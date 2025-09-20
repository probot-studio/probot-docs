#!/usr/bin/env python3
"""Rank documentation pages based on review metrics stored in review.md.

Expected review format (per page):

## docs/yazilim/example.md
- Anlaşılırlık: -2
- Dil Doğallığı: 6
- ...

Metric values must be between -10 and 10. Lines missing metrics are ignored.
"""
from __future__ import annotations

import argparse
import math
import sys
import unicodedata
from pathlib import Path
from typing import Dict, List, Tuple

# Metric keys are normalized via slugify() so accents or spaces do not matter.
METRIC_LABELS = {
    "anlasilirlik": "Anlaşılırlık",
    "kapsam_baglam": "Kapsam & Bağlam",
    "adim_acikligi": "Adım Açıklığı",
    "dil_dogalligi": "Dil Doğallığı",
    "ilgi_motivasyon": "İlgi & Motivasyon",
    "guvenlik_gerceklik": "Güvenlik & Gerçeklik",
    "gorsel_kod_destekleri": "Görsel/Kod Destekleri",
    "uygulanabilirlik": "Uygulanabilirlik",
}

PRIORITY_WEIGHTS = {
    "anlasilirlik": 1.0,
    "kapsam_baglam": 0.9,
    "adim_acikligi": 1.0,
    "dil_dogalligi": 0.7,
    "ilgi_motivasyon": 0.7,
    "guvenlik_gerceklik": 1.0,
    "gorsel_kod_destekleri": 0.6,
    "uygulanabilirlik": 1.0,
}

SCALE_MIN = -10.0
SCALE_MAX = 10.0


TRANSLATIONS = str.maketrans({
    "ı": "i",
    "İ": "I",
    "ş": "s",
    "Ş": "S",
    "ğ": "g",
    "Ğ": "G",
    "ö": "o",
    "Ö": "O",
    "ü": "u",
    "Ü": "U",
    "ç": "c",
    "Ç": "C",
})


def slugify(label: str) -> str:
    """Return ASCII slug used for metric lookup."""
    translated = label.translate(TRANSLATIONS)
    normalized = unicodedata.normalize("NFKD", translated)
    ascii_only = normalized.encode("ascii", "ignore").decode("ascii")
    cleaned = []
    for char in ascii_only.lower():
        if char.isalnum():
            cleaned.append(char)
        else:
            cleaned.append("_")
    slug = "".join(cleaned)
    while "__" in slug:
        slug = slug.replace("__", "_")
    return slug.strip("_")


def parse_review(path: Path) -> Dict[str, Dict[str, float]]:
    """Parse metrics from review markdown file."""
    pages: Dict[str, Dict[str, float]] = {}
    current_page: str | None = None
    for raw_line in path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if line.startswith("## "):
            current_page = line[3:].strip()
            pages[current_page] = {}
            continue
        if not current_page or not line or not line.startswith("-"):
            continue
        bits = line.lstrip("- ").split(":", 1)
        if len(bits) != 2:
            continue
        label, value_part = bits
        slug = slugify(label)
        if slug not in METRIC_LABELS:
            continue
        try:
            value = float(value_part.strip())
        except ValueError:
            continue
        if not (SCALE_MIN <= value <= SCALE_MAX):
            raise ValueError(
                f"Metric '{label}' for {current_page} must be between {SCALE_MIN} and {SCALE_MAX}."
            )
        pages[current_page][slug] = value
    return pages


def compute_priority(scores: Dict[str, float]) -> Tuple[float, float, float, float]:
    """Return (priority_score, mean_score, worst_score, coverage_ratio)."""
    if not scores:
        return (math.inf, math.nan, math.nan, 0.0)
    values = [scores[m] for m in METRIC_LABELS if m in scores]
    if not values:
        return (math.inf, math.nan, math.nan, 0.0)
    weights = [PRIORITY_WEIGHTS[m] for m in METRIC_LABELS if m in scores]
    weighted_mean = sum(v * w for v, w in zip(values, weights)) / sum(weights)
    worst_value = min(values)
    # Blend worst metric with weighted mean to emphasize weak spots.
    priority = worst_value * 0.7 + weighted_mean * 0.3
    coverage = len(values) / len(METRIC_LABELS)
    return (priority, weighted_mean, worst_value, coverage)


def build_ranking(pages: Dict[str, Dict[str, float]]) -> List[Tuple[str, Dict[str, float], Tuple[float, float, float, float]]]:
    """Attach aggregate stats to each page and sort by priority."""
    enriched = []
    for page, metrics in pages.items():
        stats = compute_priority(metrics)
        enriched.append((page, metrics, stats))
    enriched.sort(key=lambda item: (item[2][0], item[2][1]))
    return enriched


def print_report(ranked: List[Tuple[str, Dict[str, float], Tuple[float, float, float, float]]]) -> None:
    """Pretty-print ranking and highlight data coverage."""
    print("Needs Attention (lowest scores first):")
    for index, (page, metrics, stats) in enumerate(ranked, 1):
        priority, mean_score, worst_score, coverage = stats
        coverage_pct = int(coverage * 100)
        if math.isinf(priority):
            summary = "no metrics recorded"
        else:
            summary = (
                f"priority {priority:.2f}, mean {mean_score:.2f}, "
                f"worst {worst_score:.2f}, metrics {coverage_pct}%"
            )
        print(f"{index:2d}. {page} -> {summary}")
    print()
    print("Strongest Pages (highest mean scores):")
    ranked_by_mean = sorted(
        ranked,
        key=lambda item: item[2][1] if not math.isnan(item[2][1]) else -math.inf,
        reverse=True,
    )
    for index, (page, metrics, stats) in enumerate(ranked_by_mean, 1):
        mean_score = stats[1]
        if math.isnan(mean_score):
            continue
        print(f"{index:2d}. {page} -> mean {mean_score:.2f}")


def main(argv: List[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Rank pages using review metrics.")
    parser.add_argument(
        "review_file",
        type=Path,
        nargs="?",
        default=Path("review.md"),
        help="Markdown file containing review headings and metric scores.",
    )
    args = parser.parse_args(argv)
    if not args.review_file.exists():
        print(f"Review file not found: {args.review_file}", file=sys.stderr)
        return 1
    pages = parse_review(args.review_file)
    if not pages:
        print("No review data found.")
        return 0
    ranked = build_ranking(pages)
    print_report(ranked)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
