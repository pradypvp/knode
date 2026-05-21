from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import matching, sos_ai
from app.schemas import HealthResponse

app = FastAPI(title="Knode AI Engine", version="0.2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(matching.router, prefix="/match", tags=["match"])
app.include_router(sos_ai.router, prefix="/sos", tags=["sos"])


@app.get("/health", response_model=HealthResponse)
async def health() -> HealthResponse:
    return HealthResponse(status="ok", service="knode-ai-engine")
