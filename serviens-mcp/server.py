#!/usr/bin/env python3
"""MCP Server for Google Imagen — generates images via Google AI Studio."""

import os
import sys
import base64
import asyncio
from pathlib import Path

from mcp.server import Server, NotificationOptions
from mcp.server.models import InitializationCapabilities
from mcp.server.stdio import stdio_server
from mcp.types import Tool, TextContent

from google import genai
from google.genai import types

# ── Configuration ────────────────────────────────────
API_KEY = os.environ.get("GOOGLE_AI_STUDIO_API_KEY")
if not API_KEY:
    print("ERROR: GOOGLE_AI_STUDIO_API_KEY environment variable is not set.", file=sys.stderr)
    sys.exit(1)

MODEL = os.environ.get("SERVIENS_IMAGEN_MODEL", "imagen-3.0-generate-002")
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
            description="Generate an image using Google Imagen from a text prompt. Returns the file path of the saved image.",
            inputSchema={
                "type": "object",
                "properties": {
                    "prompt": {
                        "type": "string",
                        "description": "Text description of the image to generate (e.g., 'A warm flat lay of a smartphone and coffee on a wooden table')"
                    },
                    "filename": {
                        "type": "string",
                        "description": "Output filename (without extension — .png is added automatically). Example: 'se-01-presentacion'"
                    },
                    "output_dir": {
                        "type": "string",
                        "description": f"Directory to save the image. Default: {OUTPUT_DIR}"
                    },
                    "number_of_images": {
                        "type": "integer",
                        "description": "Number of images to generate (1–4). Default: 1"
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
    num_images = min(arguments.get("number_of_images", 1), 4)

    # Ensure output directory exists
    Path(out_dir).mkdir(parents=True, exist_ok=True)

    try:
        response = client.models.generate_images(
            model=MODEL,
            prompt=prompt,
            config=types.GenerateImagesConfig(
                number_of_images=num_images,
                include_rai_reason=True,
                output_mime_type="image/png",
            ),
        )
    except Exception as e:
        return [TextContent(
            type="text",
            text=f"ERROR: API call failed — {e}\n\nNote: Imagen access may require allowlist. If you get a 403 or permission error, check that your Google AI Studio account has Imagen access (https://aistudio.google.com)."
        )]

    saved = []
    for i, gen_img in enumerate(response.generated_images):
        if gen_img.image and gen_img.image.image_bytes:
            suffix = f"_{i+1}" if num_images > 1 else ""
            path = str(Path(out_dir) / f"{filename}{suffix}.png")
            with open(path, "wb") as f:
                f.write(gen_img.image.image_bytes)
            saved.append(path)

    if not saved:
        safety = getattr(response, "rai_filtered_reasons", None)
        return [TextContent(
            type="text",
            text=f"WARNING: No images returned. The prompt may have been blocked by safety filters.\nSafety reasons: {safety if safety else 'unknown'}"
        )]

    return [TextContent(
        type="text",
        text=f"OK — {len(saved)} image(s) generated:\n" + "\n".join(f"  • {p}" for p in saved)
    )]


# ── Server Lifecycle ─────────────────────────────────

async def run():
    async with stdio_server() as (read_stream, write_stream):
        await server.run(
            read_stream,
            write_stream,
            InitializationCapabilities(
                sampling={},
                experimental={},
            ),
        )


if __name__ == "__main__":
    asyncio.run(run())
