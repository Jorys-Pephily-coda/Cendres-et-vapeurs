
from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from django.db.models import Count, F
from .models import Product, ProductVote, PriceHistory
from .serializers import (
    ProductSerializer, ProductCreateUpdateSerializer,
    ProductVoteSerializer, PriceHistorySerializer
)
from apps.authentication.permissions import IsEditorOrAdmin, IsUserOrAbove
from .market_simulator import MarketSimulator
class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.filter(is_active=True)
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description', 'category']
    ordering_fields = ['created_at', 'current_price', 'name']
    def get_queryset(self):
        queryset = Product.objects.all()
        if not (self.request.user.is_authenticated and self.request.user.is_editor):
            queryset = queryset.filter(is_active=True)
        category = self.request.query_params.get('category', None)
        if category:
            queryset = queryset.filter(category=category)
        sort_by_votes = self.request.query_params.get('sort_by_votes', None)
        if sort_by_votes == 'true':
            queryset = queryset.annotate(
                vote_count_db=Count('votes')
            ).order_by('-vote_count_db', '-created_at')
        return queryset
    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return ProductCreateUpdateSerializer
        return ProductSerializer
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsEditorOrAdmin()]
        return super().get_permissions()
    def retrieve(self, request, *args, **kwargs):
        product = self.get_object()
        # Un GET ne doit pas modifier le prix : sinon le polling front fait bouger
        # les prix "artificiellement". On garde uniquement le comptage des vues.
        Product.objects.filter(pk=product.pk).update(view_count=F('view_count') + 1)
        product.refresh_from_db(fields=['view_count'])
        serializer = self.get_serializer(product)
        return Response(serializer.data)
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
    @action(detail=True, methods=['post'], permission_classes=[IsUserOrAbove])
    def vote(self, request, pk=None):
        product = self.get_object()
        user = request.user
        existing_vote = ProductVote.objects.filter(product=product, user=user).first()
        if existing_vote:
            existing_vote.delete()
            return Response({
                'message': 'Vote retiré',
                'vote_count': product.vote_count
            }, status=status.HTTP_200_OK)
        else:
            ProductVote.objects.create(product=product, user=user)
            return Response({
                'message': 'Vote ajouté',
                'vote_count': product.vote_count
            }, status=status.HTTP_201_CREATED)
    @action(detail=True, methods=['get'])
    def price_history(self, request, pk=None):

        product = self.get_object()
        history = product.price_history.all()[:50]
        serializer = PriceHistorySerializer(history, many=True)
        return Response(serializer.data)
    @action(detail=False, methods=['get'])
    def top_voted(self, request):

        products = Product.objects.filter(is_active=True).annotate(
            vote_count_db=Count('votes')
        ).order_by('-vote_count_db')[:10]
        serializer = self.get_serializer(products, many=True)
        return Response(serializer.data)
    @action(detail=False, methods=['get'])
    def categories(self, request):

        categories = Product.objects.values_list('category', flat=True).distinct()
        return Response({
            'categories': [cat for cat in categories if cat]
        })

    @action(detail=False, methods=['post'], permission_classes=[IsEditorOrAdmin])
    def start_simulation(self, request):
        """
        Démarre la simulation de marché
        POST /api/products/start_simulation/
        Body: {
            "interval": 5,  # Secondes entre chaque tick (défaut: 5)
            "volatility": 1.0,  # Multiplicateur de volatilité (défaut: 1.0)
            "influence": 1.0  # Multiplicateur d'influence global (défaut: 1.0)
        }
        """
        interval = request.data.get('interval', 5)
        volatility = request.data.get('volatility', 1.0)
        influence = request.data.get('influence', 1.0)
        
        result = MarketSimulator.start(interval=interval, volatility=volatility, influence=influence)
        
        if 'error' in result:
            return Response(result, status=status.HTTP_400_BAD_REQUEST)
        
        return Response(result, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['post'], permission_classes=[IsEditorOrAdmin])
    def stop_simulation(self, request):
        """
        Arrête la simulation de marché
        POST /api/products/stop_simulation/
        """
        result = MarketSimulator.stop()
        
        if 'error' in result:
            return Response(result, status=status.HTTP_400_BAD_REQUEST)
        
        return Response(result, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['get'])
    def simulation_status(self, request):
        """
        Vérifie le statut de la simulation
        GET /api/products/simulation_status/
        """
        result = MarketSimulator.status()
        return Response(result, status=status.HTTP_200_OK)
