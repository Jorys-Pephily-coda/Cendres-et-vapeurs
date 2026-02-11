
from .models import ActivityLog
def get_client_ip(request):
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip
class ActivityLogMiddleware:

    def __init__(self, get_response):
        self.get_response = get_response
    def __call__(self, request):
        response = self.get_response(request)
        if request.user.is_authenticated:
            self.log_action(request, response)
        return response
    def log_action(self, request, response):
        path = request.path
        method = request.method
        user = request.user
        ip = get_client_ip(request)
        if not (200 <= response.status_code < 300):
            return
        if method == 'POST':
            if '/api/auth/register/' in path:
                ActivityLog.log_action(
                    user=user,
                    action_type='user_registered',
                    description=f"Nouvel utilisateur: {user.username}",
                    ip_address=ip
                )
            elif '/api/products/' in path and 'vote' not in path:
                ActivityLog.log_action(
                    user=user,
                    action_type='product_created',
                    description=f"{user.username} a créé un nouveau produit",
                    ip_address=ip
                )
            elif '/api/orders/create/' in path:
                ActivityLog.log_action(
                    user=user,
                    action_type='order_created',
                    description=f"{user.username} a passé une commande",
                    ip_address=ip
                )
            elif '/api/calendar/events/' in path:
                ActivityLog.log_action(
                    user=user,
                    action_type='event_created',
                    description=f"{user.username} a créé un événement",
                    ip_address=ip
                )
        elif method == 'PUT' or method == 'PATCH':
            if '/api/products/' in path:
                ActivityLog.log_action(
                    user=user,
                    action_type='product_updated',
                    description=f"{user.username} a modifié un produit",
                    ip_address=ip
                )
