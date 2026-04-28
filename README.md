# AEGIS

AEGIS is an AI-powered Intellectual Property Protection and Cyber Threat Intelligence platform designed as a hackathon-grade product demo and portfolio showcase. It combines neural fingerprinting, simulated blockchain anchoring, live cyber threat monitoring, deepfake detection, automated DMCA workflows, and an explainability layer to make the entire protection pipeline feel intelligent, credible, and demo-ready.

The experience is intentionally built to feel alive during judging: threat feeds update on timers, multi-step AI pipelines execute sequentially, charts animate with realistic data, and every major button or hover state produces visible feedback. While the app runs entirely on the frontend, the structure mirrors a production-hostable SaaS dashboard and can be extended with a real backend later.

## Tech Stack

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?logo=tailwindcss&logoColor=white)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-11-black?logo=framer&logoColor=white)
![Recharts](https://img.shields.io/badge/Recharts-Data_Viz-8884D8)
![React Router](https://img.shields.io/badge/React_Router-v6-CA4245?logo=reactrouter&logoColor=white)

## Screenshot

Screenshot placeholder: add a hero screenshot or dashboard capture here before publishing the repository.

## Run Locally

```bash
npm install
npm run dev
```

The development server runs with Vite. Open the local URL shown in the terminal.

## Build

```bash
npm run build
```

Production output is generated in `dist/`. Deploy the contents of `dist/` to Vercel, Netlify, or any static hosting provider. Routing is already configured for Vercel with `vercel.json`.

## Project Structure

```text
src/
  components/
  pages/
  features/
  hooks/
  data/
  lib/
  assets/
```

## Deployment Notes

- `vite.config.ts` uses `base: '/'`
- `vercel.json` rewrites all routes to `/`
- `npm run build` completes successfully and outputs the production bundle to `dist/`
