# Ananya Kulshreshtha — portfolio site

One long page. Nine chapters, one continuous read. Built as plain HTML, CSS and JavaScript — no framework, no build step.

## Run it locally

```bash
cd ak_website
python3 -m http.server 8000
```

Open `http://localhost:8000`.

## Deploy to GitHub Pages

1. Create a GitHub repo (e.g. `ananya-portfolio`).
2. Push the contents of this folder to `main`.
3. Repo → Settings → Pages → Source: `Deploy from a branch` → Branch: `main`, folder `/ (root)`.
4. The site appears at `https://<username>.github.io/ananya-portfolio/`.

For a root URL (`https://<username>.github.io/`), name the repo `<username>.github.io` instead and push the same files.

All paths are relative, so the site works from a subfolder. `.nojekyll` stops GitHub from running Jekyll.

## Files

```
index.html          all content and links
styles.css          design system, layout, motion
main.js             reveal-on-scroll + section index
favicon.svg         red square, cream A
assets/img/*.webp   21 images extracted from the supplied portfolio PDF
assets/img/starry-night-*.webp  Van Gogh, The Starry Night (public domain)
assets/fonts/*.woff2  Archivo Black, Archivo, Instrument Serif Italic
```

## Open items before/after deploy

- **GitHub URL.** Not created yet. Once it exists, update `og:image` to an absolute URL if you add one.
- **Client permissions.** The client names and screenshots come from Ananya's own portfolio PDF and the links she supplied. Confirm she is happy for all of them to be public.
- **Dr Abhilasha Singh posts.** Shown without individual links (none were supplied); they link to her LinkedIn profile. The deck's line "infographic design not claimed" is kept on the page.
- **Dove analysis.** Mentioned as an independent, uncommissioned piece in the About section. No separate page yet.
- **Metrics.** Numbers come from the deck. They currently carry no dates or baselines; add a scope line if a recruiter is likely to ask.
- **OG image.** Add `assets/og.jpg` (1200×630) and an absolute `og:image` once the URL is known.

## Design notes

- Palette: Monet water fields (teal, lavender, moss, navy, mustard), berry from the original deck, one Kruger red `#CE2118` for captions.
- Type: Archivo Black / Archivo / Instrument Serif Italic, self-hosted.
- Signature: each project is a different hour of the same page (`06:40` → `22:30`), with red caption bars and a hard-edged contact sheet.
- Motion is one authored moment (the hero bar and section reveals). Everything is opacity/transform/clip-path; `prefers-reduced-motion` is fully honoured.
- **Section weather:** each section carries a small canvas behind its content. Iconinc and TenterHook drop Instagram hearts, The Brand Salt gets snow and salt, the films section sits on Van Gogh's *The Starry Night*, Outspoke blooms with water-lily petals, and the remaining sections get a quiet gold/berry mote drift.
- **Outspoke petals:** 60 blurred petals and loose blooms in the Monet palette, continuous while the section is visible, skipped under reduced motion.
- **Films background:** Van Gogh's *The Starry Night*, 1889 (public domain), served as WebP at 1280/1920 widths with a dark radial wash for text contrast. Credited in the section.
- Images are WebP at 1400px max; total page imagery ~1.9MB.
