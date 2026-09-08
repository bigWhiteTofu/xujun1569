# Jun Xu · 徐俊

Two separate static sites, deployed together on GitHub Pages:

- `/xujun1569/`: English personal homepage (default for ORCID).
- `/xujun1569/zh/`: Chinese personal homepage. Language links stay inside the public site.
- `/xujun1569/ph1/`: preserved Chinese application profile, with its original papers, materials, and interactions.
- `/xujun1569/in/`: existing tracked entry, now forwards to `../ph1/?from=in`.

The personal and application sites do not link to each other. This is navigation separation; the application URL remains public.

## Editing and preview

Node.js is sufficient; no frontend package installation is needed.

```powershell
node scripts/build-home.mjs
node scripts/check-site.mjs
node --check home.js
node scripts/mock-server.mjs
```

Preview at `http://127.0.0.1:4173/xujun1569/`. The preview server accepts the same subdirectory paths as GitHub Pages and provides in-memory message/visit endpoints. It never sends preview messages to production. Stop it with Ctrl+C.

Interaction regression tests use JSDOM as a development-only dependency: run `npm ci --ignore-scripts`, then `npm test`. They cover all publication categories and date order, photo/atlas placement, independent atlas navigation, bilingual paper titles, language anchors, keyboard menu behavior, message feedback, failure draft preservation, rate limits, and the combined note/contact length boundary. They do not replace a browser layout review.

- `scripts/home-content.mjs`: paired English/Chinese homepage copy.
- `scripts/research-content.mjs`: bilingual atlas descriptions, publication categories, and all 12 published papers. The two Chinese articles use English titles verified from their PDF abstracts, alongside the original Chinese titles.
- `scripts/build-home.mjs`: shared semantic HTML template, metadata, and public sitemap generation.
- `index.html`, `zh/index.html`, `sitemap.xml`: generated files; rebuild after copy/template changes.
- `home.css`, `home.js`: public responsive styles and shared interactions.
- `screens.css`, `screens.js`: the personal layout and native-scroll navigation.
- `scripts/screens.test.mjs`: native scrolling, reading progress, and active-section regressions.
- `ph1/index.html`, `ph1/app.js`: original application profile, using parent-relative assets.
- `styles.css`, `app.js`, `admin.*`, `config.js`, `worker/`: existing application/admin/API code. The original root `app.js` is retained for provenance but no longer loaded by the personal homepage.

The public page uses native continuous scrolling, a sticky header, a thin reading progress bar, and an underline on the current navigation link. All four research directions remain fully visible along an illustrated, alternating research trail. There is no wheel interception, animated page switching, or publication pagination.

All 12 papers are rendered statically, ordered by descending recorded journal year and thematic relevance within the same year. Each has one primary topic: Learning & AI (4), Knowledge & trust (3), Teachers & communities (3), or Digital society (2). The IPM paper retains its recorded 2027 journal year; it is not presented as a newly inferred publication date.

Core content, DOI/PDF links, and language navigation work without JavaScript. All 12 papers appear in order; topic filters hide only nonmatching items. Anchors account for the sticky header and reduced-motion settings.

Public messages use the existing `/api/message` service. The 1,000-character limit includes contact details; errors preserve the draft, submissions time out after 12 seconds, and all visible status text is localized. No live messages should be sent as part of testing.

## Publishing

The existing remote is `bigWhiteTofu/xujun1569`; both `main` and `gh-pages` previously pointed to the same site commit. Publish only after validation, without force pushing. Keep both page sets and shared assets in the published tree. No Cloudflare API deployment is required for this redesign.

## Third-party assets

Existing personal photographs are reused without modifying the image files. Cabinet Grotesk is served locally from Fontshare (Indian Type Foundry); its original CSS source is kept in `assets/fonts/cabinet-source.css`. GSAP 3.12.5 and ScrollTrigger 3.12.5 are vendored from the same jsDelivr package used by the original site; their license notices are preserved in the files.
