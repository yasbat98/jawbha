"""
Content Pipeline — fal.ai + ElevenLabs + Anthropic
Generates editorial visuals, caption, and voiceover for a given topic.

Usage:
    python pipeline.py                        # uses config.yaml
    python pipeline.py --topic "your topic"   # override topic at runtime
"""

import os
import sys
import json
import time
import argparse
import requests
import yaml
from pathlib import Path
from datetime import datetime

import fal_client
from elevenlabs.client import ElevenLabs
from elevenlabs import save
import anthropic


# ── Load config ───────────────────────────────────────────────────────────────

def load_config(path: str = "config.yaml") -> dict:
    with open(path, "r") as f:
        return yaml.safe_load(f)


# ── Output folder ─────────────────────────────────────────────────────────────

def make_output_folder(cfg: dict) -> Path:
    base = Path(cfg["output"]["folder"])
    slug = cfg["content"]["topic"].lower().replace(" ", "-")[:40]
    stamp = datetime.now().strftime("%Y%m%d-%H%M%S")
    folder = base / f"{stamp}-{slug}"
    folder.mkdir(parents=True, exist_ok=True)
    print(f"[+] Output folder: {folder}")
    return folder


# ── Prompt generation (Claude) ────────────────────────────────────────────────

PROMPT_SYSTEM = """\
You are a creative director for editorial content. Your job is to write
concise, highly detailed image generation prompts for fal.ai (FLUX model).
Each prompt must produce a distinct location/setting. Output valid JSON only.
"""

def generate_prompts(cfg: dict, client: anthropic.Anthropic) -> list[str]:
    topic    = cfg["content"]["topic"]
    aesthetic = cfg["style"]["aesthetic"]
    palette  = cfg["style"]["color_palette"]
    photo    = cfg["style"]["photography_style"]
    lighting = cfg["style"]["lighting"]
    n        = cfg["content"]["num_images"]

    user_msg = f"""\
Topic: {topic}
Visual style: {aesthetic}
Color palette: {palette}
Photography style: {photo}
Lighting: {lighting}
Aspect ratio: 9:16 (portrait)

Write {n} image generation prompts, each with a DIFFERENT location/setting.
Return ONLY a JSON array of {n} strings, nothing else.
Example format: ["prompt 1", "prompt 2", ...]
"""

    print(f"[+] Generating {n} image prompts via Claude...")
    response = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=1024,
        system=PROMPT_SYSTEM,
        messages=[{"role": "user", "content": user_msg}],
    )

    raw = response.content[0].text.strip()
    # Strip markdown fences if present
    if raw.startswith("```"):
        raw = raw.split("\n", 1)[1].rsplit("```", 1)[0].strip()

    prompts = json.loads(raw)
    for i, p in enumerate(prompts, 1):
        print(f"    [{i}] {p[:80]}...")
    return prompts


# ── Image generation (fal.ai) ─────────────────────────────────────────────────

def generate_images(
    prompts: list[str],
    cfg: dict,
    out_folder: Path,
) -> list[Path]:
    os.environ["FAL_KEY"] = cfg["api_keys"]["fal_ai"]
    model = cfg["style"]["fal_model"]
    fmt   = cfg["output"]["image_format"]
    paths = []

    for i, prompt in enumerate(prompts, 1):
        print(f"[+] Generating image {i}/{len(prompts)} on fal.ai...")
        try:
            result = fal_client.subscribe(
                model,
                arguments={
                    "prompt": prompt,
                    "image_size": "portrait_9_16",
                    "num_images": 1,
                    "num_inference_steps": 28,
                    "guidance_scale": 3.5,
                    "enable_safety_checker": True,
                },
                with_logs=False,
            )

            image_url = result["images"][0]["url"]
            img_data  = requests.get(image_url, timeout=60).content
            img_path  = out_folder / f"image_{i:02d}.{fmt}"
            img_path.write_bytes(img_data)
            paths.append(img_path)
            print(f"    Saved → {img_path.name}")

        except Exception as e:
            print(f"    [!] Image {i} failed: {e}")

        time.sleep(1)  # rate-limit courtesy delay

    return paths


# ── Caption generation (Claude) ───────────────────────────────────────────────

CAPTION_SYSTEM = """\
You are a social media copywriter who writes sharp, editorial captions.
Match the tone exactly as specified. Output the caption text only — no
quotes, no labels, no explanation.
"""

def generate_caption(cfg: dict, client: anthropic.Anthropic) -> str:
    topic      = cfg["content"]["topic"]
    tone       = cfg["caption"]["tone"]
    hook_style = cfg["caption"]["hook_style"]
    always_use = ", ".join(cfg["caption"]["always_use"])
    never_use  = ", ".join(cfg["caption"]["never_use"])
    max_len    = cfg["caption"]["max_length"]

    user_msg = f"""\
Write a social media caption for a content piece about: {topic}

Tone: {tone}
Hook style: {hook_style}
Always use words like: {always_use}
Never use words like: {never_use}
Max length: {max_len} characters

Write the caption now.
"""

    print("[+] Generating caption via Claude...")
    response = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=256,
        system=CAPTION_SYSTEM,
        messages=[{"role": "user", "content": user_msg}],
    )
    caption = response.content[0].text.strip()
    print(f"    Caption: {caption}")
    return caption


