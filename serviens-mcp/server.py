#!/usr/bin/env python3
"""MCP Server for Google Gemini Image — generates images via Google AI Studio."""

import os
import sys
import json
import asyncio
from pathlib import Path

from mcp.server import Server
from mcp.server.stdio import stdio_server
from mcp.types import Tool, TextContent

from google import genai
from google.genai import types

# ── Configuration ────────────────────────────────────
API_KEY = os.environ.get("GOOGLE_AI_STUDIO_API_KEY")
if not API_KEY:
    print("ERROR: GOOGLE_AI_STUDIO_API_KEY environment variable is not set.", file=sys.stderr)
    sys.exit(1)

MODEL = os.environ.get("SERVIENS_IMAGEN_MODEL", "gemini-3.1-flash-image")
ASPECT_RATIO = os.environ.get("SERVIENS_ASPECT_RATIO", "1:1")

DEFAULT_OUTPUT_DIR = str(Path(__file__).resolve().parent.parent / "serviens-assets")
OUTPUT_DIR = os.environ.get("SERVIENS_OUTPUT_DIR", DEFAULT_OUTPUT_DIR)

client = genai.Client(api_key=API_KEY)
server = Server("serviens-imagen")

# ── Tools ────────────────────────────────────────────

@server.list_tools()
async def list_tools() -> list[Tool]:
    return [
        Tool(
            name="generate_image",
            description="Generate an image using Google Gemini image model from a text prompt. Saves the result as PNG in the output directory.",
            inputSchema={
                "type": "object",
                "properties": {
                    "prompt": {
                        "type": "string",
                        "description": "Text description of the image to generate (English works best). Include composition, style, colors, and mood."
                    },
                    "filename": {
                        "type": "string",
                        "description": "Output filename without extension (.png is added). Example: 'se-01-presentacion'"
                    },
                    "output_dir": {
                        "type": "string",
                        "description": f"Directory to save the image. Default: {OUTPUT_DIR}"
                    },
                    "model": {
                        "type": "string",
                        "description": f"Gemini image model to use. Default: {MODEL}. Options: gemini-2.5-flash-image, gemini-3.1-flash-image, gemini-3.1-flash-lite-image, gemini-3-pro-image"
                    },
                    "aspect_ratio": {
                        "type": "string",
                        "description": "Aspect ratio. Default: 1:1. Options: 1:1, 9:16, 16:9, 4:3, 3:4"
                    }
                },
                "required": ["prompt", "filename"]
            }
        )
    ]


@server.call_tool()
async def call_tool(name: str, arguments: dict) -> list[TextContent]:
    if name != "generate_image":
        return [TextContent(type="text", text=f"Unknown tool: {name}")]

    prompt = arguments["prompt"]
    filename = arguments["filename"]
    out_dir = arguments.get("output_dir", OUTPUT_DIR)
    model = arguments.get("model", MODEL)
    aspect = arguments.get("aspect_ratio", ASPECT_RATIO)

    Path(out_dir).mkdir(parents=True, exist_ok=True)

    try:
        response = client.models.generate_content(
            model=model,
            contents=prompt,
            config=types.GenerateContentConfig(
                response_modalities=["IMAGE"],
                image_config=types.ImageConfig(aspect_ratio=aspect),
            ),
        )
    except Exception as e:
        msg = str(e)
        if "429" in msg and "limit: 0" in msg:
            return [TextContent(
                type="text",
                text=f"ERROR: Quota exceeded — image generation requires billing enabled.\n\n"
                     f"Go to https://aistudio.google.com → Settings → Billing → enable Pay-as-you-go.\n"
                     f"Then retry this same prompt.\n\n"
                     f"Raw error: {msg[:300]}"
            )]
        return [TextContent(type="text", text=f"ERROR: API call failed — {msg[:500]}")]

    saved = []
    for i, part in enumerate(response.parts):
        if part.inline_data:
            img = part.as_image()
            suffix = f"_{i+1}" if len(response.parts) > 1 else ""
            path = str(Path(out_dir) / f"{filename}{suffix}.png")
            with open(path, "wb") as f:
                f.write(img.image_bytes)
            saved.append(path)
        elif part.text:
            saved.append(f"[text] {part.text[:200]}")

    if not saved:
        return [TextContent(
            type="text",
            text="WARNING: No image or text returned. The prompt may have been blocked by safety filters."
        )]

    return [TextContent(
        type="text",
        text=f"OK — generated:\n" + "\n".join(f"  • {p}" for p in saved)
    )]


# ── Server Lifecycle ─────────────────────────────────

async def run():
    async with stdio_server() as (read_stream, write_stream):
        await server.run(read_stream, write_stream, server.create_initialization_options())


if __name__ == "__main__":
    asyncio.run(run())
