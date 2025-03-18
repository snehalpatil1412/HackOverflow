# 1. Uses Google Translate (via googletrans) to support multiple languages
# 2. Maps certain emotions (Anger, Disgust, Fear, Sad) as indicators of stress
# 3. Extracts audio from videos using FFmpeg
# 4. xxverts speech to text using Google's speech recognition API
# 5. Django REST framework for API endpoints

from django.http import JsonResponse, HttpResponse
from tensorflow import keras
from tensorflow.keras.models import load_model # type: ignore
from tensorflow.keras.preprocessing.sequence import pad_sequences # type: ignore
from rest_framework.decorators import api_view
import subprocess
import os
import pickle
import numpy as np
import pandas as pd
import concurrent.futures
from sklearn.model_selection import train_test_split
import speech_recognition as sr
from PIL import Image
import cv2
from pydub import AudioSegment
import logging
import traceback
from googletrans import Translator
import requests
import json

logger = logging.getLogger(__name__)

# Paths to files
TEXT_MODEL_PATH = 'text_model/Text_Prediction_Model.keras'
TOKENIZER_PATH = 'text_model/tokenizer_stress.pkl'
EMOTION_MODEL_PATH = 'video_model/facial_emotion_video_model.h5'  # Path to your emotion detection model
MAX_LEN = 100  # Max length used during training

# Load the trained text model and tokenizer
with open(TOKENIZER_PATH, 'rb') as file:
    text_tokenizer = pickle.load(file)
text_model = load_model(TEXT_MODEL_PATH)

# Load the emotion detection model
emotion_model = load_model(EMOTION_MODEL_PATH)

# Initialize translator
translator = Translator()

def home(request):
    return HttpResponse("Welcome to the Stress Detection API!")


@api_view(['POST'])
def predict_stress_from_text(request):
    data = request.data.get('text', None)
    language = request.data.get('language', 'en')  # Default to English
    
    if not data:
        return JsonResponse({"error": "No text provided"}, status=400)

    # Translate text to English if not already in English
    if language != 'en':
        try:
            translated = translator.translate(data, src=language, dest='en')
            data = translated.text
        except Exception as e:
            logger.error(f"Translation error: {str(e)}")
            return JsonResponse({"error": f"Translation error: {str(e)}"}, status=400)

    # Tokenize and preprocess the input text
    text_sequence = text_tokenizer.texts_to_sequences([data])
    padded_sequence = pad_sequences(text_sequence, maxlen=MAX_LEN)

    # Predict stress
    prediction = text_model.predict(padded_sequence)
    stress = int(prediction > 0.5)  # 1 if stress, 0 if no stress

    return JsonResponse({'stress': stress})


def extract_frames(video_path, frame_interval=30):
    video = cv2.VideoCapture(video_path)
    fps = video.get(cv2.CAP_PROP_FPS)  # Get the frames per second
    frame_interval = int(fps * 2)
    frames = []

    frame_count = 0
    while True:
        ret, frame = video.read()
        if not ret:
            break
        if frame_count % frame_interval == 0:
            frames.append(frame)
        frame_count += 1
    video.release()
    print(f"Extracted {len(frames)} frames.")  # Debugging print
    return frames


def get_emotion_from_predictions(predictions):
    emotion_labels = ['Anger', 'Disgust', 'Fear', 'Happy', 'Sad', 'Surprise', 'Neutral']
    max_index = np.argmax(predictions)
    return emotion_labels[max_index]

