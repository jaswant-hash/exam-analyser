"""
ExamAI — Pure Gemini Grading Service
---------------------------------------------
Single endpoint: POST /analyse
Engine: Gemini 2.5 Flash (REST API, no local ML)
Speed: ~5s for full syllabus × answer cross-comparison
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import re
import logging
import requests as http_req
import json
import os

logging.basicConfig(level=logging.INFO)
log = logging.getLogger("examai")

app = Flask(__name__)

# Restrict CORS to known origins in production via env var
ALLOWED_ORIGINS = os.environ.get("ALLOWED_ORIGINS", "*")
CORS(app, origins=ALLOWED_ORIGINS)

# ── Gemini config ─────────────────────────────────────────────
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    log.warning("GEMINI_API_KEY is not set — /analyse will return 500")

GEMINI_MODELS = ["gemini-2.5-flash", "gemini-2.0-flash"]
GEMINI_BASE   = "https://generativelanguage.googleapis.com/v1beta/models"

# ── Limits ────────────────────────────────────────────────────
MAX_INPUT_CHARS = 24_000   # ~6k tokens per slot; keeps well within Gemini context
MAX_OUTPUT_TOKENS = 8192   # enough for 20+ question exams


# ── Helpers ───────────────────────────────────────────────────
def clean(text: str) -> str:
    return re.sub(r"\s+", " ", str(text)).strip()

def truncate(text: str, limit: int = MAX_INPUT_CHARS) -> str:
    return text[:limit] if len(text) > limit else text

def build_resources(topic: str) -> list[dict]:
    q  = topic.replace(" ", "+")
    qe = topic.replace(" ", "%20")
    return [
        {
            "title": f"{topic} — Full Tutorial",
            "url":   f"https://www.youtube.com/results?search_query={q}+tutorial",
            "type":  "video",
        },
        {
            "title": f"{topic} — GeeksForGeeks",
            "url":   f"https://www.geeksforgeeks.org/search/?q={qe}",
            "type":  "article",
        },
        {
            "title": f"{topic} — W3Schools / TutorialsPoint",
            "url":   f"https://www.google.com/search?q={q}+tutorial+site:w3schools.com+OR+site:tutorialspoint.com",
            "type":  "article",
        },
    ]

def score_to_level(s: int) -> str:
    if s >= 80: return "Strong"
    if s >= 60: return "Moderate"
    if s >= 40: return "Weak"
    return "Gap"


# ── Gemini call ───────────────────────────────────────────────
def analyze_with_gemini(syllabus: str, questions: str, answers: str) -> dict:
    if not GEMINI_API_KEY:
        raise Exception("GEMINI_API_KEY environment variable is not set.")
    if not answers.strip():
        raise Exception("answerText is empty — nothing to analyse.")

    prompt = f"""You are a strict university professor and AI grading engine.
Analyse three documents and evaluate how well the student performed.

--- 1. SYLLABUS / COURSE PORTION ---
{syllabus}

--- 2. QUESTION PAPER ---
{questions}

--- 3. STUDENT ANSWER SHEET ---
{answers}

INSTRUCTIONS:
1. Extract every question from the question paper.
2. Map each question to its syllabus topic.
3. Read the student's answer for that question in the answer sheet.
4. Score their conceptual understanding 0-100 (pure semantic score, not grammar).
   Bands: 80-100 Strong | 60-79 Moderate | 40-59 Weak | 0-39 Gap
5. List specific missing or incorrect concepts.
6. Write 1-2 sentence actionable feedback.

