#!/usr/bin/env python3
"""Generate review prompts and call GPT-5 High Thinking to score docs/yazilim pages."""
from __future__ import annotations

import argparse
import datetime as dt
import hashlib
import json
import os
import sys
from dataclasses import dataclass
import time
from pathlib import Path
from typing import Dict, List, Optional, Tuple

import yaml

try:
    from openai import OpenAI
except ImportError:  # pragma: no cover
    OpenAI = None  # type: ignore

REPO_ROOT = Path(__file__).resolve().parents[1]
DEFAULT_METRICS_FILE = REPO_ROOT / "review" / "metrics.yaml"
DEFAULT_SYSTEM_PROMPT = REPO_ROOT / "review" / "prompts" / "system.md"
DEFAULT_USER_TEMPLATE = REPO_ROOT / "review" / "prompts" / "user_template.md"
DEFAULT_REVIEW_MD = REPO_ROOT / "review.md"
DEFAULT_LOG_DIR = REPO_ROOT / "review" / "logs"
DOCS_DIR = REPO_ROOT / "docs" / "yazilim"

MODEL_NAME = "gpt-5-chat-latest"


@dataclass
class MetricSpec:
    key: str
    label: str
    description: str
    weight: float
    min_value: float
    max_value: float


@dataclass
class FilePayload:
    path: str
    content: str
    sha256: str
    previous_scores: Dict[str, float]


def load_metrics(path: Path) -> Tuple[str, Dict[str, MetricSpec]]:
    data = yaml.safe_load(path.read_text(encoding="utf-8"))
    prompt_version = str(data.get("prompt_version", "unknown"))
    specs: Dict[str, MetricSpec] = {}
    for key, item in data.get("metrics", {}).items():
        label = item.get("label", key)
        desc = item.get("description", "")
        rng = item.get("range", [-10, 10])
        weight = float(item.get("weight", 1.0))
        specs[key] = MetricSpec(
            key=key,
            label=label,
            description=desc,
            weight=weight,
            min_value=float(rng[0]),
            max_value=float(rng[1]),
        )
    return prompt_version, specs


def slugify_label(label: str) -> str:
    mapping = {
        "ı": "i", "İ": "I", "ş": "s", "Ş": "S",
        "ğ": "g", "Ğ": "G", "ö": "o", "Ö": "O",
        "ü": "u", "Ü": "U", "ç": "c", "Ç": "C",
    }
    translated = label.translate(str.maketrans(mapping))
    parts = []
    prev_underscore = False
    for ch in translated:
        if ch.isalnum():
            parts.append(ch.lower())
            prev_underscore = False
        else:
            if not prev_underscore:
                parts.append("_")
                prev_underscore = True
    slug = "".join(parts).strip("_")
    return slug


def load_previous_scores(review_md: Path, specs: Dict[str, MetricSpec]) -> Dict[str, Dict[str, float]]:
    if not review_md.exists():
        return {}
    label_to_key = {spec.label: spec.key for spec in specs.values()}
    slug_to_key = {slugify_label(spec.label): spec.key for spec in specs.values()}
    current: Optional[str] = None
    scores: Dict[str, Dict[str, float]] = {}
    temp: Dict[str, float] = {}
    for line in review_md.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if line.startswith("## "):
            if current and temp:
                scores[current] = temp
            current = line[3:].strip()
            temp = {}
            continue
        if line.startswith("- ") and current:
            try:
                key_part, value_part = line[2:].split(":", 1)
            except ValueError:
                continue
            key_part = key_part.strip()
            value_str = value_part.strip()
            try:
                value = float(value_str)
            except ValueError:
                continue
            metric_key = label_to_key.get(key_part)
            if not metric_key:
                metric_key = slug_to_key.get(slugify_label(key_part))
            if metric_key:
                temp[metric_key] = value
    if current and temp:
        scores[current] = temp
    return scores


def read_docs(directory: Path, specs: Dict[str, MetricSpec], previous: Dict[str, Dict[str, float]]) -> List[FilePayload]:
    files: List[FilePayload] = []
    for path in sorted(directory.rglob("*.md")):
        rel_path = str(path.relative_to(REPO_ROOT))
        content = path.read_text(encoding="utf-8")
        sha = hashlib.sha256(content.encode("utf-8")).hexdigest()
        files.append(
            FilePayload(
                path=rel_path,
                content=content,
                sha256=sha,
                previous_scores=previous.get(rel_path, {}),
            )
        )
    return files


