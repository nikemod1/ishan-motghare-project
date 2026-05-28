# India State News Atlas

Interactive India state map with state-specific news from the last 30 days.

## Overview

This project shows India as an interactive state map. Click a state to highlight it and load the latest matching local news stories for that state.

## Features

- Click any Indian state on the map to highlight it.
- Show the top 5 related news stories for the selected state.
- Keep results limited to articles published within the previous 30 days.
- Rank stories using the selected state name, capital, and major city keywords.
- Keep the map responsive inside Chrome and other modern browsers.
- Use a separate server layer so the news source can be changed later without rewriting the UI.

## Tech Stack

- Frontend: Vite + React + TypeScript.
- Map: [`india-map-svg`](https://www.npmjs.com/package/india-map-svg).
- News: Node/Express proxy that queries Google News RSS, then filters and ranks the results.

## Local Setup

```bash
npm install
npm run dev
```

The app runs the client on port 5173 and the API on port 3001.

## How It Works

1. The map returns a state ID when you click a region.
2. The app resolves that ID to the matching state profile.
3. The server queries Google News RSS for that state and nearby city keywords.
4. Results older than 30 days are dropped.
5. The remaining stories are ranked and trimmed to the top 5.
6. The selected state is highlighted using the map's own ID naming.

## Notes

- The news filter is heuristic-based, not a government or geofenced source.
- Some news stories may mention a city rather than the state name directly.
- If you want a stricter location-aware news pipeline later, the server layer is already separated and can be replaced.
- The repository is set up for local development first, then GitHub publishing.

## Troubleshooting

- If the map looks clipped, make sure the browser window is wide enough and reload once after the dev server starts.
- If the news panel is empty, try another state; RSS availability can vary by region and day.
- If ports 5173 or 3001 are busy, stop the conflicting process and run the app again.

## Usage Tips

- Start with Maharashtra if you want a dense news feed for quick testing.
- Use the map click, not hover, to switch the selected state.
- Wait for the news panel to refresh after each click; the app re-queries the server for the new state.
- If a story looks off-topic, it is usually because the RSS source mentioned a city keyword more strongly than the state name.
- Use the browser back button only after the page is fully loaded so you do not interrupt the active news request.
- Keep the app on a stable network connection because the server depends on external RSS feeds.

## Run in Production

```bash
npm run build
npm start
```
