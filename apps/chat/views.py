from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import ChatMessage
from .serializers import ChatMessageSerializer
from apps.authentication.permissions import IsEditorOrAdmin


class ChatMessageViewSet(viewsets.ModelViewSet):
    queryset = ChatMessage.objects.all()
    serializer_class = ChatMessageSerializer
    permission_classes = [IsEditorOrAdmin]
    
    def get_queryset(self):
        queryset = ChatMessage.objects.all().order_by('-created_at')
        limit = self.request.query_params.get('limit', 50)
        try:
            limit = int(limit)
        except ValueError:
            limit = 50
        return queryset[:limit][::-1]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(user=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=['get'])
    def recent(self, request):
        limit = request.query_params.get('limit', 50)
        since_id = request.query_params.get('since_id', None)
        
        try:
            limit = int(limit)
        except ValueError:
            limit = 50
        
        queryset = ChatMessage.objects.all().order_by('created_at')
        
        if since_id:
            try:
                queryset = queryset.filter(id__gt=int(since_id))
            except ValueError:
                pass
        
        messages = queryset[:limit]
        serializer = self.get_serializer(messages, many=True)
        return Response(serializer.data)
