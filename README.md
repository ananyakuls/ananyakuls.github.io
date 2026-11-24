# Ananya Kulshreshtha · portfolio site

One long portfolio page plus a separate research page. Built as plain HTML, CSS and JavaScript, with no framework or build step.

## Run it locally

```bash
cd ak_website
python3 -m http.server 8000
```

Open `http://localhost:8000`.

## Deploy to GitHub Pages

This folder is the deployable root. The repo is `ananyakuls/ananyakuls.github.io`, so the site is meant to live at `https://ananyakuls.github.io/`.

1. Push this folder to `main` (the source-only material in `../ak_website_source` stays outside the repo).
2. Repo → Settings → Pages → Source: `Deploy from a branch` → Branch: `main`, folder `/ (root)`.
3. Keep `.nojekyll` in the root so GitHub does not run Jekyll.

If the site is deployed under a project path instead (`https://<username>.github.io/<repo>/`), update the canonical, `og:url`, `og:image` and sitemap URLs first. All page paths are relative, so the rest works unchanged.

## Files

```
index.html          portfolio content and links
research.html       separate research index
styles.css          design system, layout, motion
main.js             time-of-day header, reveals, section index, ambient fireworks
favicon.svg         red square, cream A
robots.txt          crawler rules and sitemap pointer
sitemap.xml         home and research URLs
assets/img/*.webp   portfolio images, report previews, research background
assets/reports/     local PDF copy of the growth report
assets/fonts/*.woff2  Archivo Black, Archivo, Instrument Serif Italic
../ak_website_source  originals, frozen versions and review preview (not deployed)
```

## Open items before/after deploy

- **GitHub URL.** Canonical, OG and sitemap URLs point to `https://ananyakuls.github.io/`. Update them if the account or repo name changes.
- **Client permissions.** The client names and screenshots come from Ananya's own portfolio PDF and the links she supplied. Confirm she is happy for all of them to be public.
- **TBS Clients.** Anyuta Dhir and Dr Abhilasha Singh share one chapter with their two LinkedIn profile cards; both cards link to their profiles.
- **Growth metrics.** The August 2025 Anyuta Dhir report opens from Google Drive, with a local PDF copy in `assets/reports/` beside it.
- **Research page.** Six titles link to the supplied Google Drive and Slides documents. The page uses Daniel Maclise, *The Play Scene in Hamlet* (1842), as a dark background. Public domain.
- **Metrics.** Numbers come from the deck. The growth report carries August 2025; the headline stats elsewhere still have no baselines.
- **Research background rights.** The research background is Daniel Maclise, *The Play Scene in Hamlet*, 1842. Public domain. The earlier candidates remain in `../ak_website_source`.
- **OG image.** Add `assets/og.jpg` (1200×630) and an absolute `og:image` once the URL is known.

## Design notes

- Palette: Monet water fields (teal, lavender, moss, navy, mustard), berry from the original deck, one Kruger red `#CE2118` for captions.
- Type: Archivo Black / Archivo / Instrument Serif Italic, self-hosted; the hero pull-quote uses Georgia Italic.
- Signature: each project is a different hour of the same page (`06:40` → `22:30`), with red caption bars and a hard-edged contact sheet.
- Motion is one authored moment (the hero bar and section reveals). Everything is opacity/transform/clip-path; `prefers-reduced-motion` is fully honoured.
- **Ambient fireworks:** a single fixed canvas places sparse bursts in the left margin on screens 1200px and wider. It runs only while a burst is alive, pauses when the tab is hidden, and is skipped under reduced motion.
- **Section weather:** each section carries a small canvas behind its content. Iconinc and TenterHook drop Instagram hearts, The Brand Salt gets snow and salt, the films section sits on Van Gogh's *The Starry Night*, Outspoke blooms with water-lily petals, and the remaining sections get a quiet gold/berry mote drift.
- **Outspoke petals:** 60 blurred petals and loose blooms in the Monet palette, continuous while the section is visible, skipped under reduced motion.
- **Films background:** Van Gogh's *The Starry Night*, 1889 (public domain), served as WebP at 1280/1920 widths with a dark radial wash for text contrast. Credited in the section.
- Images are WebP and downscaled for their display size; the chapter thumbnails are the bulk of the image weight.
- **Instagram evidence:** the Iconinc, Brand Salt and TenterHook cards use each post's actual cover image, stored locally so the page still works offline and from a zip. Comments are not shown. One TenterHook post was already deleted on Instagram, so its original cover is kept.
