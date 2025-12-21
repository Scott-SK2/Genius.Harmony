from django.contrib import admin
from .models import Profile, Pole, Projet, Tache, Document


class TacheInline(admin.TabularInline):
    model = Tache
    extra = 0
    fields = ['titre', 'statut', 'priorite', 'deadline']
    readonly_fields = ['titre']


class DocumentInline(admin.TabularInline):
    model = Document
    extra = 0
    fields = ['titre', 'fichier', 'type', 'uploade_par']
    readonly_fields = ['uploade_par']


@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'role', 'pole', 'client_type']
    list_filter = ['role', 'pole']
    search_fields = ['user__username', 'user__email', 'user__first_name', 'user__last_name']
    raw_id_fields = ['user']


@admin.register(Pole)
class PoleAdmin(admin.ModelAdmin):
    list_display = ['name', 'description']
    search_fields = ['name']


@admin.register(Projet)
class ProjetAdmin(admin.ModelAdmin):
    list_display = ['titre', 'type', 'statut', 'pole', 'client', 'chef_projet', 'created_at']
    list_filter = ['type', 'statut', 'pole', 'created_at']
    search_fields = ['titre', 'description', 'client__username']
    filter_horizontal = ['membres']
    raw_id_fields = ['client', 'chef_projet']
    date_hierarchy = 'created_at'
    inlines = [TacheInline, DocumentInline]

    fieldsets = (
        ('Informations générales', {
            'fields': ('titre', 'description', 'type', 'statut')
        }),
        ('Organisation', {
            'fields': ('pole', 'chef_projet', 'membres', 'client')
        }),
        ('Dates', {
            'fields': ('date_debut', 'date_fin_prevue', 'date_fin_reelle')
        }),
        ('Liens Odoo', {
            'fields': ('odoo_project_id', 'odoo_invoice_id'),
            'classes': ('collapse',)
        }),
    )


@admin.register(Tache)
class TacheAdmin(admin.ModelAdmin):
    list_display = ['titre', 'projet', 'get_assignes', 'statut', 'priorite', 'deadline']
    list_filter = ['statut', 'priorite', 'projet__pole', 'created_at']
    search_fields = ['titre', 'description', 'projet__titre']
    raw_id_fields = ['projet']
    filter_horizontal = ['assigne_a']
    date_hierarchy = 'deadline'

    def get_assignes(self, obj):
        """Retourne la liste des personnes assignées à cette tâche"""
        assignes = obj.assigne_a.all()
        if assignes.exists():
            return ", ".join([user.username for user in assignes])
        return "-"
    get_assignes.short_description = 'Assigné à'


@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display = ['titre', 'projet', 'type', 'uploade_par', 'created_at']
    list_filter = ['type', 'created_at', 'projet__pole']
    search_fields = ['titre', 'description', 'projet__titre']
    raw_id_fields = ['projet', 'uploade_par']
    readonly_fields = ['created_at']
    date_hierarchy = 'created_at'
