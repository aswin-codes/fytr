from fastapi import FastAPI, File, UploadFile, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import logging
from dotenv import load_dotenv
import os
from google import genai
from google.genai import types
from typing import Optional
import time
import json
from datetime import datetime
import uuid
import tempfile
import shutil
import httpx

# Set up logging
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
EXPRESS_API_URL = os.getenv("EXPRESS_API_URL", "http://localhost:3000")  # Your Express URL

if not GEMINI_API_KEY:
    logger.error("GEMINI_API_KEY is missing!")
    
client = genai.Client(api_key=GEMINI_API_KEY)

@app.get("/")
async def root():
    return {"message": "Hello World"}
    
@app.get("/health")
async def health():
    return {"status": "alive", "gemini_key_set": bool(GEMINI_API_KEY)}


MODEL_NAME = "gemini-2.5-flash"

ANALYSIS_PROMPT = """
You are a STRICT professional strength & conditioning coach and biomechanics analyst.

Analyze the provided gym workout video with ZERO positivity bias.
Be critical. Penalize unsafe or inefficient movement patterns.

IMPORTANT RULES:
- DO NOT be encouraging by default.
- If form is unsafe or inefficient, LOWER the score.
- Average gym form should score between 50-70.
- Only near-perfect technique may score above 85.
- Beginners with visible mistakes MUST score below 70.
- Unsafe posture MUST be marked as "critical".

SCORING RUBRIC:
90-100 → Excellent / Elite form (rare)
75-89  → Good form with minor issues
60-74  → Average form, needs improvement
40-59  → Poor form, multiple issues
<40    → Dangerous form, high injury risk

STATUS RULES:
- score ≥ 80 → "good"
- score 60-79 → "warning"
- score < 60 → "critical"

ANALYSIS REQUIREMENTS:
- Identify joint alignment issues (knees, hips, spine, neck).
- Identify balance, tempo, range of motion, and control issues.
- If knees cave, back rounds, neck bends, or momentum is used → PENALIZE.
- If video quality is unclear → LOWER score and mention uncertainty.

OUTPUT RULES (STRICT):
- Return ONLY valid JSON.
- No markdown.
- No explanations outside JSON.
- No emojis.
- No extra keys.
- Arrays must contain real coaching feedback (not generic praise).

JSON FORMAT:
{
  "exercise": "{exercise_name}",
  "score": number,
  "verdict": string,
  "status": "good" | "warning" | "critical",
  "positives": [
    "Short factual statement",
    "Short factual statement"
  ],
  "improvements": [
    "Specific biomechanical issue",
    "Specific biomechanical issue",
    "Specific biomechanical issue"
  ],
  "aiCoachTip": "One concise corrective coaching cue"
}
"""


async def check_quota(token: str) -> dict:
    """Check if user has remaining quota"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{EXPRESS_API_URL}/api/quota/check",
                headers={"Authorization": f"Bearer {token}"},
                timeout=10.0
            )
            
            if response.status_code == 401:
                raise HTTPException(status_code=401, detail="Unauthorized")
            elif response.status_code == 404:
                raise HTTPException(status_code=404, detail="User not found")
            elif response.status_code != 200:
                raise HTTPException(status_code=500, detail="Quota check failed")
            
            return response.json()
    except httpx.RequestError as e:
        logger.error(f"Error connecting to Express API: {str(e)}")
        raise HTTPException(status_code=503, detail="Quota service unavailable")


async def increment_quota(token: str) -> dict:
    """Increment user's usage count"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{EXPRESS_API_URL}/api/quota/increment",
                headers={"Authorization": f"Bearer {token}"},
                timeout=10.0
            )
            
            if response.status_code == 401:
                raise HTTPException(status_code=401, detail="Unauthorized")
            elif response.status_code != 200:
                logger.error(f"Failed to increment quota: {response.text}")
                raise HTTPException(status_code=500, detail="Failed to update quota")
            
            return response.json()
    except httpx.RequestError as e:
        logger.error(f"Error connecting to Express API: {str(e)}")
        raise HTTPException(status_code=503, detail="Quota service unavailable")


