
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('apps.authentication.urls')),
    path('api/users/', include('apps.authentication.urls_users')),
    path('api/products/', include('apps.products.urls')),
    path('api/', include('apps.ecommerce.urls')),
    path('api/calendar/', include('apps.calendar_app.urls')),
    path('api/chat/', include('apps.chat.urls')),
    path('api/monitoring/', include('apps.monitoring.urls')),
    path('api/contact/', include('apps.contact.urls')),
    path('api/logs/', include('apps.logs.urls')),
]
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
admin.site.site_header = "Cendres et Vapeur - Administration"
admin.site.site_title = "Cendres et Vapeur Admin"
admin.site.index_title = "Panneau de contrôle de la Zone Franche"
