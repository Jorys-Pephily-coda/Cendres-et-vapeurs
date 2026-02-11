
from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from django.db.models import Count
from .models import Product, ProductVote, PriceHistory
from .serializers import (
    ProductSerializer, ProductCreateUpdateSerializer,
    ProductVoteSerializer, PriceHistorySerializer
)
from apps.authentication.permissions import IsEditorOrAdmin, IsUserOrAbove
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
        product.fluctuate_price(action='view')
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
