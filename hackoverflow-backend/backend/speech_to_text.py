from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import speech_recognition as sr

@csrf_exempt
def convert_speech_to_text(request):
    if request.method == 'POST':
        audio_file = request.FILES.get('file')
        if not audio_file:
            return JsonResponse({'error': 'No file provided'}, status=400)
        
        recognizer = sr.Recognizer()
        try:
            with sr.AudioFile(audio_file) as source:
                audio_data = recognizer.record(source)
                text = recognizer.recognize_google(audio_data)
                return JsonResponse({'text': text})
        except sr.UnknownValueError:
            return JsonResponse({'error': 'Speech recognition could not understand audio'}, status=400)
        except sr.RequestError as e:
            return JsonResponse({'error': f'Speech recognition service error: {e}'}, status=400)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)

    return JsonResponse({'error': 'Invalid request method'}, status=405)
