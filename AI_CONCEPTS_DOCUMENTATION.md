# AI Concepts in Knode: Complete Technical Documentation

## 1) Executive Overview

Knode uses a **hybrid AI architecture**:

- A dedicated Python `ai-engine` service implements algorithmic intelligence.
- The Node/Express backend orchestrates product workflows and calls AI APIs.
- The Next.js frontend exposes AI-assisted features to users.

The system uses two core AI paradigms in production:

1. **Graph search + symbolic inference** for peer matchmaking.
2. **Game-theoretic minimax** for SOS bounty suggestion.

It is intentionally **transparent and deterministic** (no black-box LLM dependency for core decisions). This gives:

- explainable outputs (coverage, bridge cost, rationale strings),
- reproducible ranking behavior,
- easy debugging and tuning with known formulas.

---

## 2) AI Architecture and Data Flow

### 2.1 Services and responsibilities

- **Frontend (`frontend`)**
  - gathers user intent (skills, SOS urgency, target skill, deadline),
  - calls backend APIs.
- **Backend (`backend`)**
  - validates requests, enforces auth/business rules,
  - fetches candidates from DB,
  - forwards ranking/bounty scoring to AI engine when available,
  - applies product logic (lock windows, bonus grants, skill eligibility).
- **AI Engine (`ai-engine`)**
  - exposes `/match/*` and `/sos/bounty` APIs,
  - runs deterministic algorithmic scoring.

### 2.2 Integration contract

Backend reads `AI_ENGINE_URL`. If configured and reachable:

- matchmaking calls `POST {AI_ENGINE_URL}/match/rank`
- SOS bounty assistant calls `POST {AI_ENGINE_URL}/sos/bounty`

If AI engine is unavailable:

- matchmaking falls back to backend-local heuristic scoring,
- SOS bounty endpoint returns a clear 502 error.

---

## 3) Matchmaking AI (A* + Inference + Weighted Scoring)

This is the most AI-dense feature in the project.

### 3.1 Problem framing

Goal: rank candidate helpers for a seeker by considering:

- explicit skill overlap,
- inferred/related skill coverage,
- graph “distance” to missing skills,
- candidate quality priors (credibility, karma),
- optional proficiency depth.

### 3.2 Symbolic inference closure

In `ai-engine/algorithms/inference.py`, the system defines implication rules such as:

- `machine-learning -> python`
- `competitive-programming -> dsa`
- `(python + probability) -> machine-learning`

Then `infer_closure(...)` repeatedly applies rules to build a **closed skill set**.

Why this matters:

- sparse user profiles become richer without user manually entering every prerequisite.
- ranker becomes robust to vocabulary incompleteness.

### 3.3 Skill dependency graph

`ai-engine/algorithms/skill_edges.py` defines a directed graph of prerequisite/related transitions:

- `python -> machine-learning`
- `dsa -> systems`
- `digital-electronics -> fpga`
- etc.

This graph is used for path-based reasoning over “how far” a candidate is from uncovered seeker skills.

### 3.4 A* search usage

`ai-engine/algorithms/astar_search.py` implements:

- `a_star_shortest(...)`
- `min_astar_from_set_to_goal(...)`

Current heuristic is set to `0` in `path_score.py`, which makes A* equivalent to uniform-cost graph search (Dijkstra-like behavior over unit edges), while still keeping extensibility for future heuristics.

### 3.5 Bridge penalty and coverage metrics

In `ai-engine/algorithms/path_score.py`:

- **coverage** = `|candidate_closure ∩ seeker_closure| / |seeker_closure|`
- **bridge penalty** = sum of shortest path distances from candidate skill set to each uncovered seeker skill

Interpretation:

- high coverage means candidate can already handle seeker needs.
- high bridge penalty means candidate may need conceptual jumps to help effectively.

### 3.6 Final ranking formula

In `ai-engine/services/matching_core.py`, score is:

- `raw_overlap * 16`
- `+ coverage * 42`
- `- bridging * 2.8`
- `+ credibility * 0.42`
- `+ clamped_karma * 0.017`
- `+ proficiency_bonus`

This is a **linear utility model** combining relevance + reliability + engagement.

### 3.7 Backend orchestration and fallback

`backend/src/services/matchmakingService.ts`:

- goal-scopes seeker skills,
- fetches candidate rows from Prisma,
- calls AI engine `/match/rank` when available,
- otherwise uses local score fallback,
- normalizes scores into percentage via z-score + sigmoid (`toPercentScores`).

Result: UX remains available even if AI engine is temporarily down.

---

## 4) SOS Bounty AI (Game-Theoretic Minimax)

### 4.1 Problem framing

When posting SOS, user can ask AI to suggest bounty based on:

- urgency (0 to 1),
- queue depth (market congestion proxy).

### 4.2 Minimax model

In `ai-engine/algorithms/sos_minimax.py`:

