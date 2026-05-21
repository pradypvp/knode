from fastapi import APIRouter

from algorithms.sos_minimax import minimax_suggest_bounty
from app.schemas import BountySuggestRequest, BountySuggestResponse

router = APIRouter()


@router.post("/bounty", response_model=BountySuggestResponse)
async def suggest_bounty(body: BountySuggestRequest) -> BountySuggestResponse:
    b, val, rationale = minimax_suggest_bounty(body.urgency, body.queueDepth)
    return BountySuggestResponse(
        suggestedBounty=b, gameValue=val, rationale=rationale
    )
