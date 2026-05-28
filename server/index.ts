import cors from 'cors';
import express from 'express';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getStateProfile, stateProfiles } from '../src/data/stateProfiles';
import { getStateNews } from './newsService';

const app = express();
const port = Number(process.env.PORT ?? 3001);
const rootDir = path.dirname(fileURLToPath(import.meta.url));
const clientDist = path.resolve(rootDir, '..', 'dist');

app.use(cors());
app.use(express.json());

app.get('/api/health', (_request, response) => {
  response.json({ status: 'ok', service: 'india-state-news-atlas' });
});

app.get('/api/states', (_request, response) => {
  response.json(stateProfiles);
});

app.get('/api/news', async (request, response) => {
  const stateParam = typeof request.query.state === 'string' ? request.query.state : '';
  const profile = getStateProfile(stateParam);

  if (!profile) {
    response.status(400).json({
      error: 'Provide a valid Indian state id such as MH or a full state name.',
    });
    return;
  }

  try {
    const payload = await getStateNews(profile.id);
    response.json(payload);
  } catch (error) {
    response.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to load state news.',
    });
  }
});

if (existsSync(clientDist)) {
  app.use(express.static(clientDist));

  app.get(/^(?!\/api).*/, (_request, response) => {
    response.sendFile(path.join(clientDist, 'index.html'));
  });
}

app.listen(port, () => {
  console.log(`India State News Atlas server running on http://127.0.0.1:${port}`);
});
