# GEMINI.md - Project Context, Architectural Standards & UX Laws

## 1. Project Overview & Identity
- **Product Name:** SentinelPayload (Client-Side API Mutation & Automated Test Generator)
- **Primary Function:** Ingests JSON schemas and sample API payloads, applies automated mutation vectors (boundary value analysis, missing keys, type inversion, and unicode fuzzing), and compiles runnable Postman Collections (v2.1) and Playwright API test suites (`.spec.ts`).
- **Core Constraint:** 100% client-side execution. Zero external databases, zero cloud dependencies, zero telemetry tracking. All AST parsing, schema mutations, and file synthesis run in the user's browser runtime.

---

## 2. Enforcement of UX Laws (Interface & Interaction Directives)

When designing, drafting, or refactoring UI components and interaction workflows, Gemini MUST strictly adhere to the following UX laws:

### A. Jakob’s Law (Familiarity & Conventions)
* Use established conventions from tools developers and QA engineers already use daily (Postman, Swagger/OpenAPI UI, Insomnia, and VS Code).
* Place the HTTP method verb (`POST`, `PUT`, `PATCH`, `DELETE`) as a colored badge directly adjacent to the endpoint input path.
* Structure payload inspection with collapsible tree views and Monaco/CodeMirror-style JSON editors with line numbers, syntax highlighting, and inline validation warnings.

### B. Hick’s Law (Decision Latency Reduction)
* Avoid displaying exhaustive checklists of 30+ raw mutation rules at once.
* Group mutation rules into 3 progressive, opinionated presets:
  1. **Quick Smoke / BVA:** Numerical boundaries ($0$, $-1$, $2^{53}-1$), empty strings, and null injections.
  2. **Strict Schema Contract:** Missing required keys, extra properties, and type inversions (e.g., string to array).
  3. **Adversarial / Fuzzing:** SQL/XSS injections, unicode emoji clusters (`₱🔥🚀`), byte floods, and control characters.
* Allow advanced users to expand custom overrides via secondary accordions.

### C. Miller’s Law (Cognitive Chunking)
* Limit the primary workspace to 4 distinct, clearly delineated mental zones:
  1. **Input Stage:** Endpoint URL, Method, Headers, Sample JSON Payload / Schema.
  2. **Mutation Config:** Preset selection, boundary rules, and target expected status codes.
  3. **Matrix Preview:** Generated test cases categorized by negative scenario type with live diffs against baseline.
  4. **Export Center:** Dual-pane generated code view (Postman v2.1 JSON vs. Playwright `.spec.ts`) with quick-copy and zip download.

### D. Fitts’s Law (Target Accessibility & Sizing)
* Make primary call-to-action buttons (e.g., `Generate Test Matrix`, `Export Playwright .spec.ts`, `Export Postman Collection`) high-contrast, visually prominent targets with a minimum click/tap bounding box of 44x44px.
* Place sticky execution buttons at predictable locations: top-right header and bottom-right floating bar when scrolling through large mutation lists.
* Position copy-to-clipboard icons directly at the top right of code previews with immediate visual feedback.

### E. Doherty Threshold (<400ms Response Times)
* Payload generation, JSON schema validation, and TypeScript code compilation MUST execute in <150ms for payloads under 1,000 keys.
* Offload payload generation loops exceeding 50 variants to an in-browser Web Worker to prevent UI thread stuttering or input lag.
* Provide instant inline schema validation indicators as the user types JSON; never require a manual "Validate" click.

### F. Aesthetic-Usability Effect
* Build the UI with an engineering-focused aesthetic: clean monospace typography for technical data (`JetBrains Mono`, `Fira Code`, or `Geist Mono`), dark-mode first design, subtle borders (`border-neutral-800`), and distinct method badges:
  * `POST`: Emerald / Green
  * `PUT`: Amber / Orange
  * `PATCH`: Cyan / Blue
  * `DELETE`: Rose / Red
* Clear visual hierarchy separates metadata, assertions, and payloads without dense visual clutter.

### G. Tesler’s Law (Conservation of Complexity)
* Absorb structural complexity within the generator engine rather than offloading it to the user.
* Automatically infer sensible defaults: if a user inputs `{ "age": 25 }`, the engine automatically identifies it as an integer, derives boundaries ($0, -1, 2147483647$), and sets the expected failure status to `400 Bad Request` without forcing manual mapping.

### H. Peak-End Rule (Memorable Completion)
* Make the export milestone feel rewarding:
  * Display a summary metric banner: *"Generated 18 test cases (6 BVA, 8 Schema, 4 Fuzz) in 42ms."*
  * Provide single-click copy buttons with temporary checkmark transitions and a toast notification.
  * Offer a one-click `Download Test Bundle (.zip)` that includes `tests/api.spec.ts`, `playwright.config.ts`, and `package.json`.

---

## 3. Engineering & Code Standards

### TypeScript & Code Generation Guidelines
1. **Zero-Eval & Zero Template Injection:** Never compile user input using `eval()` or unescaped string concatenation. All payload representations must pass through `JSON.stringify(payload, null, 2)` with safe string-escape handlers for quotes and template literals.
2. **Playwright Spec Output Requirements:**
   - Must use the modern Playwright `APIRequestContext` fixture (`async ({ request }) => { ... }`).
   - Every generated test block must include a unique scenario ID, descriptive category tag, transport status assertion (`expect(response.status()).toBe(...)`), and response JSON error parsing.
   - Default hostnames must reference runtime environment variables with fallback defaults:
     ```typescript
     const BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';
     ```
3. **Postman Collection v2.1 Requirements:**
   - Follow strict Postman Collection v2.1.0 JSON schema.
   - Embed assertions inside `event[type="test"].script.exec` arrays using standard Chai assertions (`pm.response.to.have.status(...)`).
4. **Client-Side File Delivery:**
   - Use browser `Blob` creation and `URL.createObjectURL` for downloading `.ts` and `.json` files. Always invoke `URL.revokeObjectURL` to prevent memory leaks.

---

## 4. Assistant Behavior & Operational Constraints
* **Deliver Concrete Code:** When writing features, provide full, runnable TypeScript/JavaScript functions. Do not use pseudo-code, ellipsis omissions (`// ...rest of code`), or placeholder comments in core logic.
* **Respect Zero-Backend Mandate:** Reject any solution suggesting server-side rendering, proxy relays, database storage, or remote logging. All state must live in memory or optional `localStorage`.
* **Proactive QA Mindset:** When writing or reviewing code, actively consider edge cases: handling circular JSON structures, extremely deep object trees, malformed unicode, and payloads exceeding 5MB.