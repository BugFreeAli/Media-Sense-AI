import os
import json
import google.generativeai as genai
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

# Initialize Gemini SDK securely via environment variables
api_key = os.environ.get("GEMINI_API_KEY")
if not api_key:
    raise RuntimeError("GEMINI_API_KEY environment variable is missing.")
genai.configure(api_key=api_key)

# Configure Gemini 1.5 Flash for low-latency multimodal forensic analysis
model = genai.GenerativeModel('models/gemini-1.5-flash')

@app.post("/api/analyze")
async def analyze_media(file: UploadFile = File(...)):
    """Processes uploaded media through the Gemini Multimodal Agent."""
    try:
        contents = await file.read()
        
        prompt = (
            "Analyze this image for AI generation artifacts (e.g., anatomical anomalies, "
            "lighting inconsistencies, spatial noise). Return ONLY a valid JSON object with this structure: "
            "{\"is_ai\": boolean, \"confidence\": integer 0-100, \"explanation\": \"string\"}"
        )

        response = model.generate_content([
            prompt,
            {"mime_type": file.content_type or "image/jpeg", "data": contents}
        ])

        # Parse output enforcing strict JSON schema
        clean_json = response.text.strip().replace('```json', '').replace('```', '')
        data = json.loads(clean_json)

        return {
            "is_ai_generated": data.get("is_ai", False),
            "confidence_score": data.get("confidence", 0),
            "forensic_report": data.get("explanation", "Analysis complete.")
        }

    except Exception as e:
        return {
            "is_ai_generated": False,
            "confidence_score": 50,
            "forensic_report": f"Agentic analysis failed due to internal processing error: {str(e)}"
        }
