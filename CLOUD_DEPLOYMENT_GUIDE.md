# Deploying VIT Campus Compass on Vercel

The site is plain static files, so Vercel needs **no build step and no framework setting**.
The included `vercel.json` only adds a few safe security headers.

## Option A: drag and drop (quickest)

1. Put these files together in one folder: `index.html`, `style.css`, `data.js`, `script.js`, `vercel.json`, `README.md`.
2. Go to vercel.com/new and sign in (GitHub login is fine).
3. Choose to deploy a folder or upload your project files (the exact wording changes, so use the upload option on the New Project page). Pick the folder from step 1.
4. If Vercel asks for settings, use **Framework Preset: Other**, leave **Build Command** and **Output Directory** empty, and set **Root Directory** to the folder that holds `index.html`.
5. Click **Deploy**. In about 30 seconds you get a link like `https://vit-campus-compass.vercel.app`.

## Option B: GitHub + Vercel (auto-updates)

1. Create a **Public** GitHub repository and upload all the files to the **root** (not in a subfolder).
2. On vercel.com choose **Add New → Project**, import the repository, keep the defaults (**Framework: Other**) and click **Deploy**.
3. Every time you commit a change on GitHub, Vercel redeploys automatically.

## Option C: Vercel CLI

```bash
npm i -g vercel
cd path/to/project
vercel --prod
```

## Before you submit

- Open the live link on your phone and your laptop.
- Toggle dark mode, search for "robot", bookmark a club and refresh to check it was saved.
- Try the easter egg (click the glowing ∞, or type `infinity`) and press Esc inside a dialog.
- Test the status labels on another date by adding `?today=2026-11-02` to the URL.
- Check every outbound link. File names are case-sensitive on Vercel, so keep them lowercase exactly as supplied.

## Common problems

- **404 page:** `index.html` is not at the root of what you uploaded. Re-deploy with the Root Directory set to the folder containing it.
- **Unstyled page:** `style.css` or `script.js` was missed in the upload.
- **Changes not showing:** hard-refresh (Ctrl+Shift+R) or wait for the new deployment to finish.

(Still want GitHub Pages instead? Push the same files to a repo, then Settings → Pages → Deploy from branch `main` / root.)
