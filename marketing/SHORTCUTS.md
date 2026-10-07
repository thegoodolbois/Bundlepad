# Posting with Siri / Apple Shortcuts

**How it works.** The Shortcuts action **Get Contents of URL** can send
GET/POST/PUT/PATCH/DELETE requests with JSON bodies and custom headers
([Apple](https://support.apple.com/guide/shortcuts/request-your-first-api-apd58d46713f/ios)).
That's enough to post to any platform whose API takes a single key or token.
- **Say it:** name the shortcut, e.g. "Post update", then say "Hey Siri, post
  update"
  ([Apple](https://support.apple.com/guide/shortcuts/run-shortcuts-with-siri-apd07c25bb38/ios)).
- **Schedule it:** Shortcuts app → Automation → Time of Day → **Run
  Immediately**. This has been possible for every trigger since iOS 17. It
  still shows a notification when it runs, and it won't run if the phone is
  off.
- **Draft with AI:** iOS 26's **Use Model** action can write the post text
  inside the shortcut. Read it before it goes out.

**Limits.**
- Shortcuts can't do OAuth logins or token refreshes, so X, LinkedIn, Reddit,
  YouTube and TikTok can't be posted to directly. For those, call a scheduler
  with a long-lived key (Buffer, Typefully, Ayrshare, Upload-Post, Postiz), or
  your own n8n/Zapier webhook.
- Keys saved inside a shortcut are plain text. Don't share the shortcut, and
  use a separate key you can revoke.

---

## Recipes

Each recipe is one or two **Get Contents of URL** actions. Set Method, add
Headers, and set Request Body to **JSON**. Values in `<angle brackets>` are
yours to fill in. Start with an **Ask for Input** (Text) action, and use its
result as the post text.

### Telegram channel (easiest)
1. Create a bot with @BotFather and copy its token. Add the bot as an **admin**
   of your channel, with permission to post.
2. Get Contents of URL:
   - URL: `https://api.telegram.org/bot<TOKEN>/sendMessage`
   - Method: POST. Body (JSON): `chat_id` = `@yourchannel`, `text` = *Provided
     Input*, `parse_mode` = `HTML`
3. To post a photo, call `sendPhoto` with `photo` set to an image URL and
   `caption` set to the text.

### Discord channel
1. Channel → Edit → Integrations → Webhooks → New Webhook → Copy URL.
2. Get Contents of URL:
   - URL: `<webhook URL>?wait=true`
   - Method: POST. Body (JSON): `content` = *Provided Input*, `username` =
     `Bundlepad`
3. Optional: add an `embeds` array of objects, each with `title`, `url` and
   `description`.

### Bluesky
1. Bluesky → Settings → Privacy and security → App passwords → create one.
2. **Get Contents of URL #1** (log in):
   - URL: `https://bsky.social/xrpc/com.atproto.server.createSession`
   - POST, JSON: `identifier` = `<you>.bsky.social`, `password` = `<app password>`
   - Then **Get Dictionary Value** `accessJwt` and `did` from the result.
3. **Get Contents of URL #2** (post):
   - URL: `https://bsky.social/xrpc/com.atproto.repo.createRecord`
   - POST, header `Authorization` = `Bearer <accessJwt>`
   - JSON: `repo` = *did*, `collection` = `app.bsky.feed.post`, and `record`
     (a Dictionary) = { `$type`: `app.bsky.feed.post`, `text`: *Provided
     Input*, `createdAt`: *Current Date* formatted ISO 8601 }
4. Links aren't clickable unless you add `facets`. Put the link last, or use
   Buffer for link cards.

Notes:
- `createSession` is rate-limited (30 per 5 minutes, 300 a day), so don't loop it.
- Bluesky prefers OAuth for new apps, but app passwords still work.

### Mastodon (can schedule itself)
1. Your server → Preferences → Development → New application, with scope
   `write:statuses`. Copy the access token.
2. Get Contents of URL:
   - URL: `https://<your.server>/api/v1/statuses`
   - POST, header `Authorization` = `Bearer <token>`
   - JSON: `status` = *Provided Input*, `visibility` = `public`
   - Optional: `scheduled_at` = an ISO 8601 date at least 5 minutes ahead.
     Mastodon then posts it on time, even if your phone is off.

### Threads (one tap)
- **Open URLs:** `https://www.threads.com/intent/post?text=<URL-encoded text>&url=<link>`
- Threads opens with the post filled in, and you tap Post. Use **URL Encode**
  on the text first.

### WhatsApp (prefill a message)
- **Open URLs:** `https://wa.me/?text=<URL-encoded text>`. You choose the chat
  and tap send.
- WhatsApp Channels have no API, and the Business Policy bans currency and ICO
  promotion. Use this only for personal sharing.

### Farcaster (via Neynar)
- Get Contents of URL: `https://api.neynar.com/v2/farcaster/cast`, POST
  - Headers: `x-api-key` = `<key>`, `Content-Type` = `application/json`
  - JSON: `signer_uuid` = `<approved signer>`, `text` = *Provided Input*,
    `embeds` = [{ `url`: `<link>` }]
- The exact field names weren't verified. Check docs.neynar.com before
  relying on this.

### Binance Square
- Get Contents of URL:
  `https://www.binance.com/bapi/composite/v1/public/pgc/openApi/content/add`,
  POST, header `X-Square-OpenAPI-Key` = `<key from Creator Center>`
- Body fields weren't verified. See Binance's official `square-post` skill in
  `github.com/binance/binance-skills-hub`.

### Everything else: through a scheduler or webhook
- **Buffer** (GraphQL API, available on every plan since May 2026), **Typefully**,
  **Ayrshare**, **Upload-Post** and **Postiz** all take a single API key, so
  one Get Contents of URL call queues a post to X, LinkedIn, Instagram,
  TikTok, YouTube and others. Look up each one's endpoint in its API docs.
- Your own **n8n** (self-hosted, free) or **Zapier** webhook: the Shortcut
  POSTs `{ "text": ... }` to the webhook URL, and the workflow handles OAuth
  and posts everywhere. This is the most flexible "Hey Siri, announce the
  launch" setup.

### Example: "Hey Siri, announce launch"
1. **Ask for Input** (Text): "What should the post say?"
2. **Text:** compose *Provided Input* + ` ` + `https://<you>.github.io/<repo>/`
3. **Get Contents of URL:** Telegram `sendMessage` (recipe above)
4. **Get Contents of URL:** Discord webhook (recipe above)
5. **Get Contents of URL:** Mastodon `/api/v1/statuses`
6. **Get Contents of URL:** your n8n webhook, which handles X, LinkedIn and others
7. **Show Notification:** "Posted"

Name it "Announce launch". Siri runs all steps in order.

## Android equivalent
- **Tasker:** HTTP Request actions (POST, JSON, headers) plus time-based
  profiles do the same as the recipes above.
- **Voice:** go through AutoVoice or Google Assistant. Whether Assistant
  routines still work under Gemini in 2026 is unconfirmed.