# ── Voiceover script (Claude) ─────────────────────────────────────────────────

VOICEOVER_SYSTEM = """\
You are a scriptwriter for short-form video voiceovers.
Write natural, conversational scripts that sound great when spoken aloud.
No stage directions. Output script text only.
"""

def generate_voiceover_script(cfg: dict, client: anthropic.Anthropic) -> str:
    topic = cfg["content"]["topic"]
    tone  = cfg["caption"]["tone"]

    user_msg = f"""\
Write a 30-second voiceover script for a content piece about: {topic}
Tone: {tone}
Keep it punchy, vivid, and made for spoken delivery.
"""

    print("[+] Generating voiceover script via Claude...")
    response = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=512,
        system=VOICEOVER_SYSTEM,
        messages=[{"role": "user", "content": user_msg}],
    )
    script = response.content[0].text.strip()
    print(f"    Script ({len(script)} chars): {script[:80]}...")
    return script


# ── Voiceover audio (ElevenLabs) ──────────────────────────────────────────────

def generate_voiceover_audio(
    script: str,
    cfg: dict,
    out_folder: Path,
) -> Path:
    print("[+] Generating voiceover audio via ElevenLabs...")
    el_cfg   = cfg["voiceover"]
    el_client = ElevenLabs(api_key=cfg["api_keys"]["elevenlabs"])

    audio = el_client.text_to_speech.convert(
        text=script,
        voice_id=el_cfg["elevenlabs_voice_id"],
        model_id=el_cfg["model_id"],
        voice_settings={
            "stability":        el_cfg["stability"],
            "similarity_boost": el_cfg["similarity_boost"],
            "style":            el_cfg["style"],
            "speed":            el_cfg["speed"],
        },
    )

    audio_path = out_folder / f"voiceover.{cfg['output']['audio_format']}"
    save(audio, str(audio_path))
    print(f"    Saved → {audio_path.name}")
    return audio_path


# ── Save manifest ─────────────────────────────────────────────────────────────

def save_manifest(
    cfg: dict,
    prompts: list[str],
    caption: str,
    script: str,
    image_paths: list[Path],
    audio_path: Path,
    out_folder: Path,
) -> None:
    manifest = {
        "topic":       cfg["content"]["topic"],
        "generated":   datetime.now().isoformat(),
        "caption":     caption,
        "voiceover_script": script,
        "images":      [str(p) for p in image_paths],
        "audio":       str(audio_path),
        "prompts":     prompts,
    }
    manifest_path = out_folder / "manifest.json"
    manifest_path.write_text(json.dumps(manifest, indent=2))
    print(f"[+] Manifest saved → {manifest_path.name}")

    # Also save caption and script as plain text for easy copy-paste
    (out_folder / "caption.txt").write_text(caption)
    (out_folder / "voiceover_script.txt").write_text(script)
    print("[+] caption.txt and voiceover_script.txt saved")


# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="Content Pipeline — fal.ai + ElevenLabs")
    parser.add_argument("--config", default="config.yaml", help="Path to config file")
    parser.add_argument("--topic",  default=None,          help="Override topic from config")
    args = parser.parse_args()

    cfg = load_config(args.config)
    if args.topic:
        cfg["content"]["topic"] = args.topic

    # Validate API keys
    missing = [
        k for k, v in cfg["api_keys"].items()
        if not v or v.startswith("YOUR_")
    ]
    if missing:
        print(f"[!] Missing API keys in config.yaml: {', '.join(missing)}")
        sys.exit(1)

    if cfg["voiceover"]["elevenlabs_voice_id"].startswith("YOUR_"):
        print("[!] Set your ElevenLabs voice_id in config.yaml")
        sys.exit(1)

    # Initialise Anthropic client
    anthropic_key = os.environ.get("ANTHROPIC_API_KEY", "")
    if not anthropic_key:
        print("[!] Set ANTHROPIC_API_KEY environment variable")
        sys.exit(1)
    claude = anthropic.Anthropic(api_key=anthropic_key)

    out_folder = make_output_folder(cfg)

    # Run pipeline
    prompts     = generate_prompts(cfg, claude)
    image_paths = generate_images(prompts, cfg, out_folder)
    caption     = generate_caption(cfg, claude)
    script      = generate_voiceover_script(cfg, claude)
    audio_path  = generate_voiceover_audio(script, cfg, out_folder)

    save_manifest(cfg, prompts, caption, script, image_paths, audio_path, out_folder)

    print("\n✓ Pipeline complete!")
    print(f"  Output → {out_folder}/")
    print(f"  Images : {len(image_paths)}")
    print(f"  Audio  : {audio_path.name}")
    print(f"  Caption: {out_folder / 'caption.txt'}")
    print(f"  Script : {out_folder / 'voiceover_script.txt'}")


if __name__ == "__main__":
    main()
