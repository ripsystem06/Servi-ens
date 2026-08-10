#!/usr/bin/env python3
"""MCP Server for Stability AI — text-to-image via REST v2beta API."""

import os
import sys
import asyncio
from pathlib import Path

import httpx
from mcp.server import Server
from mcp.server.stdio import stdio_server
from mcp.types import Tool, TextContent

# ── Configuration ────────────────────────────────────
API_KEY = os.environ.get("STABILITY_API_KEY")
if not API_KEY:
    print("ERROR: STABILITY_API_KEY environment variable is not set.", file=sys.stderr)
    sys.exit(1)

BASE_URL = "https://api.stability.ai/v2beta/stable-image/generate"

# Credit costs per model (approximate, check https://platform.stability.ai/account/credits)
MODEL_COSTS = {
    "core":   3,   # Stable Image Core — best quality, no prompt engineering needed
    "sd3":    1,   # SD3 Medium — cheapest, good quality
    "ultra":  8,   # Stable Image Ultra — highest quality
}

DEFAULT_MODEL = os.environ.get("SERVIENS_STABILITY_MODEL", "core")
DEFAULT_OUTPUT_DIR = str(Path(__file__).resolve().parent.parent / "serviens-assets")
OUTPUT_DIR = os.environ.get("SERVIENS_OUTPUT_DIR", DEFAULT_OUTPUT_DIR)

server = Server("serviens-stability")

# ── Tools ────────────────────────────────────────────

@server.list_tools()
async def list_tools() -> list[Tool]:
    return [
        Tool(
            name="generate_image",
            description="Generate an image using Stability AI (Stable Diffusion) from a text prompt. Free tier gives 25 credits.",
            inputSchema={
                "type": "object",
                "properties": {
                    "prompt": {
                        "type": "string",
                        "description": "Detailed English description of the image to generate. Include style, lighting, composition, colors, mood."
                    },
                    "filename": {
                        "type": "string",
                        "description": "Output filename without extension (.png added automatically). Example: 'se-01-presentacion'"
                    },
                    "output_dir": {
                        "type": "string",
                        "description": f"Directory to save images. Default: {OUTPUT_DIR}"
                    },
                    "model": {
                        "type": "string",
                        "enum": ["core", "sd3", "ultra"],
                        "description": f"Model: 'core' (3 credits, best balance), 'sd3' (1 credit, cheapest), 'ultra' (8 credits, best quality). Default: {DEFAULT_MODEL}"
                    },
                    "aspect_ratio": {
                        "type": "string",
                        "enum": ["1:1", "16:9", "9:16", "4:3", "3:4", "21:9"],
                        "description": "Image aspect ratio. Default: 1:1"
                    },
                    "negative_prompt": {
                        "type": "string",
                        "description": "What to avoid in the image (e.g., 'blurry, text, watermark, distorted')"
                    },
                    "style_preset": {
                        "type": "string",
                        "description": "Style preset: photographic, digital-art, cinematic, analog-film, neon-punk, isometric, etc."
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
    model = arguments.get("model", DEFAULT_MODEL)
    aspect = arguments.get("aspect_ratio", "1:1")
    negative = arguments.get("negative_prompt", "")
    style = arguments.get("style_preset", "")

    cost = MODEL_COSTS.get(model, 3)
    Path(out_dir).mkdir(parents=True, exist_ok=True)

    # Build multipart form
    data = {
        "prompt": prompt,
        "output_format": "png",
        "aspect_ratio": aspect,
    }
    if negative:
        data["negative_prompt"] = negative
    if style:
        data["style_preset"] = style

    # Build multipart form files
    files = {}
    for key, value in data.items():
        files[key] = (None, str(value))

    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                f"{BASE_URL}/{model}",
                files=files,
                headers={
                    "Authorization": f"Bearer {API_KEY}",
                    "Accept": "image/*",
                },
            )

        if response.status_code == 200:
            path = str(Path(out_dir) / f"{filename}.png")
            with open(path, "wb") as f:
                f.write(response.content)
            return [TextContent(
                type="text",
                text=f"OK → {path} ({len(response.content)} bytes)\nModel: {model} (~{cost} credit(s))"
            )]

        # Error handling
        error_body = response.text[:500]
        if response.status_code == 402:
            return [TextContent(
                type="text",
                text=f"ERROR: No credits left (HTTP 402). Your 25 free credits are exhausted.\nUpgrade at https://platform.stability.ai/account/credits"
            )]
        if response.status_code == 401:
            return [TextContent(
                type="text",
                text=f"ERROR: Invalid API key (HTTP 401). Check STABILITY_API_KEY environment variable."
            )]
        if response.status_code == 403:
            return [TextContent(
                type="text",
                text=f"ERROR: Content blocked by safety filter (HTTP 403).\nDetails: {error_body}"
            )]

        return [TextContent(
            type="text",
            text=f"ERROR: HTTP {response.status_code}\n{error_body}"
        )]

    except httpx.TimeoutException:
        return [TextContent(type="text", text="ERROR: Request timed out after 60s. Try again.")]
    except Exception as e:
        return [TextContent(type="text", text=f"ERROR: {e}")]


# ── Server Lifecycle ─────────────────────────────────

async def run():
    async with stdio_server() as (read_stream, write_stream):
        await server.run(read_stream, write_stream, server.create_initialization_options())


if __name__ == "__main__":
    asyncio.run(run())
