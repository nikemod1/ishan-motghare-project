import { XMLParser } from 'fast-xml-parser';
import { subDays } from 'date-fns';
import { buildSearchTerms, getStateProfile, type StateProfile } from '../src/data/stateProfiles';
import type { NewsArticle, StateNewsResponse } from '../src/lib/news';

const parser = new XMLParser({
  ignoreAttributes: false,
  removeNSPrefix: true,
  textNodeName: '#text',
});

const CACHE_TTL_MS = 10 * 60 * 1000;
const WINDOW_DAYS = 30;
const cache = new Map<string, { expiresAt: number; payload: StateNewsResponse }>();

export async function getStateNews(stateIdOrName: string): Promise<StateNewsResponse> {
  const profile = getStateProfile(stateIdOrName);

  if (!profile) {
    throw new Error('Unknown state. Use a valid Indian state id such as MH or a full state name.');
  }

  const cached = cache.get(profile.id);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.payload;
  }

  const queryTerms = buildSearchTerms(profile);
  const articleGroups = await Promise.all(queryTerms.map((queryTerm) => fetchArticlesForTerm(profile, queryTerm)));
  const articles = rankAndDeduplicate(articleGroups.flat(), profile).slice(0, 5);

  const payload: StateNewsResponse = {
    stateId: profile.id,
    stateName: profile.name,
    generatedAt: new Date().toISOString(),
    windowDays: WINDOW_DAYS,
    articles,
    queryTerms,
    coverageNote:
      'Results are pulled from Google News RSS, restricted to the last 30 days, and ranked using state and city keyword matches.',
  };

  cache.set(profile.id, {
    expiresAt: Date.now() + CACHE_TTL_MS,
    payload,
  });

  return payload;
}

async function fetchArticlesForTerm(profile: StateProfile, queryTerm: string): Promise<NewsArticle[]> {
  const query = encodeURIComponent(`"${queryTerm}" when:30d`);
  const url = `https://news.google.com/rss/search?q=${query}&hl=en-IN&gl=IN&ceid=IN:en`;

  try {
    const response = await fetch(url, {
      headers: {
        'user-agent': 'Mozilla/5.0',
        accept: 'application/rss+xml, application/xml;q=0.9, */*;q=0.8',
      },
    });

    if (!response.ok) {
      return [];
    }

    const parsed = parser.parse(await response.text()) as Record<string, unknown>;
    const items = normalizeToArray(((parsed.rss as Record<string, unknown> | undefined)?.channel as Record<string, unknown> | undefined)?.item);

    return items
      .map((item) => normalizeArticle(item, profile, queryTerm))
      .filter((article): article is NewsArticle => article !== null);
  } catch {
    return [];
  }
}

function normalizeArticle(rawItem: unknown, profile: StateProfile, queryTerm: string): NewsArticle | null {
  if (!rawItem || typeof rawItem !== 'object') {
    return null;
  }

  const item = rawItem as Record<string, unknown>;
  const title = cleanupText(readText(item.title));
  const summary = cleanupText(readText(item.description) || readText(item['media:description']) || readText(item.contentSnippet));
  const link = readText(item.link) || readText(item.guid) || '';
  const source = readText((item.source as Record<string, unknown> | undefined)?.['#text']) || readText(item.source) || 'Google News';
  const publishedAt = parsePublishedAt(readText(item.pubDate) || readText(item.published) || readText(item.date));

  if (!title || !link || !publishedAt) {
    return null;
  }

  if (publishedAt < subDays(new Date(), WINDOW_DAYS)) {
    return null;
  }

  const keywords = [profile.name, profile.capital, ...profile.keywords].map((term) => term.toLowerCase());
  const searchableText = `${title} ${summary} ${source}`.toLowerCase();
  const matchedTerms = keywords.filter((term) => searchableText.includes(term));

  if (matchedTerms.length === 0) {
    return null;
  }

  const score = scoreArticle({ title, summary, source, publishedAt, matchedTerms, profile, queryTerm });

  return {
    title,
    summary: summary || 'Local coverage within the last month.',
    source,
    link,
    publishedAt: publishedAt.toISOString(),
    matchedTerms,
    score,
    queryTerm,
  };
}

function scoreArticle(input: {
  title: string;
  summary: string;
  source: string;
  publishedAt: Date;
  matchedTerms: string[];
  profile: StateProfile;
  queryTerm: string;
}): number {
  const titleLower = input.title.toLowerCase();
  const summaryLower = input.summary.toLowerCase();
  const sourceLower = input.source.toLowerCase();
  const queryLower = input.queryTerm.toLowerCase();
  const now = Date.now();
  const ageInDays = Math.max(0, (now - input.publishedAt.getTime()) / 86_400_000);

  let score = input.matchedTerms.length * 20;
  score += Math.max(0, 30 - ageInDays);

  if (titleLower.includes(input.profile.name.toLowerCase())) {
    score += 20;
  }

  if (titleLower.includes(input.profile.capital.toLowerCase())) {
    score += 12;
  }

  if (summaryLower.includes(input.profile.name.toLowerCase())) {
    score += 8;
  }

  if (summaryLower.includes(input.profile.capital.toLowerCase())) {
    score += 5;
  }

  if (sourceLower.includes('google news')) {
    score += 2;
  }

  if (titleLower.includes(queryLower) || summaryLower.includes(queryLower)) {
    score += 6;
  }

  return score;
}

function rankAndDeduplicate(articles: NewsArticle[], profile: StateProfile): NewsArticle[] {
  const seen = new Set<string>();
  const profileName = profile.name.toLowerCase();
  const capital = profile.capital.toLowerCase();

  return articles
    .filter((article) => {
      const key = article.link || article.title;
      if (seen.has(key)) {
        return false;
      }

      const searchableText = `${article.title} ${article.summary}`.toLowerCase();
      const isStateSpecific =
        searchableText.includes(profileName) ||
        searchableText.includes(capital) ||
        article.matchedTerms.some((term) => searchableText.includes(term));

      if (!isStateSpecific) {
        return false;
      }

      seen.add(key);
      return true;
    })
    .sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score;
      }

      return new Date(right.publishedAt).getTime() - new Date(left.publishedAt).getTime();
    });
}

function normalizeToArray<T>(value: T | T[] | undefined): T[] {
  if (!value) {
    return [];
  }

  return Array.isArray(value) ? value : [value];
}

function readText(value: unknown): string {
  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  if (value && typeof value === 'object') {
    const candidate = value as Record<string, unknown>;
    return readText(candidate['#text'] ?? candidate.text ?? candidate.value);
  }

  return '';
}

function cleanupText(text: string): string {
  return text
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function parsePublishedAt(value: string): Date | null {
  if (!value) {
    return null;
  }

  const published = new Date(value);
  return Number.isNaN(published.getTime()) ? null : published;
}
