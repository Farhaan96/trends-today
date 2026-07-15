#!/usr/bin/env python3
"""Evidence-labeled topic scoring for the Trends Today editorial queue."""

from __future__ import annotations

import argparse
import json
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, Iterable, List, Optional


REPO_ROOT = Path(__file__).resolve().parents[2]
DEFAULT_CONFIG = REPO_ROOT / "config" / "content-business.json"


class StrategyError(ValueError):
    """Raised when a candidate cannot be scored honestly."""


@dataclass(frozen=True)
class ScoreResult:
    title: str
    lane: str
    score: float
    decision: str
    confidence: str
    reasons: List[str]
    raw: Dict[str, Any]

    def as_dict(self) -> Dict[str, Any]:
        return {
            "title": self.title,
            "lane": self.lane,
            "score": self.score,
            "decision": self.decision,
            "confidence": self.confidence,
            "reasons": self.reasons,
            "candidate": self.raw,
        }


def load_config(path: Path = DEFAULT_CONFIG) -> Dict[str, Any]:
    with path.open("r", encoding="utf-8") as handle:
        return json.load(handle)


def _validate_weights(weights: Dict[str, int]) -> None:
    if sum(weights.values()) != 100:
        raise StrategyError("Opportunity scoring weights must total 100")


def _validate_rating(name: str, value: Any, minimum: int, maximum: int) -> float:
    if value is None:
        raise StrategyError(f"Missing evidence rating: {name}")
    if isinstance(value, bool) or not isinstance(value, (int, float)):
        raise StrategyError(f"{name} must be numeric")
    if value < minimum or value > maximum:
        raise StrategyError(f"{name} must be between {minimum} and {maximum}")
    return float(value)


def score_candidate(candidate: Dict[str, Any], config: Optional[Dict[str, Any]] = None) -> ScoreResult:
    """Score one researched candidate without inventing missing evidence.

    Every weighted input must be supplied by the research step. A missing value
    produces ``needs-research`` rather than a made-up neutral score.
    """

    config = config or load_config()
    scoring = config["opportunityScoring"]
    weights = scoring["weights"]
    _validate_weights(weights)

    title = str(candidate.get("title", "")).strip()
    lane = str(candidate.get("lane", "")).strip()
    if not title:
        raise StrategyError("Candidate title is required")
    valid_lanes = {item["id"] for item in config["portfolio"]}
    if lane not in valid_lanes:
        raise StrategyError(f"lane must be one of: {', '.join(sorted(valid_lanes))}")

    evidence = candidate.get("evidence") or {}
    source_urls = [url for url in evidence.get("sourceUrls", []) if str(url).strip()]
    ratings = candidate.get("ratings") or {}
    minimum = int(scoring["scale"]["min"])
    maximum = int(scoring["scale"]["max"])

    missing = [name for name in weights if ratings.get(name) is None]
    if missing:
        return ScoreResult(
            title=title,
            lane=lane,
            score=0,
            decision="needs-research",
            confidence="insufficient-evidence",
            reasons=[f"Missing ratings: {', '.join(missing)}"],
            raw=candidate,
        )

    validated = {
        name: _validate_rating(name, ratings[name], minimum, maximum)
        for name in weights
    }
    weighted = sum((validated[name] / maximum) * weight for name, weight in weights.items())
    score = round(weighted, 1)

    reasons: List[str] = []
    if len(source_urls) < int(scoring["minimumSources"]):
        reasons.append(
            f"Only {len(source_urls)} usable sources; {scoring['minimumSources']} required"
        )
    if validated["evidenceStrength"] < float(scoring["minimumEvidenceStrength"]):
        reasons.append("Evidence strength is below the release threshold")
    if not evidence.get("demandEvidence"):
        reasons.append("No demand evidence recorded")
    if not evidence.get("uniqueAngleEvidence"):
        reasons.append("No unique-angle evidence recorded")

    eligible = score >= float(scoring["minimumScore"]) and not reasons
    return ScoreResult(
        title=title,
        lane=lane,
        score=score,
        decision="brief" if eligible else "repair",
        confidence=str(candidate.get("confidence", "current-hypothesis")),
        reasons=reasons or ["Meets the current evidence and opportunity thresholds"],
        raw=candidate,
    )


def rank_candidates(candidates: Iterable[Dict[str, Any]], config: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
    config = config or load_config()
    results = [score_candidate(candidate, config) for candidate in candidates]
    order = {"brief": 0, "repair": 1, "needs-research": 2}
    results.sort(key=lambda item: (order[item.decision], -item.score, item.title.lower()))
    return [item.as_dict() for item in results]


def build_research_queue(topics: Iterable[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Convert discovery output into an unscored queue for evidence collection."""

    created_at = datetime.now(timezone.utc).isoformat()
    return [
        {
            "title": str(topic.get("title", "")).strip(),
            "discoverySource": topic.get("source", "unknown"),
            "discoveredAt": topic.get("discovered_at", created_at),
            "status": "needs-research",
            "requiredEvidence": [
                "intended reader and problem",
                "demand signal with source",
                "three or more usable source URLs",
                "specific angle not covered by existing inventory",
                "content lane and CTA hypothesis",
                "all eight opportunity ratings",
            ],
        }
        for topic in topics
        if str(topic.get("title", "")).strip()
    ]


def main() -> None:
    parser = argparse.ArgumentParser(description="Rank researched Trends Today topics")
    parser.add_argument("input", type=Path, help="JSON array of researched candidates")
    parser.add_argument("--output", type=Path, help="Write ranked JSON to this path")
    args = parser.parse_args()

    with args.input.open("r", encoding="utf-8") as handle:
        candidates = json.load(handle)
    if not isinstance(candidates, list):
        raise StrategyError("Input must be a JSON array")

    payload = {
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "results": rank_candidates(candidates),
    }
    rendered = json.dumps(payload, indent=2)
    if args.output:
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(rendered + "\n", encoding="utf-8")
    else:
        print(rendered)


if __name__ == "__main__":
    main()
