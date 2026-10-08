---
name: video-sourcing
description: Turn an approved script and a product into a short vertical video using only footage the user is allowed to use (own footage, licensed stock, public domain, licensed AI B-roll), with music, voiceover, captions, a license log and a compliance gate. Lists 193 sources with license, API and cost. Use when a user wants a compilation video for a daily or weekly post, needs free or legal footage, music or voiceover, or wants a script-to-video pipeline.
---

# Video sourcing: script + product → compiled video

Files: `marketing/VIDEO-SOURCING.md` and `marketing/data/video.json`, which has:
- `stages`: 7, each with human and agent versions
- `procedure_human`, `procedure_agent`: 14 steps
- `scene_schema`
- `shot_rules`
- `license_log`
- `compliance_gate`
- `methods`
- `sources[]`: category, license, api, cost

Web: the Video sourcing tab.

**Which video for what:** ads use an AI-generated video made from the script
(the user's generator). Daily and weekly posts use this compiled video.

## Procedure (agent version; humans approve at the marked gates)
1. **Input:** an approved script (from `script-engine`, verdict `original`),
   `product_facts.json`, the user's own product clips and photos, brand
   settings, target platforms.
2. **Scene breakdown:** JSON per `scene_schema`.
   - Scenes of 1–3 s; hook text within 2 s; product on screen by 3–5 s.
   - Each scene has `vo`, `visual_description`, `keywords`,
     `negative_keywords`, `asset_type` and `claim_ids`.
3. **Footage, in order of safety:**
   1. own product footage
   2. brand or supplier footage with written permission
   3. free commercial stock: Pexels API, Pixabay API, Mixkit, Coverr
   4. public domain: NASA, NARA
   5. licensed AI B-roll, with AI disclosure turned on
   6. CC BY with attribution

   Search with portrait orientation and 2–3 keyword variants. Drop clips under
   1080 px or shorter than the scene.
4. **License log:** write a row the moment a clip is downloaded: source, id,
   page URL, creator, license and its URL, `retrieved_at`, sha256.
5. **Screen and rank.**
   - Reject logos, watermarks, on-screen text and faces that imply endorsement.
   - Rank with CLIP/SigLIP or Twelve Labs, and don't reuse a clip across
     variants.
   - **Gate:** the human approves the contact sheet.
6. **Voice and music.**
   - Voice: licensed TTS or the user's own voice, with word timings from
     WhisperX.
   - Music: licensed for every target platform. TikTok's Commercial Music
     Library is TikTok-only.
   - Duck the music 10–15 dB under the voice.
7. **Assemble with FFmpeg, Shotstack, Creatomate or Remotion:**
   - 1080×1920 at 30 fps
   - cuts on word boundaries
   - captions in the safe zone
   - −14 LUFS
8. **QA and compliance gate.** Block publishing if any asset lacks a license
   row, or a claim isn't in `product_facts`. Turn on AI-content and #ad
   disclosures.
9. **Output:**
   - `final.mp4`
   - `captions.srt`
   - `license_log.csv`
   - `compliance.json`
   - a thumbnail

   Then post through the `social-posting` skill.

## Hard rules
- **Never compile other creators' videos** (TikTok, YouTube, Instagram posts)
  without a written license, even with credit. "Fair use" doesn't cover ads.
- **Re-check licenses.** Stock licenses change, and some exclude
  trademarks/logos or "standalone" resale; re-check the source's license page
  (URLs are in `video.json`).
- **Vary each variant.** Change the hook and footage per variant rather than
  reposting identical edits.
