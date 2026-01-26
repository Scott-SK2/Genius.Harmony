"""
Odoo Gateway - Couche d'abstraction pour toutes les interactions avec Odoo

Ce module gère:
- Connexion singleton à Odoo
- Rate limiting automatique (max 10 req/sec)
- Cache Redis pour les lectures
- Retries avec backoff exponentiel
- Détection et gestion des 429 Too Many Requests

Usage:
    from core.odoo_gateway import odoo_gateway

    # Créer un contact
    partner_id = odoo_gateway.create_partner(user_data)

    # Récupérer un projet (avec cache)
    project = odoo_gateway.get_project(odoo_project_id)
"""
import time
import logging
from django.core.cache import cache
from django.conf import settings

logger = logging.getLogger(__name__)


class OdooNotConfiguredError(Exception):
    """Exception levée quand Odoo n'est pas configuré"""
    pass


class OdooRateLimitError(Exception):
    """Exception levée quand Odoo renvoie un 429 Too Many Requests"""
    pass


class OdooGateway:
    """
    Gateway centralisé pour toutes les interactions avec Odoo

    Features:
    - Connexion singleton (une seule connexion réutilisée)
    - Rate limiting automatique (100ms entre chaque appel)
    - Cache Redis intégré (TTL configurables)
    - Retries automatiques avec backoff exponentiel
    - Gestion des erreurs 429 Too Many Requests
    """

    _instance = None
    _odoo = None
    _last_call_time = 0
    _min_call_interval = 0.1  # 100ms entre chaque appel = max 10 req/sec
    _connection_attempted = False
    _connection_failed = False

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    def __init__(self):
        # Ne pas se connecter automatiquement lors de l'import
        # La connexion sera établie lors du premier appel à _ensure_connected()
        pass

    def _connect(self):
        """Établit la connexion à Odoo via XML-RPC"""
        if self._connection_attempted:
            if self._connection_failed:
                raise OdooNotConfiguredError("Odoo connection failed previously")
            return

        self._connection_attempted = True

        if not settings.ODOO_ENABLED:
            self._connection_failed = True
            raise OdooNotConfiguredError("Odoo is not enabled. Set ODOO_ENABLED=True in settings.")

        if not all([settings.ODOO_HOST, settings.ODOO_DB, settings.ODOO_USERNAME, settings.ODOO_PASSWORD]):
            self._connection_failed = True
            raise OdooNotConfiguredError("Missing Odoo configuration. Check ODOO_* settings.")

        try:
            import odoorpc

            self._odoo = odoorpc.ODOO(
                settings.ODOO_HOST,
                port=settings.ODOO_PORT,
                protocol=settings.ODOO_PROTOCOL
            )
            self._odoo.login(
                settings.ODOO_DB,
                settings.ODOO_USERNAME,
                settings.ODOO_PASSWORD
            )
            logger.info(f"✅ Connected to Odoo: {settings.ODOO_HOST} (DB: {settings.ODOO_DB})")
            self._connection_failed = False
        except Exception as e:
            logger.error(f"❌ Odoo connection failed: {e}")
            self._connection_failed = True
            raise OdooNotConfiguredError(f"Failed to connect to Odoo: {e}")

    def _ensure_connected(self):
        """Vérifie que la connexion Odoo est active"""
        if not settings.ODOO_ENABLED:
            raise OdooNotConfiguredError("Odoo integration is disabled")
        if not self._odoo:
            self._connect()

    def _throttle(self):
        """
        Rate limiting : max 10 req/sec
        Attend si nécessaire pour respecter le délai minimal entre appels
        """
        current_time = time.time()
        elapsed = current_time - self._last_call_time

        if elapsed < self._min_call_interval:
            sleep_time = self._min_call_interval - elapsed
            time.sleep(sleep_time)

        self._last_call_time = time.time()

    def _call_with_retry(self, method, *args, **kwargs):
        """
        Appel Odoo avec retry automatique

        Features:
        - Max 3 tentatives
        - Backoff exponentiel: 1s, 2s, 4s
        - Détecte 429 Too Many Requests et attend plus longtemps
        - Logs toutes les erreurs

        Args:
            method: callable - Méthode Odoo à appeler
            *args, **kwargs: Arguments de la méthode

        Returns:
            Résultat de l'appel Odoo

        Raises:
            OdooRateLimitError: Si rate limit atteint après tous les retries
            Exception: Pour les autres erreurs après 3 tentatives
        """
        max_retries = 3

        for attempt in range(max_retries):
            try:
                self._throttle()  # Rate limiting
                result = method(*args, **kwargs)
                return result

            except Exception as e:
                error_msg = str(e).lower()

                # Détecte rate limiting Odoo (429 ou "too many requests")
                if '429' in error_msg or 'too many' in error_msg or 'rate limit' in error_msg:
                    wait_time = (2 ** attempt) * 60  # 1min, 2min, 4min
                    logger.warning(f"⚠️ Odoo rate limit hit, retry {attempt+1}/{max_retries} in {wait_time}s")

                    if attempt < max_retries - 1:
                        time.sleep(wait_time)
                        continue
                    else:
                        raise OdooRateLimitError(f"Odoo rate limit exceeded after {max_retries} attempts")

                # Autres erreurs (network, timeout, etc.)
                if attempt < max_retries - 1:
                    backoff = 2 ** attempt  # 1s, 2s, 4s
                    logger.warning(f"⚠️ Odoo call failed (attempt {attempt+1}/{max_retries}): {e}")
                    logger.warning(f"   Retrying in {backoff}s...")
                    time.sleep(backoff)
                    continue
                else:
                    logger.error(f"❌ Odoo call failed after {max_retries} attempts: {e}")
                    raise

    # ========================================
    # PARTNERS (Contacts Odoo)
    # ========================================

    def create_partner(self, user_data):
        """
        Crée un contact dans Odoo

        Args:
            user_data: dict avec 'id', 'username', 'first_name', 'last_name', 'email', 'phone'

        Returns:
            int: Odoo partner ID
        """
        self._ensure_connected()
        Partner = self._odoo.env['res.partner']

        # Construire le nom complet (fallback sur username si pas de prénom/nom)
        first_name = user_data.get('first_name', '').strip()
        last_name = user_data.get('last_name', '').strip()

        if first_name or last_name:
            name = f"{first_name} {last_name}".strip()
        else:
            name = user_data.get('username', 'Unknown User')

        vals = {
            'name': name,
            'email': user_data.get('email', ''),
            'phone': user_data.get('phone', ''),
            'comment': f"Genius Harmony User ID: {user_data.get('id')} | Username: {user_data.get('username')}",
        }

        partner_id = self._call_with_retry(Partner.create, vals)
        logger.info(f"✅ Created Odoo partner {partner_id} for user {user_data.get('id')} ({name})")
        return partner_id

    def update_partner(self, odoo_partner_id, user_data):
        """
        Met à jour un contact Odoo existant

        Args:
            odoo_partner_id: int - ID Odoo du partner
            user_data: dict avec les nouvelles données
        """
        self._ensure_connected()
        Partner = self._odoo.env['res.partner']

        # Construire le nom complet
        first_name = user_data.get('first_name', '').strip()
        last_name = user_data.get('last_name', '').strip()

        if first_name or last_name:
            name = f"{first_name} {last_name}".strip()
        else:
            name = user_data.get('username', 'Unknown User')

        vals = {
            'name': name,
            'email': user_data.get('email', ''),
            'phone': user_data.get('phone', ''),
        }

        self._call_with_retry(Partner.write, [odoo_partner_id], vals)
        logger.info(f"✅ Updated Odoo partner {odoo_partner_id}")

        # Invalider le cache
        cache.delete(f"odoo:partner:{odoo_partner_id}")

    def delete_partner(self, odoo_partner_id):
        """
        Supprime un contact Odoo

        Args:
            odoo_partner_id: int - ID Odoo du partner à supprimer
        """
        self._ensure_connected()
        Partner = self._odoo.env['res.partner']

        # Supprimer le partner dans Odoo
        self._call_with_retry(Partner.unlink, [odoo_partner_id])
        logger.info(f"✅ Deleted Odoo partner {odoo_partner_id}")

        # Invalider le cache
        cache.delete(f"odoo:partner:{odoo_partner_id}")

    def get_partner(self, odoo_partner_id, use_cache=True):
        """
        Récupère un contact Odoo (avec cache Redis 5 min)

        Args:
            odoo_partner_id: int
            use_cache: bool - utiliser le cache Redis (default: True)

        Returns:
            dict: Partner data {'id', 'name', 'email', 'phone', 'comment'}
        """
        cache_key = f"odoo:partner:{odoo_partner_id}"

        if use_cache:
            cached = cache.get(cache_key)
            if cached:
                logger.debug(f"📦 Cache hit: {cache_key}")
                return cached

        self._ensure_connected()
        Partner = self._odoo.env['res.partner']

        partner = self._call_with_retry(
            Partner.read,
            [odoo_partner_id],
            ['name', 'email', 'phone', 'comment']
        )[0]

        if use_cache:
            cache.set(cache_key, partner, timeout=300)  # 5 minutes
            logger.debug(f"💾 Cached: {cache_key}")

        return partner

    # ========================================
    # PROJECTS (Projets Odoo)
    # ========================================

    def create_project(self, projet_data):
        """
        Crée un projet dans Odoo

        Args:
            projet_data: dict avec 'id', 'titre', 'description', 'client_odoo_id', 'date_debut', 'date_fin_prevue'

        Returns:
            int: Odoo project ID
        """
        self._ensure_connected()
        Project = self._odoo.env['project.project']

        vals = {
            'name': projet_data['titre'],
            'description': projet_data.get('description', ''),
            'partner_id': projet_data.get('client_odoo_id'),  # Client Odoo
        }

        # Dates (optionnelles)
        if projet_data.get('date_debut'):
            vals['date_start'] = str(projet_data['date_debut'])
        if projet_data.get('date_fin_prevue'):
            vals['date'] = str(projet_data['date_fin_prevue'])

        project_id = self._call_with_retry(Project.create, vals)
        logger.info(f"✅ Created Odoo project {project_id} for projet {projet_data.get('id')} ({projet_data['titre']})")
        return project_id

    def update_project(self, odoo_project_id, projet_data):
        """Met à jour un projet Odoo existant"""
        self._ensure_connected()
        Project = self._odoo.env['project.project']

        vals = {
            'name': projet_data['titre'],
            'description': projet_data.get('description', ''),
        }

        self._call_with_retry(Project.write, [odoo_project_id], vals)
        logger.info(f"✅ Updated Odoo project {odoo_project_id}")

        # Invalider le cache
        cache.delete(f"odoo:project:{odoo_project_id}")

    def get_project(self, odoo_project_id, use_cache=True):
        """Récupère un projet Odoo (avec cache 5 min)"""
        cache_key = f"odoo:project:{odoo_project_id}"

        if use_cache:
            cached = cache.get(cache_key)
            if cached:
                return cached

        self._ensure_connected()
        Project = self._odoo.env['project.project']

        project = self._call_with_retry(
            Project.read,
            [odoo_project_id],
            ['name', 'description', 'date_start', 'date', 'partner_id']
        )[0]

        if use_cache:
            cache.set(cache_key, project, timeout=300)

        return project

    # ========================================
    # TASKS (Tâches Odoo)
    # ========================================

    def create_task(self, tache_data):
        """
        Crée une tâche dans Odoo

        Args:
            tache_data: dict avec 'id', 'titre', 'description', 'projet_odoo_id', 'deadline', 'priorite'

        Returns:
            int: Odoo task ID
        """
        self._ensure_connected()
        Task = self._odoo.env['project.task']

        vals = {
            'name': tache_data['titre'],
            'description': tache_data.get('description', ''),
            'project_id': tache_data.get('projet_odoo_id'),
            'priority': self._map_priorite(tache_data.get('priorite', 'normale')),
        }

        if tache_data.get('deadline'):
            vals['date_deadline'] = str(tache_data['deadline'])

        task_id = self._call_with_retry(Task.create, vals)
        logger.info(f"✅ Created Odoo task {task_id} for tache {tache_data.get('id')}")
        return task_id

    def batch_create_tasks(self, taches_data_list):
        """
        Crée plusieurs tâches en une seule requête (BATCH)
        Optimisation : 1 appel API au lieu de N

        Args:
            taches_data_list: list of dict

        Returns:
            list: Odoo task IDs
        """
        if not taches_data_list:
            return []

        self._ensure_connected()
        Task = self._odoo.env['project.task']

        vals_list = [
            {
                'name': t['titre'],
                'description': t.get('description', ''),
                'project_id': t.get('projet_odoo_id'),
                'date_deadline': str(t.get('deadline', '')),
                'priority': self._map_priorite(t.get('priorite', 'normale')),
            }
            for t in taches_data_list
        ]

        task_ids = self._call_with_retry(Task.create, vals_list)
        logger.info(f"✅ Batch created {len(task_ids)} Odoo tasks")
        return task_ids

    def _map_priorite(self, priorite):
        """Map Genius priorité vers Odoo priority"""
        mapping = {
            'basse': '0',
            'normale': '1',
            'haute': '2',
            'urgente': '3',
        }
        return mapping.get(priorite, '1')


# Instance globale singleton
# Usage: from core.odoo_gateway import odoo_gateway
odoo_gateway = OdooGateway()
