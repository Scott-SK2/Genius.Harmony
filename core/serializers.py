from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Profile, Pole

User = get_user_model()

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

class PoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pole
        fields = ['id', 'name', 'description']

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

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role', 'pole', 'pole_name']

    def update(self, instance, validated_data):
        profile_data = validated_data.pop('profile', {})
        role = profile_data.get('role')
        pole = profile_data.get('pole')

        if role is not None:
            instance.profile.role = role
        if 'pole' in profile_data:
            instance.profile.pole = pole

        instance.profile.save()
        instance.save()
        return instance