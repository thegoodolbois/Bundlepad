# Video sourcing: script + product → compiled video

Turn a script and a product into a short video from footage you are allowed to use. Every source with its license, API and cost, plus the full procedure for you and for your agent. Researched 2026-10-08 by six agents.

Web view: the **Video sourcing** tab of the guide page. Data: [data/video.json](data/video.json).

## The procedure at a glance

| # | Stage | You (human) | Your agent |
|---|---|---|---|
| 1 | Script | Approve the script (15-45 s): hook, problem, product, proof, call to action. List every claim and keep proof for it. | Draft the script from a winning pattern (Market research tab → Sales scripts); attach claim IDs from your approved product facts. |
| 2 | Scene breakdown | Check the scene list reads well and every scene is filmable. | Split the script into 1-3 s scenes with voiceover text, visual description, search keywords, negative keywords, on-screen text and asset type (JSON schema below). |
| 3 | Footage, in order of safety | Film 5-10 shots of the real product on your phone (vertical 1080×1920). Get written permission before using any brand or supplier video. | 1) your own product footage, 2) brand/supplier footage with written permission, 3) free stock with a commercial license (Pexels, Pixabay, Mixkit, Coverr…), 4) public domain (NASA, NARA, Internet Archive PD), 5) AI-generated B-roll from a tool whose plan allows commercial use, 6) CC BY with attribution. Search via APIs, download, log the license of every clip. |
| 4 | Match clips to scenes | Approve the contact sheet (one frame per chosen clip). | Rank candidates per scene by keyword match and visual similarity (CLIP/SigLIP or Twelve Labs search); reject logos, watermarks, on-screen text and identifiable faces implying endorsement; avoid reusing the same clip across variants. |
| 5 | Voiceover, music, sound | Record the voiceover yourself, or approve the AI voice. Pick music licensed for every platform you post to. | Generate TTS with a commercially licensed voice, get word timings (WhisperX), pick music from a library that covers all target platforms (TikTok Commercial Music Library is TikTok-only), add sound effects, duck music 10-15 dB under the voice. |
| 6 | Assemble and caption | Watch the draft once. Fix anything that looks off. | Normalize every shot to 1080×1920 30 fps, trim to word boundaries, concatenate, overlay product shot and hook text in the first 2 s, burn captions in the safe zone, mix audio to about −14 LUFS (FFmpeg, Shotstack, Creatomate or Remotion). |
| 7 | Check and publish | Turn on AI labels and #ad / paid-partnership disclosures where they apply, then publish (or approve the automated post). | Run the compliance gate (below); block publishing if any asset lacks a license row. Output final.mp4, captions.srt, license_log.csv and compliance.json, then post through the Platforms tab routes. |

## Human version, step by step

1. Write/approve script (15-45 s): hook line (<=2 s), problem, product demo, proof, CTA. Mark every factual claim and keep proof.
2. Shoot own product footage on phone vertical 1080x1920 30fps: 5-10 shots (hero, in-hand, unboxing, in-use, close-ups) - this is your originality anchor.
3. Break script into scenes in a sheet: scene #, VO text, seconds, visual idea, keywords, on-screen text.
4. For each scene search Pexels/Pixabay/Mixkit/Coverr with orientation portrait; download 2-3 candidates; record each in the license log immediately.
5. Reject clips with visible logos, recognizable celebrities, watermarks, or people in sensitive contexts; check model release where available.
6. Record voiceover (own voice or licensed TTS with commercial rights).
7. Choose music: TikTok CML for TikTok-only; otherwise a library licensed for all platforms + paid ads (e.g., Epidemic/Artlist/YouTube Audio Library for YouTube only).
8. Edit in CapCut/Canva/Descript (using only 'Commercial Use' labeled assets): cut every 1-3 s, hook visual + text in first 2 s, product visible by ~3-5 s, CTA final 2-3 s.
9. Add captions (auto-caption, then proofread), keep text inside safe zone (avoid top ~150px and bottom ~350px + right edge UI).
10. Export H.264, 1080x1920, 30fps, AAC, loudness ~-14 LUFS.
11. Compliance check: AI disclosure toggles, #ad if paid partnership, claims substantiated, no fake testimonials.
12. Post; vary hook/footage for each new variant rather than reposting identical edits.

## Agent version, step by step

1. INPUT: script.txt, product_facts.json (approved claims), product_assets/ (own photos/clips), brand.json (fonts, colors, logo), target platforms.
2. SCENE BREAKDOWN: call LLM with scene schema (see next framework); validate JSON; durations sum to target (e.g., 20-30 s); each scene 1-3 s (split long VO lines into multiple shots).
3. ASSET ROUTING: asset_type=product -> pick from product_assets/ by tags; stock -> step 4; ai -> generate with licensed AI tool and set ai_disclosure=true.
4. SEARCH: for each stock scene, query Pexels /videos/search (orientation=portrait) and Pixabay /api/videos with 2-3 keyword variants; collect top 15 candidates; drop ones < 1080 px short side or duration < scene length.
5. DOWNLOAD + LOG: download to assets/raw/<source>_<id>.mp4; write license log row (source, id, page URL, creator, license name + URL, retrieved_at, sha256).
6. SHOT SPLIT: PySceneDetect detect-adaptive; keep shots >= scene duration.
7. SCREEN: Google Video Intelligence LOGO_RECOGNITION + TEXT_DETECTION (or OCR on frames) -> reject logos/watermarks/text; face count flag for human review if face is identifiable and implies endorsement.
8. RANK: extract 1 fps frames; SigLIP/CLIP similarity vs scene 'visual_description' minus 'negative_keywords'; or Twelve Labs search for timestamped segment; choose best segment start where motion begins; avoid reusing the same clip twice; diversity penalty.
9. HUMAN REVIEW GATE (optional but recommended): generate contact sheet (ffmpeg tile) of chosen shots per scene for approval.
10. VOICEOVER: TTS (licensed for commercial ads) or human VO; get word timings via WhisperX forced alignment against script text.
11. ASSEMBLE: normalize each shot (scale/crop 1080x1920, 30fps, setsar=1), trim to scene duration snapped to word boundaries; concat; overlay product PNG/logo; drawtext hook in first 2 s; burn captions; mix VO + ducked music; loudnorm -14 LUFS. OR emit Shotstack/Creatomate/Remotion JSON from the same scene list.
12. QA: ffprobe checks (1080x1920, duration, audio present), black-frame detect, caption safe zones, first frame not black, text legibility; compare to previous variants (perceptual hash) to ensure variation > threshold.
13. COMPLIANCE REPORT: list every asset with license, AI-generated flags, claims used vs product_facts, required disclosures per platform; block publish if any asset lacks a license row.
14. OUTPUT: final.mp4, captions.srt, license_log.csv, compliance.json, thumbnail.jpg; human uploads (or posts via official APIs: TikTok Content Posting API, YouTube Data API videos.insert, Instagram Graph API) and toggles AI/ad disclosures.

## Scene breakdown format (what the agent produces)

```json
{ "video": {"aspect":"9:16","fps":30,"target_seconds":24,"platforms":["tiktok","reels","shorts"]},
  "scenes": [ {"id":1, "vo":"Packing takes forever?", "start":0.0, "duration":1.8, "role":"hook",
   "visual_description":"overflowing suitcase, clothes spilling, frustrated hands", "keywords":["messy suitcase","packing clothes","overstuffed luggage"],
   "negative_keywords":["logo","airport brand","face close-up"], "asset_type":"stock|product|ai|ugc", "on_screen_text":"Packing takes forever?",
   "motion":"fast", "claim_ids":[] } ] }
Rules for the LLM: max 3 s per scene, hook <=2 s with text, product shown by scene 2-3, every claim references claim_ids from product_facts, no invented testimonials, keywords concrete and filmable.
```

## Shot rules

- Hook: first 1-2 s must show motion + pattern interrupt + text overlay stating the problem/promise; no logos-only intro.
- Cut every 1-3 s; match cuts to VO phrase boundaries (WhisperX word timings).
- Show product in hand/in use within 3-5 s; final 2-3 s CTA with product hero shot.
- Native 9:16 footage preferred; if landscape, crop center on subject or blur-pad; never letterbox with black bars.
- Minimum 1080x1920 output; source >= 1080 px on short side to avoid upscaling blur.
- Avoid recognizable faces implying endorsement; avoid logos, landmarks with trademark issues, sensitive contexts (health, politics) for stock people.
- Mix ratio: >= 30-50% own product footage/VO for originality; no single stock clip reused across many variants unchanged.
- Keep text in safe zone; captions at ~60-70% height; high contrast; 1-5 words per caption chunk.
- Loudness ~-14 LUFS; music ducked under VO by 10-15 dB.

## License log

- Columns: asset_id, project_id, video_variant, scene_id, asset_type (stock_video|music|sfx|image|font|voice|ai_generated|own_footage), source_name, source_asset_id, source_page_url, download_url, creator_name, creator_profile_url, license_name, license_url, license_version_or_snapshot_date, commercial_use_ok (Y/N), ads_ok (Y/N), attribution_required (Y/N), attribution_text, platform_restrictions (e.g., 'TikTok only'), model_release (Y/N/unknown), property_release, contains_logos_or_people (notes), ai_generated (Y/N), ai_tool_and_plan, retrieved_at (ISO8601), downloaded_file, sha256, in_point, out_point, used_in_final (Y/N), reviewer, review_date, notes.
- Also archive: a PDF/screenshot of the license page and asset page at download time (licenses change; Pixabay/Pexels terms have changed before).
- Retention: keep for life of ad + statute of limitations (e.g., 3+ years).

## Compliance gate (before publishing)

- [ ] Every asset has license log row with commercial_use_ok=Y and ads_ok=Y if used in paid ads.
- [ ] No footage downloaded from YouTube/TikTok/Instagram/other creators without a written license.
- [ ] Music licensed for each target platform (TikTok CML only on TikTok; CapCut library music not for other platforms).
- [ ] Realistic AI visuals/voices/avatars -> enable AI label on TikTok, YouTube (altered/synthetic), Meta; EU AI Act Art. 50 for EU audiences.
- [ ] FTC: no fake/AI testimonials or stock actors presented as customers; claims substantiated; #ad / paid partnership disclosure when applicable.
- [ ] Originality: own VO + product footage present; variant differs meaningfully from previous uploads (YouTube inauthentic content, TikTok unoriginal, Meta originality).
- [ ] No visible third-party trademarks/logos or identifiable people in sensitive contexts.

## Rules

- Never download videos from YouTube, TikTok, Instagram or other creators without a written license. A "compilation" of other people's clips is infringement and is downranked as unoriginal content.
- Make your own product footage and voiceover the core of every video (aim for 30-50%); stock and AI footage support it.
- Read each clip's license: commercial use and use in ads must both be allowed. Record every asset in the license log before publishing.
- No identifiable people implying they endorse your product, no visible logos or trademarks, no fake testimonials, no AI avatars presented as real customers.
- Label realistic AI visuals and voices on TikTok, YouTube and Meta; disclose ads and affiliate links.
- Free plans of AI tools often add watermarks or forbid commercial use. Check the plan before using the output in an ad.

## Free stock video

