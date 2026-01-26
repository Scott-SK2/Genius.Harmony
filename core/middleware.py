"""
Custom middleware for logging and auditing
"""
import logging
import json
from django.utils.deprecation import MiddlewareMixin

logger = logging.getLogger('genius_harmony.audit')


class AuditLoggingMiddleware(MiddlewareMixin):
    """
    Middleware to log important actions for audit trail
    Logs: POST, PUT, PATCH, DELETE requests to important endpoints
    """

    # Endpoints to audit
    AUDIT_PATHS = [
        '/api/projets/',
        '/api/users/',
        '/api/poles/',
        '/api/documents/',
    ]

    def process_response(self, request, response):
        # Only log for authenticated users
        if not request.user.is_authenticated:
            return response

        # Only log state-changing methods
        if request.method not in ['POST', 'PUT', 'PATCH', 'DELETE']:
            return response

        # Check if path should be audited
        should_audit = any(request.path.startswith(path) for path in self.AUDIT_PATHS)

        if should_audit:
            log_data = {
                'user': request.user.username,
                'user_id': request.user.id,
                'method': request.method,
                'path': request.path,
                'status_code': response.status_code,
                'ip_address': self.get_client_ip(request),
            }

            # Log request body for POST/PUT/PATCH (be careful with sensitive data)
            if request.method in ['POST', 'PUT', 'PATCH'] and hasattr(request, 'data'):
                # Don't log passwords
                safe_data = {k: v for k, v in request.data.items() if k not in ['password', 'password1', 'password2']}
                log_data['data'] = safe_data

            if response.status_code >= 400:
                logger.warning(f"Audit: {json.dumps(log_data)}")
            else:
                logger.info(f"Audit: {json.dumps(log_data)}")

        return response

    @staticmethod
    def get_client_ip(request):
        """Get client IP address from request"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip
