from fastapi import APIRouter

from app.schemas import (
    CandidateRankIn,
    MatchScoreRequest,
    MatchScoreResponse,
    RankItem,
    RankRequest,
    RankResponse,
)
from services.matching_core import score_candidate

router = APIRouter()


@router.post("/score", response_model=MatchScoreResponse)
async def match_score(body: MatchScoreRequest) -> MatchScoreResponse:
    m = score_candidate(
        body.seekerSkills,
        body.candidate.skills,
        body.candidate.credibility,
        body.candidate.karma,
        None,
    )
    return MatchScoreResponse(
        score=m["score"],
        coverage=m["coverage"],
        bridging=m["bridging"],
        raw_overlap=m["raw_overlap"],
    )


def _prof_map(c: CandidateRankIn) -> dict[str, int] | None:
    if not c.skillLevels:
        return None
    return {p.skill.lower().strip(): p.proficiency for p in c.skillLevels}


@router.post("/rank", response_model=RankResponse)
async def match_rank(body: RankRequest) -> RankResponse:
    ranked: list[RankItem] = []
    for c in body.candidates:
        m = score_candidate(
            body.seekerSkills,
            c.skills,
            c.credibility,
            c.karma,
            _prof_map(c),
        )
        ranked.append(
            RankItem(
                userId=c.userId,
                score=m["score"],
                coverage=m["coverage"],
                bridging=m["bridging"],
                raw_overlap=m["raw_overlap"],
            )
        )
    ranked.sort(key=lambda x: x.score, reverse=True)
    return RankResponse(ranked=ranked)
