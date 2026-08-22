# Bharat Scheme Saathi

Project Overview

Build Bharat Saathi AI, a mobile-first Progressive Web App (PWA) that helps elderly Indian citizens — especially those living alone — discover government welfare schemes they qualify for, and stay connected through a wellbeing check-in feature. The app is voice-first, extremely simple, and designed for users who may have low literacy, limited smartphone experience, or difficulty with small text and complex navigation.

This app is the frontend layer of a system where an n8n workflow acts as the AI backend. The app's job is to collect user input, send it to a webhook, and display the structured results returned — it does NOT do the AI reasoning itself.

Core Design Principles (apply to every screen)

One task per screen. No multi-field forms. Ask one thing at a time, like a conversation.

Large everything. Minimum 18-20px body text, 24px+ for headings, minimum 48px tap targets.

High contrast. Dark text on light, uncluttered backgrounds. Avoid low-contrast pastels or busy gradients.

Voice-first, never voice-only. Every voice interaction must have an equally visible text/tap alternative directly on screen — never hidden behind a toggle or menu.

No jargon, no bare icons. Every icon must be paired with a text label.

Forgiving, calm error handling. No technical error messages, no "session expired." Simple, warm retry prompts only.

Mobile-first, responsive. Assume most users are on a phone browser, not desktop.

Screens & User Flow

1. Welcome / Language Select

App name "Bharat Saathi AI" with a warm, simple icon/illustration (not a stock corporate logo)

4–6 large language buttons (Hindi, Marathi, English, Tamil, etc. — use whichever languages the team specifies)

Tapping a language sets the app's language context for all following screens (text labels AND voice recognition language code)

2. Talk to Saathi (Scheme Agent — main screen)

Large centered microphone button as the primary call-to-action, with the label "Tap and speak" beneath it in the selected language

Directly below, an equally visible text input box with placeholder text like "Or type your situation here"

A short, warm prompt above both: "Tell me about yourself — your age, family situation, and anything else — and I'll find schemes you may qualify for."

Optional expandable fields (not required, but available): name, age, gender, widow status, disability %, BPL status, annual income, phone, family contact name, family contact phone. These can be filled via natural conversation extraction OR manually — design this as a lightweight conversational form, not a rigid table.

A single large "Find My Schemes" button to submit

3. Matched Schemes (Results screen)

Loading state while waiting for the backend response: friendly message like "Saathi is checking your eligibility..." with a simple animation — response time can be 15-30+ seconds, so this must clearly read as "working," not "stuck"

Results shown as large, stacked cards, one per matched scheme:

Scheme name (bold, large)

One-line plain-language reason why they qualify

Expandable "Documents needed" section listing required documents in plain language

If zero matches, show a warm, non-discouraging message and suggest they check back after adding more details

A persistent "Ask Saathi something else" button to return to screen 2

4. Saathi Check-In (Wellbeing screen)

Simple, warm greeting message (can be personalized with the citizen's name once known)

Two large buttons: "I'm doing well 🙂" and "I need help 🙁"

If "I need help" is tapped, OR if this screen is reached via a follow-up flag from the backend:

Prominently display India's National Elder Line helpline: 14567, with a tap-to-call link

If a family contact is on file, show a large "Notify [family contact name]" button that opens the device's native SMS or WhatsApp share sheet, pre-filled with a caring message asking them to check in

If no family contact is on file, skip that button gracefully — do not show an empty or broken state

Backend Integration (critical — follow exactly)

This app does NOT run its own AI logic. All reasoning happens in an external n8n workflow. The app only sends and receives data via a single webhook endpoint.

Endpoint: POST https://[YOUR_N8N_WEBHOOK_URL] (use an environment variable / config field for this — the team will paste in the real URL)

Request body shape (send exactly these fields; all except name/situation_text may be omitted if unknown):

{
  "name": "string",
  "age": "number",
  "gender": "string",
  "is_widow": "boolean",
  "disability_percent": "number",
  "is_bpl": "boolean",
  "annual_income": "number",
  "phone": "string",
  "family_contact_name": "string (optional)",
  "family_contact_phone": "string (optional)",
  "situation_text": "string — free-text description of their situation"
}


Expected response shape:

[
  {
    "scheme_id": "string",
    "scheme_name": "string",
    "reason": "string — plain language eligibility reason",
    "required_documents": ["string", "string", "..."]
  }
]


Parse this array directly into the Results screen cards. Handle empty arrays and network/timeout errors gracefully with the calm error handling described above — never show a raw error or stack trace to the user.

Voice Feature Implementation

Use the browser-native Web Speech API for speech-to-text (SpeechRecognition / webkitSpeechRecognition) — no paid APIs.

Set the recognition language dynamically based on the language selected on screen 1 (e.g. hi-IN for Hindi, mr-IN for Marathi).

Use the browser-native SpeechSynthesis API for reading results aloud, optional but valuable for a "read my results to me" button.

Since Web Speech API reliability varies by browser (best in Chrome/Edge) and by language, always keep the text input equally accessible — never make voice the only path.

Show clear visual feedback while listening (e.g. a pulsing mic icon) and while processing.

Technical & Scalability Notes

Build as a responsive PWA — installable, works well on both mobile browsers and desktop for demo purposes.

No user authentication needed for this MVP — a phone number is a sufficient identifier.

Do not build any backend logic, database calls, or AI calls directly in the app — all of that is handled by the n8n webhook. The app is purely a presentation and input-collection layer.

Keep state in-memory / React state — no need for persistent local storage for this MVP.

Design the codebase so a "Documents Checklist" export/download feature and additional screens (e.g. a follow-up history view) could be added later without major restructuring.

Explicitly Out of Scope (do not build)

No user accounts, login, or authentication system

No admin dashboard

No real-time outbound calling or SMS sending — the "Notify family" feature uses only the device's native share/SMS intent, never a backend telephony service

No hardcoded assumptions about which schemes exist — all scheme data comes dynamically from the webhook response

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/8beeb6e8-5ab5-4a17-a9ea-49b9a225f783).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
