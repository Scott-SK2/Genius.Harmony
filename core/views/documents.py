"""
Document-related views
"""
import mimetypes
from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from django.http import Http404, HttpResponseRedirect

from ..models import Document
from ..serializers import DocumentSerializer
from ..permissions import CanDeleteDocument


class DocumentListCreateView(generics.ListCreateAPIView):
    """
    GET: Liste les documents (filtrés par projet si ?projet=<id>)
    POST: Upload un nouveau document
    """
    serializer_class = DocumentSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get_queryset(self):
        queryset = Document.objects.all().select_related('projet', 'uploade_par')

        # Filtrer par projet si demandé
        projet_id = self.request.query_params.get('projet')
        if projet_id:
            queryset = queryset.filter(projet_id=projet_id)

        return queryset

    def perform_create(self, serializer):
        # Associer l'utilisateur connecté comme uploadeur
        serializer.save(uploade_par=self.request.user)


class DocumentDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET: Récupère les détails d'un document
    PUT/PATCH: Modifie un document
    DELETE: Supprime un document (Admin, Super Admin, ou propriétaire uniquement)
    """
    queryset = Document.objects.all().select_related('projet', 'uploade_par')
    serializer_class = DocumentSerializer
    permission_classes = [permissions.IsAuthenticated, CanDeleteDocument]
    parser_classes = [MultiPartParser, FormParser]


class DocumentDownloadView(APIView):
    """
    GET: Télécharge un document avec les headers appropriés pour forcer le téléchargement
    Compatible avec AWS S3 et stockage local
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        try:
            document = Document.objects.get(pk=pk)
        except Document.DoesNotExist:
            raise Http404("Document non trouvé")

        # Vérifier que le fichier existe
        if not document.fichier:
            return Response(
                {"detail": "Aucun fichier associé à ce document"},
                status=status.HTTP_404_NOT_FOUND
            )

        file_url = document.fichier.url

        # Si c'est une URL S3 (commence par http:// ou https://)
        if file_url.startswith(('http://', 'https://')):
            # Pour S3, générer une URL signée temporaire si nécessaire
            from django.conf import settings
            from django.core.files.storage import default_storage

            # Si on utilise S3 et que QUERYSTRING_AUTH n'est pas activé
            if hasattr(settings, 'AWS_STORAGE_BUCKET_NAME') and settings.AWS_STORAGE_BUCKET_NAME:
                if not settings.AWS_QUERYSTRING_AUTH:
                    # Générer une URL signée valide pendant 1 heure
                    try:
                        signed_url = default_storage.url(document.fichier.name, expire=3600, parameters={'ResponseContentDisposition': f'attachment; filename="{document.titre}.{document.fichier.name.split(".")[-1]}"'})
                        return HttpResponseRedirect(signed_url)
                    except Exception:
                        # Si la génération échoue, utiliser l'URL normale
                        pass

            # Pour les URLs publiques ou autre stockage cloud
            return HttpResponseRedirect(file_url)

        # Fichier local (mode développement)
        import os
        from django.http import FileResponse

        try:
            file_path = document.fichier.path
        except (NotImplementedError, AttributeError):
            # Si .path n'est pas supporté par le storage backend
            return HttpResponseRedirect(file_url)

        if not os.path.exists(file_path):
            return Response(
                {"detail": "Fichier introuvable sur le serveur"},
                status=status.HTTP_404_NOT_FOUND
            )

        # Déterminer le type MIME
        content_type, _ = mimetypes.guess_type(file_path)
        if content_type is None:
            content_type = 'application/octet-stream'

        # Construire le nom du fichier avec l'extension correcte
        # Récupérer l'extension du fichier stocké
        _, file_extension = os.path.splitext(document.fichier.name)

        # Utiliser le titre du document + extension
        # Nettoyer le titre pour éviter les caractères problématiques
        safe_title = "".join(c for c in document.titre if c.isalnum() or c in (' ', '-', '_')).strip()
        filename = f"{safe_title}{file_extension}"

        # Créer la réponse avec le fichier
        # FileResponse gère l'ouverture et la fermeture du fichier automatiquement
        response = FileResponse(open(file_path, 'rb'), content_type=content_type)
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        return response
