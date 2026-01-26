import logging
from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Profile, Pole, Projet, Tache, Document, Notification

User = get_user_model()
logger = logging.getLogger(__name__)


class AdminUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "is_active",
            "is_staff",
            "date_joined",
        ]
        read_only_fields = ["id", "date_joined", "username"]


class RegisterSerializer(serializers.ModelSerializer):
    role = serializers.ChoiceField(choices=Profile.ROLE_CHOICES, write_only=True)
    client_type = serializers.CharField(required=False, allow_blank=True, write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'first_name', 'last_name', 'role', 'client_type']
        extra_kwargs = {
            'password': {'write_only': True},
            'first_name': {'required': True},
            'last_name': {'required': True},
        }

    def create(self, validated_data):
        try:
            logger.info(f"🔹 Creating user with username: {validated_data.get('username')}")

            role = validated_data.pop('role')
            client_type = validated_data.pop('client_type', '')

            password = validated_data.pop('password')
            user = User(**validated_data)
            user.set_password(password)

            logger.info(f"🔹 Saving user to database...")
            user.save()
            logger.info(f"✅ User saved successfully, ID: {user.id}")

            # Récupérer le profil créé automatiquement par le SIGNAL
            logger.info(f"🔹 Fetching auto-created profile...")
            profile = user.profile
            logger.info(f"✅ Profile found, ID: {profile.id}")

            profile.role = role
            if role in ['artiste', 'client', 'partenaire']:
                profile.client_type = client_type

            logger.info(f"🔹 Saving profile with role: {role}")
            profile.save()
            logger.info(f"✅ Profile saved successfully")

            return user
        except Exception as e:
            logger.error(f"❌ Error in RegisterSerializer.create: {e}", exc_info=True)
            raise

class PoleSerializer(serializers.ModelSerializer):
    chef_username = serializers.CharField(source='chef.username', read_only=True)
    chef_email = serializers.CharField(source='chef.email', read_only=True)

    class Meta:
        model = Pole
        fields = ['id', 'name', 'description', 'chef', 'chef_username', 'chef_email']
        extra_kwargs = {
            'chef': {'required': False, 'allow_null': True}
        }

