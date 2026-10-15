# Brief para agentes redactores de la Academia OdonTeck

You are writing educational content in Spanish (Mexico) for «Academia OdonTeck», a Cisco-Networking-Academy-style reading platform about dentistry inside OdonTeck Club. Readers: dental students, pasantes, general dentists, dental assistants and, in some programs, informed patients. Repo root: C:\dev\02_CLIENTES\OdonTeck\odonteck-club-wt-herramientas (branch feat/academia).

READ FIRST (mandatory):
1. docs/ACADEMIA-FORMATO.md — the exact JSON format and editorial rules.
2. docs/PLAN-ACADEMIA.md — purpose, audience, review workflow, image policy and the approved catalog.
3. api/content/academia/catalogo.json — your program's module list. Module `titulo` must match the catalog EXACTLY.
4. Gold-standard depth example (read-only, other product, different domain): C:\dev\02_CLIENTES\VisionPecuaria-Avicola\elite-pecuario\api\content\academia\pollo-de-engorda\modulo-01.json. Match its depth, structure and quality, never its content or brand. Once caries-dental/modulo-01.json exists, use it as the in-house example.

WHAT TO PRODUCE: one file per assigned module at api/content/academia/<program-id>/modulo-NN.json (two digits). For each module:
- `estado` is always "borrador" and `version` is 1. Only a dental professional moves it to «revision» or «aprobado» from the admin panel.
- `resumen` 60–120 words; `objetivos` 4–6 with observable verbs; `duracionMin` realistic; `portada` 16:9 with alt and prompt.
- 5 temas (4 to 6 allowed). Each tema:
  - 1,000–1,400 words of real teaching text (texto, recuadro, pasos, lista, tabla);
  - a `subtitulo` every 2–3 paragraphs;
  - at least 3 `figura` blocks, each with an image prompt;
  - at least 1 `diagrama` (labeled diagrams are drawn in code, never requested from the image generator);
  - at least 2 `recuadro` blocks of different variants (atencion, sabias, profundizar, ejemplo, mexico);
  - at least 1 `actividad` (ordenar, relacionar, vf, caso or calculadora);
  - `enPocasPalabras`: a simple 2–3 sentence summary a patient could understand;
  - 3–8 glossary terms, exactly 3 verification questions (ids t<M>.<T>-1..3) and its sources;
  - it ends with a practical, applicable idea (for the clinic, for study or for home care).
- At least one `profundizar` recuadro per module, at university/professional level (it is shown as a collapsible box).
- One minijuego. Rotate by module number: modules 1,4,7,10,13,16 → `sopa`; 2,5,8,11,14 → `crucigrama`; 3,6,9,12,15 → `memorama`.
- Exam: `aprobar` 70, `mostrar` 10, 15–20 questions mixing recall, comprehension and clinical cases. Never «todas las anteriores» or «ninguna de las anteriores».
- ANSWER POSITIONS: spread the correct answer across A, B, C and D in both exams and verification questions. No letter may hold more than 35 % of a module's exam answers. Write the options in natural order first, then place the correct one where the balance needs it.
- Cover the module title thoroughly and without overlapping other modules of the program: think like the author of a university dental textbook who also writes clearly for a first-semester student. Use current knowledge (2025/2026), Mexican context (Secretaría de Salud, COFEPRIS, NOM, IMSS/ISSSTE practice settings, SIVEPAB when relevant) and international references.

VALIDATION: after writing each module run `node scripts/academia/validar.mjs <program-id> --estricto` from the repo root and fix every error for that module before moving on (0 errors required). Modules not yet written appear as «pendientes»; that is fine. The validator is being written by the platform agent; if it is not there yet, say so in your report and self-check against docs/ACADEMIA-FORMATO.md.

NON-NEGOTIABLE RULES:
- Technically correct and current. NEVER invent data, figures, norms, NOM numbers, documents, authors, years or URLs. If unsure a source exists, don't cite it; use `"tipo": "propia"` with title «Elaboración propia OdonTeck con base en …». Only include `url` when certain.
- NOM numbers: before citing any NOM, confirm with WebSearch that it exists AND is in force (Catálogo Mexicano de Normas of the Secretaría de Economía or the DOF). Examples you must verify yourself, not assume: NOM-013-SSA2-2015 (prevention and control of oral diseases), NOM-087-SEMARNAT-SSA1-2002 (RPBI), NOM-004-SSA3-2012 (expediente clínico), NOM-229-SSA1-2002 (X-ray installations; read its scope carefully, it has specific provisions about dental equipment). If you cannot confirm validity, describe the requirement without the number and tell the reader to check the current DOF.
- Good sources: Secretaría de Salud, COFEPRIS, DOF, WHO/OMS and OPS, FDI, ADA, AAPD, AAE, CDC (infection control in dental settings), UNAM and other universities, peer-reviewed consensus (ICDAS II/ICCMS, CAMBRA, 2017 World Workshop classification of periodontal and peri-implant diseases by AAP/EFP). Use WebSearch sparingly (a few searches per module) to confirm current data and norms.
- NO drug doses and no closed pharmacological protocols (antibiotics, analgesics, anesthetics, fluoride varnish amounts per kg, etc.). Explain the concept and state that prescribing is the dentist's or specialist's professional judgment. No dose calculators.
- Invasive procedures (cavity preparation, root canal instrumentation, scaling, extractions) are explained as concepts, always with biosafety, never as step-by-step instructions for untrained people and never with graphic content.
- Spanish of Mexico, clear and warm, second person, technically precise. Use «» instead of ASCII double quotes inside JSON text values.
- No padding: never repeat sentences or write filler to reach word counts. Every paragraph must teach something new. Write the JSON by hand with the Write tool; do not generate content with templates or loops.
- Image prompts: Spanish, 60–140 words, ending with «Evitar: …». Realistic clinical photography or realistic illustration; correct dental anatomy for the age and arch described; no blood or disturbing graphic content; no identifiable faces of real patients (frame mouths, hands, instruments, typodonts, or people wearing masks); correct PPE in every clinical scene (gloves, mask or respirator, eye protection or face shield, gown); no text, labels or logos inside the image. Proportions: 1:1, 16:9, 9:16, 3:4, 4:3. Image ids `<program-id>/mNN/NN` consecutive per module, portada `<program-id>/mNN/portada`, diagram ids `<program-id>/mNN/dN`.
- Write ONLY to api/content/academia/<program-id>/modulo-NN.json for your assigned modules. Do not edit any other file. Do not run git (no commit, push or stash).
- Do NOT spawn helper agents: write every module yourself, one after another.

FINAL REPORT (short): modules written, total words and images from the validator's last line, every NOM or standard you cited and how you verified it, and any facts you were unsure about and how you handled them.
