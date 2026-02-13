from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from django.utils.dateparse import parse_date
from .models import CalendarEvent, ShiftNote
from .serializers import CalendarEventSerializer, ShiftNoteSerializer
from apps.authentication.permissions import IsEditorOrAdmin
class CalendarEventViewSet(viewsets.ModelViewSet):
    queryset = CalendarEvent.objects.all()
    serializer_class = CalendarEventSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    def get_queryset(self):
        queryset = CalendarEvent.objects.all()
        start_date = self.request.query_params.get('start_date', None)
        end_date = self.request.query_params.get('end_date', None)
        if start_date:
            queryset = queryset.filter(start_date__gte=start_date)
        if end_date:
            queryset = queryset.filter(end_date__lte=end_date)
        priority = self.request.query_params.get('priority', None)
        if priority:
            queryset = queryset.filter(priority=priority)
        return queryset
    

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsEditorOrAdmin()]
        return super().get_permissions()
    

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    
    @action(detail=False, methods=['get'])
    def month_view(self, request):
        year = request.query_params.get('year')
        month = request.query_params.get('month')
        if not year or not month:
            return Response({
                'error': 'Paramètres year et month requis'
            }, status=status.HTTP_400_BAD_REQUEST)
        try:
            year = int(year)
            month = int(month)
        except ValueError:
            return Response({
                'error': 'year et month doivent être des nombres'
            }, status=status.HTTP_400_BAD_REQUEST)
        events = CalendarEvent.objects.filter(
            start_date__year=year,
            start_date__month=month
        )
        serializer = self.get_serializer(events, many=True)
        return Response({
            'year': year,
            'month': month,
            'events': serializer.data
        })
    

    @action(detail=False, methods=['get'])
    def priorities(self, request):
        return Response({
            'priorities': [
                {'value': choice[0], 'label': choice[1]}
                for choice in CalendarEvent.PRIORITY_CHOICES
            ]
        })
class ShiftNoteViewSet(viewsets.ModelViewSet):
    serializer_class = ShiftNoteSerializer

    def get_queryset(self):
        user = self.request.user
        queryset = ShiftNote.objects.all()
        if not user.is_admin:
            queryset = queryset.filter(user=user)
        date = self.request.query_params.get('date', None)
        if date:
            queryset = queryset.filter(date=date)
        shift = self.request.query_params.get('shift', None)
        if shift:
            queryset = queryset.filter(shift=shift)
        user_id = self.request.query_params.get('user_id', None)
        if user_id and user.is_admin:
            queryset = queryset.filter(user_id=user_id)
        return queryset
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


    def perform_update(self, serializer):
        note = self.get_object()
        if note.user != self.request.user and not self.request.user.is_admin:
            return Response({
                'error': 'Vous ne pouvez modifier que vos propres notes'
            }, status=status.HTTP_403_FORBIDDEN)
        serializer.save()


    def perform_destroy(self, instance):
        if instance.user != self.request.user and not self.request.user.is_admin:
            return Response({
                'error': 'Vous ne pouvez supprimer que vos propres notes'
            }, status=status.HTTP_403_FORBIDDEN)
        instance.delete()


    @action(detail=False, methods=['get'])
    def my_notes(self, request):
        notes = ShiftNote.objects.filter(user=request.user)
        date = request.query_params.get('date')
        if date:
            notes = notes.filter(date=date)
        serializer = self.get_serializer(notes, many=True)
        return Response(serializer.data)
    
    
    @action(detail=False, methods=['get'])
    def date_notes(self, request):
        date_str = request.query_params.get('date')
        if not date_str:
            return Response({
                'error': 'Paramètre date requis'
            }, status=status.HTTP_400_BAD_REQUEST)
        date = parse_date(date_str)
        if not date:
            return Response({
                'error': 'Format de date invalide (YYYY-MM-DD)'
            }, status=status.HTTP_400_BAD_REQUEST)
        morning_notes = ShiftNote.objects.filter(date=date, shift='morning')
        evening_notes = ShiftNote.objects.filter(date=date, shift='evening')
        return Response({
            'date': date_str,
            'morning': self.get_serializer(morning_notes, many=True).data,
            'evening': self.get_serializer(evening_notes, many=True).data
        })