def process_video(video_path):
    stress_emotions = {'Anger', 'Disgust', 'Fear', 'Sad'}  # Stress-related emotions
    frames = extract_frames(video_path, frame_interval=30)
    stress_count = 0
    not_stress_count = 0
    total_frames = len(frames)

    frame_results = []  # Store frame-wise predictions

    for i, frame in enumerate(frames):
        gray_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        resized_frame = cv2.resize(gray_frame, (48, 48))  # Resize to match model input
        img_array = np.array(resized_frame) / 255.0  # Normalize pixel values
        img_array = np.expand_dims(img_array, axis=-1)  # Add channel dimension
        img_array = np.expand_dims(img_array, axis=0)  # Add batch dimension

        predictions = emotion_model.predict(img_array)
        detected_emotion = get_emotion_from_predictions(predictions)

        is_stressed = detected_emotion in stress_emotions
        stress_count += int(is_stressed)
        not_stress_count += int(not is_stressed)

        frame_results.append({
            "frame_number": i,
            "emotion": detected_emotion,
            "stress_prediction": "Stressed" if is_stressed else "Not Stressed"
        })

        # Print frame-wise predictions
        print(f"Frame {i}: {detected_emotion} -> {'Stressed' if is_stressed else 'Not Stressed'}")

    # Final decision based on majority vote
    final_stress_decision = "Stressed" if stress_count > not_stress_count else "Not Stressed"

    return final_stress_decision, frame_results

def extract_audio_text(video_path, language='en'):
    temp_audio_path = "temp_audio.wav"
    
    try:
        logger.debug(f"Extracting audio using FFmpeg: {video_path}")
        
        # Extract audio using faster FFmpeg settings
        command = [
            "ffmpeg", "-i", video_path, "-vn", "-acodec", "pcm_s16le",
            "-ar", "16000", "-ac", "1", "-y", temp_audio_path
        ]
        subprocess.run(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)

        if not os.path.exists(temp_audio_path):
            return "Error: Audio extraction failed"

        logger.debug("Audio extracted successfully. Splitting into chunks...")

        # Convert audio to chunks using pydub
        audio = AudioSegment.from_wav(temp_audio_path)
        chunk_length_ms = 5000  # 5-second chunks
        chunks = [audio[i:i + chunk_length_ms] for i in range(0, len(audio), chunk_length_ms)]

        recognizer = sr.Recognizer()
        full_text = ""
        original_language = language

        for i, chunk in enumerate(chunks):
            chunk_path = f"chunk_{i}.wav"
            chunk.export(chunk_path, format="wav")

            with sr.AudioFile(chunk_path) as source:
                audio_data = recognizer.record(source)
                try:
                    # Use the specified language for speech recognition
                    text = recognizer.recognize_google(audio_data, language=language)
                    full_text += text + " "
                except sr.UnknownValueError:
                    logger.warning(f"Chunk {i}: Could not understand audio")
                except sr.RequestError as e:
                    logger.error(f"Google Speech API error: {str(e)}")

            os.remove(chunk_path)  # Clean up chunk file

        original_text = full_text.strip() if full_text else "No text detected"
        
        # Translate to English if not already in English
        if language != 'en' and original_text != "No text detected":
            try:
                translated = translator.translate(original_text, src=language, dest='en')
                english_text = translated.text
                return original_text, english_text, original_language
            except Exception as e:
                logger.error(f"Translation error: {str(e)}")
                return original_text, original_text, original_language
        
        return original_text, original_text, original_language

    except Exception as e:
        logger.error(f"Error in speech recognition: {str(e)}")
        logger.error(traceback.format_exc())
        return f"Error extracting text: {str(e)}", f"Error extracting text: {str(e)}", language

    finally:
        if os.path.exists(temp_audio_path):
            os.remove(temp_audio_path)
            logger.debug("Cleaned up temporary audio file")



# Add this function to your views.py
def query_mistral(prompt, api_key):
    url = "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.1"
    headers = {"Authorization": f"Bearer {api_key}"}
    data = {"inputs": prompt}

    try:
        response = requests.post(url, headers=headers, json=data)
        response.raise_for_status()
        result = response.json()
        # Extract only the generated text, assuming it's the first element
        generated_text = result[0]['generated_text'].split('Solution:')[-1].strip() if result else "No response received."

        # Format the generated text
        if any(str(i) + "." in generated_text for i in range(1, 10)):
            # If the text contains numbered points, split it into a list
            formatted_text = "\n".join([point.strip() for point in generated_text.split("\n") if point.strip()])
        else:
            # Otherwise, keep it as a paragraph
            formatted_text = generated_text

        # # Append a positive note
        # positive_note = "\n\nRemember, taking small steps each day can lead to big improvements. You're doing great!"
        # formatted_text += positive_note

        return formatted_text

    except requests.exceptions.RequestException as e:
        return f"Error: {e}"

