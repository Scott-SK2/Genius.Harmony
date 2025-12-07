from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Profile

User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    role = serializers.ChoiceField(choices=Profile.ROLE_CHOICES)
    client_type = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'role', 'client_type']
        extra_kwargs = {
            'password': {'write_only': True},
        }

    def create(self, validated_data):
        role = validated_data.pop('role')
        client_type = validated_data.pop('client_type', '')

        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()

        # Récupérer le profil créé automatiquement par le SIGNAL
        profile = user.profile
        profile.role = role
        if role in ['client', 'partenaire']:
            profile.client_type = client_type
        profile.save()

        return user
