#!/usr/bin/env python3
"""Mechanically upgrade legacy MDX articles without inventing new reporting."""

from __future__ import annotations

import argparse
import json
import re
from dataclasses import asdict, dataclass
from datetime import datetime
from pathlib import Path
from typing import Iterable, List, Tuple
from urllib.parse import urlparse

import yaml


REPO_ROOT = Path(__file__).resolve().parents[2]
CONTENT_ROOT = REPO_ROOT / "content"
DEFAULT_REPORT = (
    REPO_ROOT
    / "artifacts"
    / "editorial"
    / "archive-quality-audit-2026-07-23.json"
)
LEGACY_BYLINES = {
    "Alex Chen",
    "David Kim",
    "Emma Thompson",
    "Sarah Martinez",
    "Trends Today",
    "Trends Today Team",
    "Trends Today Editorial Team",
}
UPGRADE_TIMESTAMP = "2026-07-23T18:15:00-07:00"
ARCHIVE_METHOD = (
    "This archive article was reformatted from its original text and cited "
    "links during the July 2026 readability review. The sources were not "
    "freshly re-reported during that formatting pass."
)
REVIEW_METADATA_RENAMES = {
    "editorialReviewedBy": "originalEditorialReviewedBy",
    "editorialReviewVerdict": "originalEditorialReviewVerdict",
    "editorialReviewModel": "originalEditorialReviewModel",
    "editorialReviewScores": "originalEditorialReviewScores",
    "editorialReviewArtifact": "originalEditorialReviewArtifact",
    "reviewedBy": "originalReviewedBy",
    "reviewVerdict": "originalReviewVerdict",
    "reviewModel": "originalReviewModel",
    "reviewArtifact": "originalIndependentReviewArtifact",
    "candidateSha256": "originalCandidateSha256",
    "promotedAt": "originalPromotedAt",
}


@dataclass
class ArticleAudit:
    path: str
    changed: bool
    words: int
    h2_sections: int
    list_items: int
    external_urls: int
    minimum_external_sources: int
    has_sources_heading: bool
    has_highlights: bool
    has_reporting_method: bool
    maximum_paragraph_words: int
    prose_em_dashes: int
    source_refresh_required: bool
    issues: List[str]


def split_document(text: str) -> Tuple[str, str]:
    match = re.match(r"^---\s*\n(.*?)\n---\s*\n?", text, re.DOTALL)
    if not match:
        raise ValueError("missing YAML frontmatter")
    return match.group(1), text[match.end() :]


def yaml_quote(value: str) -> str:
    return "'" + value.replace("'", "''") + "'"


def upsert_scalar(frontmatter: str, key: str, value: str) -> str:
    replacement = f"{key}: {yaml_quote(value)}"
    pattern = re.compile(rf"^{re.escape(key)}:\s*.*$", re.MULTILINE)
    if pattern.search(frontmatter):
        return pattern.sub(replacement, frontmatter, count=1)
    return f"{frontmatter.rstrip()}\n{replacement}"


def rename_frontmatter_key(frontmatter: str, old: str, new: str) -> str:
    """Preserve an original release review without implying it covers new bytes."""
    pattern = re.compile(rf"^{re.escape(old)}:", re.MULTILINE)
    if not pattern.search(frontmatter):
        return frontmatter
    return pattern.sub(f"{new}:", frontmatter, count=1)


def append_highlights(frontmatter: str, highlights: Iterable[str]) -> str:
    if re.search(r"^highlights:\s*", frontmatter, re.MULTILINE):
        return frontmatter
    lines = ["highlights:"]
    lines.extend(f"  - {yaml_quote(item)}" for item in highlights)
    return f"{frontmatter.rstrip()}\n" + "\n".join(lines)


