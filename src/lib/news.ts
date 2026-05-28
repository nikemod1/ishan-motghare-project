export interface NewsArticle {
  title: string;
  summary: string;
  source: string;
  link: string;
  publishedAt: string;
  matchedTerms: string[];
  score: number;
  queryTerm: string;
}

export interface StateNewsResponse {
  stateId: string;
  stateName: string;
  generatedAt: string;
  windowDays: number;
  articles: NewsArticle[];
  queryTerms: string[];
  coverageNote: string;
}

export async function fetchStateNews(stateId: string, signal?: AbortSignal): Promise<StateNewsResponse> {
  const response = await fetch(`/api/news?state=${encodeURIComponent(stateId)}`, { signal });

  if (!response.ok) {
    const fallbackMessage = `Unable to load news for ${stateId}`;
    const errorBody = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(errorBody?.error ?? fallbackMessage);
  }

  return response.json() as Promise<StateNewsResponse>;
}
