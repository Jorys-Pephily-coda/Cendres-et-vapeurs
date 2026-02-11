
from rest_framework import viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.http import StreamingHttpResponse
import json
import time
from .models import ToxicityData
from .serializers import ToxicityDataSerializer
class ToxicityDataViewSet(viewsets.ReadOnlyModelViewSet):

    queryset = ToxicityData.objects.all()
    serializer_class = ToxicityDataSerializer
    permission_classes = [AllowAny]
    def get_queryset(self):
        queryset = ToxicityData.objects.all()
        limit = self.request.query_params.get('limit', 50)
        try:
            limit = int(limit)
        except ValueError:
            limit = 50
        return queryset[:limit]
@api_view(['GET'])
@permission_classes([AllowAny])
def current_toxicity(request):
    latest = ToxicityData.generate_random_data()
    serializer = ToxicityDataSerializer(latest)
    return Response(serializer.data)
@api_view(['POST'])
def generate_toxicity_data(request):

    data = ToxicityData.generate_random_data()
    serializer = ToxicityDataSerializer(data)
    return Response(serializer.data)
def toxicity_stream(request):

    def event_stream():
        while True:
            data = ToxicityData.generate_random_data()
            yield f"data: {json.dumps(data.to_dict())}\n\n"
            time.sleep(5)
    response = StreamingHttpResponse(event_stream(), content_type='text/event-stream')
    response['Cache-Control'] = 'no-cache'
    response['X-Accel-Buffering'] = 'no'
    return response
