from pydantic import BaseModel, Field


class HealthResponse(BaseModel):
    status: str
    service: str


class CandidateModel(BaseModel):
    skills: list[str] = Field(default_factory=list)
    credibility: float = 50
    karma: float = 0


class MatchScoreRequest(BaseModel):
    seekerSkills: list[str]
    candidate: CandidateModel


class MatchScoreResponse(BaseModel):
    score: float
    coverage: float
    bridging: float
    raw_overlap: float


class SkillProf(BaseModel):
    skill: str
    proficiency: int = 3


class CandidateRankIn(BaseModel):
    userId: str
    skills: list[str] = Field(default_factory=list)
    credibility: float = 50
    karma: float = 0
    skillLevels: list[SkillProf] = Field(default_factory=list)


class RankRequest(BaseModel):
    seekerSkills: list[str]
    candidates: list[CandidateRankIn]


class RankItem(BaseModel):
    userId: str
    score: float
    coverage: float
    bridging: float
    raw_overlap: float


class RankResponse(BaseModel):
    ranked: list[RankItem]


class BountySuggestRequest(BaseModel):
    urgency: float = Field(ge=0.0, le=1.0, default=0.5)
    queueDepth: int = Field(ge=0, default=0)


class BountySuggestResponse(BaseModel):
    suggestedBounty: int
    gameValue: float
    rationale: str
