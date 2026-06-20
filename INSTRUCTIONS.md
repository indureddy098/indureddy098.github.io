# How to use your portfolio site

You only need to touch **two things**: the info block at the top of `index.html` and the `images/` folder.

---

## 1. Edit your personal info

Open `index.html` in any text editor (Notepad, VS Code, or the editor on github.com).

Look for this big banner near the top:

```
>>>>>  EDIT YOUR PERSONAL INFO BELOW — THIS IS THE ONLY PLACE  <<<<<
```

Inside that block (roughly **lines 17–48**) you'll see a JSON-style structure. Replace the placeholder text inside the quotes. Don't remove the quotes, commas, or curly braces.

### What to change

| Field | What it is | Example |
|---|---|---|
| `name` | Your display name | `"Jane Doe"` |
| `tagline` | One-line description shown under the hero | `"Editorial · Runway · Commercial"` |
| `stats.Height` etc. | Your measurements — keep both metric/imperial or just one | `"5'9\" / 175 cm"` |
| `contact.email` | Your booking email | `"jane@example.com"` |
| `contact.instagram` | The handle shown on the page | `"@janedoe"` |
| `contact.instagramUrl` | The full URL it links to | `"https://instagram.com/janedoe"` |
| `contact.agency` | Agency name or `"Freelance"` | `"Ford Models"` |

**Important about quotes:** if your text contains a `"` you must escape it as `\"` (the height field already shows how). If your text contains a `\` you must escape it as `\\`. Otherwise, write things normally.

### Adding or removing stats

To add a new row to the stats block, copy any existing line in the `"stats"` block and add a comma to the end of the previous line. Example — adding "Languages":

```json
  "stats": {
    "Height":    "5'9\" / 175 cm",
    "Bust":      "32\" / 81 cm",
    ...
    "Languages": "English, French"
  },
```

Make sure the LAST line inside `stats` does NOT have a trailing comma.

To remove a row, delete the whole line — and again, make sure the last remaining line has no trailing comma.

---

## 2. Add your photos

Put all photos inside the `images/` folder, using these exact filenames:

| Filename | Where it shows |
|---|---|
| `hero.jpg` | Big full-screen photo at the top |
| `gallery-01.jpg` | Gallery grid, position 1 |
| `gallery-02.jpg` | Gallery grid, position 2 |
| `gallery-03.jpg` … `gallery-08.jpg` | Gallery grid, positions 3–8 |

### Recommended specs

- **Format:** `.jpg` for photos (smaller files). Use `.png` only if you need transparency.
- **Hero photo:** landscape or portrait, around **2000 px** on the long side. This is the biggest image — it loads first.
- **Gallery photos:** portrait orientation works best (the grid uses a 3:4 frame). Around **1200–1600 px** on the long side is plenty for a web page.
- **File size:** aim for **under 300 KB per image** after compression. The whole site should fit under ~3 MB total.

### Want more or fewer than 8 gallery images?

In `index.html`, find the `"gallery"` block. To add a 9th photo, add a new line like:

```json
    { "image": "images/gallery-09.jpg", "alt": "Gallery image 9" },
```

…and drop a matching `gallery-09.jpg` into the `images/` folder. Same rule as above: no trailing comma on the last line.

### How to compress your photos

The easiest free options (no install needed):

1. **[Squoosh](https://squoosh.app)** — drag a photo in, on the right side pick "MozJPEG" with quality around 75–80. Download. That's it.
2. **[TinyJPG](https://tinyjpg.com)** — drag and drop, it compresses, you download. Up to 20 images at a time.

Run every photo through one of these before adding it. Uncompressed phone/camera photos can be 5–10 MB each — way too big for a web page.

### Renaming a photo to match

If your photo is called `IMG_4823.jpg`, just rename it to `gallery-01.jpg` (or whichever slot it should fill) before dropping it into `images/`.

---

## 3. Run the site locally (before pushing)

You can preview the site on your computer without pushing to GitHub.

**Easiest: double-click `index.html`** — it opens in your browser straight from your hard drive. URL will start with `file:///`. That's fine for everything except the edit mode "Copy code" button, which needs the next method.

**Better: start a local web server (one PowerShell command):**

```powershell
cd "$env:USERPROFILE\OneDrive\Desktop\modeling-portfolio"
python -m http.server 8000
```

Then open **http://localhost:8000** in your browser. Press Ctrl+C in PowerShell to stop the server when done. (Requires Python; install from https://python.org if you don't have it — check the "Add to PATH" box during install.)

---

## 4. Adjust how each photo fits (Edit Mode)

Every photo has hidden settings — zoom, position, crop-vs-fit — that you can visually tweak. The Edit Mode UI lets you adjust them with sliders and drag-and-drop.

### How to use it

1. Run the site locally (see step 3).
2. Visit **http://localhost:8000/?edit=1** (the `?edit=1` is what activates edit mode).
3. An orange banner appears at the top.
4. **Click any photo** to select it (orange outline = selected).
5. Use the panel in the bottom-right:
   - **Crop to fill** / **Show whole photo** — two ways to fit the photo into its frame
   - **Zoom slider** (1×–3×) — or scroll the mouse wheel on the selected photo
   - **Horizontal / Vertical position** sliders — or just drag the photo with your mouse
   - **Reset this photo** — back to defaults
6. Click another photo to switch and adjust it the same way.
7. When everything looks right, click **Copy code**.

### Saving your adjustments permanently

The edit panel only updates the photos in your browser preview — changes aren't saved automatically (this is intentional, so the live site can never be edited from a browser).

To make changes permanent:

1. Click **Copy code** in the edit panel — your clipboard now has the updated config block.
2. Open `index.html` in Notepad.
3. Find the block near the top that starts with `<script id="portfolio-data"` and ends with `</script>`.
4. Delete everything **between** `<script id="portfolio-data" type="application/json">` and `</script>` (the JSON object — starts with `{` and ends with `}`).
5. Paste in the copied code.
6. Save the file.
7. Push to GitHub (see step 5 below).

### Important: the edit panel does NOT show on the live site

Edit mode only activates when the URL has `?edit=1`. Your live visitors will never see the orange banner or panel, even if they somehow visit `yoursite.com/?edit=1` (they can play with it, but nothing they change is saved — only YOU can save changes by pasting the copied code into `index.html` and pushing).

---

## 5. Updating the site later

Once it's on GitHub Pages (see the chat for setup), to make a change you'll:

1. Edit the file (either locally or directly on github.com).
2. Commit + push (or, on github.com, click "Commit changes").
3. Wait ~1 minute. Your site updates.
