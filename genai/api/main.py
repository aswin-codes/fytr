from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from google import genai
from google.genai import types
import os
import uuid
import json
from datetime import datetime
import time
import tempfile
import shutil
import logging
from typing import Optional
from dotenv import load_dotenv

# Set up logging to see what's happening
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("GymAPI")

load_dotenv()

app = FastAPI(title="Gym Form Analysis API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    logger.error("GEMINI_API_KEY is missing!")
client = genai.Client(api_key=GEMINI_API_KEY)

MODEL_NAME = "gemini-2.5-flash"

ANALYSIS_PROMPT = """Analyze this gym workout video for exercise form.
Return ONLY valid JSON:
{{
  "exercise": "{exercise_name}",
  "score": 82,
  "verdict": "Great Form!",
  "status": "good",
  "positives": ["list"],
  "improvements": ["list"],
  "aiCoachTip": "string"
}}"""

def parse_gemini_response(response_text: str) -> dict:
    try:
        content = response_text.strip()
        if "```json" in content:
            content = content.split("```json")[1].split("```")[0]
        elif "```" in content:
            content = content.split("```")[1].split("```")[0]
        
        return json.loads(content.strip())
    except Exception as e:
        logger.error(f"JSON Parsing Error: {str(e)} | Raw: {response_text}")
        raise ValueError("AI returned invalid data format")

async def analyze_video_with_gemini(video_path: str, exercise_name: Optional[str] = None) -> dict:
    uploaded_file_name = None
    try:
        logger.info(f"Uploading file to Gemini: {video_path}")
        
        # 1. Upload
        file_info = client.files.upload(path=video_path, config=types.UploadFileConfig(mime_type="video/mp4"))
        
        # FIX: Ensure we get the name correctly (handle object vs string)
        uploaded_file_name = file_info.name if hasattr(file_info, 'name') else str(file_info)
        logger.info(f"Upload successful. File ID: {uploaded_file_name}")

        # 2. Wait for Processing
        start_time = time.time()
        while True:
            # Refresh file metadata
            current_file = client.files.get(name=uploaded_file_name)
            
            # FIX: Robust state checking
            state = str(current_file.state) 
            logger.info(f"File state: {state}")

            if "ACTIVE" in state:
                break
            if "FAILED" in state:
                raise Exception("Gemini video processing failed.")
            
            if time.time() - start_time > 30:
                logger.warning("Timeout waiting for video processing.")
                break
                
            time.sleep(3)

        # 3. Generate Analysis
        logger.info("Sending analysis prompt to Gemini...")
        prompt = ANALYSIS_PROMPT.format(exercise_name=exercise_name or "Detected Exercise")
        
        response = client.models.generate_content(
            model=MODEL_NAME,
            contents=[
                types.Content(role="user", parts=[
                    types.Part.from_uri(file_uri=current_file.uri, mime_type="video/mp4"),
                    types.Part.from_text(text=prompt)
                ])
            ]
        )
        
        return parse_gemini_response(response.text)

    finally:
        if uploaded_file_name:
            try:
                client.files.delete(name=uploaded_file_name)
                logger.info("Cleaned up file from Gemini cloud.")
            except:
                pass

@app.post("/analyze-video")
async def analyze_video(
    video: UploadFile = File(...),
    exercise: Optional[str] = Form(None)
):
    temp_path = None
    try:
        logger.info(f"Received request: {video.filename}")
        suffix = os.path.splitext(video.filename)[1] or ".mp4"
        
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            shutil.copyfileobj(video.file, tmp)
            temp_path = tmp.name
        
        logger.info(f"Temporary file saved at: {temp_path}")
        
        analysis = await analyze_video_with_gemini(temp_path, exercise)
        
        return {
            "id": str(uuid.uuid4()),
            "recordedAt": datetime.utcnow().isoformat(),
            **analysis
        }

    except Exception as e:
        logger.error(f"Endpoint Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if temp_path and os.path.exists(temp_path):
            os.remove(temp_path)

@app.get("/health")
async def health():
    return {"status": "alive", "gemini_key_set": bool(GEMINI_API_KEY)}