def parse_gemini_response(response_text: str) -> dict:
    try:
        logger.info(f"Response {response_text}")
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
        file_info = client.files.upload(file=video_path, config=types.UploadFileConfig(mime_type="video/mp4"))
        
        uploaded_file_name = file_info.name if hasattr(file_info, 'name') else str(file_info)
        logger.info(f"Upload successful. File ID: {uploaded_file_name}")

        # 2. Wait for Processing
        start_time = time.time()
        while True:
            current_file = client.files.get(name=uploaded_file_name)
            
            state = str(current_file.state) 
            logger.info(f"File state: {state}")

            if "ACTIVE" in state:
                break
            if "FAILED" in state:
                raise Exception("Gemini video processing failed.")
            
            if time.time() - start_time > 45:
                logger.warning("Timeout waiting for video processing.")
                break
                
            time.sleep(3)

        # 3. Generate Analysis
        logger.info("Sending analysis prompt to Gemini...")
        prompt = ANALYSIS_PROMPT
        
        response = client.models.generate_content(
            model=MODEL_NAME,
            contents=[
                types.Content(role="user", parts=[
                    types.Part.from_uri(file_uri=current_file.uri, mime_type="video/mp4"),
                    types.Part.from_text(text=prompt)
                ])
            ],
            config=types.GenerateContentConfig(
                temperature=0.4,
                max_output_tokens=2048,
            )
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
    authorization: Optional[str] = Header(None)
):
    """
    Analyze video with quota checking.
    Requires Bearer token in Authorization header.
    """
    temp_path = None
    
    try:
        # 1. Validate Authorization Header
        if not authorization or not authorization.startswith("Bearer "):
            raise HTTPException(status_code=401, detail="Missing or invalid authorization header")
        
        token = authorization.split(" ")[1]
        
        # 2. Check Quota
        logger.info("Checking user quota...")
        quota_status = await check_quota(token)
        
        if not quota_status.get("allowed", False):
            logger.warning("User quota exceeded")
            raise HTTPException(
                status_code=429,
                detail={
                    "message": "Daily analysis limit reached",
                    "used": quota_status.get("used", 0),
                    "limit": quota_status.get("limit", 5),
                    "resetTime": quota_status.get("resetTime")
                }
            )
        
        logger.info(f"Quota check passed. Remaining: {quota_status.get('remaining', 0)}")
        
        # 3. Process Video
        logger.info(f"Received request: {video.filename}")
        suffix = os.path.splitext(video.filename)[1] or ".mp4"
        
        temp_dir = "/tmp" if os.path.exists("/tmp") else None
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix, dir=temp_dir) as tmp:
            shutil.copyfileobj(video.file, tmp)
            temp_path = tmp.name
        
        logger.info(f"Temporary file saved at: {temp_path}")
        
        # 4. Analyze with Gemini
        analysis = await analyze_video_with_gemini(temp_path)
        
        # 5. Increment Quota (only after successful analysis)
        logger.info("Analysis successful, incrementing quota...")
        usage_info = await increment_quota(token)
        
        logger.info(f"Quota updated. Used: {usage_info.get('used')}/{usage_info.get('limit')}")
        
        # 6. Return Response with Usage Info
        return {
            "id": str(uuid.uuid4()),
            "recordedAt": datetime.utcnow().isoformat(),
            "durationSeconds": 0,
            "videoUrl": "",
            "actions": {
                "canSave": True,
                "canDelete": True,
                "isCurrent": True
            },
            "usage": {
                "used": usage_info.get("used"),
                "limit": usage_info.get("limit"),
                "remaining": usage_info.get("remaining")
            },
            **analysis
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Endpoint Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if temp_path and os.path.exists(temp_path):
            os.remove(temp_path)


@app.get("/quota-status")
async def get_quota_status(authorization: Optional[str] = Header(None)):
    """Get current quota status for user"""
    try:
        if not authorization or not authorization.startswith("Bearer "):
            raise HTTPException(status_code=401, detail="Missing or invalid authorization header")
        
        token = authorization.split(" ")[1]
        
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{EXPRESS_API_URL}/api/quota/status",
                headers={"Authorization": f"Bearer {token}"},
                timeout=10.0
            )
            
            if response.status_code != 200:
                raise HTTPException(status_code=response.status_code, detail="Failed to fetch quota")
            
            return response.json()
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching quota: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))