def build_user_prompt(template_path: Path, prompt_version: str, files: List[FilePayload]) -> str:
    template = template_path.read_text(encoding="utf-8")
    timestamp = dt.datetime.utcnow().isoformat(timespec="seconds") + "Z"

    if "{{#files}}" in template:
        before, rest = template.split("{{#files}}", 1)
        block, after = rest.split("{{/files}}", 1)
    else:
        before, block, after = template, "", ""

    def replace_simple(text: str) -> str:
        return (
            text.replace("{{prompt_version}}", prompt_version)
            .replace("{{timestamp}}", timestamp)
        )

    rendered_files = []
    for payload in files:
        section = block
        prev = payload.previous_scores
        if prev:
            prev_str = ", ".join(f"{k}={v:+.1f}" for k, v in prev.items())
        else:
            prev_str = "None"
        summary = payload.content.replace("\n", " ")
        if len(summary) > 400:
            summary = summary[:400] + "…"
        section = (
            section.replace("{{path}}", payload.path)
            .replace("{{previous_scores}}", prev_str)
            .replace("{{summary}}", summary)
            .replace("{{content}}", payload.content)
        )
        section = replace_simple(section)
        rendered_files.append(section)

    prompt = replace_simple(before) + "".join(rendered_files) + replace_simple(after)
    return prompt


def ensure_logs_dir(log_dir: Path) -> None:
    log_dir.mkdir(parents=True, exist_ok=True)


def call_model(system_prompt: str, user_prompt: str, dry_run: bool = False) -> Dict[str, object]:
    if dry_run:
        return {
            "dry_run": True,
            "system_prompt": system_prompt,
            "user_prompt": user_prompt,
        }
    if OpenAI is None:
        raise RuntimeError("openai package is not available. Install openai>=1.0.0.")
    client = OpenAI()

    last_error: Optional[str] = None
    for attempt in range(6):
        try:
            response = client.responses.create(
                model=MODEL_NAME,
                input=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
            )
            break
        except Exception as exc:  # broad to inspect type without importing specific classes
            last_error = str(exc)
            msg = str(exc)
            if "rate limit" in msg.lower() or "please try again" in msg.lower():
                time.sleep(3 + attempt)
                continue
            if "temporary failure" in msg.lower() or "connection" in msg.lower():
                time.sleep(2 + attempt)
                continue
            raise
    else:
        raise RuntimeError(f"Model call failed after retries: {last_error}")
    response_dict = response.model_dump()

    # Extract JSON string from the first textual output chunk.
    json_payload: Optional[str] = None
    for item in response_dict.get("output", []):
        if item.get("type") == "message":
            for content_item in item.get("content", []):
                if content_item.get("type") == "output_text":
                    json_payload = content_item.get("text")
                    break
        if json_payload:
            break
    if not json_payload:
        raise ValueError("Model response missing JSON content.")
    text = json_payload.strip()
    if text.startswith("```"):
        lines = text.splitlines()
        if len(lines) >= 2 and lines[0].startswith("```") and lines[-1].startswith("```"):
            text = "\n".join(lines[1:-1]).strip()

    parsed: Optional[Dict[str, object]] = None
    parse_error: Optional[str] = None
    try:
        parsed = json.loads(text)
    except json.JSONDecodeError as exc:
        parse_error = str(exc)

    return {
        "response": response_dict,
        "parsed": parsed,
        "raw_json": json_payload,
        "parse_error": parse_error,
    }


def write_log(log_dir: Path, payload: Dict[str, object], files: List[FilePayload], prompt_version: str, system_prompt: str, user_prompt: str, batch_index: int, batch_total: int) -> Path:
    ensure_logs_dir(log_dir)
    timestamp = dt.datetime.utcnow().strftime("%Y%m%dT%H%M%SZ")
    suffix = f"-{batch_index + 1:02d}of{batch_total:02d}" if batch_total > 1 else ""
    log_path = log_dir / f"review-{timestamp}{suffix}.json"
    log_doc = {
        "timestamp": timestamp,
        "model": MODEL_NAME,
        "prompt_version": prompt_version,
        "files": [
            {
                "path": f.path,
                "sha256": f.sha256,
                "previous_scores": f.previous_scores,
            }
            for f in files
        ],
        "system_prompt": system_prompt,
        "user_prompt": user_prompt,
        "result": payload,
    }
    log_path.write_text(json.dumps(log_doc, ensure_ascii=False, indent=2), encoding="utf-8")
    return log_path


