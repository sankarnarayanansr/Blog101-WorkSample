import os
from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'blogServerDjango.settings')

application = get_wsgi_application()

# Add this for Vercel
def app(request):
    return application(request)