from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from core.models import Profile

User = get_user_model()


class Command(BaseCommand):
    help = 'Transforme l\'utilisateur Scott en Super Administrateur'

    def handle(self, *args, **options):
        try:
            # Chercher l'utilisateur Scott (insensible à la casse)
            user = User.objects.filter(username__iexact='scott').first()

            if not user:
                self.stdout.write(
                    self.style.ERROR('Utilisateur "Scott" introuvable')
                )
                return

            # Récupérer ou créer le profil
            profile, created = Profile.objects.get_or_create(user=user)

            # Changer le rôle en super_admin
            profile.role = 'super_admin'
            profile.save()

            self.stdout.write(
                self.style.SUCCESS(
                    f'✓ L\'utilisateur "{user.username}" (ID: {user.id}) a été transformé en Super Administrateur'
                )
            )

        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Erreur: {str(e)}')
            )