- action set (bounties): `(0, 5, 10, 25, 50, 75, 100)`
- adversarial environment states (“strains”): `(0, 1, 2)`

For each bounty `b`, compute worst-case utility:

- `worst_case(b) = min_{strain in STRAINS} utility_requester(b, strain, urgency, queueDepth)`

Pick:

- `argmax_b worst_case(b)`  (maximin policy)

This is robust decision-making under uncertain response conditions.

### 4.3 Utility semantics

Utility combines:

- negative payment pressure (higher bounty costs requester),
- congestion penalty,
- urgency relief value.

This gives a principled tradeoff instead of arbitrary static recommendations.

### 4.4 API and backend bridge

- AI engine endpoint: `POST /sos/bounty`
- Backend bridge: `backend/src/controllers/sosAiController.ts`
- Frontend trigger: SOS page “AI suggest bounty (minimax)” button.

Backend now catches network failures and returns:

- `502 AI engine unavailable. Start ai-engine/run.sh`

instead of generic internal server error.

---

## 5) AI-Informed SOS Marketplace Rules

Beyond the pure minimax suggestion, SOS uses algorithmic logic in product behavior.

### 5.1 Skill-targeted SOS routing

Each SOS has:

- `topicTag`
- `targetSkill`

Backend normalizes skills with aliases (e.g. `c++ -> cpp`, `node.js -> nodejs`) before matching.

### 5.2 Lock-in mechanism (anti-sniping)

When an eligible helper views an OPEN SOS detail:

- backend sets `lockHolderUserId`
- sets `lockExpiresAt` (10-minute window)

Pick operation requires:

- valid unexpired lock,
- lock owned by picker.

This prevents chaotic last-second free-for-all behavior.

### 5.3 Time-pressure incentive bonus

On successful pick, bonus is computed from remaining deadline fraction:

- <= 25% time left: +35% of base bounty
- <= 50% time left: +15% of base bounty
- else: +0%

Bonus is credited via karma ledger (`SOS_URGENT_BONUS`), making urgency economics explicit and auditable.

---

## 6) Why these are “AI concepts” (and not just normal backend logic)

The system uses multiple classic AI families:

- **Search AI**: A* for graph distance and bridge estimation.
- **Knowledge-based AI**: rule-driven inference closure for skills.
- **Game theory / decision theory**: minimax maximin bounty selection.
- **Utility optimization**: weighted ranking objective.
- **Robust systems AI**: graceful fallback strategy when inference service is offline.

This is a practical “Applied AI Systems” design:

- not a single monolithic model,
- but coordinated algorithmic intelligence where each method matches the problem type.

---

## 7) Current limitations and improvement opportunities

### 7.1 Matchmaking

- A* heuristic is currently `0`; adding admissible domain heuristics can reduce expansions.
- Score coefficients are hand-tuned constants; can be learned from historical outcomes.
- Skill graph is static; can be expanded from real learning pathways.

### 7.2 Bounty model

- STRAINS are coarse discrete states.
- Utility is hand-crafted; could be calibrated from acceptance/response latency.
- Candidate action space doesn’t yet include dynamic market elasticity per domain/tag.

### 7.3 Data quality

- Skill naming relies on normalization + aliases; stronger ontology mapping can reduce mismatch.
- Better telemetry can feed online tuning loops.

---

## 8) Operational notes for running AI features

### 8.1 Start AI engine

From `ai-engine`:

```bash
./run.sh
```

Exposes:

- `GET /health`
- `POST /match/score`
- `POST /match/rank`
- `POST /sos/bounty`

### 8.2 Backend env requirement

Set in backend env:

- `AI_ENGINE_URL=http://localhost:8010`

Without this, AI-assisted endpoints are disabled/fallback.

### 8.3 Debug checklist

- If bounty suggestion fails: check AI engine health first.
- If matchmaking looks generic: backend may be on fallback path (AI engine unreachable).
- If skill-targeted access fails: verify canonical skill aliases and stored normalized skills.

---

## 9) Quick feature-to-algorithm map

- **“Find matches”** -> Inference closure + graph bridge metrics + weighted utility ranking (+ optional backend fallback).
- **“AI suggest bounty”** -> Minimax (maximin) over discrete strain scenarios.
- **“SOS lock + bonus”** -> Rule-based market mechanism with urgency-time utility bonus.

---

## 10) Summary

Knode’s AI stack is built as an **explainable algorithmic intelligence layer**:

- A* and graph reasoning estimate conceptual distance.
- Rule inference expands sparse skill signals.
- Utility-based ranking orders candidates by fit and reliability.
- Minimax gives robust SOS bounty guidance under uncertainty.
- Product economics (locking + urgency bonus) align incentives with fast, high-quality help.

This design is highly suitable for educational and peer-help ecosystems where interpretability, controllability, and reliability are more important than opaque model outputs.
