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

## 3. Preview before you publish

Double-click `index.html` and it should open in your browser. The placeholder images will be broken (because you haven't added the files yet) — that's expected. Once you drop real photos with the right names into `images/`, refresh the page and they'll appear.

---

## 4. Updating the site later

Once it's on GitHub Pages (see the chat for setup), to make a change you'll:

1. Edit the file (either locally or directly on github.com).
2. Commit + push (or, on github.com, click "Commit changes").
3. Wait ~1 minute. Your site updates.
