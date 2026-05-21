from algorithms.inference import infer_closure, normalize
from algorithms.path_score import cover_metrics


def score_candidate(
    seeker_skills: list[str],
    candidate_skills: list[str],
    credibility: float,
    karma: float,
    prof_by_skill: dict[str, int] | None = None,
) -> dict[str, float]:
    sk = infer_closure(normalize(seeker_skills))
    ck = infer_closure(normalize(candidate_skills))
    raw_overlap = len(normalize(seeker_skills) & normalize(candidate_skills))
    bridge, _n_uncov, coverage = cover_metrics(ck, sk)
    prof_bonus = 0.0
    if prof_by_skill:
        for s in sk & ck:
            prof_bonus += min(5, max(1, prof_by_skill.get(s, 3))) * 0.6
    score = (
        raw_overlap * 16.0
        + coverage * 42.0
        - bridge * 2.8
        + credibility * 0.42
        + min(max(karma, 0.0), 5000.0) * 0.017
        + prof_bonus
    )
    return {
        "score": score,
        "coverage": coverage,
        "bridging": bridge,
        "raw_overlap": float(raw_overlap),
    }
