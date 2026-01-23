"""
Pole-related views
"""
from rest_framework import generics

from ..models import Pole
from ..serializers import PoleSerializer
from ..permissions import CanViewPoles


class PoleDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Pole.objects.all()
    serializer_class = PoleSerializer
    permission_classes = [CanViewPoles]


class PoleListCreateView(generics.ListCreateAPIView):
    queryset = Pole.objects.all()
    serializer_class = PoleSerializer
    permission_classes = [CanViewPoles]
