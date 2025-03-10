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

def home(request):
    return HttpResponse("Welcome to the Stress Detection API!")


@api_view(['POST'])
def predict_stress_from_text(request):
    data = request.data.get('text', None)
    if not data:
        return JsonResponse({"error": "No text provided"}, status=400)

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

def extract_audio_text(video_path):
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

        for i, chunk in enumerate(chunks):
            chunk_path = f"chunk_{i}.wav"
            chunk.export(chunk_path, format="wav")

            with sr.AudioFile(chunk_path) as source:
                audio_data = recognizer.record(source)
                try:
                    text = recognizer.recognize_google(audio_data)
                    full_text += text + " "
                except sr.UnknownValueError:
                    logger.warning(f"Chunk {i}: Could not understand audio")
                except sr.RequestError as e:
                    logger.error(f"Google Speech API error: {str(e)}")

            os.remove(chunk_path)  # Clean up chunk file

        return full_text.strip() if full_text else "No text detected"

    except Exception as e:
        logger.error(f"Error in speech recognition: {str(e)}")
        logger.error(traceback.format_exc())
        return f"Error extracting text: {str(e)}"

    finally:
        if os.path.exists(temp_audio_path):
            os.remove(temp_audio_path)
            logger.debug("Cleaned up temporary audio file")

# Process video for emotion detection and speech-to-text conversion
@api_view(['POST'])
def upload_video(request):
    video_path = None
    try:
        file = request.FILES.get('file')
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
            future_extracted_text = executor.submit(extract_audio_text, video_path)

            # Get results from the threads
            video_stress_result, frame_results = future_video_stress.result()
            extracted_text = future_extracted_text.result()

        # Predict stress from extracted text
        if extracted_text and extracted_text != "No text detected":
            text_sequence = text_tokenizer.texts_to_sequences([extracted_text])
            padded_sequence = pad_sequences(text_sequence, maxlen=MAX_LEN)
            text_prediction = text_model.predict(padded_sequence)
            text_stress = int(text_prediction > 0.5)  # 1 = stressed, 0 = not stressed
            text_stress_result = "Stressed" if text_stress else "Not Stressed"
        else:
            text_stress_result = "No text detected"


        # Compute the final stress decision based on both extracted text and facial expressions
        if video_stress_result == "Stressed" and text_stress_result == "Stressed":
            final_stress_decision = "Stressed"
        elif video_stress_result == "Stressed" or text_stress_result == "Not Stressed":
            final_stress_decision = "Not Stressed"
        elif video_stress_result == "Not Stressed" or text_stress_result == "Stressed":
            final_stress_decision = "Moderate Stress"
        else:
            final_stress_decision = "Not Stressed"
            
        # Print only the required values
            print(f"Final Stress Decision (Facial Expressions): {video_stress_result}")
            print(f"Final Stress Decision (Extracted Text): {text_stress_result}")
            print(f"Final Stress Decision: {final_stress_decision}")

        response_data = {
            "Final Stress Decision": final_stress_decision,
            "Frame Results": frame_results,
            "Extracted Text": extracted_text,
            "Final Stress Decision (Facial Expressions)": video_stress_result,
            "Final Stress Decision (Extracted Text)": text_stress_result,
            
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