from django.contrib import admin
from django.urls import path
from api.views import upload_video, home, predict_stress_from_text
from . import speech_to_text

urlpatterns = [
    path('', home, name='home'),
    path('api/upload_video/', upload_video, name='upload_video'),
    path('admin/', admin.site.urls),
    path('api/predict/text/', predict_stress_from_text, name='predict_stress_from_text'),
    path('api/speech-to-text/', speech_to_text.convert_speech_to_text, name='speech_to_text'),
]
