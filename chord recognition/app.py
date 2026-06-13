import shutil
import tempfile

from fastapi import FastAPI, Form
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import traceback

from pipeline import start_pipeline

app = FastAPI(title="Music Analyzer")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"],
    allow_methods=["POST"],
    allow_headers=["*"],
)

@app.post("/analyze")
async def analyze(youtube_link: str = Form(...)):
    temp_dir = tempfile.mkdtemp(prefix="upload_")

    try:
        result, title = start_pipeline(youtube_link, temp_dir)

        return JSONResponse(content={
            "status": "ok",
            "title": title,
            "performer": "Kajdanka AI",
            "result": result,
        })

    except Exception as e:
        traceback.print_exc()
        return JSONResponse(status_code=500, content={
            "status": "error",
            "message": str(e),
        })

    finally:
        shutil.rmtree(temp_dir, ignore_errors=True)
