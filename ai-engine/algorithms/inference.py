from collections.abc import Iterable

Rule = tuple[frozenset[str], str]

RULES: list[Rule] = [
    (frozenset({"machine-learning"}), "python"),
    (frozenset({"competitive-programming"}), "dsa"),
    (frozenset({"thesis"}), "writing"),
    (frozenset({"python", "probability"}), "machine-learning"),
]


def normalize(skills: Iterable[str]) -> set[str]:
    return {s.lower().strip() for s in skills if s and s.strip()}


def infer_closure(skills: set[str]) -> set[str]:
    out = set(skills)
    changed = True
    while changed:
        changed = False
        for req, implied in RULES:
            if implied in out:
                continue
            if req.issubset(out):
                out.add(implied)
                changed = True
    return out
