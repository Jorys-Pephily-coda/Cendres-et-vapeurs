
from rest_framework import viewsets
from rest_framework.permissions import AllowAny
from .models import ActivityLog
from .serializers import ActivityLogSerializer
class ActivityLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ActivityLog.objects.all()
    serializer_class = ActivityLogSerializer
    permission_classes = [AllowAny]
    def get_queryset(self):
        queryset = ActivityLog.objects.all()
        limit = self.request.query_params.get('limit', 100)
        try:
            limit = int(limit)
        except ValueError:
            limit = 100
        action_type = self.request.query_params.get('action_type')
        if action_type:
            queryset = queryset.filter(action_type=action_type)
        return queryset[:limit]
