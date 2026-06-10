# AI Layer Core

FastAPI service that builds domain prompts and calls Gemini for static lab assistance.

## Start

```bash
python -m venv .venv && .venv\Scripts\activate && pip install -r requirements.txt && copy .env.example .env && python app.py
```

Set `GEMINI_API_KEY` in `.env` before using the analysis endpoints.