def clean_markdown(text: str) -> str:
    text = re.sub(r"!\[[^\]]*\]\([^)]+\)", "", text)
    text = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", text)
    text = re.sub(r"[*_`#>]", "", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


def candidate_sentences(body: str, description: str = "") -> List[str]:
    candidates: List[str] = []
    if description:
        candidates.append(clean_markdown(description))

    in_sources = False
    for block in re.split(r"\n\s*\n", body):
        stripped = block.strip()
        if re.match(r"^##\s+sources\s*$", stripped, re.IGNORECASE):
            in_sources = True
            continue
        if in_sources:
            continue
        if (
            not stripped
            or stripped.startswith(("#", ">", "|", "```"))
            or re.match(r"^(?:[-*+]\s+|\d+\.\s+)", stripped)
        ):
            continue
        for sentence in re.split(r"(?<=[.!?])\s+", clean_markdown(stripped)):
            sentence = sentence.strip()
            words = sentence.split()
            if 8 <= len(words) <= 34 and not sentence.lower().startswith("source"):
                candidates.append(sentence)
        if len(candidates) >= 8:
            break

    unique: List[str] = []
    seen = set()
    for candidate in candidates:
        normalized = re.sub(r"\W+", " ", candidate).strip().lower()
        if not normalized or normalized in seen:
            continue
        seen.add(normalized)
        unique.append(candidate)
        if len(unique) == 3:
            return unique

    headings = [
        clean_markdown(value)
        for value in re.findall(r"^##\s+(.+)$", body, re.MULTILINE)
        if value.strip().lower() != "sources"
    ]
    for heading in headings:
        normalized = re.sub(r"\W+", " ", heading).strip().lower()
        if normalized and normalized not in seen:
            seen.add(normalized)
            unique.append(heading)
        if len(unique) == 3:
            break
    return unique


def replace_prose_em_dashes(body: str) -> str:
    lines: List[str] = []
    in_sources = False
    for line in body.splitlines():
        stripped = line.strip()
        if re.match(r"^##\s+sources\s*$", stripped, re.IGNORECASE):
            in_sources = True
        elif in_sources and re.match(r"^##\s+\S", stripped):
            in_sources = False
        if in_sources or stripped.startswith(">") or '"' in line:
            lines.append(line)
            continue
        line = line.replace(" — ", "; ").replace("—", " - ")
        lines.append(line)
    return "\n".join(lines) + ("\n" if body.endswith("\n") else "")


def append_existing_sources(body: str) -> str:
    """Add a visible source list using only links already present in the article."""
    if re.search(r"^##\s+sources\s*$", body, re.IGNORECASE | re.MULTILINE):
        return body

    links: List[Tuple[str, str]] = []
    seen = set()
    for anchor, url in re.findall(r"\[([^\]]+)\]\((https?://[^)\s]+)\)", body):
        if url in seen:
            continue
        seen.add(url)
        links.append((clean_markdown(anchor), url))
    for url in re.findall(r"(?<!\()https?://[^)\s>]+", body):
        if url in seen:
            continue
        seen.add(url)
        links.append((urlparse(url).netloc, url))

    if not links:
        return body
    source_lines = ["## Sources"]
    source_lines.extend(f"- [{anchor or urlparse(url).netloc}]({url})" for anchor, url in links)
    return body.rstrip() + "\n\n" + "\n".join(source_lines) + "\n"


def split_long_paragraphs(body: str, maximum_words: int = 80) -> str:
    blocks = re.split(r"(\n\s*\n)", body)
    rewritten: List[str] = []
    for block in blocks:
        stripped = block.strip()
        if (
            not stripped
            or block.isspace()
            or stripped.startswith(("#", ">", "|", "```"))
            or re.match(r"^(?:[-*+]\s+|\d+\.\s+)", stripped)
            or len(stripped.split()) <= maximum_words
        ):
            rewritten.append(block)
            continue

        sentences = re.split(r"(?<=[.!?])\s+", stripped)
        if len(sentences) < 2 or any(
            len(sentence.split()) > maximum_words for sentence in sentences
        ):
            rewritten.append(block)
            continue

        groups: List[str] = []
        current: List[str] = []
        current_words = 0
        for sentence in sentences:
            sentence_words = len(sentence.split())
            if current and current_words + sentence_words > maximum_words:
                groups.append(" ".join(current))
                current = []
                current_words = 0
            current.append(sentence)
            current_words += sentence_words
        if current:
            groups.append(" ".join(current))
        rewritten.append("\n\n".join(groups))
    return "".join(rewritten)


def paragraph_word_counts(body: str) -> List[int]:
    counts: List[int] = []
    for block in re.split(r"\n\s*\n", body):
        stripped = block.strip()
        if (
            not stripped
            or stripped.startswith(("#", ">", "|", "```"))
            or re.match(r"^(?:[-*+]\s+|\d+\.\s+)", stripped)
        ):
            continue
        counts.append(len(stripped.split()))
    return counts


def prose_em_dash_count(body: str) -> int:
    count = 0
    in_sources = False
    for line in body.splitlines():
        stripped = line.strip()
        if re.match(r"^##\s+sources\s*$", stripped, re.IGNORECASE):
            in_sources = True
            continue
        if in_sources and re.match(r"^##\s+\S", stripped):
            in_sources = False
        if in_sources or stripped.startswith(">"):
            continue
        count += re.sub(r'"[^"\r\n]*"', "", line).count("—")
    return count


def audit_document(path: Path, text: str, changed: bool = False) -> ArticleAudit:
    issues: List[str] = []
    try:
        frontmatter, body = split_document(text)
        metadata = yaml.safe_load(frontmatter) or {}
    except Exception as exc:
        return ArticleAudit(
            path=path.as_posix(),
            changed=changed,
            words=0,
            h2_sections=0,
            list_items=0,
            external_urls=0,
            minimum_external_sources=3,
            has_sources_heading=False,
            has_highlights=False,
            has_reporting_method=False,
            maximum_paragraph_words=0,
            prose_em_dashes=0,
            source_refresh_required=True,
            issues=[f"frontmatter parse failed: {exc}"],
        )

    body_words = len(re.findall(r"\b[\w’'-]+\b", body))
    h2_sections = len(re.findall(r"^##\s+\S", body, re.MULTILINE))
    list_items = len(
        re.findall(r"^(?:[-*+]\s+|\d+\.\s+)", body, re.MULTILINE)
    )
    urls = set(re.findall(r"https?://[^)\s>]+", body))
    has_sources = bool(
        re.search(r"^##\s+sources\s*$", body, re.IGNORECASE | re.MULTILINE)
    )
    paragraphs = paragraph_word_counts(body)
    maximum_paragraph = max(paragraphs, default=0)
    em_dashes = prose_em_dash_count(body)
    highlights = metadata.get("highlights")
    has_highlights = isinstance(highlights, list) and len(highlights) >= 3
    has_method = bool(metadata.get("reportingMethod"))
    story_type = str(metadata.get("storyType") or "legacy")
    minimum_sources = {
        "bulletin": 1,
        "reported-update": 2,
        "guide-or-explainer": 3,
        "legacy": 3,
    }.get(story_type, 3)
    source_refresh_required = (
        metadata.get("archiveReviewStatus") == "format-reviewed-needs-source-refresh"
        or not has_sources
        or len(urls) < minimum_sources
    )

    minimum_words = {
        "bulletin": 250,
        "reported-update": 400,
        "guide-or-explainer": 500,
        "legacy": 300,
    }.get(story_type, 300)
    if body_words < minimum_words:
        issues.append(f"under {minimum_words} words for {story_type}")
    if not has_sources:
        issues.append("missing Sources section")
    if len(urls) < minimum_sources:
        issues.append(
            f"fewer than {minimum_sources} external source link(s) required "
            f"for {story_type}"
        )
    if not has_highlights:
        issues.append("missing three article highlights")
    if not has_method:
        issues.append("missing reporting method")
    if maximum_paragraph > 80:
        issues.append(f"paragraph exceeds 80 words ({maximum_paragraph})")
    if em_dashes:
        issues.append(f"{em_dashes} prose em dash(es)")

    return ArticleAudit(
        path=path.as_posix(),
        changed=changed,
        words=body_words,
        h2_sections=h2_sections,
        list_items=list_items,
        external_urls=len(urls),
        minimum_external_sources=minimum_sources,
        has_sources_heading=has_sources,
        has_highlights=has_highlights,
        has_reporting_method=has_method,
        maximum_paragraph_words=maximum_paragraph,
        prose_em_dashes=em_dashes,
        source_refresh_required=source_refresh_required,
        issues=issues,
    )


def upgrade_document(text: str) -> Tuple[str, bool]:
    frontmatter, body = split_document(text)
    metadata = yaml.safe_load(frontmatter) or {}
    original = text
    has_original_release_review = bool(
        metadata.get("candidateSha256") or metadata.get("originalCandidateSha256")
    )

    for old_key, new_key in REVIEW_METADATA_RENAMES.items():
        frontmatter = rename_frontmatter_key(frontmatter, old_key, new_key)

    author = metadata.get("author")
    if isinstance(author, str) and author in LEGACY_BYLINES:
        frontmatter = upsert_scalar(
            frontmatter, "author", "Trends Today Newsroom"
        )

    highlights = metadata.get("highlights")
    if not isinstance(highlights, list) or len(highlights) < 3:
        extracted = candidate_sentences(body, str(metadata.get("description", "")))
        if len(extracted) >= 3:
            frontmatter = append_highlights(frontmatter, extracted[:3])

    if not metadata.get("reportingMethod"):
        frontmatter = upsert_scalar(frontmatter, "reportingMethod", ARCHIVE_METHOD)
        frontmatter = upsert_scalar(
            frontmatter,
            "archiveReviewStatus",
            "format-reviewed-needs-source-refresh",
        )
        frontmatter = upsert_scalar(
            frontmatter, "archiveReviewNote", "Sources not freshly reverified"
        )
    elif has_original_release_review:
        frontmatter = upsert_scalar(
            frontmatter,
            "archiveReviewStatus",
            "format-reviewed-original-release-check-preserved",
        )
        frontmatter = upsert_scalar(
            frontmatter,
            "archiveReviewNote",
            "Original release review preserved; July 2026 pass changed presentation",
        )

    body = replace_prose_em_dashes(body)
    body = split_long_paragraphs(body)
    body = append_existing_sources(body)

    provisional = f"---\n{frontmatter.rstrip()}\n---\n\n{body.lstrip()}"
    if provisional != original:
        frontmatter = upsert_scalar(frontmatter, "modifiedAt", UPGRADE_TIMESTAMP)

    upgraded = f"---\n{frontmatter.rstrip()}\n---\n\n{body.lstrip()}"
    return upgraded, upgraded != original


def run(
    content_root: Path = CONTENT_ROOT,
    report_path: Path = DEFAULT_REPORT,
    apply_changes: bool = False,
) -> dict:
    audits: List[ArticleAudit] = []
    changed_count = 0

    for path in sorted(content_root.glob("**/*.mdx")):
        original = path.read_text(encoding="utf-8-sig")
        updated, changed = upgrade_document(original)
        if apply_changes and changed:
            path.write_text(updated, encoding="utf-8", newline="\n")
            changed_count += 1
        audits.append(
            audit_document(path.relative_to(REPO_ROOT), updated, changed=changed)
        )

    summary = {
        "generatedAt": datetime.now().astimezone().isoformat(),
        "mode": "apply" if apply_changes else "dry-run",
        "articles": len(audits),
        "changedArticles": changed_count if apply_changes else sum(a.changed for a in audits),
        "sourceRefreshRequired": sum(a.source_refresh_required for a in audits),
        "remainingIssues": sum(bool(a.issues) for a in audits),
        "issueCounts": {
            "underMinimumWords": sum(
                any(issue.startswith("under ") for issue in a.issues)
                for a in audits
            ),
            "missingSourcesSection": sum(not a.has_sources_heading for a in audits),
            "underRequiredExternalSources": sum(
                a.external_urls < a.minimum_external_sources for a in audits
            ),
            "missingHighlights": sum(not a.has_highlights for a in audits),
            "missingReportingMethod": sum(
                not a.has_reporting_method for a in audits
            ),
            "paragraphOver80Words": sum(
                a.maximum_paragraph_words > 80 for a in audits
            ),
            "proseEmDashes": sum(a.prose_em_dashes for a in audits),
        },
    }
    payload = {"summary": summary, "articles": [asdict(a) for a in audits]}

    if apply_changes:
        report_path.parent.mkdir(parents=True, exist_ok=True)
        report_path.write_text(
            json.dumps(payload, indent=2, ensure_ascii=False) + "\n",
            encoding="utf-8",
            newline="\n",
        )
    return payload


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true")
    parser.add_argument("--content-root", type=Path, default=CONTENT_ROOT)
    parser.add_argument("--report", type=Path, default=DEFAULT_REPORT)
    args = parser.parse_args()
    payload = run(
        content_root=args.content_root,
        report_path=args.report,
        apply_changes=args.apply,
    )
    print(json.dumps(payload["summary"], indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
