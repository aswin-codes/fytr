from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging


# Set up logging to see what's happening
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("GymAPI")

app = FastAPI(title="Gym Form Analysis API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {"message": "Hello World"}