Return ONE valid JSON object — NO markdown, NO code fences, RAW JSON only:
{{
  "topicResults": [
    {{
      "topic": "<Exact topic name from syllabus>",
      "question": "<Exact question text>",
      "coverage": <integer 0-100>,
      "missingConcepts": ["<concept 1>", "<concept 2>"],
      "geminiFeedback": "<1-2 sentence critique with specific missing marks>"
    }}
  ]
}}"""

    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "temperature": 0.1,
            "maxOutputTokens": MAX_OUTPUT_TOKENS,
            "responseMimeType": "application/json",
        },
    }

    for model in GEMINI_MODELS:
        try:
            url  = f"{GEMINI_BASE}/{model}:generateContent?key={GEMINI_API_KEY}"
            resp = http_req.post(url, json=payload, timeout=30)
            if not resp.ok:
                log.warning(f"{model} HTTP {resp.status_code}: {resp.text[:200]}")
                continue

            raw  = resp.json()
            text = raw["candidates"][0]["content"]["parts"][0]["text"].strip()

            # Bulletproof JSON extraction in case model adds any prefix text
            start = text.find("{")
            end   = text.rfind("}")
            if start != -1 and end != -1:
                text = text[start:end + 1]

            return json.loads(text)
        except Exception as e:
            log.error(f"Gemini [{model}] error: {e}")
            continue

    raise Exception("All Gemini models failed. Check API key and quota.")


# ── Study plan builder ────────────────────────────────────────
def build_revision_plan(gaps: list[dict]) -> list[dict]:
    hours_map = {"Critical": 3, "High": 2, "Low": 1}
    severity  = {"Critical": 0, "High": 1, "Low": 2}

    sorted_gaps  = sorted(gaps, key=lambda x: severity.get(x["weaknessLevel"], 3))
    days, bucket, bucket_h = [], [], 0.0

    for r in sorted_gaps:
        h = hours_map.get(r["weaknessLevel"], 1)
        if bucket_h + h > 4.0 and bucket:
            days.append((bucket, bucket_h))
            bucket, bucket_h = [], 0.0
        bucket.append(r)
        bucket_h += h
    if bucket:
        days.append((bucket, bucket_h))

    return [
        {
            "day":            i + 1,
            "topic":          " + ".join(t["topic"] for t in tpcs),
            "topics":         [t["topic"] for t in tpcs],
            "estimatedHours": round(th, 1),
            "tasks":          (
                [f"Focus on missing concept: {c}" for t in tpcs for c in t["missingConcepts"]][:3]
                or [f"Review {t['topic']}" for t in tpcs]
            ),
            "concepts":       list({c for t in tpcs for c in t["missingConcepts"]}),
            "resources":      tpcs[0]["resources"],
            "resource":       tpcs[0]["resources"][0],
        }
        for i, (tpcs, th) in enumerate(days)
    ]


# ── /analyse endpoint ─────────────────────────────────────────
@app.route("/analyse", methods=["POST"])
def analyse():
    try:
        data = request.get_json(force=True)

        syllabus_text = truncate(clean(data.get("syllabusText", "")))
        question_text = truncate(clean(data.get("questionText", "General Concepts Check")))
        answer_text   = truncate(clean(data.get("answerText",   "")))

        if not syllabus_text:
            return jsonify({"error": "syllabusText is required."}), 400
        if not answer_text:
            return jsonify({"error": "answerText is required."}), 400

        # ── Gemini grading ───────────────────────────────────
        raw_result = analyze_with_gemini(syllabus_text, question_text, answer_text)

        # ── Normalise results ────────────────────────────────
        results = []
        for r in raw_result.get("topicResults", []):
            score     = max(0, min(100, int(r.get("coverage", 0))))
            is_gap    = score < 60
            weakness  = "Critical" if score < 40 else "High" if score < 60 else "Low"
            resources = build_resources(r.get("topic", "Unknown"))

            results.append({
                "topic":           r.get("topic",          "Unknown"),
                "question":        r.get("question",        "N/A"),
                "coverage":        score,
                "geminiFeedback":  r.get("geminiFeedback", ""),
                "missingConcepts": list(r.get("missingConcepts", []))
                                   or ([r.get("topic", "")] if is_gap else []),
                "level":           score_to_level(score),
                "isGap":           is_gap,
                "weaknessLevel":   weakness if is_gap else "Low",
                "resources":       resources,
            })

        if not results:
            raise Exception("Gemini returned 0 topic results — check input quality.")

        gaps    = [r for r in results if r["isGap"]]
        covered = [r for r in results if not r["isGap"]]
        avg_cov = int(sum(r["coverage"] for r in results) / len(results))

        plan = build_revision_plan(gaps)

        payload = {
            "score":          avg_cov,
            "totalTopics":    len(results),
            "gapCount":       len(gaps),
            "coveredCount":   len(covered),
            "topicResults":   results,
            "weakTopics": [
                {
                    "topic":           r["topic"],
                    "weaknessLevel":   r["weaknessLevel"],
                    "coverage":        r["coverage"],
                    "missingConcepts": r["missingConcepts"],
                    "resources":       r["resources"],
                    "geminiFeedback":  r["geminiFeedback"],
                }
                for r in gaps
            ],
            "coveredTopics": [
                {"topic": r["topic"], "coverage": r["coverage"]} for r in covered
            ],
            "missingConcepts": [c for r in gaps for c in r["missingConcepts"]],
            "recommendations": [
                {
                    "topic":       r["topic"],
                    "priority":    "High" if r["weaknessLevel"] in ("Critical", "High") else "Medium",
                    "explanation": r["geminiFeedback"],
                    "resources":   r["resources"],
                }
                for r in gaps[:5]
            ],
            "revisionPlan": plan,
            "overallFeedback": (
                f"Gemini 2.5 Flash Analysis — {len(results)} questions mapped. "
                f"Semantic understanding: {avg_cov}%."
            ),
        }

        return jsonify(payload)

    except Exception as e:
        log.error("Analyse error: " + str(e))
        return jsonify({"error": str(e)}), 500


# ── /health endpoint ──────────────────────────────────────────
@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status": "ok",
        "engine": "gemini-2.5-flash",
        "key_set": bool(GEMINI_API_KEY),
    })


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5050, debug=False)
