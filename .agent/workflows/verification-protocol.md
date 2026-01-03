---
description: Agent Verification Protocol for Quality Assurance
---

# Agent Verification Protocol

Before marking any task as **Done** or asking the User to "check it out", I (the Agent) MUST perform the following checks.

## 1. The "Does it Exist?" Check (Navigation & Config)
*   [ ] **New Pages**: If I created a link to `/foo`, does the file `app/foo/page.tsx` actually exist?
*   [ ] **Config Updates**: If I used a new image host, API, or env var, did I update `next.config.js` or `.env`?
*   [ ] **No Dead Ends**: Do the buttons I just added actually have `onClick` or `href` attributes?

## 2. The "Happy Path" Resilience Check (Data & Logic)
*   [ ] **Loading States**: Did I add a loading spinner or disable the button while waiting for the server?
*   [ ] **Error Handling**: What happens if the API returns 500?
    *   *Bad*: App crashes or shows nothing.
    *   *Good*: Shows a toast/alert: "Something went wrong, please try again."
*   [ ] **Empty States**: What does the component look like if the list is empty? (Don't leave a blank white space).

## 3. The "Don't Break the UI" Check (CSS & Layout)
*   [ ] **Overflow**: If the text is 500 characters long, will it break out of the box? (Use `break-words`, `overflow-hidden`, or `flex-wrap`).
*   [ ] **Mobile Width**: Did I hardcode `width: 600px`? (Use `max-width: 100%`).
*   [ ] **Container Check**: If I added a new specialized component, is it inside a container that provides necessary padding/margins?

## 4. The "Self-Correction" Loop
*   **STOP**: Do not guess.
*   **LOOK**: Use `read_url_content` (for local pages) or `browser` (if available) to verify the final HTML structure.
*   **LISTEN**: Check the terminal output. Are there new errors since I started?

---
*Reference this protocol in the `Verification Plan` section of future Implementation Plans.*
