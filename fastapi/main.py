from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging
from dotenv import load_dotenv
import os

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

@app.get("/")
async def root():
    return {"message": "Hello World"}
    
@app.get("/health")
async def health():
    return {"status": "alive", "gemini_key_set": bool(GEMINI_API_KEY)}
