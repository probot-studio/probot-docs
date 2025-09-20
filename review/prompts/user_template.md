Prompt-Version: {{prompt_version}}
Review-Date: {{timestamp}}
Model-Target: gpt-5-high-thinking

You will review the following Markdown files from the `docs/yazilim/` tree. Full contents follow, separated by boundary markers.

Context reminders:
- Metrics definition file: `review/metrics.yaml`
- Prior human scores (if any) are included inline.
- Compare pages against each other; highlight outliers through scoring.

{{#files}}
===== FILE START =====
Path: {{path}}
Previous-Scores: {{previous_scores}}
Auto-Summary: {{summary}}
---
{{content}}
===== FILE END =====

{{/files}}

Instructions:
1. Reflect on the set as a whole: what patterns, strengths, or weaknesses stand out?
2. For each page, reason step-by-step about every metric before deciding on a score.
3. Keep the reasoning internal; the final response must be the JSON object required by the system prompt. Do not include explanatory text outside JSON.