class UserProfileSerializer(serializers.ModelSerializer):
    role = serializers.CharField(source='profile.role')
    pole = serializers.PrimaryKeyRelatedField(
        source='profile.pole',
        queryset=Pole.objects.all(),
        allow_null=True,
        required=False
    )
    pole_name = serializers.CharField(
        source='profile.pole.name', read_only=True
    )
    membre_specialite = serializers.CharField(source='profile.membre_specialite', required=False, allow_blank=True)
    description = serializers.CharField(source='profile.description', required=False, allow_blank=True)
    photo = serializers.ImageField(source='profile.photo', read_only=True)
    photo_url = serializers.SerializerMethodField()

    # Champs de contact
    phone = serializers.CharField(source='profile.phone', required=False, allow_blank=True, allow_null=True)
    website = serializers.URLField(source='profile.website', required=False, allow_blank=True, allow_null=True)
    instagram = serializers.URLField(source='profile.instagram', required=False, allow_blank=True, allow_null=True)
    twitter = serializers.URLField(source='profile.twitter', required=False, allow_blank=True, allow_null=True)
    tiktok = serializers.URLField(source='profile.tiktok', required=False, allow_blank=True, allow_null=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role', 'pole', 'pole_name', 'membre_specialite', 'description', 'photo', 'photo_url', 'phone', 'website', 'instagram', 'twitter', 'tiktok']

    def get_photo_url(self, obj):
        if hasattr(obj, 'profile') and obj.profile.photo:
            photo_url = obj.profile.photo.url
            # Si l'URL est déjà absolue, la retourner telle quelle
            if photo_url.startswith(('http://', 'https://')):
                return photo_url
            # Sinon, construire l'URL absolue (Render Disk)
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(photo_url)
            return photo_url
        return None

    def update(self, instance, validated_data):
        profile_data = validated_data.pop('profile', {})

        # Mettre à jour les champs du User (first_name, last_name)
        if 'first_name' in validated_data:
            instance.first_name = validated_data['first_name']
        if 'last_name' in validated_data:
            instance.last_name = validated_data['last_name']

        # Mettre à jour les champs du Profile
        role = profile_data.get('role')
        pole = profile_data.get('pole')
        membre_specialite = profile_data.get('membre_specialite')
        description = profile_data.get('description')
        phone = profile_data.get('phone')
        website = profile_data.get('website')
        instagram = profile_data.get('instagram')
        twitter = profile_data.get('twitter')
        tiktok = profile_data.get('tiktok')

        if role is not None:
            instance.profile.role = role
        if 'pole' in profile_data:
            instance.profile.pole = pole
        if membre_specialite is not None:
            instance.profile.membre_specialite = membre_specialite
        if description is not None:
            instance.profile.description = description
        if phone is not None:
            instance.profile.phone = phone
        if website is not None:
            instance.profile.website = website
        if instagram is not None:
            instance.profile.instagram = instagram
        if twitter is not None:
            instance.profile.twitter = twitter
        if tiktok is not None:
            instance.profile.tiktok = tiktok

        instance.profile.save()
        instance.save()
        return instance


# Serializers pour les utilisateurs (format simple pour les relations)
class UserSimpleSerializer(serializers.ModelSerializer):
    """Serializer simple pour afficher les utilisateurs dans les projets/tâches"""
    full_name = serializers.SerializerMethodField()
    role = serializers.CharField(source='profile.role', read_only=True)
    membre_specialite = serializers.CharField(source='profile.membre_specialite', read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'full_name', 'role', 'membre_specialite']
        read_only_fields = ['id', 'username', 'email', 'full_name', 'role', 'membre_specialite']

    def get_full_name(self, obj):
        return obj.get_full_name() or obj.username


# Serializers pour les tâches
class TacheSerializer(serializers.ModelSerializer):
    assigne_a_details = UserSimpleSerializer(source='assigne_a', many=True, read_only=True)
    projet_titre = serializers.CharField(source='projet.titre', read_only=True)

    class Meta:
        model = Tache
        fields = [
            'id', 'projet', 'projet_titre', 'titre', 'description',
            'statut', 'priorite', 'assigne_a', 'assigne_a_details',
            'deadline', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class TacheCreateSerializer(serializers.ModelSerializer):
    """Serializer pour la création/modification de tâches"""

    class Meta:
        model = Tache
        fields = [
            'id', 'projet', 'titre', 'description',
            'statut', 'priorite', 'assigne_a', 'deadline'
        ]
        read_only_fields = ['id']


# Serializers pour les documents
class DocumentSerializer(serializers.ModelSerializer):
    uploade_par_details = UserSimpleSerializer(source='uploade_par', read_only=True)
    projet_titre = serializers.CharField(source='projet.titre', read_only=True)
    fichier_url = serializers.SerializerMethodField()

    class Meta:
        model = Document
        fields = [
            'id', 'projet', 'projet_titre', 'titre', 'fichier', 'fichier_url',
            'type', 'description', 'uploade_par', 'uploade_par_details',
            'created_at'
        ]
        read_only_fields = ['id', 'uploade_par', 'created_at']

    def get_fichier_url(self, obj):
        if obj.fichier:
            fichier_url = obj.fichier.url
            # Si l'URL est déjà absolue, la retourner telle quelle
            if fichier_url.startswith(('http://', 'https://')):
                return fichier_url
            # Sinon, construire l'URL absolue (Render Disk)
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(fichier_url)
            return fichier_url
        return None


# Serializers pour les projets
class ProjetListSerializer(serializers.ModelSerializer):
    """Serializer pour la liste des projets (version allégée)"""
    pole_name = serializers.CharField(source='pole.name', read_only=True)
    client_username = serializers.CharField(source='client.username', read_only=True)
    chef_projet_username = serializers.CharField(source='chef_projet.username', read_only=True)
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)
    nombre_taches = serializers.SerializerMethodField()
    nombre_membres = serializers.SerializerMethodField()

    class Meta:
        model = Projet
        fields = [
            'id', 'titre', 'type', 'statut', 'pole', 'pole_name',
            'client', 'client_username', 'chef_projet', 'chef_projet_username', 'chef_projet_status',
            'created_by', 'created_by_username', 'membres',
            'nombre_taches', 'nombre_membres', 'date_debut', 'date_fin_prevue',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_by', 'created_at', 'updated_at']

    def get_nombre_taches(self, obj):
        return obj.taches.count()

    def get_nombre_membres(self, obj):
        return obj.membres.count()


class ProjetDetailSerializer(serializers.ModelSerializer):
    """Serializer pour les détails d'un projet"""
    pole_details = PoleSerializer(source='pole', read_only=True)
    client_details = UserSimpleSerializer(source='client', read_only=True)
    chef_projet_details = UserSimpleSerializer(source='chef_projet', read_only=True)
    created_by_details = UserSimpleSerializer(source='created_by', read_only=True)
    membres_details = UserSimpleSerializer(source='membres', many=True, read_only=True)
    taches = TacheSerializer(many=True, read_only=True)
    documents = DocumentSerializer(many=True, read_only=True)

    class Meta:
        model = Projet
        fields = [
            'id', 'titre', 'description', 'type', 'statut',
            'pole', 'pole_details',
            'client', 'client_details',
            'chef_projet', 'chef_projet_details', 'chef_projet_status',
            'created_by', 'created_by_details',
            'membres', 'membres_details',
            'taches', 'documents',
            'odoo_project_id', 'odoo_invoice_id',
            'date_debut', 'date_fin_prevue', 'date_fin_reelle',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_by', 'created_at', 'updated_at']


class ProjetCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer pour la création et modification de projets"""

    class Meta:
        model = Projet
        fields = [
            'id', 'titre', 'description', 'type', 'statut',
            'pole', 'client', 'chef_projet', 'chef_projet_status', 'membres',
            'date_debut', 'date_fin_prevue', 'date_fin_reelle',
            'odoo_project_id', 'odoo_invoice_id'
        ]
        read_only_fields = ['id', 'chef_projet_status']

    def create(self, validated_data):
        # Si un chef de projet est désigné, mettre le statut à 'pending'
        if 'chef_projet' in validated_data and validated_data['chef_projet'] is not None:
            validated_data['chef_projet_status'] = 'pending'
        return super().create(validated_data)

    def update(self, instance, validated_data):
        # Si le chef de projet change, réinitialiser le statut à 'pending'
        if 'chef_projet' in validated_data:
            if validated_data['chef_projet'] != instance.chef_projet:
                validated_data['chef_projet_status'] = 'pending'
        return super().update(instance, validated_data)


# Serializers pour les notifications
class NotificationSerializer(serializers.ModelSerializer):
    """Serializer pour les notifications"""
    tache_titre = serializers.CharField(source='tache.titre', read_only=True)
    tache_projet_id = serializers.IntegerField(source='tache.projet.id', read_only=True, allow_null=True)
    projet_titre = serializers.CharField(source='projet.titre', read_only=True)
    type_display = serializers.CharField(source='get_type_display', read_only=True)

    class Meta:
        model = Notification
        fields = [
            'id', 'type', 'type_display', 'titre', 'message',
            'tache', 'tache_titre', 'tache_projet_id',
            'projet', 'projet_titre',
            'is_read', 'created_at', 'read_at'
        ]
        read_only_fields = ['id', 'user', 'created_at', 'read_at']