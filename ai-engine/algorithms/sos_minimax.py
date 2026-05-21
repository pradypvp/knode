BOUNTIES = (0, 5, 10, 25, 50, 75, 100)
STRAINS = (0, 1, 2)


def _utility_requester(
    bounty: int, strain: int, urgency: float, queue_depth: int
) -> float:
    congestion = 0.48 * strain * queue_depth
    relief = urgency * 20.0 * (1.0 - 0.08 * strain)
    return -float(bounty) - congestion + relief - strain * 1.5


def minimax_suggest_bounty(
    urgency: float, queue_depth: int
) -> tuple[int, float, str]:
    urgency = min(1.0, max(0.0, urgency))
    qd = min(40, max(0, queue_depth))
    best_b = BOUNTIES[0]
    best_val = float("-inf")
    for b in BOUNTIES:
        worst_case = min(_utility_requester(b, m, urgency, qd) for m in STRAINS)
        if worst_case > best_val:
            best_val = worst_case
            best_b = b
    rationale = (
        f"maximin bounty vs market strain levels {STRAINS}; "
        f"urgency={urgency:.2f} queue_depth={qd}"
    )
    return best_b, best_val, rationale
