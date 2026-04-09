from __future__ import annotations

import os
from io import BytesIO

from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from PIL import Image
import rembg

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

rembg_session = rembg.new_session("u2netp")

@app.post("/api/v1/remove-bg")
async def remove_background(file: UploadFile = File(...)) -> StreamingResponse:
    contents = await file.read()

    image = Image.open(BytesIO(contents))
    image.load()

    output_bytes: bytes = rembg.remove(contents, session=rembg_session, force_return_bytes=True)

    return StreamingResponse(BytesIO(output_bytes), media_type="image/png")
