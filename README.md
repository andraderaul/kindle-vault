# Kindle Vault

A place to store and listen to highlights from your Kindle readings.

---

## What it does

Imports your Kindle highlights and organizes them by book. You can read the excerpts in the browser or have the app read them aloud using the Web Speech API — no cost, no external API.

It accepts two import formats:
- `My Clippings.txt` — the file the Kindle itself generates, no conversion needed
- JSON — for those who have already exported highlights through other means

---

## Stack

- Next.js 15 (App Router)
- TypeScript strict
- Prisma + SQLite
- TailwindCSS v4
- Lingui.js (pt-BR, en, es)
- Web Speech API

---

## Running locally

```bash
git clone https://github.com/andraderaul/kindle-vault
cd kindle-vault

npm install

npx prisma migrate dev --name init

npm run i18n:compile

npm run dev
```

Open at `http://localhost:3000`.

---

## Importing your highlights

**Via `My Clippings.txt`:**
Connect your Kindle to the computer. The file is at `Kindle/documents/My Clippings.txt`. Upload it directly on the import screen.

**Via JSON:**
The file must be an array of objects with the fields `bookTitle`, `author`, `text`, and optionally `location`.

```json
[
  {
    "bookTitle": "Sapiens",
    "author": "Yuval Noah Harari",
    "text": "Wheat did not give the individual man a better life.",
    "location": 942
  }
]
```

---

## About the project

I started it because I wanted to reread my highlights without depending on any external service. The data lives in a local SQLite database — nothing leaves your machine.

I tried to follow good engineering practices throughout development: separation between queries and actions (inspired by CQRS), isolated icon components, internationalization with Lingui, dark mode without load flash, and a robust parser for the Kindle format. Not because the project demands that complexity, but because it was an opportunity to practice.

There are cursor rules in `.cursor/rules/` documenting the architecture decisions in case you want to understand the reasoning behind each choice.

---

## Useful commands

```bash
npm run dev          # development
npm run build        # production build
npm run check        # lint + format (Biome)
npm run i18n:extract # extract new strings for translation
npm run i18n:compile # compile translations
npm run i18n:check   # validate complete translations

npx prisma studio    # view the database
npx prisma migrate dev --name <name>  # new migration
```

---

## License

[MIT](LICENSE)
