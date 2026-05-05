# Traveler Quotes Ingestion

Place one file per country in this folder:

- filename: `<country-slug>.json` (example: `france.json`, `united-kingdom.json`)
- content: array of exactly 10 quote objects

Required per quote:

- `text` (real quote text)
- `sentiment` (`positive` | `neutral` | `negative`)
- `sourceName` (platform or site name)
- `sourceUrl` (verifiable URL)
- optional: `author`

Distribution required by validation:

- 5 positive
- 3 neutral
- 2 negative

If the file is missing or invalid, the app will show:

- "Traveler feedback is currently being collected."

Example:

```json
[
  {
    "text": "I loved walking through the old town at sunrise...",
    "sentiment": "positive",
    "sourceName": "Reddit r/travel",
    "sourceUrl": "https://www.reddit.com/...",
    "author": "username"
  }
]
```

## Import into database

Build quote files from source manifests first:

```bash
npm run quotes:build
```

After adding/updating country quote files, run:

```bash
npm run quotes:import
```

Dry-run validation (no DB write):

```bash
npm run quotes:import -- --dry-run
```

Source manifests are expected in:

- `data/traveler-quote-sources/*.json`
