---
name: user-intake
description: Collect everything needed to automate one user's content before building anything - profile and goals, products and provable facts, platforms with sign-in and keys, schedule, approvals, scripts, video, research and metrics - then write profile.json, product.json files and a .env. Use when onboarding a new user for content automation, when a user hands you a generated setup prompt or profile.json, or when required details or keys are missing.
---

# User intake

- **Prompt:** `marketing/INTAKE.md` has 10 steps, the secret-handling rules,
  and the `profile.json` shape.
- **Form for the user:** `marketing/setup.html`, online at
  https://thegoodolbois.github.io/Bundlepad/marketing/setup.html. It asks the
  same questions and gives the user:
  - a personalized agent prompt
  - `profile.json`
  - `product-*.json`
  - `.env` with their keys

## If the user gives you a generated prompt or profile.json
1. Treat its **STILL MISSING** list (`unknowns` in `profile.json`) as your
   first questions.
2. Keys show up by name only, with their status. Never ask the user to paste
   a key into the chat. Ask for the `.env` file, or for the key to go into
   your secret store.
3. For each platform key marked `MISSING`, walk the user through that
   platform's `human_steps` in `marketing/data/setup.json`, one step at a time.
4. Run each platform's `test_call` and one private or test post. Then
   continue with the `content-autopilot` skill.

## If you start from nothing
Either send the user the setup page link, or run the steps in `INTAKE.md`
yourself:
- Ask 2–4 questions at a time, offering defaults.
- After each step, repeat back what you recorded.
- Write `unknown` for anything they can't answer, and list those at the end.

## Rules
- **Credentials:** never ask for account passwords or seed phrases; PeerTube
  and Lemmy are the only exceptions, with a warning. Use the exact secret
  names from `setup.json`.
- **Claims:** a product claim needs a fact the user can prove.
- **Approval:** ads and anything with a claim always need the user's
  approval, whatever approval level they chose.
