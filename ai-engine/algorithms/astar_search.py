import heapq
from collections.abc import Callable, Mapping


def a_star_shortest(
    start: str,
    goal: str,
    successors: Mapping[str, list[str]],
    heuristic: Callable[[str], float],
    max_expansions: int = 400,
) -> float | None:
    if start == goal:
        return 0.0
    open_set: list[tuple[float, float, str]] = [(heuristic(start), 0.0, start)]
    g_best: dict[str, float] = {start: 0.0}
    expansions = 0
    while open_set and expansions < max_expansions:
        expansions += 1
        _, g, node = heapq.heappop(open_set)
        if node == goal:
            return g
        if g > g_best.get(node, float("inf")):
            continue
        for nxt in successors.get(node, ()):
            ng = g + 1.0
            if ng < g_best.get(nxt, float("inf")):
                g_best[nxt] = ng
                f = ng + heuristic(nxt)
                heapq.heappush(open_set, (f, ng, nxt))
    return None


def min_astar_from_set_to_goal(
    starts: set[str],
    goal: str,
    successors: Mapping[str, list[str]],
    heuristic: Callable[[str], float],
) -> float:
    if goal in starts:
        return 0.0
    best: float | None = None
    for s in starts:
        d = a_star_shortest(s, goal, successors, heuristic)
        if d is not None and (best is None or d < best):
            best = d
    return best if best is not None else 12.0