def parse_args(argv: Optional[List[str]] = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Run GPT-based documentation review.")
    parser.add_argument("--metrics", type=Path, default=DEFAULT_METRICS_FILE, help="Path to metrics.yaml")
    parser.add_argument("--system-prompt", type=Path, default=DEFAULT_SYSTEM_PROMPT, help="Path to system prompt")
    parser.add_argument("--user-template", type=Path, default=DEFAULT_USER_TEMPLATE, help="Path to user prompt template")
    parser.add_argument("--review-md", type=Path, default=DEFAULT_REVIEW_MD, help="Path to existing review.md for previous scores")
    parser.add_argument("--docs-dir", type=Path, default=DOCS_DIR, help="Docs directory to scan")
    parser.add_argument("--log-dir", type=Path, default=DEFAULT_LOG_DIR, help="Directory to write JSON logs")
    parser.add_argument("--dry-run", action="store_true", help="Do not call the API; output prompts only")
    parser.add_argument("--print", dest="print_prompts", action="store_true", help="Print prompts to stdout")
    parser.add_argument("--batch-size", type=int, default=5, help="Number of files per API call (ignored when --groups-file is set)")
    parser.add_argument("--groups-file", type=Path, help="YAML file describing explicit groups of file paths")
    return parser.parse_args(argv)


def main(argv: Optional[List[str]] = None) -> int:
    args = parse_args(argv)
    prompt_version, specs = load_metrics(args.metrics)
    previous = load_previous_scores(args.review_md, specs)
    files = read_docs(args.docs_dir, specs, previous)
    if not files:
        print("No markdown files found to review.")
        return 1

    system_prompt = args.system_prompt.read_text(encoding="utf-8")

    groups: List[List[FilePayload]] = []
    if args.groups_file:
        groups_data = yaml.safe_load(args.groups_file.read_text(encoding="utf-8"))
        if not isinstance(groups_data, list):
            raise ValueError("groups file must be a list")
        path_map = {f.path: f for f in files}
        for entry in groups_data:
            if isinstance(entry, dict) and "files" in entry:
                group_paths = entry["files"]
            else:
                group_paths = entry
            if not isinstance(group_paths, list):
                raise ValueError("each group must be a list of paths or a dict with 'files'")
            group_payloads: List[FilePayload] = []
            for path in group_paths:
                if path not in path_map:
                    raise ValueError(f"Path '{path}' in groups file not found among docs")
                group_payloads.append(path_map[path])
            groups.append(group_payloads)
    else:
        batch_size = max(1, args.batch_size)
        total_batches = (len(files) + batch_size - 1) // batch_size
        for batch_index in range(total_batches):
            groups.append(files[batch_index * batch_size : (batch_index + 1) * batch_size])

    total_batches = len(groups)
    for batch_index, batch_files in enumerate(groups):
        user_prompt = build_user_prompt(args.user_template, prompt_version, batch_files)

        if args.print_prompts:
            print("=== SYSTEM PROMPT ===")
            print(system_prompt)
            print("=== USER PROMPT ===")
            print(user_prompt)

        payload = call_model(system_prompt, user_prompt, dry_run=args.dry_run)
        log_path = write_log(
            args.log_dir,
            payload,
            batch_files,
            prompt_version,
            system_prompt,
            user_prompt,
            batch_index,
            total_batches,
        )

        print(f"Review log written to {log_path}")
        if not args.dry_run:
            print("Parsed metrics (batch {}/{})".format(batch_index + 1, total_batches))
            if payload.get("parse_error"):
                print(f"  Warning: parse error -> {payload['parse_error']}")
            parsed = payload.get("parsed", {})
            if isinstance(parsed, dict):
                files_data = parsed.get("files")
                if isinstance(files_data, list):
                    for item in files_data:
                        print(f"- {item.get('path')}: {item.get('metrics')}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