# Example usage in the upload_video function
@api_view(['POST'])
def upload_video(request):
    video_path = None
    try:
        file = request.FILES.get('file')
        language = request.data.get('language', 'en')  # Get language from request, default to English

        if not file:
            return JsonResponse({"error": "No file provided"}, status=400)

        # Ensure uploads directory exists
        upload_dir = 'uploads'
        os.makedirs(upload_dir, exist_ok=True)

        # Save video
        video_path = os.path.join(upload_dir, 'temp_video.webm')
        with open(video_path, 'wb+') as destination:
            for chunk in file.chunks():
                destination.write(chunk)

        # Run facial expression detection and text extraction in parallel
        with concurrent.futures.ThreadPoolExecutor() as executor:
            future_video_stress = executor.submit(process_video, video_path)
            future_extracted_text = executor.submit(extract_audio_text, video_path, language)

            # Get results from the threads
            video_stress_result, frame_results = future_video_stress.result()
            original_text, english_text, detected_language = future_extracted_text.result()

        # Check if facial expressions were detected
        valid_facial_data = len(frame_results) > 0
        video_stress_result = video_stress_result if valid_facial_data else "No facial expressions detected"

        # Check if text was extracted
        valid_text_data = english_text and english_text != "No text detected" and not english_text.startswith("Error")

        # Predict stress from extracted text
        if valid_text_data:
            text_sequence = text_tokenizer.texts_to_sequences([english_text])
            padded_sequence = pad_sequences(text_sequence, maxlen=MAX_LEN)
            text_prediction = text_model.predict(padded_sequence)
            text_stress = int(text_prediction > 0.5)  # 1 = stressed, 0 = not stressed
            text_stress_result = "Stressed" if text_stress else "Not Stressed"
        else:
            text_stress_result = "No speech detected"

        # Compute the final stress decision based on available data
        if not valid_facial_data and not valid_text_data:
            # Neither facial nor text data available
            final_stress_decision = "Unable to determine stress - no data available"
        elif not valid_facial_data:
            # Only text data available
            final_stress_decision = text_stress_result
        elif not valid_text_data:
            # Only facial data available
            final_stress_decision = video_stress_result
        else:
            # Both data available - use original logic
            if video_stress_result == "Stressed" and text_stress_result == "Stressed":
                final_stress_decision = "Highly Stressed"
            elif video_stress_result == "Stressed" and text_stress_result == "Not Stressed":
                final_stress_decision = "Not Stressed"
            elif video_stress_result == "Not Stressed" and text_stress_result == "Stressed":
                final_stress_decision = "Moderate Stress"
            else:
                final_stress_decision = "Not Stressed"

        # Query Mistral for suggestions
        api_key = ""
        if valid_text_data:
            prompt = f"""
            User Concern: {english_text}

            Start with a motivational message to reassure the user. Then, provide only the practical solution to address the user's concern. Do not repeat the concern. Focus on actionable advice.

            End your response with another positive, motivational message to uplift the user.
            Solution:
            """
            mistral_response = query_mistral(prompt, api_key)
        else:
            mistral_response = "No suggestions available."

        # Print only the required values
        print(f"Final Stress Decision (Facial Expressions): {video_stress_result}")
        print(f"Final Stress Decision (Extracted Text): {text_stress_result}")
        print(f"Final Stress Decision: {final_stress_decision}")

        # Prepare response data
        response_data = {
            "Final Stress Decision": final_stress_decision,
            "Frame Results": frame_results if valid_facial_data else [],
            "Extracted Text": original_text,
            "Detected Language": detected_language,
            "Final Stress Decision (Facial Expressions)": video_stress_result,
            "Final Stress Decision (Extracted Text)": text_stress_result,
            "Suggestions": mistral_response,
        }

        return JsonResponse(response_data)

    except Exception as e:
        logger.error(f"Error in upload_video: {str(e)}")
        logger.error(traceback.format_exc())
        return JsonResponse({"error": str(e), "traceback": traceback.format_exc()}, status=500)

    finally:
        # Cleanup
        if video_path and os.path.exists(video_path):
            os.remove(video_path)
