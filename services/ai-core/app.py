import json
import logging
import os
from typing import Any, Dict, List, Optional

import google.generativeai as genai
import uvicorn
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from groq import Groq

load_dotenv()

LOG_LEVEL = os.getenv("LOG_LEVEL", "info").upper()
logging.basicConfig(level=getattr(logging, LOG_LEVEL, logging.INFO))
logger = logging.getLogger("ai-core")

PORT = int(os.getenv("PORT", "5001"))
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")
GROQ_MODEL = "llama-3.3-70b-versatile"

app = FastAPI(title="AI Layer Core", version="2.0.0")


class CodeAnalyzeRequest(BaseModel):
    language: str = Field(..., min_length=1)
    code: str = Field(..., min_length=1)
    response_language: str = Field(default="English")
    provider: str = Field(default="gemini")
    api_key: Optional[str] = Field(default=None)


class CircuitAnalyzeRequest(BaseModel):
    image: str = Field(..., min_length=1, description="Base64 encoded circuit image")
    response_language: str = Field(default="English")
    provider: str = Field(default="gemini")
    api_key: Optional[str] = Field(default=None)


class ReportAnalyzeRequest(BaseModel):
    text: str = Field(..., min_length=1)
    response_language: str = Field(default="English")
    provider: str = Field(default="gemini")
    api_key: Optional[str] = Field(default=None)


def extract_json(text: str) -> Dict[str, Any]:
    cleaned = text.strip()
    if cleaned.startswith("```"):
        lines = cleaned.splitlines()
        if lines and lines[0].startswith("```"):
            lines = lines[1:]
        if lines and lines[-1].startswith("```"):
            lines = lines[:-1]
        cleaned = "\n".join(lines).strip()

    start = cleaned.find("{")
    end = cleaned.rfind("}")
    if start != -1 and end != -1 and end > start:
        cleaned = cleaned[start : end + 1]

    try:
        return json.loads(cleaned)
    except json.JSONDecodeError as exc:
        logger.warning("Non-JSON response: %s", text[:500])
        raise HTTPException(status_code=502, detail="AI response was not valid JSON") from exc


def call_groq(prompt: str, api_key: str) -> Dict[str, Any]:
    try:
        client = Groq(api_key=api_key)
        response = client.chat.completions.create(
            model=GROQ_MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
        )
        text = response.choices[0].message.content or "{}"
        return extract_json(text)
    except Exception as exc:
        logger.exception("Groq request failed")
        error_msg = str(exc).lower()
        if "quota" in error_msg or "rate" in error_msg:
            raise HTTPException(status_code=429, detail="Groq quota exceeded. Try again later.") from exc
        elif "401" in error_msg or "unauthorized" in error_msg or "invalid" in error_msg:
            raise HTTPException(status_code=401, detail="Invalid Groq API key.") from exc
        raise HTTPException(status_code=502, detail="Groq request failed") from exc


def call_gemini(prompt: str, image_b64: str | None = None, api_key: str | None = None) -> Dict[str, Any]:
    key = api_key or GEMINI_API_KEY
    if not key:
        raise HTTPException(status_code=500, detail="No Gemini API key provided.")
    try:
        genai.configure(api_key=key)
        gemini_model = genai.GenerativeModel(GEMINI_MODEL)
        if image_b64:
            response = gemini_model.generate_content(
                [prompt, {"mime_type": "image/png", "data": image_b64}],
                generation_config={"response_mime_type": "application/json"},
            )
        else:
            response = gemini_model.generate_content(
                prompt,
                generation_config={"response_mime_type": "application/json"},
            )
    except Exception as exc:
        logger.exception("Gemini request failed")
        error_msg = str(exc).lower()
        if "quota" in error_msg:
            raise HTTPException(status_code=429, detail="Gemini quota exceeded. Try again later.") from exc
        elif "401" in error_msg or "unauthorized" in error_msg:
            raise HTTPException(status_code=401, detail="Invalid Gemini API key.") from exc
        raise HTTPException(status_code=502, detail="Gemini request failed") from exc
    return extract_json(response.text or "{}")


def call_ai(prompt: str, provider: str, api_key: Optional[str], image_b64: str | None = None) -> Dict[str, Any]:
    if provider == "groq":
        if not api_key:
            raise HTTPException(status_code=400, detail="Groq API key required. Get one free at console.groq.com")
        if image_b64:
            raise HTTPException(status_code=400, detail="Groq does not support image input. Use Gemini for circuit analysis.")
        return call_groq(prompt, api_key)
    else:
        return call_gemini(prompt, image_b64, api_key)


def ensure_list(value: Any) -> List[Any]:
    return value if isinstance(value, list) else []


@app.get("/health")
def health() -> Dict[str, str]:
    return {"status": "ok", "service": "ai-core"}


@app.post("/analyze/code")
def analyze_code(payload: CodeAnalyzeRequest) -> Dict[str, Any]:
    prompt = f"""
You are an AI Lab Assistant performing static analysis only. Do not execute or simulate code.
Analyze this {payload.language} lab code for bugs, corrections, and learning explanations.
Also provide corrected code snippets with fixes.
Respond entirely in {payload.response_language}.
Return only JSON with this exact shape:
{{
  "bugs": [{{"title": "string", "line": "string or null", "severity": "low|medium|high", "description": "string"}}],
  "fixes": [{{"title": "string", "code": "string", "description": "string"}}],
  "explanations": ["string"]
}}

Code:
```{payload.language}
{payload.code}
```
"""
    data = call_ai(prompt, payload.provider, payload.api_key)
    return {
        "bugs": ensure_list(data.get("bugs")),
        "fixes": ensure_list(data.get("fixes")),
        "explanations": ensure_list(data.get("explanations")),
    }


@app.post("/analyze/circuit")
def analyze_circuit(payload: CircuitAnalyzeRequest) -> Dict[str, Any]:
    prompt = f"""
You are an AI Lab Assistant identifying visible circuit components from an uploaded lab image.
Respond entirely in {payload.response_language}.
Return only JSON with this exact shape:
{{
  "components": [{{"name": "string", "description": "string"}}]
}}
Keep descriptions concise and educational.
"""
    data = call_ai(prompt, payload.provider, payload.api_key, payload.image)
    return {"components": ensure_list(data.get("components"))}


@app.post("/analyze/report")
def analyze_report(payload: ReportAnalyzeRequest) -> Dict[str, Any]:
    prompt = f"""
You are an AI Lab Assistant converting extracted lab-report text into a clean report template and viva prep.
Respond entirely in {payload.response_language}.
Return only JSON with this exact shape:
{{
  "template": {{
    "aim": "string",
    "theory": "string",
    "procedure": "string",
    "observations": "string",
    "results": "string",
    "conclusion": "string"
  }},
  "viva_questions": [{{"q": "string", "a": "string"}}]
}}

Extracted text:
{payload.text}
"""
    data = call_ai(prompt, payload.provider, payload.api_key)
    template = data.get("template") if isinstance(data.get("template"), dict) else {}
    return {
        "template": {
            "aim": template.get("aim", ""),
            "theory": template.get("theory", ""),
            "procedure": template.get("procedure", ""),
            "observations": template.get("observations", ""),
            "results": template.get("results", ""),
            "conclusion": template.get("conclusion", ""),
        },
        "viva_questions": ensure_list(data.get("viva_questions")),
    }


if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=PORT, reload=True)