| Name | What you get | License | Attribution | API | Cost |
|---|---|---|---|---|---|
| [Pexels (Videos + Pexels API)](https://www.pexels.com/videos/) | Large free library of photos and videos (hundreds of thousands of clips), HD to 4K, many lifestyle, people and product-adjacent scenes. Vertical clips are plentiful: the site search and the API both filter orientation=portrait. | Pexels License (plus some legacy CC0 items). Free for commercial use including ads, modification allowed, no attribution required. Restrictions: identifiable people may not be shown in a bad light or offensive way (e.g. crime, medical ailment, pornographic context); no political use of content showing people/trademarks; no implied endorsement by people or brands shown; no use as a trademark or business name; content showing trademarks/logos may not be used commercially for goods/services or merchandise; no selling unaltered copies or redistributing on other stock/wallpaper platforms. No model releases are provided. | No (appreciated). The API guidelines ask apps to show a prominent link to Pexels and credit the creator where possible. | Yes. Pexels API, free key from pexels.com/api. GET https://api.pexels.com/videos/search?query=...&orientation=portrait&size=medium&min_duration=&max_duration=&per_page=80, plus /videos/popular and /videos/videos/{id}, with the Authorization header carrying the key. Default limit 200 requests/hour, 20,000/month, and Pexels says it raises this for free on request when you can show attribution use. | Free |
| [Pixabay (Videos + Pixabay API)](https://pixabay.com/videos/) | Large free library of video (film and animation), images, music and sound effects. Many vertical clips can be found by searching 'vertical'. The video API returns large/medium/small/tiny renditions with width and height, so an agent can filter by aspect ratio itself. | Pixabay Content License. Free use, including commercial and ads, no attribution, modification allowed. Prohibited: selling or distributing content on a standalone basis (no creative effort applied); commercial use related to goods/services of content containing recognisable trademarks, logos or brands; immoral or illegal use, especially of recognisable people; misleading or deceptive use; use as a trademark or business name. Some content may be subject to third-party IP, privacy or property rights. The summary does not address AI training (unverified). | No | Yes. Pixabay API, free key with an account. GET https://pixabay.com/api/videos/?key=KEY&q=...&video_type=film\|animation&category=&min_width=&min_height=&per_page=3-200. The limit is 100 requests per 60 seconds per key. Responses must be cached for 24h, and video files should be downloaded rather than hotlinked at scale. | Free |
| [Coverr](https://coverr.co/) | Curated free stock videos (lifestyle, tech, workspace, food), with a dedicated vertical category at /stock-video-footage/vertical. The library mixes human-shot footage and labeled AI-generated clips, plus some premium or iStock items. | Coverr License (free stock library). Royalty-free, usable in ads, client work, websites and social, no attribution required, no watermark. Restrictions per third-party summaries: no reselling the clips as-is and no building a competing library. Premium and iStock-sourced clips carry their own licenses, so check each clip. | No (credit appreciated). API use requires crediting Coverr (logo). | Yes. Coverr API (api.coverr.co/docs). Create an app at coverr.co/developers to get a key. Demo status allows 50 requests/hour; Production allows 2,000/hour and needs a Pro or Ultimate subscription; Enterprise limits are custom. Keep the key server-side. | Free library + paid Pro/Ultimate plans (prices unverified). |
| [Mixkit (Envato)](https://mixkit.co/free-stock-video/) | Free curated stock video (4K and HD), music, sound effects and video templates, with a free vertical collection of more than 2,100 clips at /free-vertical-videos/. | Mixkit Stock Video Free License: commercial and personal use including online ads, social media marketing and YouTube, no attribution, no watermark. Items cannot be resold or redistributed in original form, and you must add creative value. Third parties may not sublicense. Some items are under the Mixkit Restricted License, which allows personal non-commercial use only and no monetized or business use, so ads need clips under the Free License. | No | No public API. | Free |
| [Videvo](https://www.videvo.net/) | Free and premium stock video, motion graphics, music and SFX. Free clips are a smaller subset of millions of premium assets. Vertical availability is limited, so search 'vertical'. | Per clip, one of: Videvo Standard License (use in your work without attribution, no redistribution); Videvo Attribution License (same, but credit required); Creative Commons 3.0 CC BY (credit and note changes). Premium subscribers get free clips under a Royalty-Free license with no attribution. Some clips are editorial-only and not for ads. | Sometimes. Attribution License and CC BY clips need a credit like 'Footage by Videvo' (or the creator) in the video or description. | No public API (unverified). | Free tier + Premium (third-party prices: Lite $7.99, Plus $14.99, Pro $24.99 per month; unverified). |
| [Vecteezy (Video)](https://www.vecteezy.com/free-videos) | Huge library (50M+ assets total) of photos, vectors and 4K video, including many vertical clips. Free and Pro tiers. | Vecteezy Free License: personal and commercial use allowed with attribution to Vecteezy and the creator. Pro License (subscription): no attribution, broader print, digital, TV and limited merchandise use, $10,000 legal protection on Pro content. Editorial-licensed assets cannot be used commercially even by Pro users. Pro licenses are single-user, and client sublicensing is allowed under conditions. | Yes for free assets (e.g. 'Stock video by Vecteezy' with a link plus the creator). No for Pro subscribers. | Yes. Vecteezy API (vecteezy.com/developers): search, filter, download and related resources. Free tier allows about 500 downloads per month; pay-as-you-go is $0.002/call and $1/download; Business tier is custom (official pricing table per search snippet). | Free (attribution) + Pro subscription (price unverified). |
| [Videezy (Eezy)](https://www.videezy.com/) | Community-uploaded free HD and 4K footage plus Pro clips. Vertical availability is limited. | Videezy Standard (free) License: free with attribution to Videezy.com. Some guides say commercial use of Standard content requires buying a Commercial or Non-attribution license with credits, and some free clips are Editorial-only. Pro License (bought with credits): commercial use, no attribution. Credits expire after 1 year. | Yes for free clips: 'Free Stock Footage by Videezy.com' with a link. | No public API (unverified). | Free + credit packs for Pro or non-attribution licenses. |
| [Life of Vids](https://www.lifeofvids.com/) | Small set of free clips and loops (by Leeroy agency), mostly landscape. Updated irregularly. | Third-party sources describe the clips as free of copyright restrictions or CC0, while others say 'Standard / Creative Commons'. The official terms could not be retrieved (unverified). The commonly cited rule is free use with no redistribution of the clips as-is. | No (unverified) | No | Free |
| [SplitShire](https://www.splitshire.com/) | Free photos and a small set of videos by Daniel Nanescu. Landscape only. | SplitShire license (custom): free for personal and commercial use, no attribution. Third-party summaries add that you may not redistribute unmodified files on competing stock sites or sell them standalone. Some blogs call it CC0 (unverified). | No | No | Free |
| [Envato (Elements free monthly files) / Motion Array free](https://elements.envato.com/free) | Envato Elements gives 12 to 17 curated free files each month (may include stock video), the same for all users. Motion Array has free-account assets (a small subset). Both have large paid libraries with vertical footage. | Envato Elements: free monthly files are provided 'as is' under Envato terms (license text unverified). The paid Elements license covers commercial use per registered project. Motion Array: most assets are cleared for commercial use, editorial-only items are excluded, and after cancelling you cannot use downloads in new projects. Motion Array is now owned by Artlist, so terms may change. | No | No public API for downloading (unverified). | Free accounts with limited files. Paid Envato Elements is about $16.50/mo (unverified). |
| [Adobe Stock Free Collection](https://stock.adobe.com/free) | Free collection (1M+ assets) including videos, templates and 3D. Vertical clips are searchable. | Adobe Stock Standard License: free assets can be used for personal, business and educational projects. Adobe offers no Extended license for video. Standard license limits (such as about 500,000 copies or views for certain uses) apply per community guidance (unverified). No use of trademarks or people in sensitive ways. | No | Adobe Stock API exists for partners, but free-collection download through the API is unverified. | Free (Adobe ID). |
| [Storyblocks (free trial / subscription)](https://www.storyblocks.com/) | Large subscription library of video, music and templates with many vertical clips. | Storyblocks license: subscription downloads may be used commercially, forever, even after cancelling, but you cannot download again after cancelling. Some content is editorial-only. There is currently no free trial per its help center. | No | Yes but Enterprise only (quote). | Paid subscription (no free trial). |
| [Shutterstock (free videos + API)](https://www.shutterstock.com/) | About 40 curated free videos (secondary sources) plus a vast paid library. The free trial was discontinued on 1 March 2024. | Shutterstock Standard Video License: web and multimedia use up to an audience of 500,000 (secondary sources). Enhanced licenses are needed beyond that. | No | Yes. Shutterstock API: free developer account for search with watermarked previews and monthly call limits. Licensing or downloads need paid plans. | Free curated clips; otherwise paid. |
| [Freepik (video)](https://www.freepik.com/videos) | Stock video library with vertical clips plus AI video tools. | Freepik License. Free and Essential users: commercial use allowed with attribution ('Designed by Freepik' with a link, in the video credits, the end card or the description). Premium, Premium+ and Pro: no attribution. You may not sell, redistribute, sublicense or share files. Copyright stays with the author. | Yes on the free tier. | Freepik API exists (unverified details). | Free (with attribution) + Premium. |
| [Vidsplay](https://www.vidsplay.com/) | Small library of free HD clips. | Sources conflict between CC0, CC BY 3.0 and a custom license requiring a credit link to Vidsplay (unverified). | Likely Yes. Credit link to vidsplay.com. | No | Free |
| [Ignite Motion](https://ignitemotion.com/) | Animated motion backgrounds and loops. | Terms of use reportedly allow personal and commercial use. No named license (unverified). | Unverified | No | Free |
| [Beachfront B-Roll](https://www.beachfrontbroll.com/) | Free HD footage and animated backgrounds, hosted on archive.org. | Described as free for any production purpose. No explicit license text found (unverified). | Unverified | Internet Archive API for the hosted files (unverified). | Free |
| [Pexels Videos API](https://www.pexels.com/api/documentation/) | Free stock videos searchable by keyword; endpoint returns multiple renditions (SD/HD/4K, some portrait). Filter orientation=portrait for 9:16. | Pexels License: free for commercial use incl. ads, modification allowed, no attribution required. Not allowed: selling unaltered copies, implying endorsement by identifiable people/brands, redistributing as a stock library, using people in offensive/misleading ways. | No (appreciated). API ToS asks you to show a 'Photos/Videos provided by Pexels' link in apps that use the API. | Yes - GET https://api.pexels.com/videos/search?query=...&orientation=portrait&size=medium&per_page=80 ; header Authorization: <API_KEY>; default 200 req/hour, 20,000/month (raise on request). | Free |
| [Pixabay API (videos)](https://pixabay.com/api/docs/) | Free stock videos (tiny/small/medium/large renditions, up to 4K for some). No direct orientation filter for video in API; filter by width<height after fetch. | Pixabay Content License: free commercial use, modification, no attribution required. Prohibited: selling/distributing unmodified content standalone, using identifiable people/brands/trademarks in a way implying endorsement, offensive use, use in trademarks/logos. | No | Yes - GET https://pixabay.com/api/videos/?key=KEY&q=...&video_type=film&per_page=200 ; 100 requests/60s; results must be cached 24h; no permanent hotlinking - download to own server. | Free |

## Public domain

| Name | What you get | License | Attribution | API | Cost |
|---|---|---|---|---|---|
| [Free Nature Stock](https://freenaturestock.com/) | Nature photos and videos (landscapes, wildlife, plants) in HD and 4K. Landscape orientation. | Creative Commons Zero (CC0) per the site's license page: commercial and non-commercial use without permission or attribution. | No | No | Free |
| [ISO Republic](https://isorepublic.com/videos/) | Free photos and videos across categories (architecture, nature, people, tech). Mostly landscape. | CC0 per the official license page: all photo and video downloads are free for personal and commercial use. Attribution is encouraged but not required. You may not present the work as your own original creation. | No (encouraged) | No | Free |
| [Distill](https://www.wedistill.io/) | 10 to 30 second HD clips. The site may be inactive. | CC0 per secondary sources (unverified). | No | No | Free |
| [Pond5 Public Domain Project](https://www.pond5.com/free) | Historic public-domain media (2015 launch): about 10,000 video clips, NASA and space footage, archival films. | Public domain (no license needed for genuine PD works), but check each clip's status. Pond5's paid content uses the Pond5 royalty-free license. | No | No | Free |
| [Internet Archive — Moving Image Archive](https://archive.org/details/movies) | Millions of uploaded video items: feature films, home movies, TV, ephemeral films, news. Quality ranges from SD transfers to HD. Almost no 9:16 material. | Licenses vary per item and are often user-asserted: Public Domain Mark 1.0, CC0, CC BY/BY-SA/BY-NC etc. or no license at all. Internet Archive does NOT verify rights; many uploads are infringing. Only rely on items with a credible PD basis (e.g. US government, pre-1930 publication, notice-less pre-1978 US publication documented) or a license from the actual rights holder. | Sometimes — follow the item's license; for PD credit is courtesy. | Yes — Advanced Search API (https://archive.org/advancedsearch.php) with mediatype:movies and licenseurl:* filter; Metadata API (https://archive.org/metadata/{identifier}); 'internetarchive' Python CLI (ia search / ia download). No key for read. | Free |
| [Prelinger Archives (on Internet Archive)](https://archive.org/details/prelinger) | About 8,500+ ephemeral films (advertising, educational, industrial, amateur) 1903-1980s, freely downloadable. Classic retro look (households, factories, cars, cities). 4:3/16:9, SD to HD scans. | Most items are marked Public Domain (copyright expired or published without notice); some marked CC. The Archive's notice invites use 'in whole or in part, in any medium or market throughout the world' and says derivative works are yours. However Prelinger/IA provide NO written warranty — user assumes risk. Full collection is also licensed via Getty Images (with indemnity) for productions needing clearance. Music on soundtracks and people/brands shown may raise separate issues. | No (credit 'Prelinger Archives' is appreciated). | Yes — via Internet Archive APIs: collection:prelinger in advancedsearch / `ia search 'collection:prelinger'`. | Free (Getty license for indemnified HD masters is paid) |
| [NASA Image and Video Library](https://images.nasa.gov) | 140k+ images, videos and audio: launches, Earth from orbit, space animations, ISS footage. Video in MP4/MOV, often HD/4K; some vertical social cuts. | NASA Media Usage Guidelines: NASA content generally not subject to US copyright. Commercial use including advertising allowed BUT must not state or imply NASA endorsement; NASA insignia ('meatball'), logotype ('worm') and seal are NOT public domain and need permission; identifiable people (astronauts/employees) need consent for commercial use; items marked third-party copyrighted (e.g. some partner/ESA/JAXA material) need permission from that owner. Credit 'NASA' requested. | Sometimes — requested ('Courtesy NASA' / 'NASA/JPL-Caltech'). | Yes — https://images-api.nasa.gov/search?q=earth&media_type=video (no API key); /asset/{nasa_id} lists renditions (mp4/mov/srt); /metadata/{nasa_id}. page_size up to 100. | Free |
| [NASA Scientific Visualization Studio (SVS)](https://svs.gsfc.nasa.gov) | Thousands of data visualizations and animations (rotating Earth, climate, sun) in up to 4K/8K frames and MP4. | Same NASA Media Usage Guidelines; most visualizations are public domain with requested credit 'NASA's Scientific Visualization Studio'. Some include third-party data/imagery (e.g. Blue Marble partners) — check page credits. | Sometimes — credit lines given on each page. | Partial — SVS has a JSON API (https://svs.gsfc.nasa.gov/api/{id}) (unverified details). | Free |
| [NOAA (Photo Library, video B-roll, NOAA Ocean Today, NESDIS)](https://photolib.noaa.gov) | Photos and video B-roll of oceans, weather, storms, marine life, satellites. NOAA Ocean Today and NESDIS/GOES satellite loops; HD available. | NOAA-produced material is public domain (US government work); NOAA asks for credit 'NOAA' plus photographer if named. Does not extend to the NOAA emblem; no implied endorsement. Non-NOAA footage in compilations is identified and needs separate permission. Older B-roll page mentioned fee for reproduction only (unverified current). | Sometimes — requested ('NOAA' / photographer). | No public video API (unverified); GOES imagery via NESDIS/AWS Open Data (noaa-goes16/18 buckets). | Free |
| [US National Archives (NARA) Catalog](https://catalog.archives.gov) | Hundreds of thousands of digitized motion picture reels (WWII, newsreels, government films, Universal Newsreel), many downloadable MP4. | Government-created records are generally public domain. Each record has a 'Use Restrictions' field: 'Unrestricted' means NARA knows no restriction (not a guarantee); donated materials (e.g. some newsreels, gift collections) can be copyrighted. Same endorsement/publicity caveats as other US gov footage. | No (credit 'National Archives' recommended, citing record NAID). | Yes — Catalog API v2 https://catalog.archives.gov/api/v2/records/search?q=...&typeOfMaterials=Moving Images (unverified param), header x-api-key; key by emailing Catalog_API@nara.gov. Bulk: NARA dataset on AWS Registry of Open Data. | Free |
| [Library of Congress (Free to Use and Reuse, National Screening Room)](https://www.loc.gov/free-to-use/) | Curated sets of public-domain or rights-clear films (early cinema, government films) plus the National Screening Room; many items are downloadable MP4. | Varies by collection; each has a 'Rights and Access' statement. 'Free to Use' sets are PD or no known restrictions; National Screening Room contains both PD and copyrighted films — only reuse those marked free. Attribution recommended, not required. | No — recommended. | Yes — loc.gov JSON API: append ?fo=json to search URLs, e.g. https://www.loc.gov/search/?q=train&fa=original-format:film,+video&fo=json (no key). | Free |
| [National Park Service (B-roll galleries, NPGallery)](https://npgallery.nps.gov) | Park B-roll pages (Grand Canyon, Death Valley, Yellowstone etc.) with HD clips of landscapes, wildlife, weather; NPGallery digital asset library. | NPS-produced media is public domain; park pages say clips may be used for any purpose without release, but must not imply NPS endorsement; NPS arrowhead logo is protected. Credit 'Courtesy of the National Park Service' requested. Some NPGallery assets carry copyright notices (check metadata). | Sometimes — requested. | No (unverified); direct download links on pages. | Free |
| [USGS Multimedia Gallery](https://www.usgs.gov/products/multimedia-gallery/videos) | Videos of volcanoes, earthquakes, rivers, wildlife, field science; HD. | USGS-authored information is public domain; credit 'U.S. Geological Survey' requested; some items have non-USGS credits (copyrighted). | Sometimes — requested. | No dedicated video API (unverified). | Free |
| [DVIDS (Defense Visual Information Distribution Service)](https://www.dvidshub.net) | Hundreds of thousands of US military videos/B-roll: aircraft, ships, training, disaster relief; HD; some vertical social content. | Media produced by DoD is public domain unless otherwise indicated. Commercial use (incl. advertising) is permitted but must not imply DoD endorsement; commercial users should display a non-endorsement disclaimer where practicable and obscure unit insignia/tail numbers; credit producer requested. | Sometimes — requested (photographer/videographer + DVIDS). | Yes — DVIDS API https://api.dvidshub.net (free key on registration; search?type=video&q=...). | Free |
| [Smithsonian Open Access](https://www.si.edu/openaccess) | 5M+ CC0 2D/3D items (images, 3D models); little or no video in Open Access set. | CC0 for designated Open Access assets — commercial use without credit. Non-CC0 items have metadata but no media. | No (credit appreciated). | Yes — https://api.si.edu/openaccess/api/v1.0/search?q=...&api_key=KEY (key from api.data.gov); bulk JSON on GitHub/AWS. | Free |
| [CDC Public Health Image Library and B-roll](https://phil.cdc.gov) | Health and lab imagery; CDC B-roll for media (labs, vaccines, microbes). | Most CDC-produced items public domain; PHIL marks copyrighted items. No implied CDC/HHS endorsement; HHS logo restricted. | Sometimes — credit CDC requested. | No public API (unverified). | Free |
| [FEMA Media Library](https://www.fema.gov/multimedia-library) | Disaster, emergency response, weather impact photos/video. | FEMA-produced media generally public domain; no endorsement; avoid logos and identifiable victims. | Sometimes. | No (unverified). | Free |
| [Copernicus / Sentinel (EU Earth observation)](https://dataspace.copernicus.eu) | Satellite imagery and timelapse-ready data (Sentinel-1/2/3). | Copernicus data free, full and open including commercial use, with notice 'Contains modified Copernicus Sentinel data [year]'. ESA/partner-produced videos follow their own licenses. | Yes — required notice. | Yes — Copernicus Data Space Ecosystem APIs (free account). | Free |
| [Internet Archive - Audio (78rpm, netlabels)](https://archive.org/details/audio) | Millions of audio items; some public domain, netlabel CC releases. | Highly variable; many uploads have no clear rights. Only use items with explicit CC0/PD/CC BY and where the recording itself is PD (pre-1925-ish US recordings now entering PD under Music Modernization Act timelines). | Sometimes. | Yes - Internet Archive advancedsearch/metadata APIs. | Free. |

## Creative Commons

| Name | What you get | License | Attribution | API | Cost |
|---|---|---|---|---|---|
| [Mazwai](https://mazwai.com/) | Hand-picked artistic, cinematic clips (nature, travel, mood), owned by Videvo. Small library, mostly landscape. | Per clip: Creative Commons Attribution 3.0 (CC BY 3.0), which allows commercial use but requires crediting the author, or the Mazwai License, which allows commercial use without attribution. | Sometimes. CC BY clips: credit the author, e.g. 'Video by NAME via Mazwai (CC BY 3.0)'. | No | Free |
| [Dareful](https://www.dareful.com/) | A few hundred 4K clips, all shot by Joel Holland: aerials, nature, cities, holidays (fireworks, fireplaces). Landscape only. | Creative Commons Attribution 4.0 (CC BY 4.0) per multiple sources. Commercial use including ads and modification is allowed if you credit the creator. One listing says 'Proprietary and Free' (unverified). | Yes. 'Video by Joel Holland / Dareful.com, CC BY 4.0'. | No | Free |
| [Wikimedia Commons (video)](https://commons.wikimedia.org/wiki/Category:Videos) | Tens of thousands of freely licensed video files (WebM VP9/VP8/AV1 or Ogg Theora only; no MP4/H.264 uploads). Mix of nature, science, city scenes, historic film, government footage. Mostly 16:9; few native 9:16 clips; resolution ranges from SD to 4K. | Licenses vary PER FILE: CC0, Public Domain (PD-USGov, PD-old, PD-Mark), CC BY 2.0/3.0/4.0, CC BY-SA 3.0/4.0, GFDL. Commons only accepts free licenses, so NC/ND files are not allowed — every file permits commercial use and modification under its license terms. CC BY requires credit; CC BY-SA additionally requires your adapted video to be released under the same license (problematic for ads). Commons license covers copyright only; personality rights, trademarks and freedom-of-panorama issues are flagged separately by templates (e.g. {{Personality rights}}, {{Trademarked}}). | Sometimes — required for CC BY/BY-SA/GFDL; not for CC0/PD (still good practice). Format: 'Title' by Author, via Wikimedia Commons, license name + link. | Yes — MediaWiki Action API (https://commons.wikimedia.org/w/api.php). list=search with srnamespace=6 and filetype:video; prop=imageinfo&iiprop=url\|size\|mime\|extmetadata returns license (LicenseShortName, LicenseUrl, Artist, AttributionRequired, UsageTerms). No key; send a descriptive User-Agent; respect maxlag. | Free |
| [Europeana](https://www.europeana.eu) | Aggregator of European cultural heritage: millions of objects, tens of thousands of videos (archival film, TV, newsreels) from museums and archives. | Each object carries a standardized rights statement: CC0, Public Domain Mark, CC BY, CC BY-SA (free reuse incl. commercial) vs CC BY-NC*, CC BY-ND, RightsStatements.org InC/NoC-NC (not usable for ads). Use the 'Can I use it?' = Free re-use filter. | Sometimes — per rights statement; Europeana asks to credit institution. | Yes — Europeana Search API https://api.europeana.eu/record/v2/search.json?wskey=KEY&query=...&qf=TYPE:VIDEO&reusability=open (free key at pro.europeana.eu). | Free |
| [ESA (European Space Agency) Multimedia](https://www.esa.int/ESA_Multimedia/Videos) | Space mission videos, animations, Earth observation; HD/4K. | Mixed: material explicitly labelled CC BY-SA 3.0 IGO may be reused commercially with credit and share-alike. Other website material falls under ESA Terms which bar commercial use (advertising, merchandising) without written authorisation. Treat ads as needing written OK unless the item is CC BY-SA 3.0 IGO and you accept share-alike. | Yes — e.g. 'ESA/ATG medialab – CC BY-SA 3.0 IGO'. | No public API (unverified). | Free |
| [Flickr (The Commons + CC-licensed videos)](https://www.flickr.com/search/?media=videos) | Short user videos (Flickr caps video length at ~3 min for Pro, 90s/free (unverified)); The Commons institutions mostly photos. | Per-item license: All Rights Reserved (default), CC BY/BY-SA/BY-NC/BY-ND/BY-NC-SA/BY-NC-ND (2.0 and 4.0), CC0, Public Domain Mark, 'No known copyright restrictions' (The Commons), US Government Work. Only CC0, PDM, US Gov, CC BY, CC BY-SA are usable in ads. | Sometimes — CC BY/BY-SA require credit. | Yes — flickr.photos.search with media=videos&license=4,5,9,10 (IDs from flickr.photos.licenses.getInfo; 4.0 codes 11+). Free API key; non-commercial key free, commercial use of API needs approval. | Free |
| [Vimeo Creative Commons](https://vimeo.com/creativecommons) | Indie filmmaker clips including drone, nature, timelapse; often HD/4K. | Uploader-chosen CC license shown under the video; filter per license (CC BY, BY-SA, BY-ND, BY-NC, BY-NC-SA, BY-NC-ND, CC0). Only CC0/BY/BY-SA suit ads. Download only if uploader enabled it. | Sometimes. | Partial — Vimeo API (developer.vimeo.com) can return license field on videos you query (unverified), no CC search guarantee; downloads only where permitted. | Free |
| [YouTube Creative Commons (CC BY) filter](https://www.youtube.com/results?search_query=x&sp=EgIwAQ%253D%253D) | Videos uploaded with the 'Creative Commons - Attribution' option. Variable quality. | YouTube offers only CC BY 3.0 as the alternative to the Standard YouTube License. CC BY permits commercial use and modification with attribution. YouTube Studio editor shows CC videos to remix; but uploader may have no rights to the content (re-uploads), and music/third-party content inside is not cleared. Do NOT download Standard-license videos; ripping tools also breach YouTube ToS. | Yes — credit creator name + link + 'CC BY'. | Partial — YouTube Data API v3 search.list with videoLicense=creativeCommons&type=video (key required, 100 units per search, 10,000 units/day default). No download endpoint. | Free |
| [Open Images / Beeld en Geluid (openbeelden.nl)](https://www.openbeelden.nl) | Dutch archival film (Polygoon newsreels etc.) and user contributions. | Mostly CC BY-SA 3.0 NL and some CC0/PD (unverified per-item). CC BY-SA requires share-alike. | Yes for CC BY-SA. | Partial — OAI-PMH feed (unverified). | Free |
| [Wikimedia Commons (audio)](https://commons.wikimedia.org/wiki/Category:Audio_files) | Audio files (music recordings, SFX, speech) under free licenses or public domain. | Per file: CC0/PD/CC BY/CC BY-SA (no NC allowed on Commons). CC0/PD/CC BY usable in ads; BY-SA share-alike makes ad use awkward. | Sometimes - per file page. | Yes - MediaWiki API (commons.wikimedia.org/w/api.php) with imageinfo/extmetadata for license. | Free. |

## AI video generation

| Name | What you get | License | Attribution | API | Cost |
|---|---|---|---|---|---|
| [Google Veo 3.1 via Gemini app / Google Flow](https://labs.google/flow) | Text-to-video and image-to-video clips of 4/6/8 s with native synchronized audio (dialogue, SFX, ambience); 720p/1080p (4K on paid/API); 16:9 and 9:16 portrait supported in Veo 3.1. Flow adds scene-builder, frames-to-video, ingredients (reference images) and extend. | Google Terms of Service + Generative AI Additional Terms + Generative AI Prohibited Use Policy. Google does not claim ownership of outputs; Google gets a license to inputs/outputs to provide/improve services. Commercial use of FREE-tier Flow/Gemini outputs is NOT clearly granted (third-party reviews rate it 'unclear'/'No'; an open Google developer-forum question has no official answer) (unverified). Paid Google AI Pro/Ultra outputs are widely used commercially but confirm in the current Flow terms. Prohibited: deceptive impersonation, misleading content, sexual content, real-person deepfakes, IP infringement. | No credit required; all output carries invisible SynthID watermark + C2PA Content Credentials; free/consumer exports carry a visible 'Veo' watermark (a 'Media Watermark' toggle reportedly lets paid users remove the visible overlay only, unverified). | Consumer app: No public API. Programmatic route is the Gemini API / Vertex AI (see separate entry). | Free tier + paid. Flow free: reportedly 50 AI credits/day usable on Veo 3.1 Lite/Fast/Quality, no rollover, watermarked (unverified, third-party). Gemini app free: limited/rate-limited Veo access; Google AI Pro ($19.99/mo) ~3 Veo 3.1 videos/day in Gemini app, Ultra higher limits (third-party reports). Limits change often. |
| [Google Veo via Gemini API / Vertex AI](https://ai.google.dev/gemini-api/docs/video) | Same Veo 3.1 family via REST/SDK: text-to-video, image-to-video, first/last frame, reference images, video extension; 720p/1080p/4K; 16:9 and 9:16; 4-8 s clips with audio. | Gemini API Additional Terms of Service (paid tier) - developer owns/may use outputs commercially subject to Prohibited Use Policy; Vertex AI under Google Cloud terms (includes generative AI indemnity for certain Google models on Vertex AI, verify for Veo). SynthID embedded in all output. Content filters block real-person/celebrity likeness and child imagery. | No. | Yes: Gemini API model ids like veo-3.1-generate-preview / veo-3.1-fast-generate-preview / veo-3.1-lite (preview); long-running operation: client.models.generate_videos(...) then poll operations.get, download file. Vertex AI: predictLongRunning endpoint. Requires billing-enabled API key; rate limits per project. | Paid only - free API tier does NOT include Veo. Approx per second of output: Veo 3.1 Standard $0.40 (720p/1080p), $0.60 (4K); Veo 3.1 Fast $0.10 (720p) / $0.12 (1080p) / $0.30 (4K) after April 2026 cut; Veo 3.1 Lite $0.05 (720p) / $0.08 (1080p). An 8 s 9:16 Lite clip ~ $0.40-0.64. |
| [YouTube Shorts Veo 3 Fast / Dream Screen](https://support.google.com/youtube/answer/14194128) | Inside the YouTube app's Shorts camera: generate short Veo 3 Fast clips (480p, with sound, announced free Sept 2025) or Dream Screen AI backgrounds/clips to drop into a Short. | YouTube Terms of Service + Google Generative AI terms. Content made with YouTube's own AI tools gets a permanent AI label. Rights to reuse outside YouTube (e.g. in paid Meta/TikTok ads) are not documented (unverified) - treat as YouTube-only. | No; YouTube auto-applies AI disclosure + SynthID. | No. | Free (availability by country/age; 480p). |
| [OpenAI Sora / Sora 2 (DISCONTINUED)](https://platform.openai.com/docs/deprecations) | Formerly text/image-to-video with audio; 9:16 support. Consumer Sora app/site shut down 2026-04-26; Videos API (v1/videos) and sora-2 / sora-2-pro models removed 2026-09-24 with no replacement listed. | Historically: OpenAI Terms assign output ownership to user, commercial use allowed on paid plans; C2PA metadata + visible watermark. No longer obtainable. | N/A | No longer (was Videos API $0.10/s sora-2 720p; $0.30-0.70/s sora-2-pro). | Not available. |
| [Runway (Gen-4 / Gen-4 Turbo / Gen-4.5, Aleph, Act-Two)](https://runwayml.com/pricing) | Image-to-video and text-to-video 5-10 s clips, video-to-video restyle (Aleph), character performance (Act-Two), upscale to 4K; 16:9, 9:16, 1:1 and more. | Runway Terms of Use: user owns outputs and may use them commercially (Runway's ToS assigns rights to user on all plans, verify) (unverified); free plan output carries Runway watermark which makes it impractical for ads. Prohibited: non-consensual likeness, deceptive impersonation, IP infringement, sexual content. | No (watermark on free). | Yes: Runway API (dev.runwayml.com) - POST /v1/image_to_video, /v1/text_to_video, /v1/video_to_video; poll /v1/tasks/{id}. API credits $0.01 each; Gen-4 Turbo 5 credits/s (~$0.05/s), Gen-4.5 ~12 credits/s (~$0.12/s); separate balance from web plans. | Free: 125 one-time credits (no refresh), watermark, limited models, 720p. Standard ~$12-15/mo (625 credits/mo, no watermark), Pro ~$28-35/mo (2,250 credits), Unlimited ~$76-95/mo. |
| [Kling AI (Kuaishou) 2.x / 3.0](https://klingai.com) | Text/image-to-video 5-10 s, up to 1080p (4K on higher tiers), optional native audio (3.0), motion control, lip-sync, virtual try-on; 16:9, 9:16, 1:1. | Kling Terms of Service: free-tier output is personal/non-commercial only and watermarked (multiple sources); paid membership (Standard and up) grants commercial use and watermark removal. Prohibited: real-person likeness without consent, political, sexual, IP-infringing content; Chinese content regulations also apply. | No on paid; free has visible Kling watermark. | Yes: Kling official API (app.klingai.com developer platform / klingai.com/global/dev) - pay-per-unit or prepaid resource packages (trial package from ~$9.8). Approx $0.06-0.42 per second of output depending on model/mode; 5 s 720p Standard ~ $0.42, 10 s 1080p with audio ~ $1.68. Also on fal.ai / Replicate. | Free: ~66 credits/day (no rollover), ~5 s clips, 720p, watermark, personal-use. Standard ~$7-10/mo (660 credits). |
| [Luma Dream Machine (Ray3 / Ray3.14 / Ray3.2)](https://lumalabs.ai/dream-machine) | Text/image-to-video, keyframes (up to 16 in Ray3.2), extend, modify video, HDR, native 1080p, 4K upscale; 16:9, 9:16, 1:1. | Luma Terms: free plan output non-commercial and watermarked; commercial use starts on paid Plus tier (~$30/mo) and up (multiple sources). Luma API usage governed by separate API terms permitting commercial use. | No on paid; watermark on free. | Yes: Luma API (lumalabs.ai/api, usage-based since Ray3.2) - POST /dream-machine/v1/generations; separate billing from app; also via fal.ai/Replicate. | Free: limited trial/monthly credits, 720p/draft, watermark, non-commercial (sources conflict; permanent free tier may be gone). Paid: Lite ~$9.99, Plus ~$29.99 (commercial), Pro ~$90, Ultra ~$300. |
| [Pika (Pika 2.x, Pikaffects, Pikascenes)](https://pika.art/pricing) | Short text/image-to-video clips with effects (Pikaffects), scene ingredients, swaps; 480p free, up to 1080p paid; multiple aspect ratios. | Pika Terms: free 'Basic' plan watermarked and no commercial use (most sources); commercial rights + watermark-free on Pro (~$28/mo annual), Standard ambiguous. Prohibited: real-person deepfakes, IP infringement. | No on paid; free watermarked. | Partial: Pika API offered via fal.ai partnership (pika models on fal) (unverified pricing). | Free: ~80 credits/month, 480p, watermark. Standard ~$8/mo annual, Pro ~$28/mo annual, Fancy higher. |
| [Hailuo AI / MiniMax video (Hailuo 2.3, H3)](https://hailuoai.video) | Text/image-to-video 6-10 s, 768p-1080p (2K on API), strong physics/motion; 16:9, 9:16. | Hailuo Terms: free videos watermarked, no commercial rights; paid plans and MiniMax API per plan terms (commercial generally permitted on paid, verify). H3 open weights (if used) carry a license EXCLUDING USA, EU, UK, South Korea and covering outputs (unverified). | No on paid; watermark on free. | Yes: MiniMax API (platform.minimax.io) - video_generation endpoint, ~$0.08/s at 768p, ~$0.13/s at 2K pay-as-you-go (third-party); also via fal.ai. | Free: 200 one-time welcome credits + daily bonus, credits expire in ~3 days, 720p, watermark, non-commercial. Paid ~$8-15/mo Standard up to ~$200/mo Max. |
| [ByteDance Seedance via Dreamina (CapCut) / BytePlus ModelArk](https://dreamina.capcut.com) | Seedance 1.x/2.x text/image-to-video with multi-shot, audio; 9:16; integrated into CapCut/Dreamina. | Dreamina/CapCut Terms (ByteDance): broad license to uploaded content; free outputs may be watermarked; commercial rights depend on plan, region, model and asset (CapCut's own guidance). Seedance 2.0 international access reportedly restricted Feb 2026 (unverified). | No on paid; free may be watermarked. | Yes: BytePlus ModelArk API for Seedance (enterprise) and resellers (fal.ai, Atlas Cloud). | Free daily credits (amount not published); paid from ~$9.90/mo. |
| [Wan 2.1 / 2.2 (Alibaba, open weights)](https://github.com/Wan-Video/Wan2.2) | Open-weights text/image-to-video (T2V-A14B, I2V-A14B, TI2V-5B), 480p/720p, ~5 s at 16-24 fps; any aspect incl. 9:16; runs locally (5B on ~24 GB GPU) or via hosts. | Apache License 2.0 - commercial use, modification, redistribution allowed; no revenue cap or territory limit; you are responsible for outputs. Later Wan 2.5-2.7 are closed (API only via Alibaba Cloud Model Studio, separate terms). | No (keep Apache NOTICE if redistributing model, not needed for outputs). | Self-host (Diffusers/ComfyUI) or hosted APIs: fal.ai Wan 2.2 ~ $0.10/s, Wan 2.5 ~$0.05/s 480p; Replicate Wan 2.1 480p ~$0.09/s; Alibaba Cloud Model Studio for Wan 2.5+. | Free (self-host GPU cost) or per-second hosted. |
| [HunyuanVideo / HunyuanVideo 1.5 (Tencent, open weights)](https://github.com/Tencent-Hunyuan/HunyuanVideo) | Open-weights text/image-to-video, 720p, ~5 s; HunyuanVideo-Avatar and HunyuanCustom variants. | Tencent Hunyuan Community License: commercial use allowed BUT Territory excludes EU, UK and South Korea - no use of model OR outputs there; separate license above 100M MAU; acceptable use policy. Not usable if your ads run in EU/UK/KR. | Notice of license if redistributing model (verify). | Self-host; also on fal.ai/Replicate. | Free (GPU) / hosted per-second. |
| [LTX-Video / LTX-2 (Lightricks, open weights + LTX Studio)](https://ltx.io/model/license) | Fast open video model (real-time-ish), up to 4K/50fps in LTX-2.x, with audio in LTX-2; any aspect; also LTX Studio web app and API. | Original LTX-Video 0.9, LTX-2, LTX-2.3: Apache 2.0 (per ComfyUI wiki) (unverified); LTX-2.5 and some 13B releases: LTX Community/Dev License - free for entities under $10M annual revenue (group-wide); commercial license needed above. | No. | Self-host or LTX API (ltx.io) / fal.ai. | Free self-host under threshold; LTX Studio free tier + paid (unverified). |
| [Stable Video Diffusion (Stability AI)](https://huggingface.co/stabilityai/stable-video-diffusion-img2vid-xt) | Image-to-video, ~14-25 frames (2-4 s), 576x1024; older/lower quality than 2025-26 models. | Stability AI Community License: free for research, non-commercial and commercial use if total annual revenue < $1M; Enterprise license above; no cap on number of outputs; Acceptable Use Policy applies. (Check SVD model card - license per model.) | No (license notice if redistributing). | Self-host; Stability API historically offered image-to-video (verify current). | Free under $1M revenue. |
| [Adobe Firefly Video (Generate Video) + partner models](https://www.adobe.com/products/firefly/features/ai-video-generator.html) | Text/image-to-video 5 s 1080p clips, camera controls, translate audio, generate SFX; also partner models (Veo, Kling, Runway, Luma, etc.) inside Firefly; 16:9 and 9:16. | Adobe General Terms + Generative AI User Guidelines: Firefly models trained on licensed Adobe Stock + public domain, marketed as 'commercially safe'; non-Beta features OK for commercial use; IP indemnity only for eligible enterprise plans and Adobe's own Firefly models (not partner models). Content Credentials attached. | No; Content Credentials (C2PA) attached. | Yes: Firefly Services API (enterprise) incl. video generation (verify pricing; enterprise contract). | Free plan: limited daily generations (count not published). Paid: Standard $9.99/mo (2,000 credits), Pro $19.99/mo (4,000), Premium higher; video costs premium credits. |
| [Canva AI video (Create a Video Clip / Magic Media, Veo-powered)](https://www.canva.com/ai-video-generator/) | 8 s Veo-3 clips with audio inside Canva; drop into Canva video editor with templates; 16:9 (9:16 via editing). | Canva Content License Agreement + AI Product Terms: you own inputs/outputs as between you and Canva; AI-Generated Content usable like Free/Pro content (commercial allowed); Canva asks you to tell viewers content is AI-generated; no indemnity except Enterprise. | Canva asks for AI disclosure; no credit. | Partial: Canva Connect API (design automation, autofill) - AI video generation not exposed (unverified). | Video clip generation listed for Pro/Teams/Enterprise with limited monthly uses; Free plan limited/lifetime credits (unverified). Pro ~$15/mo. |
| [CapCut AI video generator / AI ad tools](https://www.capcut.com) | Script-to-video, product URL-to-ad, AI avatars, auto captions, Seedance/Dreamina generation; 9:16 native. | CapCut Terms of Service (updated 2026-04-15) + separate US Materials License Agreement for built-in assets: commercial use depends on each asset (music, templates, effects, voices); users grant ByteDance a broad, perpetual, sublicensable license to uploaded content (2025 update coverage). Many built-in music/templates are NOT cleared for ads. | Sometimes per asset. | No public generation API. | Free + CapCut Pro (~$8-20/mo; watermark/export rules vary). |
| [fal.ai (hosted AI video API aggregator)](https://fal.ai/models) | One API key for Veo 3.1, Kling 2.x/3.0, Wan 2.2/2.5, Hailuo, Luma, Pika, Seedance, LTX, Hunyuan, Vidu etc. | fal Terms + each model provider's license passes through (e.g., Wan Apache 2.0; Veo per Google terms). Generally commercial use allowed for paid API outputs - confirm per model page. | No. | Yes: REST/queue API and fal-client SDKs (fal.subscribe('fal-ai/kling-video/...')); pay-per-output. | Pay-as-you-go; examples: Veo 3.1 Fast from ~$0.10/s, Kling 3.0 Pro ~$0.224/s (audio off), Wan 2.5 ~$0.05/s (480p), Wan 2.2 ~$0.10/s. Small free credits for new accounts (unverified). |
| [Replicate (hosted model API)](https://replicate.com/collections/text-to-video) | Hosted Wan, Kling, Veo, Hailuo, LTX, SVD, etc. | Replicate Terms + each model's license. | No. | Yes: POST /v1/models/{owner}/{model}/predictions; billed per output second (official models) or GPU time. | Pay-as-you-go (Wan 2.1 480p ~$0.09/s; Veo 3 ~$0.75/s older). |

## AI avatars

| Name | What you get | License | Attribution | API | Cost |
|---|---|---|---|---|---|
| [HeyGen (AI avatars, Avatar IV/V, Video Agent)](https://www.heygen.com/pricing) | Talking-head presenters (stock avatars, custom/digital twin of yourself with consent), 175+ languages, translation/lip-sync, URL-to-video, Video Agent prompt-to-video; 9:16 supported. | HeyGen Terms of Service + Content Moderation Policy: avatars must respect rights of depicted individuals; custom avatars require consent verification of the person; no impersonation, deceptive, political misinformation, sexual content. Free/Creator plans may carry commercial-use limits - check ToS (unverified). Paid plans used commercially widely. | No; free has visible HeyGen watermark. | Yes: HeyGen API (api.heygen.com, v2/video/generate, avatar IV endpoints) - pay-as-you-go wallet from $5 since Feb 2026, no free API credits; ~$2/min Video Agent, ~$0.05-0.10/s Avatar IV. | Free: ~3 videos/month, up to 1-3 min, 720p, watermark. Creator ~$29/mo ($24 annual) no watermark; Pro/Business higher. |
| [Synthesia](https://www.synthesia.io/pricing) | Studio-quality AI presenters (230+ stock avatars, personal avatars), 140+ languages; 9:16 supported. | Synthesia Terms + Acceptable Use Policy: Stock Avatars may NOT be used in promoted/boosted/paid social advertising without Synthesia's written consent; no political/news/polarizing content with stock avatars; may not imply the real actor endorses/holds opinions or has conditions; custom avatars need the person's consent. Free videos watermarked and may not be downloadable. | No; watermark on free. | Yes: Synthesia API (api.synthesia.io/v2/videos) on Creator tier and up. | Free/Basic: ~10 min/month watermarked or 3-video trial (sources conflict). Starter ~$18-29/mo, Creator ~$64-89/mo (API), Enterprise custom. |
| [D-ID (Creative Reality Studio, talking photos, API)](https://www.d-id.com/pricing/) | Animate a still photo or stock avatar into a talking head; streaming agents; 9:16 possible. | D-ID Terms: Trial and Lite plans personal-use only with watermark (full-screen on trial, corner on Lite); commercial use from Pro (~$29/mo); API commercial from Launch plan (~$35/mo). Must own rights/consent for any face uploaded. | No; watermark on trial/Lite. | Yes: D-ID API (api.d-id.com/talks, /clips) - Build plan personal-use, Launch $35/mo 180 credits commercial. | Trial ~5 min/month watermarked personal; Lite $5.90; Pro $29; API Launch $35, Scale $138.60. |
| [Captions / Mirage (AI Creator, Ad Studio)](https://www.captions.ai) | AI UGC-style actors (Mirage model) reading your script, auto-captions, AI edit; 9:16 native. | Captions/Mirage Terms: paid plans include commercial usage rights for generated videos (Sacra) (unverified); AI actors are synthetic - must not be presented as real customers. | No; free tier watermark (unverified). | Yes: Mirage/Captions API (API key, per-second credits; AI Creator, AI Ads, captioning endpoints). | Free: 60-200 lifetime credits, Mirage videos <=15 s. Basic $9.99, Max $24.99 (no watermark, AI actors), Business/Ad Studio ~$199/mo 12,000 credits; Mirage 10 credits/s. |
| [Arcads](https://www.arcads.ai) | AI UGC actors (300+), talking-actor ads from script, product-in-hand, emotion control; 9:16. | Arcads Terms (not retrieved): commercial ad use is the product's purpose; actor likeness licensed by Arcads (unverified). Disclosure obligations per platform/FTC remain on advertiser. | No (unverified). | Partial: API only on custom Pro plan. | No free plan; Lite $29 (no talking actors), Starter ~$77-110/mo (~10 videos), Creator ~$220; 800 credits per billed minute per actor. |
| [Creatify (URL-to-video ads, AI avatars)](https://creatify.ai/pricing) | Turns product URL into multiple ad variants with AI avatars, B-roll, captions; 9:16. | Creatify Terms: free exports watermarked; paid plans for commercial ads (unverified). | No; watermark on free. | Yes: Creatify API (api.creatify.ai, link_to_videos, lipsyncs) on paid/API plans. | Free: 10 credits/month, watermark. Starter ~$33-39, Pro ~$49-99. |

## Product footage

| Name | What you get | License | Attribution | API | Cost |
|---|---|---|---|---|---|
| [Brand / manufacturer media kit, press room or partner portal]((per brand) e.g. brand.com/press, /media-kit, Brandfolder/Bynder partner portals) | Official product photos, packshots, b-roll clips, logos, sometimes 9:16 social cuts. Quality varies by brand; many b-roll clips are 16:9 and need reframing. | No standard license. Typical press-kit terms: licensed for editorial/press or for promoting the brand's own products; brand keeps ownership; no logo alteration; some kits are gated (request form, approval email) or say 'contact us before use' (e.g., NerdWallet b-roll). Press/editorial permission does NOT automatically cover paid ads. Retailer/reseller asset portals usually permit use to promote that brand's products only, sometimes limited by channel (web, social, print) and period. | Sometimes - follow the brand's guidelines (usually no visible credit needed in ads, but no implied endorsement). | No (generally). Some brands use DAMs (Brandfolder, Bynder, Frontify) with share links; API access only for the brand's own users. | Free |
| [Wholesale marketplace brand assets (Faire and similar)](https://www.faire.com) | Brand-supplied listing images (sometimes video) for products you buy wholesale. | No Faire-level license found granting retailers reuse of brand photos in ads (unverified). Each brand's wholesale policy governs; some brands (e.g., Playground wholesale policy) forbid retailers from using logos/product photography without prior permission and design approval. | Per brand | No public asset API for retailers | Free with wholesale account |
| [TikTok Shop affiliate - free/refundable samples and seller collaborations](https://seller-us.tiktok.com/ (Affiliate Center)) | Creators request samples of your product and post shoppable videos; you get organic videos featuring the product. | Creator owns the video. To run it as an ad, use Spark Ads authorization code (creator-granted, 7-365 days) or a written license. TikTok ad IP policy prohibits using clips from unauthorized sources. | N/A | Partly - TikTok Shop Partner API exists for sellers (affiliate endpoints; approval required) (unverified) | Cost of samples + commission; sample types: free, refundable (refund after GMV milestone), none |
| [Impact.com brand creative library (Content > Assets)](https://impact.com) | Affiliates download brand-approved banners, images and sometimes video ad creative in multiple sizes/languages (Shopify's program on Impact says so). | Governed by each brand's program Terms (contract within Impact). Usually permitted only to promote that brand via your tracked links; paid social/search ads often restricted or require approval (check 'Promotional methods' in the contract). | Per contract | Partly - Impact Partner API exposes Ads/creatives for partners (unverified) | Free for partners |
| [Awin 'My Creative' library](https://help.awin.com/docs/using-my-creative-tool) | Banners, images, HTML5, text links, email templates; video not listed as a supported type. | Advertiser program terms govern; assets for promotional placements of that advertiser only. | Per program | Partly - Awin Publisher API (creative feeds) (unverified) | Free |
| [CJ Dropshipping Photo/Video Shooting Service](https://cjdropshipping.com (Services > Photography); guide: https://blog.cjdropshipping.cn/detail/how-to-use-video-shooting-service-from-cj-dropshipping) | Custom product photos/videos shot in CJ warehouses per your requirements. Also a public pool of already-shot videos other users paid for. | Two options per CJ blog: private (you get permanent copyright use, visible only to you) or public (others can pay to download the same video - non-exclusive). Private is safer for ads. | No | No public API for shooting requests (CJ has API for orders/products) | Quoted per request after review (not published); max 5 requests/day; ~2 working days to quote |
| [AliExpress / Alibaba supplier listing videos](https://www.aliexpress.com ; https://www.alibaba.com) | Product demo videos attached to listings; quality and watermarks vary. | No license is granted by the listing. AliExpress terms reportedly don't forbid downloading, but that is not permission to use in ads. Suppliers often copy videos from other brands/creators, so supplier permission may not be valid ('chain of title' risk). Branded/watermarked/creator-faced clips are high risk. | N/A | No | Free (asking) |
| [Alibaba OEM/private-label supplier: request custom video or free sample](https://www.alibaba.com) | Suppliers can send samples (often free for cheap stock items, you pay shipping) and some will shoot custom videos on request (paid add-on, unverified). | Get written assignment/license in the purchase agreement or chat (Trade Assurance record). | N/A | No | Samples: often free + shipping; custom video quoted |
| [Order a sample and film it yourself (phone kit)]((method) e.g. TikTok Creative Center best practices: https://ads.tiktok.com/business/creativecenter) | Your own 9:16 4K/1080p footage: hero shots, hands-on demo, unboxing, before/after, problem-solution. | You own the copyright. If anyone else appears (hands, face, voice), get a signed model release. Avoid third-party logos, artwork, music in background. | No | No | Product cost + ~$30-$150 gear (tripod, LED panel/ring light, white reflector/foam board, clip-on mic) |
| [soona (studio product photo/video)](https://soona.co/pricing) | Studio-shot product video clips, optional models/styling; ship product to studio or virtual shoot. | Content delivered to customer for commercial use (exact terms per soona ToS - unverified). | No | No | $93 per video clip; $149 studio pass per shoot for non-members; memberships ~$13-69/mo; premium edits $9 |

## UGC creator marketplaces

| Name | What you get | License | Attribution | API | Cost |
|---|---|---|---|---|---|
| [Amazon Creator Connections (brand-side campaigns)](https://advertising.amazon.com/ (Seller Central > Brands > Creator Connections)) | Brand-registered sellers set bonus commissions; Amazon Influencers make shoppable videos/posts. Creators keep their content. | Creators own their content. Third-party reporting (beBOLD) says brands generally cannot approve content beforehand or automatically reuse published content; content rights must be negotiated separately with each creator. | N/A (needs creator license) | No public API for brands (unverified) | Commission-based (bonus commissions reported 10-50%); no upfront fee (unverified) |
| [TikTok One (Creator Marketplace / Branded Content from Creators / Creator Content at Scale)](https://ads.tiktok.com/help/article/types-of-tiktok-one-solutions?lang=en) | Search and contract TikTok creators; campaigns with briefs, contracts, messaging; Spark authorization requests. | Content usage per in-platform contract; ad usage typically via Spark authorization requested in TikTok One. 'Creator Content at Scale' is listed as a program where creative is subsidized and advertiser pays only for promotion (eligibility unverified). | N/A | Partly - TikTok One APIs via Marketing API partners (unverified) | No platform fee reported; creator fees negotiated, often follower-based; CPM deals possible |
| [Shopify Collabs](https://collabs.shopify.com/terms) | Shopify app that recruits creators, gives affiliate links/codes, sends gifted products, pays commissions. | Collabs Terms do not (in retrieved excerpt) grant brands content rights; negotiate content/ad usage separately with each creator (unverified). | N/A | No public API (unverified) | Free app; commissions you set |
| [Billo](https://billo.app) | Vetted UGC creators film product videos (9:16) from your brief; hooks/variations. | Billo FAQ: creators transfer and assign all rights, title and interest in submitted content to the brand; usable on social, websites, ads. Duration not stated (read ToS). | No | No public API | ~$99/video starting (third-party, public price list removed); bundles reported 6/$500, 14/$1,000, 37/$2,500; add-ons up to ~$150/video |
| [Insense](https://insense.pro) | Marketplace of creators for UGC and Spark/Partnership ads; integrates with TikTok/Meta for whitelisting. | Content usage rights per Insense terms (licensing includes paid ads; verify). | No | No public API (unverified) | Subscription reportedly ~$400-800/mo + 7-20% marketplace fee + creator fees; trial reportedly paid and auto-upgrades |
| [Trend.io](https://www.trend.io) | US-focused UGC photo/video creators. | Brand gets usage rights for content (verify scope). | No | No | Reported from ~$50/asset; packages reported Starter $550, Essential $1,045 (~14 videos), Growth $1,980, Scale $3,872; credits expire after 12 months (third-party) |
| [JoinBrands](https://joinbrands.com) | Large creator pool for UGC video/photo, Amazon reviews-style content, TikTok Shop. | JoinBrands states accepted content can be used indefinitely on the selected channels. | No | No | Pay-as-you-go $0 plan and subscriptions reported $99/$299/$499 per month with 15/12/10/8% fees; example ~$115/video at $100 creator pay (third-party) |
| [Fiverr UGC creators](https://www.fiverr.com/categories/video-animation/ugc-videos) | Freelance UGC creators, actors, product video makers. | Fiverr ToS: buyer receives rights on delivery and payment, but many UGC gigs restrict paid-ad usage to an add-on with term (e.g., 3/6/12 months or perpetual). Always buy the commercial/ad-usage extra and get it in the order. | No | No public buyer API | Gigs ~$35-$400+; base often organic-only; paid usage extra (e.g., +15%/month extension) |
| [Collabstr](https://collabstr.com) | Marketplace of influencers/UGC creators with fixed packages. | Rights per order; Collabstr says full rights on its managed UGC; usage rights add ~40% on average (Collabstr data). | No | No | Free to search/hire; paid plans reported $299-499/mo; ~5-10% fee; avg UGC ~$190 per content (Collabstr calculator) |
| [Influee](https://influee.co/pricing) | App-based UGC marketplace, 80K+ creators, also Meta partnership ads. | Pricing page lists content usage rights for all content. | No | No | From ~EUR199/mo + creator fees + 10% marketplace fee; avg US 30s video ~$57-89 (vendor) |
| [Stack Influence (product seeding)](https://stackinfluence.com) | Micro-influencers paid in product post content; UGC library. | Vendor says full commercial rights included (lifetime). | No | No | Vendor-claimed ~$30 per collab + product cost; no subscription (verify) |
| [minisocial](https://minisocial.com) | Micro-creator (<100K followers) UGC cohorts; licensed assets; whitelisting. | Licensed UGC (terms unverified). | No | No | Pricing not public |
| [Backstage (casting) / Upwork](https://www.backstage.com ; https://www.upwork.com) | Hire actors/presenters or videographers for a product ad shoot or self-tape. | You draft the contract: work-for-hire/assignment + model release + usage terms. | No | No | Example listing day rate EUR200; varies widely |

## Music

| Name | What you get | License | Attribution | API | Cost |
|---|---|---|---|---|---|
| [YouTube Audio Library](https://studio.youtube.com/channel/UC/music) | Several thousand royalty-free music tracks plus SFX inside YouTube Studio; MP3 download; filter by genre, mood, duration, 'Attribution not required'. | Two license types per track: (1) 'YouTube Audio Library license' - free for videos you publish on YouTube (including monetized); YouTube's help focuses on in-YouTube use and third-party guides say use OFF YouTube (TikTok/Reels/paid Meta ads/website) is not clearly granted - treat as YouTube-only. (2) Creative Commons Attribution (CC BY 4.0) tracks - commercial use, ads and modification allowed on any platform with credit. No resale of the track standalone. | Sometimes - CC BY tracks require the credit text shown via the CC icon in Studio (paste it wherever the video is published); 'Attribution not required' tracks need none. | No - no public API for the Audio Library. | Free. |
| [Pixabay Music](https://pixabay.com/music/) | Large library (tens of thousands) of royalty-free music tracks from contributors; MP3 download; mood/genre/duration filters. | Pixabay Content License: irrevocable, worldwide, non-exclusive, royalty-free right to use for commercial and non-commercial purposes, modification allowed, no attribution required. Prohibited: selling/distributing content standalone or unmodified (e.g., as music files), implying endorsement, using in immoral/illegal ways, trademark/identifiable-person issues are user's responsibility (ToS warns product-promotion use may need extra consent for depicted people/brands). Some tracks are registered with Content ID by their uploaders (e.g., via HAAWK/ similar), which can trigger claims even though use is licensed. | No (appreciated). | No for music - the official Pixabay API covers images and videos only; music/SFX have no documented public endpoint (unverified but consistent across sources). | Free. |
| [Mixkit (Envato) - Free Music & SFX](https://mixkit.co/free-stock-music/) | Curated free music tracks and ~thousands of sound effects (plus video); MP3/WAV. | Mixkit Stock Music Free License and Mixkit Sound Effects Free License: free for commercial and personal projects, no attribution. Music license (per some third-party summaries) excludes certain uses such as broadcast TV/radio, physical media and video games (verify per track page); SFX license is broader. Cannot resell/redistribute items unaltered or as standalone files; cannot claim as your own or register with Content ID. | No (appreciated). | No public API. | Free. |
| [Uppbeat (free tier)](https://uppbeat.io/) | Curated music (YouTube-creator oriented), SFX; free tier accesses ~25-30% of catalog. | Uppbeat Free license: for creators' own social/YouTube content; requires credit; free tier is NOT for paid ads, corporate or client work. Paid 'Premium'/'Business' tiers add clearance for online paid ads and client work and remove credit. | Yes on free tier - paste the Uppbeat credit + license code into video description/caption. | No public API. | Free tier: ~3 downloads upfront, +1 per month (2026 sources; older sources say 10/month). Paid Premium ~US$6-10/mo, Business higher (verify). |
| [Bensound](https://www.bensound.com/) | Roughly 600+ royalty-free tracks by a small set of composers; MP3; filter by mood. | Bensound Free License: free use in online videos/social with mandatory credit; sources conflict on whether ads/paid promotion are covered - treat free license as NOT covering paid ads. Paid licenses (pay-per-track or subscription) remove attribution and extend to commercial/ads uses. | Yes (free) - credit like 'Music: Bensound / License code: XXXX / Artist: name' in description. | No public API. | Free with credit; paid per-track (~EUR 30+) or subscription (~EUR 10-13/mo annual) - figures unverified. |
| [Incompetech (Kevin MacLeod)](https://incompetech.com/music/royalty-free/) | ~2,000 instrumental tracks across genres; MP3; searchable by feel/tempo. | Creative Commons Attribution 4.0 (CC BY 4.0): commercial use, ads, modification allowed with attribution. Optional paid 'Standard License' (no attribution) ~US$30 per track (tiered discounts reported). | Yes (CC BY) - 'Track Title Kevin MacLeod (incompetech.com) Licensed under Creative Commons: By Attribution 4.0 License http://creativecommons.org/licenses/by/4.0/'. | No API. | Free with credit; ~US$30/track no-attribution license (unverified current price). |
| [Free Music Archive (FMA)](https://freemusicarchive.org/) | Large archive of independent music under various Creative Commons licenses; owned by Tribe of Noise. | Varies per track: CC BY / CC BY-SA allow commercial ads with credit (SA = derivative must share alike - impractical for ads); CC BY-NC / NC-ND forbid commercial use; ND forbids modification (editing/trim may count). Commercial licenses for many tracks sold via Tribe of Noise PRO (~EUR 45 per track reported) with legal guarantee. | Yes for CC tracks - 'Title by Artist is licensed under CC BY 4.0' with links. | No current official public API (old FMA API retired; unverified). | Free (CC) / ~EUR 45 per commercial license via Tribe of Noise PRO. |
| [Chosic](https://www.chosic.com/free-music/all/) | Aggregated free music (many CC BY tracks from artists like Scott Buckley, Kevin MacLeod etc.) with auto attribution text. | Mixed per track - mostly Creative Commons (CC BY common; some CC BY-SA/NC) or artist custom licenses. Only CC BY / CC0 / explicitly commercial tracks are usable for ads. | Sometimes - attribution text shown on download; paste into caption. | No API. | Free. |
| [Jamendo Music / Jamendo Licensing](https://www.jamendo.com/) | 500k+ independent tracks under Creative Commons; separate paid commercial licensing catalog. | Free tracks are CC (various, often NC) - Jamendo states commercial use of its music requires purchasing a commercial license from Jamendo Licensing (per-use pricing; ~US$49+/track reported, unverified). | Yes for CC uses; not needed with paid license. | Yes - Jamendo API v3.0 (api.jamendo.com/v3.0/tracks) with client_id from devportal.jamendo.com; returns license_ccurl per track; free for non-commercial apps (~35k requests/month reported, unverified). | Free API (non-commercial) / paid licensing for commercial. |
| [ccMixter](https://ccmixter.org/) | Community remixes/instrumentals under CC; 'dig.ccmixter.org' for film/video-friendly instrumentals. | Mostly CC BY or CC BY-NC per track; only CC BY usable in ads with credit. | Yes - per CC BY. | Partial - legacy query API (ccmixter.org/api/query) (unverified current status). | Free. |
| [Musopen](https://musopen.org/) | Public-domain/CC recordings of classical music (copyright-free performances). | Many recordings released as Public Domain/CC0 (commercial ads OK); some CC BY or other - check each recording. Composition PD is not enough - the recording must be free too, which Musopen recordings address. | Sometimes. | No public API (unverified). | Free tier with daily download limits; paid membership for more. |
| [Epidemic Sound (trial)](https://www.epidemicsound.com/) | ~50k tracks + 200k SFX, stems, 'Adapt' length editing; API for partners. | Subscription license: Personal plan covers your own social channels (monetized), Commercial/Business plan covers brands, client work and paid ads (check plan wording). Content published during an active subscription/trial stays cleared for that publication (no new uses after cancellation). | No. | Yes (partner) - Epidemic Sound Partner API (requires partnership agreement). | 30-day free trial (reported); Personal ~US$10-15/mo, Commercial ~US$20-23/mo (2026 listings conflict). |
| [Artlist (trial/plans)](https://artlist.io/) | Music, SFX, footage, AI voice; universal license. | Artlist license: 'Social' plans for personal channels only (no paid ads); 'Pro' plans cover paid ads, client work, broadcast, websites. Lifetime use for projects created during subscription. | No. | No public API. | Music & SFX Social ~US$9.99/mo annual; Music & SFX Pro ~US$24.92/mo annual (2026 listings); occasional free trials/promos (unverified). |
| [Soundstripe / Musicbed / PremiumBeat (paid alternatives)](https://www.soundstripe.com/) | Paid royalty-free libraries; PremiumBeat sells single-track licenses (~US$49+ standard). | Commercial ad use typically allowed under paid licenses; check tier for paid media spend/broadcast. | No. | Soundstripe has a partner API (unverified). | Paid. |
| [Suno (AI music)](https://suno.com/) | Text-to-song generation (vocals/instrumental), up to several minutes; Suno Studio, stems on Premier. | Suno Terms: Free (Basic) plan - non-commercial only, Suno retains ownership; Pro (~US$10/mo) and Premier (~US$30/mo) - commercial use rights (ads, streaming, sync) for songs generated while subscribed; no retroactive rights for free-plan songs. Post-Warner (Nov 2025) settlement, wording moved toward a granted commercial license and download limits; AI-only output may not be copyrightable (US Copyright Office). UMG/Sony litigation status varies by source. | No. | No official public API (third-party wrappers violate ToS). | Free (non-commercial, ~50 credits/day); Pro ~US$10/mo; Premier ~US$30/mo. |
| [Udio (AI music)](https://www.udio.com/) | AI song generator; after Oct 2025 UMG settlement, downloads disabled and platform moving to a licensed 'walled garden'. | Paid plans historically granted commercial use; since late 2025 creations are kept within the platform (no downloads/exports) pending new licensed service - effectively unusable for exported ads as of 2026 (verify). | No. | No. | Free/paid tiers. |
| [ElevenLabs Music (Eleven Music) + SFX generator](https://elevenlabs.io/music) | AI music generation (UI + API) trained on licensed data (Merlin, Kobalt deals); AI sound-effects generator also available. | ElevenLabs Terms: commercial use on paid plans; free plan non-commercial with attribution. Eleven Music marketed as 'cleared for broad commercial use' (film, TV, ads) on paid plans; usage limits vary by tier. | Free plan: attribution required; paid: No. | Yes - ElevenLabs API: POST /v1/music (compose), POST /v1/sound-generation (SFX), xi-api-key header. | Free (10k credits/mo, non-commercial); Starter ~US$5-6/mo with commercial license; Creator ~US$22/mo. |
| [Stable Audio (Stability AI)](https://stableaudio.com/) | AI music/SFX generation (web app + open weights: Stable Audio Open 1.0, Stable Audio 3.0 family 2026). | Stable Audio web plans: commercial rights on paid tiers (free tier non-commercial, unverified). Open weights under Stability AI Community License - free commercial use for orgs under US$1M annual revenue; above requires Enterprise license. Stable Audio Open 1.0 trained on CC audio (Freesound/FMA). | No. | Yes - Stability AI REST API (stable audio endpoints) and self-hosting open weights. | Free tier + paid; API credits. |
| [Other AI music generators (Mubert, Beatoven.ai, Soundraw, Loudly, AIVA)](https://mubert.com/) | Royalty-free AI generated background tracks by mood/length; several have APIs (Mubert API, Beatoven API, Loudly API, Soundraw API for partners). | Commercial/ads use generally on paid plans only; free tiers typically personal/non-commercial with attribution (e.g., Mubert free requires attribution; AIVA free - AIVA owns copyright and requires credit). Verify per vendor. | Sometimes (free tiers). | Yes/Partial - vendor APIs, mostly paid. | Free tiers + paid (~US$10-30/mo). |
| [TikTok Commercial Music Library + Music Usage Confirmation](https://ads.tiktok.com/business/creativecenter/music/pc/en) | Pre-cleared tracks for commercial content on TikTok. Business accounts see only CML in-app. | CML tracks licensed for commercial use on TikTok (organic + ads) only; not for other platforms. Brands may use externally licensed music if license covers TikTok commercial use and they complete Music Usage Confirmation (third-party summaries). | No | No | Free |

## Sound effects

| Name | What you get | License | Attribution | API | Cost |
|---|---|---|---|---|---|
| [Pixabay Sound Effects](https://pixabay.com/sound-effects/) | Tens of thousands of SFX (whooshes, clicks, pops, transitions, ambiences); MP3. | Pixabay Content License - commercial use incl. ads, modification allowed, no attribution; no standalone resale/redistribution (e.g., as an SFX pack). | No. | No (no public audio endpoint). | Free. |
| [Freesound](https://freesound.org/) | 600k+ user-uploaded sounds (SFX, foley, ambiences, loops) under CC licenses. | Per sound: CC0 (no conditions), CC BY 4.0 (credit), CC BY-NC (no commercial - excluded for ads). Older CC Sampling+ items exist - avoid for ads. | Sometimes - CC BY requires 'Sound name by username (freesound.org) licensed under CC BY 4.0'. | Yes - Freesound APIv2: token auth for search (GET /apiv2/search/text/?query=whoosh&filter=license:"Creative Commons 0"); original-file download requires OAuth2 (/apiv2/sounds/<id>/download/); HQ MP3 previews downloadable with token. Limits ~60 req/min, ~2000/day; ~500 downloads/day reported (unverified). | Free. |
| [Zapsplat](https://www.zapsplat.com/) | 150k+ SFX and some music; MP3 free, WAV for Gold. | Zapsplat Standard License (free): commercial use with attribution ('Sound effects obtained from https://www.zapsplat.com'); some items CC BY. Gold (~US$4-5/mo) removes attribution for items downloaded while Gold. No standalone redistribution. Ads not explicitly addressed in sources - check license page. | Yes (free) / No (Gold). | No public API. | Free (MP3, download limits) / Gold ~US$4/mo. |
| [Mixkit Sound Effects](https://mixkit.co/free-sound-effects/) | Thousands of curated SFX. | Mixkit Sound Effects Free License: commercial, no attribution; no redistribution. | No. | No. | Free. |
| [BBC Sound Effects (RemArc)](https://sound-effects.bbcrewind.co.uk/) | ~33,000 BBC archive sound effects (WAV). | RemArc Licence: personal, educational or research use only - NOT commercial (no ads). Commercial licenses for the BBC library available via Pro Sound Effects (paid). | Yes (RemArc requires credit 'BBC Sound Effects'). | No public API. | Free (non-commercial) / paid via Pro Sound Effects. |
| [Sonniss GameAudioGDC bundles](https://sonniss.com/gameaudiogdc) | Annual free bundles of pro SFX (tens of GB total). | Sonniss royalty-free license: commercial use in unlimited projects, no attribution; no redistribution as SFX library; newer bundles forbid AI training use. | No. | No. | Free. |
| [Kenney / OpenGameArt audio (CC0)](https://kenney.nl/assets/category:Audio) | CC0 UI/interface/impact sound packs (Kenney); OpenGameArt mixed licenses. | Kenney: CC0 1.0 - any use incl. ads, no attribution. OpenGameArt: per asset (CC0/CC BY/GPL etc.). | No (Kenney). | No. | Free. |

## Voiceover / TTS

| Name | What you get | License | Attribution | API | Cost |
|---|---|---|---|---|---|
| [ElevenLabs (TTS / voice)](https://elevenlabs.io/) | Highly natural multilingual TTS (Multilingual v2, Flash, v3), voice library, voice cloning (paid), dubbing. | ElevenLabs Terms: Free plan - non-commercial, attribution to ElevenLabs required; paid plans (Starter+) - commercial license for output incl. ads. Cloning requires rights/consent of the voice owner; Voice Library voices have their own sharing terms. Prohibited: impersonation, deceptive content. | Free: Yes; Paid: No. | Yes - ElevenLabs API: POST /v1/text-to-speech/{voice_id} (xi-api-key), timestamps endpoint /with-timestamps for caption sync; concurrency limits by tier. | Free 10k credits/mo (~10 min); Starter ~US$5-6/mo (30k credits, commercial); Creator ~US$22/mo; Pro ~US$99/mo. |
| [OpenAI Text-to-Speech API](https://platform.openai.com/docs/guides/text-to-speech) | gpt-4o-mini-tts (steerable tone via instructions), tts-1 / tts-1-hd; ~11+ preset voices; MP3/WAV/Opus. | OpenAI Terms: you own output (as between you and OpenAI) and may use commercially. Usage policies require clearly disclosing to end users that the voice is AI-generated, not human; no impersonation; no custom voice cloning. | No attribution; AI-voice disclosure required by policy. | Yes - POST https://api.openai.com/v1/audio/speech {model, voice, input, instructions}; ~2000 input tokens/request. | Pay-as-you-go: gpt-4o-mini-tts ~US$0.60/1M input tokens + US$12/1M audio tokens (~1.5 cents/min); tts-1 ~US$15/1M chars (verify). |
| [Google Cloud Text-to-Speech](https://cloud.google.com/text-to-speech) | 380+ voices, 50+ languages: Standard, WaveNet, Neural2, Studio, Chirp 3 HD; SSML; custom voice. | Google Cloud Terms: customer owns output; commercial use incl. ads allowed; restrictions per AUP (no impersonation/deception). | No. | Yes - REST text:synthesize (POST https://texttospeech.googleapis.com/v1/text:synthesize), API key/service account; SSML marks for timing. | Free monthly: Standard/WaveNet 4M chars (pricing table; product page says 1M for WaveNet), Neural2 1M, Chirp 3 HD 1M, Studio 1M; then US$4 / 16 / 30 / 160 per 1M chars. |
| [Microsoft Azure AI Speech (Neural TTS)](https://azure.microsoft.com/products/ai-services/text-to-speech) | 400+ neural voices, 140+ locales, HD voices, styles (cheerful, excited), SSML, word boundary events; custom neural voice (limited access). | Microsoft Product Terms: customer owns output; commercial use allowed; Responsible AI/Code of Conduct requires disclosure of synthetic voice where appropriate; custom neural voice needs approval + voice talent consent. | No. | Yes - Speech SDK / REST (POST https://{region}.tts.speech.microsoft.com/cognitiveservices/v1, SSML body); WordBoundary events for captions. | F0 free: 500k neural chars/month (each request capped); S0 ~US$15-16 per 1M chars (verify). |
| [Amazon Polly](https://aws.amazon.com/polly/) | Standard, Neural, Long-Form, Generative voices; SSML; Speech Marks (word timings). | AWS Service Terms: commercial use of output allowed; customer responsible for rights/disclosures. | No. | Yes - SynthesizeSpeech API (boto3 polly.synthesize_speech, Engine='generative'), SpeechMarkTypes=['word'] for captions. | Free tier: Standard 5M chars/mo; Neural 1M/mo and Generative 100k/mo for 12 months; then Standard US$4, Neural ~US$16-19.20, Generative US$30, Long-Form US$100 per 1M chars; new accounts up to US$200 credits. |
| [Murf AI](https://murf.ai/) | Studio TTS with 200+ voices, timing to video, API (Murf API). | Free plan: ~10 minutes, no downloads, no commercial rights. Creator plan (~US$19-29/mo) and up include commercial usage rights. | No (paid). | Yes - Murf API (paid, separate). | Free trial / Creator ~US$19-29/mo. |
| [Play.ht (DISCONTINUED)](https://play.ht/) | Formerly AI TTS platform. | Acquired by Meta July 2025; API shut down July 2025; platform terminated Dec 31, 2025 - do not plan on it. | N/A | No (shut down). | N/A |
| [CapCut Text-to-Speech](https://www.capcut.com/tools/text-to-speech) | Built-in TTS voices in CapCut desktop/mobile/web, auto captions. | CapCut help pages state TTS output may be used commercially (ads, brand promotions) subject to CapCut Terms of Service; built-in music/templates governed by separate CapCut Materials License (some materials restricted/commercial-limited). Regional terms differ (US vs global); CapCut ToS grants it broad rights to user content. | No. | No public API. | Free (some voices Pro). |
| [TikTok in-app Text-to-Speech / Voice effects](https://www.tiktok.com/) | Built-in TTS voices in TikTok editor. | Usable within TikTok content per TikTok ToS; not a downloadable asset licensed for other platforms. | No. | No. | Free. |
| [Piper (open-source TTS)](https://github.com/rhasspy/piper) | Fast local neural TTS (ONNX), many voices/languages; runs on CPU; original repo archived Oct 2025, development continues in successor (OHF-Voice/piper1-gpl). | Engine MIT (newer piper1 fork GPL-3.0); each voice model has its own license (CC0, CC BY 4.0, or dataset-restricted e.g. some trained on non-commercial datasets). Check each voice MODEL_CARD; prefer CC0/CC BY voices with clean datasets (e.g., LJSpeech-based = PD). | Sometimes - CC BY voices need credit. | Yes - local CLI/Python ('echo text \| piper --model en_US-...onnx --output_file out.wav'). | Free. |
| [Kokoro-82M (open-weight TTS)](https://huggingface.co/hexgrad/Kokoro-82M) | Small high-quality open TTS model, multiple English and other voices; runs locally. | Apache-2.0 weights (per model card/hosts) - commercial use allowed; trained on permissive/non-copyrighted data (developer claim). | No (Apache notice for redistribution of model only). | Yes - local Python (kokoro package) or hosted APIs (Together, etc.). | Free (self-host). |
| [Coqui XTTS v2](https://huggingface.co/coqui/XTTS-v2) | Open-weight multilingual voice-cloning TTS. | Coqui Public Model License 1.0.0 (CPML): non-commercial use of model AND its outputs only. Coqui shut down Dec 2023 - no working route to a commercial license. NOT usable for ads. | N/A | Local only. | Free (non-commercial). |
| [Other commercial TTS APIs (Cartesia, Deepgram Aura, Fish Audio, Hume Octave, WellSaid, Resemble, Speechify)](https://cartesia.ai/) | Low-latency or expressive TTS APIs; most with free trial credits. | Commercial use typically on paid plans; free tiers often non-commercial/attribution. Verify each vendor's terms (unverified). | Sometimes. | Yes - REST APIs. | Free credits + paid. |
| [Human voice actors (Fiverr, Voices.com, Voice123) / record yourself](https://www.voices.com/) | Human VO talent; or self-recorded VO on phone with free tools (Audacity, Adobe Podcast Enhance). | Commercial rights per contract - specify 'paid social ads, all platforms, perpetuity' usage scope; self-recorded = you own it. | No. | Partial - marketplaces have no public automation. | ~US$20-300+ per spot. |

## Editing APIs

| Name | What you get | License | Attribution | API | Cost |
|---|---|---|---|---|---|
| [Shotstack](https://shotstack.io/pricing/) | Cloud video editing API: JSON timeline (tracks, clips, assets: video, image, title, html, caption, audio, luma), output 1080x1920 at 9:16, auto-captions via 'caption' asset with alias to TTS/transcript; also Ingest and Create (TTS/AI) APIs. | Commercial SaaS; you supply licensed assets; sandbox renders watermarked. | No | Yes - POST https://api.shotstack.io/edit/v1/render (stage: /edit/stage/render), header x-api-key; poll GET /render/{id}. | Sandbox free (watermarked). Pay-as-you-go listed $30/100 credits ($0.30/min); subscription $199/mo 1,000 credits per official page; third-party reports differ ($39/200 credits) - verify |
| [Creatomate](https://creatomate.com/pricing) | Template-based video API: design a 9:16 template in web editor (dynamic elements: video slots, text, captions with word highlighting, TTS), render via API or Zapier/Make/n8n; also full RenderScript JSON without template. | Commercial SaaS; built-in stock integrations follow their own licenses. | No | Yes - POST https://api.creatomate.com/v1/renders with template_id + modifications, Bearer API key. | Free trial 50 credits no card (Capterra); paid tiers Essential/Growth/Beyond (~$41-45, ~$109, ~$329/mo - third-party, unverified) |
| [JSON2Video](https://json2video.com/pricing) | Video-from-JSON API: scenes with video/image/text/voice (built-in TTS) /subtitles elements; Make/Zapier/n8n integrations. | Commercial SaaS. Free plan: personal/educational/evaluation only, watermarked; paid plans remove watermark. | No | Yes - POST /v2/movies with x-api-key; credits deducted by length x resolution factor. | Free: 600 one-time credits, watermark, not for commercial use; paid ~$16.95-$99.95/mo (third-party snapshot May 2026, unverified) |
| [Plainly](https://www.plainlyvideos.com/) | Automates After Effects templates: upload AE project, map layers to data, render via API/integrations. | Commercial SaaS; AE templates must be licensed for your use (e.g., Envato/Motion Array templates have their own terms). | No | Yes - HTTP API (render endpoint per template). | From ~$69/mo (14-day trial) - third-party, unverified |
| [Rendi / FFmpeg-as-a-service APIs](https://www.rendi.dev/) | Run FFmpeg commands in cloud via REST without servers. | Commercial SaaS. | No | Yes - REST (unverified details) | Free tier + paid (unverified) |

## Editing apps

| Name | What you get | License | Attribution | API | Cost |
|---|---|---|---|---|---|
| [Canva (free video library)](https://www.canva.com/) | Canva's built-in library of free and Pro stock video, music and templates, editable in 9:16 for Reels and TikTok. | Canva Content License. Free Media License: unlimited Canva designs, advertising and promotional projects permitted. Pro Content: commercial use inside designs. Some items are under a One Design Use license, which needs a fee per design and per Magic Resize. Branded or Disney content is personal use only. You may not use content standalone outside a design or for AI/ML. There is no indemnification. | No | Canva Connect API (design automation) is available, but stock download through the API is not available (unverified). | Free + Canva Pro (price unverified). |
| [Editor built-in stock libraries (Clipchamp / CapCut / Kapwing)](https://clipchamp.com/) | Video editors with built-in stock libraries (often Storyblocks or Getty sourced) and 9:16 presets. | Each editor's own stock terms. Typically usable only inside videos exported from that editor, not as standalone files (unverified). | Usually No | Varies | Free tiers + paid |
| [FFmpeg](https://ffmpeg.org/legal.html) | Command-line encoder: trim, scale/crop to 1080x1920, concat, overlay logo/product images, burn captions (subtitles/ass filter), mix voiceover + music with ducking (sidechaincompress), loudness normalize (loudnorm). | LGPL 2.1+ (GPL if built with GPL parts like libx264). Using the binary to make videos imposes no license on your videos; redistribution of the binary carries obligations. | No | Partial - CLI; Python wrappers (ffmpeg-python, subprocess). Hosted: Rendi, FFmpeg APIs. | Free |
| [MoviePy](https://github.com/Zulko/moviepy) | Python video editing library (v2.x): subclip, resize, crop, concatenate_videoclips, CompositeVideoClip, TextClip, audio mixing; uses FFmpeg under the hood. | MIT - commercial use allowed. | No | Partial - Python library. | Free |
| [Remotion](https://www.remotion.dev/docs/license) | React-based programmatic video; compositions take JSON props (scenes, captions, product shots); render locally, on Lambda or Cloud Run; @remotion/captions + Whisper integration for TikTok-style word captions. | Remotion License: free for individuals, for-profit orgs with up to 3 employees, non-profits and evaluation; companies of 4+ need a Company License (Creators $25/mo per seat; Automators $0.01/render, $100/mo minimum; Enterprise from $500/mo) - official pricing page. | No | Yes - @remotion/renderer renderMedia(), @remotion/lambda renderMediaOnLambda(). | Free (small teams) / paid company license |
| [Canva Bulk Create + Canva Connect API](https://www.canva.com/help/bulk-create/) | Bulk Create fills a design (incl. vertical video) from CSV/table rows - text and images per row; Canva stock video/music under Canva Content License. | Canva Content License: Free/Pro content may be used in commercial projects incl. ads within designs; cannot resell/redistribute stock standalone or use in trademarks; music has platform limits (check). Pro elements need Pro. | No | Partial - Canva Connect API (autofill brand templates requires Canva Enterprise, unverified); Bulk Create is UI. | Free plan; Pro ~$15/mo (unverified); Bulk Create requires Pro/Teams (unverified) |
| [CapCut (desktop/web/mobile, templates)](https://www.capcut.com/trust/legal) | Editor with templates, auto captions, TTS, effects; tight TikTok integration. | CapCut ToS + Materials License Agreement (dated Jan 2026 per third-party): only templates/materials expressly labeled 'Commercial Use' may be used for brand promotion; one personal-only element makes the whole export personal-only (third-party reading). Library music labeled 'commercial: TikTok and CapCut' is platform-limited - not cleared for YouTube/IG/paid ads elsewhere. ToS grants CapCut broad license to user content (disputed reading). | No | No public editing API | Free + Pro subscription |
| [Descript](https://www.descript.com/) | Text-based video editing, transcription, captions, Overdub/AI voice (with consent), stock media library, 9:16 layouts. | Commercial SaaS; built-in stock media under provider licenses (check per asset); AI voice clones require voice owner's consent. | No | Partial - limited API (unverified) | Free tier + paid plans (unverified) |

## Footage matching & search

| Name | What you get | License | Attribution | API | Cost |
|---|---|---|---|---|---|
| [Openverse](https://openverse.org) | Search engine (WordPress.org) for 800M+ openly licensed images and audio; video only via 'external sources' links (Wikimedia, Vimeo, YouTube CC, etc.). | Indexes only CC-licensed and public domain works; filters for commercial use and modification. Openverse does not verify licenses. | Per item. | Yes — https://api.openverse.org/v1/images/ and /v1/audio/ (anonymous low rate; register OAuth app for higher). No video endpoint (as of last verified docs). | Free |
| [Openverse (audio)](https://openverse.org/) | Search engine (WordPress Foundation) indexing openly licensed audio from Jamendo, Freesound, Wikimedia Commons, ccMixter etc. | Aggregator only - each result carries its source license (CC0, PDM, CC BY, BY-SA, NC...). Filter license_type=commercial and/or modification to get ad-usable items. | Depends on item - Openverse generates attribution text. | Yes - Openverse API: GET https://api.openverse.org/v1/audio/?q=...&license_type=commercial,modification&category=music\|sound_effect; anonymous use has low rate limits; register OAuth2 app (/v1/auth_tokens/register) for higher limits. | Free. |
| [OpenAI CLIP / OpenCLIP (embeddings for semantic matching)](https://github.com/mlfoundations/open_clip) | Open-source image-text embedding models. Embed one frame per second (or per shot) of every candidate clip and embed each scene description; cosine similarity ranks which clip best matches the script line. | Code: MIT (OpenAI CLIP) / MIT-style (OpenCLIP); model weights per model card (many OpenCLIP weights trained on LAION, released under MIT/open terms). Running the model does not change the footage license. | No | Partial - Python library (pip install open_clip_torch); no hosted API. Hosted alternatives: Replicate/HuggingFace Inference endpoints. | Free (compute only; CPU works for small batches, GPU faster) |
| [Google SigLIP / SigLIP 2](https://huggingface.co/google/siglip-so400m-patch14-384) | Image-text embedding model (sigmoid loss) generally stronger zero-shot retrieval than original CLIP; SigLIP 2 adds multilingual support. | Apache-2.0 (model card) - commercial use permitted. | No | Partial - transformers library (AutoModel 'google/siglip-so400m-patch14-384' or siglip2 variants). | Free (compute) |
| [Twelve Labs (Marengo search/embed, Pegasus video-to-text)](https://www.twelvelabs.io/pricing) | Hosted video understanding: index your clip library, then natural-language search returns timestamped segments ('hands opening a parcel on a doorstep'); Embed API returns video embeddings; Pegasus generates descriptions. | Commercial SaaS; you keep rights to uploaded content per ToS; output segments are pointers into your own licensed footage. | No | Yes - REST API: create index (Marengo), upload tasks (/tasks), POST /search with query_text; Embed API. Free plan: up to 10h (600 min) indexing, 90-day index retention, 100 videos/index, 5 concurrent tasks (per official pricing page snippet). | Free tier (600 min indexing, search marked free on official page) ; Developer pay-as-you-go ~ $0.042/min indexing, search ~$4/1,000 queries beyond free (third-party, unverified) |
| [Google Cloud Video Intelligence API](https://cloud.google.com/video-intelligence/pricing) | Shot change detection, label detection (objects/scenes per shot), text detection (OCR - catch watermarks/logos), logo recognition, explicit content, person/face detection. | Commercial cloud service; analysis only. | No | Yes - videos:annotate with features SHOT_CHANGE_DETECTION, LABEL_DETECTION, TEXT_DETECTION, LOGO_RECOGNITION; Google Cloud key/service account. | First 1,000 min/month free per feature; then label detection $0.10/min, shot detection $0.05/min (free with label detection) - official pricing page |
| [AWS Rekognition Video (segment detection, labels)](https://aws.amazon.com/rekognition/pricing/) | StartSegmentDetection (shots, black frames, credits), StartLabelDetection, text detection, celebrity recognition (to flag recognizable people). | Commercial cloud service. | No | Yes - async Start*/Get* APIs on S3 objects. | Free tier for first 12 months on new accounts (limited minutes, unverified); then per-minute pricing |
| [Azure AI Video Indexer](https://azure.microsoft.com/en-us/products/ai-video-indexer) | Indexes video for scenes, shots, keyframes, labels, OCR, transcripts, brands detected. | Commercial cloud service. | No | Yes - Video Indexer REST API (ARM-based accounts); trial account with limited free minutes (unverified). | Trial minutes then pay per input minute (unverified) |
| [PySceneDetect](https://www.scenedetect.com/) | Open-source shot/scene cut detection (content, adaptive, threshold detectors); can split videos into shots via FFmpeg. | BSD-3-Clause - commercial use allowed. | No | Partial - CLI and Python API (scenedetect -i in.mp4 detect-adaptive list-scenes split-video). | Free |

## Captions

| Name | What you get | License | Attribution | API | Cost |
|---|---|---|---|---|---|
| [Submagic](https://www.submagic.co/) | Auto animated captions, emojis, B-roll suggestions, zooms, hook titles for shorts. | Commercial SaaS; check its B-roll/music library license separately. | No | Partial - API only on Business + API plan | Free 3 videos/mo (1:30 max); Starter $19/mo; Pro $39/mo; Business+API ~$69/mo (third-party 2026, unverified) |
| [Captions (Mirage) app/API](https://www.captions.ai/) | AI captions, AI edit, AI avatars/creators; API for captions and AI ads (unverified). | Commercial SaaS; AI-avatar ads require AI disclosure where platforms require. | No | Partial (unverified) | Paid subscription (unverified) |
| [OpenAI Whisper / faster-whisper / WhisperX](https://github.com/openai/whisper) | Speech-to-text with timestamps; WhisperX adds word-level alignment for karaoke captions; outputs SRT/VTT/JSON. | MIT (whisper code and weights); faster-whisper MIT; WhisperX BSD-2 (unverified). | No | Partial - local library; OpenAI hosted transcription API (whisper-1 / gpt-4o-transcribe) paid per minute. | Free locally / paid API |

## Platform rules

| Name | What you get | License | Attribution | API | Cost |
|---|---|---|---|---|---|
| [Creative Commons 'Search Portal' and legal tools](https://creativecommons.org/about/cclicenses/) | Official license deeds and a portal linking to CC-enabled search engines (Wikimedia, Openverse, Vimeo, YouTube, Europeana, Flickr). | Defines CC0, BY, BY-SA, BY-NC, BY-ND, BY-NC-SA, BY-NC-ND and Public Domain Mark (a label, not a license). Includes 'Best practices for attribution' (TASL: Title, Author, Source, License). | N/A | No | Free |
| [TikTok AI-generated content (AIGC) labeling policy](https://support.tiktok.com/en/using-tiktok/creating-videos/ai-generated-content) | Rules for labeling realistic AI content in organic posts and ads. | TikTok Community Guidelines (Integrity & Authenticity) + Advertising Policies: creators must label AI-generated content that contains realistic images, audio or video (toggle 'AI-generated content' in post settings); TikTok auto-labels via C2PA Content Credentials; misleading AIGC of real people, fake endorsements and deepfakes of public figures banned. Ads: AI disclosure mandatory for ads with realistic AI-generated content since ~2026-07-21 (secondary sources). Unlabeled realistic AIGC may be removed or down-ranked. | N/A - label required. | Content Posting API supports an AIGC flag ('is_aigc'/brand content toggles) (unverified). | Free. |
| [YouTube altered or synthetic content disclosure](https://support.google.com/youtube/answer/14328491) | Disclosure rules for realistic AI/altered content. | YouTube policy: creators must disclose realistic altered/synthetic content in Studio upload flow ('Altered content: Yes'); not required for clearly unrealistic, animated, beauty filters, or minor production assistance. Since May 2026 the label shows as an overlay on Shorts and below player on long-form; YouTube auto-applies when it detects photorealistic AI; content made with YouTube's Veo/Dream Screen is permanently labeled. Labels do not by themselves affect monetization. Google Ads also requires disclosure for election ads with synthetic content. | N/A | YouTube Data API: videos.insert status.containsSyntheticMedia field (unverified). | Free. |
| [Meta (Facebook/Instagram) AI labeling for ads and posts](https://www.facebook.com/business/help/) | AI info labels and advertiser disclosure. | Meta: 'AI info' label applied to content detected via C2PA/IPTC or self-disclosed; ads made/significantly edited with Meta GenAI tools labeled in 'About this ad' (Feb 2025); third-party AI detected via industry signals; photorealistic AI person may get label beside 'Sponsored'; mandatory disclosure for AI in political/social-issue ads. Automatic enforcement for third-party C2PA reportedly expanded July 2026 (secondary). | N/A | Marketing API ad creative fields for AI disclosure (unverified). | Free. |
| [FTC Consumer Reviews and Testimonials Rule (16 CFR Part 465) + Endorsement Guides (16 CFR Part 255)](https://www.ftc.gov/legal-library/browse/rules/trade-regulation-rule-use-consumer-reviews-testimonials) | US federal law on fake/AI testimonials and endorsements. | 16 CFR 465 (effective 2024-10-21): bans creating, buying or disseminating fake reviews/testimonials, including AI-generated ones or ones attributed to people who do not exist or who did not have the stated experience, when you knew or should have known; civil penalties ~$51,744+ per violation (inflation-adjusted). Endorsement Guides (16 CFR 255, revised 2023): endorsements must reflect honest opinions of actual users; material connections disclosed; ads must not misrepresent that an endorser is an actual user. Practical result: AI avatars/AI UGC actors may deliver scripted brand messaging but must NOT claim 'I used this and it changed my life' as if a real customer; results claims need substantiation; add clear 'AI-generated'/'actor portrayal' disclosure. | N/A - disclosures required. | No. | Free. |
| [Amazon Associates / Product Advertising API (PA-API) / Creators API content](https://affiliate-program.amazon.com/help/operating/policies) | Product images, titles, prices via API for affiliate links. NOT a source of downloadable product videos. | Associates Program Policies / PA-API License: Program Content may be used only to drive traffic to Amazon; image caching not allowed (links up to 24h); no reselling/redistributing Program Content; no altering in a misleading way; PA-API content may not be used with machine-learning models (clarified March 2024). Listing videos uploaded by sellers/brands are NOT licensed to you; do not download them for your ads. | N/A | Yes - PA-API 5.0 / Creators API (requires qualifying sales) | Free |
| [TikTok Spark Ads (authorization codes)](https://ads.tiktok.com/help/article/how-to-use-content-suite-to-create-and-launch-spark-ads) | Run a creator's organic post as an ad from their handle. | Creator grants ad authorization per post for 7, 30, 60 or 365 days and accepts the Advertising Content terms. Advertiser cannot edit the video; caption fixed. Duets/Stitches need codes from all participants. It is NOT a license to download/re-edit footage. | No (shows creator handle) | Yes - TikTok Marketing API supports Spark Ads (tt_user identity / authorization); Ads Manager batch entry up to 20 codes | Free (you pay ad spend) |
| [Meta Partnership Ads (creator ad codes / Partnership Ads Hub)](https://www.facebook.com/business/help (Partnership ads)) | Run a creator's Instagram/Facebook post as an ad showing both handles with 'Paid partnership' label. | Creator grants permission per post (partnership ad code) or account-level via Partnership Ads Hub. Meta Copyrights and Trademarks ad policy prohibits infringing content; ads can be rejected on rights-holder report. | Paid partnership label shown | Yes - Marketing API supports partnership/branded content ads | Free (ad spend) |
| [Model release / talent usage agreement](https://help.motionelements.com/en/contributor/docs/what-is-a-model-or-property-release) | Signed consent from any identifiable person (face, voice, distinctive tattoo) appearing in commercial video. | Required for commercial/advertising use (right of publicity, US state law; varies by country). Specify media, territory, duration, purpose; minors need guardian signature. Editorial-use footage cannot be repurposed into ads. Property release for recognizable private property/artworks. | N/A | No (e-sign tools like DocuSign/Dropbox Sign have APIs) | Free templates; lawyer review recommended |
| [TikTok Ads IP infringement policy](https://ads.tiktok.com/help/article/tiktok-ads-policy-intellectual-property-infringement?lang=en) | Rules for ad content. | Ads that infringe copyright/trademark not allowed; prohibits use of clips from unauthorized media sources; using third-party brands/logos misleadingly prohibited. Advertisers may need to upload proof of rights. | N/A | N/A | N/A |
| [Meta Ads Copyrights and Trademarks policy / Rights Manager](https://transparency.meta.com/policies/ad-standards/intellectual-property-infringement/copyright-and-trademarks) | Rules for ad content. | Ads may not infringe third-party IP; rejected after rights-holder reports or signals; Rights Manager can match and block reused videos. | N/A | N/A | N/A |
| [NOT allowed: reusing other sellers' or creators' videos](https://ads.tiktok.com/help/article/tiktok-ads-policy-intellectual-property-infringement?lang=en) | Ripping competitor ads (TikTok Creative Center Top Ads, Meta Ad Library), creator TikToks/Reels/YouTube, Amazon listing videos, other Shopify stores' videos. | All are copyrighted; viewing in Ad Library / Creative Center is for inspiration only. Downloading via third-party downloaders, cropping, mirroring, speed changes or adding voiceover do not make it legal. Results: ad rejection, account bans, DMCA takedowns, store/payment processor issues, lawsuits. | N/A | N/A | N/A |
| [TikTok Commercial Music Library (CML)](https://ads.tiktok.com/business/en/blog/audio-library-royalty-free-music) | 600k+ to 1M+ pre-cleared tracks and sounds available to TikTok Business accounts and in TikTok Ads Manager / CapCut for business. | TikTok Commercial Music Library terms: tracks cleared for organic business posts and paid TikTok ads on TikTok only, no per-track fee; NOT licensed for use off TikTok (Reels, YouTube, website, TV). Business accounts may not use the General (non-commercial) sound library; trending label songs are off-limits to brands. | No. | Partial - accessible inside TikTok app, TikTok Ads Manager creative tools and via TikTok's Marketing API music/asset endpoints for ads (unverified detail). | Free. |
| [Meta Sound Collection](https://www.facebook.com/sound/collection/) | ~14,000+ royalty-free songs and sound effects provided by Meta; available in Creator Studio/Meta Business Suite and Ads Manager 'Add music' for Reels ads. | Meta Sound Collection terms: free for use in content on Facebook and Instagram, including business posts and (per Meta announcements) Reels ads via Ads Manager; not licensed for other platforms. The regular Instagram/Facebook licensed music library is for personal, non-commercial use only and is unavailable to many business accounts. | No. | No public API (selection in Ads Manager / Business Suite). | Free. |
| [YouTube Shorts / Instagram / TikTok in-app trending music (warning)](https://help.instagram.com/402084904469945) | In-app libraries of popular label music. | Licensed for personal, non-commercial use only; branded content and ads cannot use them (business accounts restricted). Downloading copyrighted songs from YouTube/TikTok/Instagram for ads is infringement. | N/A | No. | N/A |
| [AI-voice and AI-content disclosure rules (platforms/FTC/EU)](https://www.ftc.gov/business-guidance/advertising-marketing) | Rules affecting synthetic voice in ads. | TikTok requires AIGC labels for realistic AI-generated audio/video (2026 ad policy reportedly expanded to ads with synthetic voices); Meta/YouTube require disclosure of realistic altered/synthetic media; OpenAI policy requires AI-voice disclosure; FTC treats AI that fakes real people/testimonials as deceptive; EU AI Act Art. 50 transparency obligations apply from Aug 2, 2026; NY requires disclosure of synthetic performers in ads; Tennessee ELVIS Act bars unauthorized voice cloning. | N/A | N/A | N/A |
| [TikTok Community Guidelines - originality / FYF eligibility](https://www.tiktok.com/community-guidelines/en/fyf-standards) | Rules on what is eligible for the For You feed; unoriginal, low-quality, or reposted content without creative edits is ineligible for FYF (third-party paraphrase; verify wording). | Policy: content 'imported or reposted without adding new or creative edits' is not recommended (unverified quote). Repeated violations reduce account reach. | n/a | No | Free |
| [YouTube Partner Program policy - Reused content and Inauthentic content (July 15, 2025 update)](https://support.google.com/youtube/answer/1311392) | Monetization policies: 'repetitious content' renamed 'inauthentic content' on July 15, 2025 - covers mass-produced/repetitive content, e.g. template-made with little variation. Reused content (compilations of others' clips without significant original commentary/edits) unchanged. | Enforcement channel-wide (demonetization of whole channel). Test: average viewer can clearly tell videos differ from one another. | n/a | No | Free |
| [TikTok AI-generated content labels (AIGC)](https://support.tiktok.com/en/using-tiktok/creating-videos/ai-generated-content) | Creators must label realistic AI-generated content; TikTok auto-labels uploads carrying C2PA Content Credentials (since May 2024). | Unlabeled realistic AIGC can be removed; ads have separate AI disclosure in ad creation. | n/a | No | Free |
| [Meta originality guidelines (Facebook/Instagram Reels) + 'AI info' labels](https://about.fb.com/news/) | Facebook original-content guidelines (2025): content filmed/produced by the creator counts as original; stitched compilations, low-effort edits, watermarks/credits alone are not enough; accounts posting mostly unoriginal content lose recommendations/monetization. Instagram extended to photos/carousels. Meta applies 'AI info' labels from C2PA/IPTC metadata and self-disclosure. | Policy, not a license. | n/a | No | Free |
| [FTC Endorsement Guides (2023) + Consumer Reviews and Testimonials Rule (eff. Oct 21, 2024)](https://www.ftc.gov/legal-library/browse/rules/rule-use-consumer-reviews-testimonials) | Guides: disclose material connections clearly in the video itself (on-screen + spoken); platform disclosure tools may be insufficient. Rule: bans fake reviews/testimonials incl. AI-generated or attributed to non-existent people or people without experience; civil penalties (~$51,744 per violation, inflation-adjusted, 2024 figure). | Law/regulation (US). | n/a | No | Free |
| [EU AI Act Article 50 transparency obligations](https://artificialintelligenceact.eu/article/50/) | Deployers of AI that generate deepfakes must disclose artificial generation; obligations apply from Aug 2, 2026. | Regulation (EU). | n/a | No | Free |

## Other

| Name | What you get | License | Attribution | API | Cost |
|---|---|---|---|---|---|
| [British Pathé](https://www.britishpathe.com) | ~85,000+ newsreel films 1896-1978 (plus Reuters historical archive). | NOT free. Copyrighted archive; all commercial and non-commercial uses require a paid license. Online licenses per clip priced by use (Advertising is a category), platform, territory and term; larger deals per second with 60-second minimum. Their YouTube channel uploads are under standard YouTube license — do not rip. | Per license | No public API | Paid — quote-based (advertising is premium; one secondary report of ~$2,600/min for worldwide online perpetual, unverified) |
| [European Commission Audiovisual Service](https://audiovisual.ec.europa.eu) | EU event footage, stock shots of European cities, institutions. | Offered free of charge for EU-related information and education purposes; commercial/advertising use not clearly permitted — check Copyright section and ask (unverified). | Yes — '© European Union'. | No (unverified). | Free for permitted purposes |
| [Australian government and archives (NFSA, agency sites, data.gov.au)](https://www.nfsa.gov.au) | Archival clips, agency videos. | Highly variable: some items CC BY 4.0 (commercial ok with attribution, e.g. RBA items), NFSA curated clips CC BY-NC-SA 4.0 (no ads), City of Sydney CC BY-NC-ND 4.0, many agency sites exclude video from site-wide CC BY. Check each item. | Yes where CC BY. | Varies. | Free |
| [UK Open Government Licence v3.0 content](https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/) | UK government information incl. some video on gov.uk and agency channels. | OGL v3 permits commercial use and adaptation with attribution, but excludes personal data, departmental/Royal Arms logos, third-party rights, military insignia, and identity documents. Applicability to individual videos must be stated by the publisher (unverified per item). | Yes — 'Contains public sector information licensed under the Open Government Licence v3.0.' | No. | Free |
| [Open Government Licence – Canada and other national open licences](https://open.canada.ca/en/open-government-licence-canada) | Federal datasets and some media. | OGL-Canada 2.0 allows commercial reuse with attribution, excluding personal info, third-party rights, official symbols (unverified for video). Other countries: Germany dl-de/by-2.0, France Licence Ouverte 2.0 (Etalab), both commercial-OK with attribution, but mainly data rather than video (unverified). | Yes. | No. | Free |
| [EUscreen](https://euscreen.eu) | European TV archive clips (broadcasters). | Mostly view-only; rights remain with broadcasters — generally NOT reusable in ads. | N/A | Partial (via Europeana). | Free to view |
| [JAXA Digital Archives](https://jda.jaxa.jp/en/) | Japanese space agency images/video. | Free for non-commercial; commercial use requires application/permission (unverified). | Yes — '©JAXA'. | No. | Free non-commercial |
| [Google SynthID + C2PA Content Credentials](https://deepmind.google/technologies/synthid/) | Provenance watermark/metadata embedded by Veo, Firefly, OpenAI (historic), etc.; read by TikTok/Meta/YouTube for auto-labels. | N/A - technology. Removing watermarks to deceive violates Google/Adobe terms and platform rules. | N/A | SynthID Detector portal; c2pa-tools CLI (open source) to read/write manifests. | Free. |
| [LLM scene breakdown (Claude / any LLM with JSON output)](https://docs.anthropic.com/) | Turns an ad script into a structured shot list: per scene VO line, duration, visual keywords (3-5 concrete nouns+verbs), negative keywords, on-screen text, required asset type (stock/product/UGC/AI), orientation. | Your script, your output; check the model provider's commercial terms (Anthropic/OpenAI commercial terms let you own outputs). | No | Yes - Messages API with a JSON schema / tool-use output. | Paid per token |

## Methods and checklists

### Agent stock-matching pipeline (script to clips)
- Split the ad script into beats (hook, problem, product, proof, CTA), each 1.5 to 4s
- For each beat, generate 3 to 5 visual search queries (literal action, emotion, setting) without brand names
- Query the Pexels /videos/search (orientation=portrait, min/max_duration) and Pixabay /api/videos/ APIs in parallel, optionally adding Coverr
- Rank candidates by aspect ratio (prefer height>width), duration, resolution of at least 1080x1920, and semantic match (embed the thumbnail with CLIP or a vision LLM against the beat text)
- Run a compliance check on each candidate with a vision model: visible logos or brands, identifiable faces in sensitive contexts, medical or political framing. Reject or flag for human review
- Download the chosen files (no hotlinking), center-crop or reframe to 9:16 with ffmpeg, and trim to the beat length
- Write a license_log.csv row per clip: source, clip id, URL, creator, license name, attribution text, download date
- Interleave the user's own product shots for the product and CTA beats (stock never shows your product)
- Assemble with VO, captions and music, export, and have a human review before posting

_Example:_ Beat 'Tired of tangled cables?' gives the queries 'person frustrated untangling cables', 'messy desk cables close up'. Pexels portrait returns a 7s 1080x1920 clip, trimmed to 2.5s and logged as Pexels License, no attribution.

### License triage tiers for paid ads
- Tier A (use freely): Pexels, Pixabay, Coverr free, Mixkit Free License, ISO Republic CC0, Free Nature Stock CC0, Adobe Stock free (standard license)
- Tier B (OK with credit in caption or end card): Vecteezy free, Freepik free, Dareful CC BY 4.0, Mazwai CC BY, Videvo Attribution
- Tier C (avoid for paid ads unless licensed): Videezy Standard, Mixkit Restricted, any Editorial-only clip, unverified-license sites (Life of Vids, Vidsplay, Ignite Motion, Beachfront, Distill)
- Always: no visible third-party logos, no implying people in the footage endorse the product, no before/after or medical claims using stock people

_Example:_ A skincare ad uses a Pexels clip of a woman applying cream with the caption 'our formula changed her skin'. This implies endorsement by an identifiable person, so it is rejected. Use it only as a neutral mood shot, or use your own UGC instead.

### Vertical sourcing fallback
- Prefer native portrait clips (Pexels orientation=portrait, Mixkit vertical, Coverr vertical)
- Otherwise take 4K landscape and crop to 9:16 (2160 tall, 1215 wide center crop) or use AI reframing
- Avoid upscaling 720p clips

_Example:_ ffmpeg -i in.mp4 -vf "crop=ih*9/16:ih,scale=1080:1920" -t 3 out.mp4

### License tiers for ad use (CC0 vs CC BY vs CC BY-SA vs NC/ND)
- GREEN — CC0 / Public Domain (PDM, US federal work, expired copyright): commercial use, editing, ads allowed; no credit legally needed (keep records anyway). Still check people, logos, trademarks, endorsement, embedded music.
- GREEN+CREDIT — CC BY (2.0/3.0/4.0): ads OK and you may edit; must give TASL credit, link license, indicate changes. On TikTok/Reels put credit in caption or end card; 4.0 allows 'reasonable manner' credit.
- YELLOW — CC BY-SA: commercial OK but your adapted video must be licensed CC BY-SA too (competitors could reuse your ad). Some argue a mere compilation/collection doesn't trigger SA, but edited/synced footage usually is an adaptation; avoid unless acceptable.
- RED — NC (BY-NC, BY-NC-SA, BY-NC-ND): no ads/commercial use. RED — ND (BY-ND): no edits/cropping/9:16 reframing, so unusable for compilations.
- RED — Standard YouTube/TikTok/Instagram license, 'All rights reserved', or unknown: do not use without a written license.

_Example:_ A beach clip on Commons tagged CC BY 4.0 by 'J. Doe' → usable; caption: 'Beach clip: "Waves at dusk" by J. Doe, CC BY 4.0, via Wikimedia Commons, cropped'. A Vimeo clip tagged CC BY-NC → rejected for a product ad.

### Verify-and-record license ledger
- For every clip, save: source URL, platform item ID, title, author, license name + URL, date accessed, a screenshot/PDF of the license page, original file hash (sha256), and download URL.
- Verify the uploader is the plausible rights holder (institutional account, original footage, consistent portfolio). Reject re-uploads of TV/films.
- Scan for risk elements: identifiable faces (need model release for ads), logos/trademarks, artwork/buildings, agency insignia, music in audio track (mute it), third-party credit lines in descriptions.
- For government footage, add non-endorsement wording if relevant (DVIDS disclaimer) and avoid agency logos.
- Store the ledger as CSV/JSON alongside the project; generate the credit text automatically from it.
- Re-check the license page on the publish date (licenses are irrevocable for CC, but mistaken tags get corrected).

_Example:_ ledger row: {clip_id:'wmc_12345', url:'https://commons.wikimedia.org/wiki/File:Waves.webm', license:'CC BY-SA 4.0', decision:'reject (SA)', checked:'2026-10-08'}

### Agent pipeline to source public/CC footage for a script
- Parse the ad script into beats; for each beat produce 3-5 visual search keywords plus mood (e.g. 'morning kitchen', 'ocean waves slow motion').
- Query APIs in parallel: Wikimedia Commons (filetype:video + extmetadata), NASA images-api (media_type=video), Internet Archive advancedsearch (mediatype:movies + licenseurl filter), Europeana (TYPE:VIDEO, reusability=open), NARA v2 (moving images), LoC fo=json, DVIDS API, Flickr (media=videos, commercial licenses).
- Normalize results into a common schema {source,id,title,thumb,duration,resolution,license,license_url,author,attribution_text,download_url}.
- Hard-filter: keep only CC0/PD/CC BY (and BY-SA if allowed); drop NC/ND/unknown.
- Rank by visual match: embed thumbnails/keyframes with a CLIP-style model and compare to beat text; also prefer higher resolution and shorter, cleaner shots.
- Download top candidates, extract the best 2-4 s segment, reframe to 9:16 (crop/blur-pad), mute original audio.
- Human review gate: faces, logos, sensitivity, brand fit; then assemble with product shots, VO and licensed music; auto-generate credits from ledger.

_Example:_ Beat 'Tired of messy cables?' → queries 'tangled cables' on Commons/IA → 6 hits; 2 CC BY, 1 PD, 3 BY-SA rejected → choose PD Prelinger 1950s office clip for comedic retro hook.

### Public-domain due diligence beyond copyright
- Publicity/privacy: identifiable people in an ad imply endorsement — use crowds, hands, backs, or get releases.
- Trademarks: blur logos, car badges, product packaging.
- Government endorsement rules: NASA, DoD, NPS, NOAA all forbid implied endorsement and protect their logos.
- Embedded works: PD film may contain copyrighted music; strip audio.
- Jurisdiction: US PD (e.g. pre-1931 publication as of 2026, US gov works) may be copyrighted elsewhere; target-market check.
- Platform rules: TikTok/Meta ad review may reject historical/war/disaster footage; keep sensitive content out.

_Example:_ A 1940s PD newsreel showing a soda brand sign: crop the sign out and replace the soundtrack before using it in a beverage ad.

### Script-to-AI-B-roll pipeline (agent)
- Split the ad script into beats (hook 0-3 s, problem, product, proof, CTA) with target durations.
- For each beat decide source: real product footage you shot > licensed stock > AI generation. Use AI only for scenes stock cannot cover (abstract, impossible, lifestyle with no identifiable real people).
- Write one visual prompt per beat: subject + action + setting + camera + lighting + 'vertical 9:16' + no text/logos; for product shots use image-to-video from YOUR product photo so the product is accurate.
- Generate 2-4 variants per beat on a cheap model (Veo 3.1 Lite/Fast via Gemini API, Wan 2.2 self-host or fal, Kling Standard), 4-8 s each.
- Auto-score variants (vision model: matches beat? artifacts? product distortion? no unintended logos/faces) and keep best.
- Assemble with FFmpeg/Shotstack/Creatomate: trim, add voiceover (TTS), captions, licensed music, CTA end card.
- Compliance pass: license log per clip (model, plan, date, prompt), AI disclosure toggles on TikTok/YouTube/Meta, FTC script lint, keep C2PA.
- Human final review and publish.

_Example:_ Beat 'Tired of tangled cables?' -> Veo 3.1 Lite prompt: 'close-up of hands untangling a messy knot of charging cables on a wooden desk, frustrated sigh, soft morning light, handheld, vertical 9:16' -> 6 s clip, $0.30-0.48 at 720p-1080p.

### Choosing an AI video tool by license risk
- Need zero cost + automation + commercial: open-weights Wan 2.2 (Apache-2.0) or LTX (Apache/ <$10M rev) self-hosted.
- Need best quality cheaply via API: Veo 3.1 Lite/Fast (Gemini API, paid only), Kling API, Runway API Gen-4 Turbo.
- Need lowest IP risk for a brand: Adobe Firefly Video model (licensed training data, enterprise indemnity).
- Free consumer tiers (Flow, Kling, Luma, Pika, Hailuo, Runway, HeyGen, Synthesia, D-ID): prototyping only - watermark and/or non-commercial.
- Avoid: Sora (shut down), HunyuanVideo for EU/UK/KR audiences, Synthesia stock avatars in paid ads without written consent, CapCut built-in assets without commercial flag.

_Example:_ Bootstrapped DTC brand: prototype in Flow free -> produce final with Veo 3.1 Fast API (~$1 per 8 s 1080p clip) or Wan 2.2 on fal (~$0.50 per 5 s).

### AI avatar ad compliance checklist
- Use stock avatars licensed for paid ads (check HeyGen/Captions/Arcads/Creatify terms; Synthesia needs written consent) or your own consented digital twin.
- Script the avatar as a presenter/brand voice, not a fake customer; no fabricated personal results.
- On-screen disclosure 'AI-generated presenter' and platform AI labels on.
- No real people, celebrities, competitor brands, or medical/financial claims without substantiation.

_Example:_ Instead of avatar saying 'I lost 10 lbs with this', say 'Here's how [Brand] helps you plan meals in 5 minutes' with caption 'AI presenter'.

### Product footage acquisition ladder (cheapest-safe first)
- 1. Check brand/manufacturer press kit or partner portal; email for written ad permission.
- 2. Ask supplier (CJ/Alibaba/AliExpress) for original files + written permission; buy CJ private video if needed.
- 3. Order a sample and film own shot library from a script-derived shot list.
- 4. Seed product to creators (TikTok Shop samples, Shopify Collabs, Stack Influence) and collect Spark/Partnership codes.
- 5. Buy UGC with ownership/ad rights (Billo, JoinBrands, Trend, Insense, Fiverr) for faces/voice.
- 6. Fill gaps with stock/AI b-roll from other research topics.

_Example:_ Selling a portable blender: brand kit has 16:9 packshots -> reframe; film own blending close-ups; buy 3 Billo testimonial hooks; run best creator TikTok as Spark Ad for 60 days.

### Rights log for every clip (agent-maintained)
- Record: clip id, source, owner, license type, proof file/URL, allowed platforms, paid ads yes/no, edits allowed, expiry date, people in shot + release ids.
- Agent blocks rendering of any clip with missing proof or expired term.
- Attach log to ad account appeals if challenged.

_Example:_ clip_042 | Billo order #123 | assignment | paid ads yes | no expiry | release: creator via Billo ToS

### Script-to-shot-list for self-filming
- Split script into beats (hook, problem, product reveal, demo, proof, CTA).
- For each beat list 2-3 shot options with framing (close-up, hands, POV, lifestyle).
- Add 3-5 alternative hooks.
- Film vertically, 5-10s per take, name files beat_shot_take.mp4.
- Agent auto-tags and matches clips to beats when editing.

_Example:_ Beat 'Hook: tired of lukewarm coffee?' -> shot A: POV sip with grimace; shot B: close-up of mug steam missing; shot C: product reveal on desk.

### Supplier/brand permission request email
- Identify yourself and the product/SKU.
- List exact assets (filenames/links).
- State uses: organic + paid ads on TikTok, Meta, YouTube; edits: cropping, captions, voiceover, music.
- Ask them to confirm they own the rights and that no third-party people/brands appear without consent.
- Request duration (ideally perpetual) and territory (worldwide).
- Save the reply as PDF.

_Example:_ 'Hi, we stock your SKU X-200. May we use the 3 demo videos on your listing in paid TikTok/Meta/YouTube ads worldwide, edited with captions and voiceover? Please confirm you own them. Thank you.'

### Creator license checklist (UGC/whitelisting)
- Ownership: assignment vs license.
- Paid ads allowed? platforms?
- Duration (30/90/365 days/perpetual) and renewal price.
- Raw files included? edits/cut-downs allowed?
- Whitelisting/Spark/Partnership code durations.
- Model release included?
- Exclusivity / competitor restrictions.
- Disclosure (#ad, paid partnership) duties.

_Example:_ Fiverr gig $75 base = organic only; add paid usage 12 months + raw files before ordering.

### Audio license triage (green/yellow/red)
- GREEN (use in any ad, any platform): CC0/Public Domain, Pixabay Content License, Mixkit free licenses (online), Kenney CC0, Sonniss, paid-plan AI music (Suno Pro/Premier, ElevenLabs paid, Stable Audio paid), paid TTS (ElevenLabs Starter+, OpenAI, Google, Azure, Polly), Kokoro (Apache-2.0), Piper CC0/CC BY voices.
- YELLOW (OK with conditions): CC BY (Incompetech, Freesound CC BY, FMA CC BY, YouTube Audio Library CC BY) - attribution in caption; Zapsplat free (credit); TikTok CML (TikTok only); Meta Sound Collection (Meta only); YouTube Audio Library standard license (YouTube only).
- RED (never in ads): CC BY-NC / NC-ND (FMA, Freesound NC, Jamendo free), BBC RemArc, Uppbeat/Bensound free tiers for paid ads, Suno/ElevenLabs/Murf free plans, Coqui XTTS (CPML), in-app trending label music, anything ripped from YouTube/TikTok/Instagram.
- Log every asset: source URL, license name, date, plan, attribution string.

_Example:_ Script for a water bottle ad: Pixabay 'upbeat summer' track (GREEN) + Freesound CC0 'gulp' SFX (GREEN) + ElevenLabs Starter voice (GREEN) -> runs on TikTok, Reels and Shorts with one master; no credit needed.

### Agent pipeline: script -> voiceover -> music -> SFX -> mix
- Parse script into beats (hook 0-3s, problem, product reveal, proof, CTA) with target durations.
- Generate VO via API (ElevenLabs /v1/text-to-speech/{voice_id}/with-timestamps, Polly speech marks, Azure WordBoundary or Google SSML marks) -> MP3 + word timings for captions.
- Derive music brief from script tone (mood, BPM 100-128 for energetic ads, instrumental, length = VO length + 1-2s).
- Get music: API-capable (Openverse audio license_type=commercial, Jamendo API + paid license, ElevenLabs Music API, Stable Audio API, Mubert/Beatoven APIs) or human pick from Pixabay/Mixkit/YouTube Audio Library.
- Get SFX per beat from Freesound API (filter license:"Creative Commons 0") or local Sonniss/Kenney index.
- Mix with ffmpeg: duck music under VO (sidechaincompress) and loudness-normalize to ~-14 LUFS for social: ffmpeg -i vo.mp3 -i music.mp3 -filter_complex "[1][0]sidechaincompress=threshold=0.05:ratio=8[m];[0][m]amix=inputs=2:normalize=0,loudnorm=I=-14:TP=-1" mix.m4a
- Write license log + attribution text into caption draft; flag AI-voice disclosure.

_Example:_ Agent turns a 60-word script into a 22s VO with timestamps, requests a 24s 'bright acoustic' ElevenLabs Music track, adds two CC0 whooshes at cut points, outputs mix.m4a + credits.txt.

### Platform-specific music versions
- Create a 'universal' master with GREEN music for cross-posting.
- For TikTok paid ads, optionally swap to a TikTok Commercial Music Library track in Ads Manager (in-platform).
- For Meta, optionally use Meta Sound Collection via Ads Manager 'Add music'.
- Never export platform-library music to another platform.

_Example:_ Same video: TikTok version uses a CML trending-style commercial track; Reels version uses Meta Sound Collection; Shorts version uses the Pixabay master.

### Attribution template
- Music: "<Title>" by <Artist> (<source URL>) - licensed under CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/).
- SFX: "<Sound name>" by <user> (freesound.org) - CC BY 4.0.
- Place in caption/description or end card; keep in asset log.

_Example:_ Music: "Carefree" Kevin MacLeod (incompetech.com), Licensed under Creative Commons: By Attribution 4.0 License.

### Content ID / claim handling
- Prefer tracks not registered with Content ID (Pixabay pages note this) or AI-generated on paid plans.
- Keep license proof (URL, screenshot, certificate, invoice).
- If claimed on YouTube, dispute with proof; on Meta/TikTok use their appeal flows.
- Avoid FMA/Jamendo/CC tracks known to be re-registered by third parties.

_Example:_ A Pixabay track triggers a claim on Shorts; you dispute attaching the Pixabay download page and license summary; claim released.

## Sources

- https://about.fb.com/news/2025/02/gen-ai-transparency-metas-ads-products/
- https://about.fb.com/news/2026/02/meta-prepares-for-2026-us-midterms/
- https://ads.tiktok.com/business/zh/blog/audio-library-royalty-free-music
- https://ads.tiktok.com/help/article/how-to-use-content-suite-to-create-and-launch-spark-ads
- https://ads.tiktok.com/help/article/tiktok-ads-policy-intellectual-property-infringement?lang=en
- https://ads.tiktok.com/help/article/types-of-tiktok-one-solutions?lang=en
- https://ainfluencer.com/billo/
- https://aireiter.com/blog/kling-ai-free-tier-2026
- https://api.coverr.co/docs/start
- https://api.dvidshub.net/docs/copyright
- https://archive.org/details/prelinger
- https://argil.ai/blog/d-id-pricing-5be73
- https://artificialintelligenceact.eu/article/50/
- https://artlist.io/help-center/privacy-terms/artlist-license
- https://audiovisual.ec.europa.eu/en/about
- https://autoae.online/blog/is-capcut-free-for-commercial-use
- https://aws.amazon.com/polly/pricing/
- https://benchlm.ai/media-pricing/sora
- https://benchlm.ai/media-pricing/veo
- https://billo.app/lp-mof-ugc-videos-2026/
- https://blog.cjdropshipping.cn/detail/how-to-use-video-shooting-service-from-cj-dropshipping
- https://blog.dubspot.com/ai-music-licensing-explained-2026
- https://blog.youtube/news-and-events/disclosing-ai-generated-content
- https://blog.youtube/news-and-events/improving-ai-labels-for-viewers-and-creators/
- https://c.enwp.org/wiki/Commons:Video
- https://c.enwp.org/wiki/Commons:YT
- https://canva.com/policies/content-license-agreement
- https://capcut.com/resource/about-capcut-terms-of-service
- https://cloud.google.com/text-to-speech/pricing
- https://cloud.google.com/video-intelligence/pricing
- https://code.shutterstock.com/api/pricing
- https://collabs.shopify.com/terms
- https://collabstr.com/influencer-price-calculator/user-generated-content
- https://community.openai.com/t/where-is-the-usage-policy-for-ai-voiceovers/679737
- https://community.shopify.com/t/can-i-upload-a-product-video-from-an-aliexpress-supplier/105427
- https://conductatlas.com/platform/amazon-associates/amazon-associates-program-policies/provision/CA-P-064503/prohibition-on-reselling-or-redistributing-program-content/
- https://conductatlas.com/platform/synthesia/synthesia-acceptable-use-policy/
- https://costbench.com/software/ai-media-apis/kling-api/
- https://costbench.com/software/ai-video-editing-saas/submagic/
- https://costbench.com/software/ai-video-generators/google-veo/free-plan
- https://costbench.com/software/ai-video-generators/pika/free-plan/
- https://costbench.com/software/ai-voice-tools/elevenlabs/free-plan
- https://costbench.com/software/ai-voice-tools/murf-ai/free-plan/
- https://coverr.co/blog/free-4k-stock-footage-sites-compared-2026
- https://coverr.co/developers
- https://coverr.co/stock-video-footage/vertical
- https://creatify.ai/blog/arcads-pricing-(2026)-plans-credits-and-what-you-ll-actually-pay
- https://creatify.ai/blog/runway-pricing-(2026)-plans-credits-and-what-you-ll-actually-pay
- https://creatify.ai/pricing
- https://creativecommons.org/about/cclicenses/
- https://deepmind.google/discover/blog/watermarking-ai-generated-text-and-video-with-synthid
- https://deepwiki.com/Tencent/HunyuanVideo/5-license-and-legal
- https://dev.to/mr_manushukla/sora-2-and-the-videos-api-shut-down-on-24-september-2026-the-migration-and-the-real-cost-per-second-bek
- https://developer.jamendo.com/v3.0
- https://developers.openai.com/api/docs/models/gpt-4o-mini-tts
- https://discuss.ai.google.dev/t/inquiry-about-commercial-use-of-videos-generated-via-google-labs-flow-free-tier-for-a-contest/169174
- https://dodropshipping.com/aliexpress-product-videos-for-dropshipping/
- https://dreamina.capcut.com/ai-video/free-ai-video-generator-usable-clips-guide-2026
- https://elevenlabs.io/music-api
- https://en.wikipedia.org/wiki/Prelinger_Archives
- https://europeana.atlassian.net/wiki/spaces/EF/pages/2060091476/Technical+criteria+for+video+files+Tier+2-4
- https://fal.ai/learn/tools/ai-video-generators
- https://fastly-f.uppbeat.io/help-center
- https://ffmpeg.org/legal.html
- https://filmdaft.com/what-is-a-model-release-form-definition-uses-free-template/
- https://fiverr.com/pughsreview/create-ugc-content-for-you
- https://flickr.com/services/api/flickr.photos.search.html
- https://freemusicarchive.org/License_Guide
- https://freemusicarchive.org/faq/
- https://freenaturestock.com/license/
- https://freesound.org/docs/api/overview.html
- https://frostbrowntodd.com/ftcs-new-rule-on-consumer-reviews-ensuring-compliance-with-human-and-ai-generated-content
- https://gamefromscratch.com/sonniss-27-5gb-sound-effect-giveaway-at-gdc-2024/
- https://gigazine.net/gsc_news/en/20251219-google-ai-video-gemini-synth-id
- https://github.com/Zulko/moviepy
- https://github.com/mlfoundations/open_clip
- https://github.com/openai/whisper
- https://github.com/rhasspy/piper/discussions/271
- https://gptprompts.ai/ai-pricing/luma-ai-pricing
- https://growthcenter.shopify.com/pages/resource-library
- https://helloplayground.com/pages/faire-wholesale-policy
- https://help.awin.com/docs/using-my-creative-tool
- https://help.captions.ai/docs/project/ad-studio
- https://help.instagram.com/402084904469945
- https://help.motionelements.com/en/contributor/docs/what-is-a-model-or-property-release
- https://help.pexels.com/hc/en-us/articles/360042332714-What-are-the-rules-for-using-Pexels-photos-or-videos
- https://help.pexels.com/hc/en-us/articles/360043229813-Can-I-use-photos-and-videos-from-Pexels-in-a-political-campaign
- https://help.storyblocks.com/en/articles/4260321-can-i-re-download-content-that-i-downloaded-in-the-past-even-though-my-subscription-is-now-cancelled
- https://helpx.adobe.com/stock/faq.html
- https://home.nps.gov/grca/learn/photosmultimedia/b-roll_hd_index.htm
- https://howaiworks.ai/blog/alibaba-wan-open-weights-stopped-at-2-2
- https://huggingface.co/google/siglip-so400m-patch14-384
- https://huggingface.co/hexgrad/Kokoro-82M
- https://hunton.com/hunton-retail-law-resource/ftc-issues-final-rule-targeting-fake-consumer-reviews-and-testimonials-including-those-generated-by-artificial-intelligence-ai-and-online-bots
- https://images-api.nasa.gov/search
- https://influee.co/blog/trendio-alternatives
- https://influee.co/pricing
- https://isorepublic.com/license/
- https://jentic.com/apis/openverse
- https://json2video.com/docs/v2/pricing/faq
- https://learn.microsoft.com/en-nz/answers/questions/1337460/azure-cognitive-speech-tts-is-the-free-tier-includ
- https://licenseorg.com/guide/music-audio/bensound
- https://licenseorg.com/guide/music-audio/incompetech
- https://licenseorg.com/guide/music-audio/uppbeat
- https://licenseorg.com/guide/music-audio/youtube-audio-library
- https://licenseorg.com/guide/music-audio/zapsplat
- https://licenseorg.com/guide/video/mazwai
- https://licenseorg.com/guide/video/motion-array
- https://ltx.io/model/license
- https://magichour.ai/blog/hailuo-23-pricing
- https://magichour.ai/blog/pika-labs-pricing
- https://magichour.ai/blog/runway-ml-pricing
- https://mixkit.co/free-vertical-videos/
- https://mixkit.co/llm-info/
- https://musicbusinessworldwide.com/meta-offers-royalty-free-music-library-to-instagram-reels-advertisers
- https://ofox.ai/blog/fal-vs-replicate-vs-ofox-video-api-pricing-2026/
- https://openclip.app/guides/tiktok-slideshow-unoriginal-content-flag
- https://openverse.org
- https://orshot.com/blog/creatomate-api-alternative
- https://osai-index.eu/model/wan
- https://pexels.com/terms-of-service
- https://photolib.noaa.gov/About
- https://photutorial.com/envato-elements-free-trial
- https://photutorial.com/epidemic-sound-pricing
- https://photutorial.com/shutterstock-ends-free-trial
- https://pixabay.com/api/docs/
- https://pixabay.com/service/faq/
- https://pixabay.com/service/license-summary/
- https://pixabay.com/service/terms/
- https://policies.google.com/terms/generative-ai/use-policy
- https://ppc.land/youtube-clarifies-inauthentic-content-policy-changes/
- https://presspage.com/blog/what-is-a-press-kit-and-what-should-be-in-yours-examples
- https://rangy.ai/blog/what-happened-to-sora
- https://remotion.dev/pricing
- https://rendley.com/blog/plainly-alternative
- https://replicate.com/pricing
- https://sacra.com/c/mirage
- https://shotstack.io/pricing/
- https://smallest.ai/blog/elevenlabs-pricing-plans-cost-what-you-get-in-2026
- https://soona.co/pricing
- https://stability.ai/explainers/stable-audio-vs-competitors-licensing-export-rights-and-self-hosting-compared
- https://stability.ai/news/license-update
- https://stackinfluence.com/stack-influence-vs-izea
- https://support.google.com/youtube/answer/1311392
- https://techjacksolutions.com/ai-brief/openai-videos-api-sora-2-deprecated-september-2026/
- https://texttolab.com/blog/play-ht-shutdown-alternatives
- https://the-decoder.com/googles-veo-3-1-lite-cuts-video-generation-costs-by-more-than-half/
- https://transparency.meta.com/policies/ad-standards/intellectual-property-infringement/copyright-and-trademarks
- https://tubefilter.com/2024/05/09/tiktok-transparency-labels-for-generative-ai-content/
- https://twelvelabs.io/pricing
- https://unreserved.rba.gov.au/nodes/view/84947
- https://vimeo.com/creativecommons
- https://wiki.creativecommons.org/Case_Studies/Kevin_MacLeod
- https://www.adobe.com/cc-shared/fragments/products/firefly/plans/faq
- https://www.aitoolcurator.com/learn/kling-guide/free-plan-limits/
- https://www.arcade.software/post/heygen-pricing
- https://www.arcade.software/post/synthesia-pricing
- https://www.archives.gov/research/catalog/help/api
- https://www.backstage.com/magazine/article/how-backstage-can-help-you-save-money-on-your-next-production-70053/
- https://www.bebolddigital.com/blog/amazons-creator-connections-for-sellers
- https://www.britishpathe.com/faq
- https://www.britishpathe.com/licensing/
- https://www.canva.com/policies/content-license-agreement-2024-06-20
- https://www.canva.com/policies/free-media
- https://www.canva.com/policies/magic-studio-terms-2023-03-14/
- https://www.capcut.com/resource/capcut-product-image-to-video-ads-guide
- https://www.capcut.com/tools/text-to-speech
- https://www.capcut.com/trust/legal
- https://www.capterra.com.au/software/1036245/creatomate
- https://www.capterra.com/p/10026817/Plainly/
- https://www.cined.com/bbc-gives-away-16000-sound-effects-for-free/
- https://www.cinerads.com/blog/ai-ad-disclosure-requirements
- https://www.cinerads.com/blog/tiktok-ai-content-policy
- https://www.desktop-documentaries.com/beachfront-broll-free-film-clips.html
- https://www.digitalmusicnews.com/2026/04/09/suno-universal-music-lawsuit-settlement-impasse/
- https://www.dvidshub.net/about/copyright
- https://www.dwt.com/insights/2023/07/ftc-advertising-endorsement-and-testimonial-guides
- https://www.ecomcrew.com/joinbrands-review/
- https://www.esa.int/ESA_Multimedia/Copyright_Notice_Images
- https://www.esa.int/ESA_Multimedia/Terms_and_Conditions
- https://www.flickrhelp.com/hc/en-us/articles/40048459562388-Copyright-Licenses-on-Flickr
- https://www.flowjam.com/blog/luma-dream-machine-review-2026
- https://www.foximusic.com/royalty-free-music-licensing-for-capcut-videos/
- https://www.freepik.com/ai/docs/personal-use
- https://www.heygen.com/moderation-policy
- https://www.hoganlovells.com/en/publications/ftc-publishes-final-rule-banning-fake-consumer-reviews-and-testimonials
- https://www.hooked.so/compare/captions-ai-pricing
- https://www.influencer-hero.com/blogs/incense-pricing-and-review
- https://www.krea.ai/blog/is-adobe-firefly-free-what-it-is-and-how-it-compares-in-2026
- https://www.loc.gov/free-to-use/
- https://www.mediapost.com/publications/article/414773/instagram-algorithm-update-deprioritizes-unorigina.html
- https://www.mediawiki.org/wiki/Extension:CommonsMetadata/en
- https://www.mindstudio.ai/blog/google-flow-pricing-credits-tiers-explained
- https://www.musicbusinessworldwide.com/universal-music-settles-udio-lawsuit-strikes-deal-for-licensed-ai-music-platform
- https://www.musicinafrica.net/magazine/suno-adjusts-ai-music-ownership-terms-after-warner-music-partnership
- https://www.nasa.gov/nasa-brand-center/images-and-media/
- https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/
- https://www.nbcnews.com/tech/tech-news/tiktok-will-automatically-label-ai-generated-content-rcna151446
- https://www.nemovideo.com/blog/ai-video-models/seedance-2-5-free-access-price
- https://www.nerdwallet.com/kit
- https://www.nfsa.gov.au/collection/curated/manjimup-and-pembertion-clip-1
- https://www.nosh.com/news/2024/influence-peddling-inside-the-platform-connecting-cpg-brands-with-micro-influencers
- https://www.nps.gov/deva/learn/photosmultimedia/b-roll-footage.htm
- https://www.pexels.com/api/documentation/
- https://www.pexels.com/license/
- https://www.printful.com/blog/how-to-get-free-samples-on-tiktok
- https://www.promptquorum.com/power-local-llm/local-tts-voice-cloning-piper-coqui-xtts
- https://www.provideocoalition.com/pond5-launches-the-public-domain-project-with-80000-free-media-clips/
- https://www.remotion.dev/docs/license/faq
- https://www.reshiftmedia.com/how-to-set-up-partnership-ads-on-meta/
- https://www.scenedetect.com/
- https://www.searchenginejournal.com/youtube-monetization-update-spam-not-reaction-channels/550755/
- https://www.si.edu/openaccess/devtools
- https://www.socialmediatoday.com/news/meta-adds-more-measures-to-ensure-original-creators-get-credit/814764/
- https://www.socialmediatoday.com/news/tiktok-changes-rules-on-music-usage-by-businesses/577734/
- https://www.soundstripe.com/blogs/tiktok-music-library-explained
- https://www.soundstripe.com/blogs/tiktok-music-licensing-rules
- https://www.stackmatix.com/blog/tiktok-video-ad-production-tips
- https://www.synthesia.io/legal/acceptable-use-policy
- https://www.techradar.com/computing/artificial-intelligence/youtube-shorts-is-getting-a-huge-free-veo-3-upgrade-that-might-just-make-me-leave-tiktok-and-capcuts-behind
- https://www.techradar.com/news/the-best-free-stock-video-sites
- https://www.techradar.com/pro/popular-video-editing-app-capcut-wants-to-use-any-content-you-produce-for-free-forever-heres-what-you-should-know
- https://www.twelvelabs.io/ko/pricing
- https://www.vecteezy.com/blog/contributor/free-vs-pro
- https://www.vecteezy.com/developers
- https://www.videezy.com/premium/join
- https://www.videvo.net/blog/?p=314
- https://www.wireflow.ai/blog/shotstack-pricing
- https://www.wrapbook.com/best-stock-video-sites/
- https://www.xpay.sh/saas-pricing/json2video/
- https://zsky.ai/blog/is-heygen-free.html
- https://zsky.ai/blog/is-minimax-3-free
