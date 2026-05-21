from .astar_search import min_astar_from_set_to_goal
from .skill_edges import forward_adj


def _augmented_succ(nodes: set[str]) -> dict[str, list[str]]:
    succ = {k: list(v) for k, v in forward_adj().items()}
    for n in nodes:
        succ.setdefault(n, [])
    return succ


def bridging_penalty_astar(
    expanded_candidate: set[str],
    target_skill: str,
) -> float:
    if target_skill in expanded_candidate:
        return 0.0
    nodes = set(expanded_candidate) | {target_skill}
    succ = _augmented_succ(nodes)

    def heuristic(_n: str) -> float:
        return 0.0

    return min_astar_from_set_to_goal(
        expanded_candidate, target_skill, succ, heuristic
    )


def cover_metrics(
    expanded_candidate: set[str],
    expanded_seeker: set[str],
) -> tuple[float, int, float]:
    uncovered = expanded_seeker - expanded_candidate
    if not uncovered:
        return 0.0, 0, 1.0
    total = 0.0
    for t in uncovered:
        total += bridging_penalty_astar(expanded_candidate, t)
    overlap = len(expanded_seeker & expanded_candidate)
    denom = max(1, len(expanded_seeker))
    coverage = overlap / denom
    return total, len(uncovered), coverage
