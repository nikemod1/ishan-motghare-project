import { useEffect, useState } from 'react';
import { MapOfSvg } from 'india-map-svg';
import { formatDistanceToNowStrict, format } from 'date-fns';
import { buildSearchTerms, getStateProfile, stateProfiles } from './data/stateProfiles';
import { fetchStateNews, type NewsArticle, type StateNewsResponse } from './lib/news';

const DEFAULT_STATE_ID = 'MH';

export default function App() {
  const [selectedStateId, setSelectedStateId] = useState(DEFAULT_STATE_ID);
  const [newsState, setNewsState] = useState<{
    status: 'idle' | 'loading' | 'ready' | 'error';
    payload: StateNewsResponse | null;
    error: string | null;
  }>({
    status: 'idle',
    payload: null,
    error: null,
  });

  const selectedState = getStateProfile(selectedStateId) ?? stateProfiles[0];

  useEffect(() => {
    const controller = new AbortController();

    setNewsState((current) => ({
      ...current,
      status: 'loading',
      error: null,
    }));

    fetchStateNews(selectedState.id, controller.signal)
      .then((payload) => {
        setNewsState({
          status: 'ready',
          payload,
          error: null,
        });
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) {
          return;
        }

        setNewsState({
          status: 'error',
          payload: null,
          error: error instanceof Error ? error.message : 'Failed to load news.',
        });
      });

    return () => controller.abort();
  }, [selectedState.id]);

  const fillById = Object.fromEntries(
    stateProfiles.map((profile) => [profile.mapId, profile.mapId === selectedState.mapId ? '#f97316' : '#1c2940']),
  );

  const highlightTerms = buildSearchTerms(selectedState).slice(0, 4);

  return (
    <main className="app-shell">
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">India State News Atlas</p>
          <h1>Click a state, highlight it, and read the newest local news from the last 30 days.</h1>
          <p className="hero-text">
            The map uses interactive state boundaries. The news service ranks Google News RSS results by
            state and city keywords, then keeps only stories published inside the last month.
          </p>
          <div className="hero-stats">
            <article>
              <strong>{stateProfiles.length}</strong>
              <span>states ready</span>
            </article>
            <article>
              <strong>30</strong>
              <span>day news window</span>
            </article>
            <article>
              <strong>Top 5</strong>
              <span>articles per state</span>
            </article>
          </div>
        </div>
        <div className="hero-panel">
          <span className="panel-label">Selected state</span>
          <h2>{selectedState.name}</h2>
          <div className="detail-grid">
            <div>
              <span>Code</span>
              <strong>{selectedState.id}</strong>
            </div>
            <div>
              <span>Capital</span>
              <strong>{selectedState.capital}</strong>
            </div>
            <div>
              <span>Region</span>
              <strong>{selectedState.region}</strong>
            </div>
            <div>
              <span>Search terms</span>
              <strong>{highlightTerms.join(' • ')}</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="workspace-grid">
        <article className="map-card">
          <div className="card-header">
            <div>
              <p className="card-kicker">Interactive map</p>
              <h3>India state boundary view</h3>
            </div>
            <div className="legend">
              <span className="legend-item current">Selected</span>
              <span className="legend-item default">Available</span>
            </div>
          </div>
          <div className="map-frame">
            <MapOfSvg
              name="India"
              strokeColor="#46556f"
              strokeWidth={1}
              pathFillColor="#162238"
              hoverPathColor="#2b3f63"
              backgroundColor="transparent"
              fillById={fillById}
              autoFit={true}
              enableZoomPan={true}
              onPathClick={(_name, id) => {
                if (!id) {
                  return;
                }

                const profile = getStateProfile(id);
                if (profile) {
                  setSelectedStateId(profile.id);
                }
              }}
            />
          </div>
        </article>

        <aside className="news-card">
          <div className="card-header">
            <div>
              <p className="card-kicker">Live feed</p>
              <h3>{selectedState.name} news</h3>
            </div>
            {newsState.status === 'ready' && newsState.payload ? (
              <span className="updated-pill">
                Updated {formatDistanceToNowStrict(new Date(newsState.payload.generatedAt), { addSuffix: true })}
              </span>
            ) : null}
          </div>

          {newsState.status === 'loading' ? <LoadingState /> : null}
          {newsState.status === 'error' ? <ErrorState message={newsState.error ?? 'Unable to load news.'} /> : null}
          {newsState.status === 'ready' && newsState.payload ? (
            <NewsList payload={newsState.payload} />
          ) : null}

          <div className="news-footnote">
            <strong>Filtering rule</strong>
            <p>
              Articles must mention the selected state or one of its city keywords and must fall inside the
              previous 30 days.
            </p>
          </div>
        </aside>
      </section>
    </main>
  );
}

function LoadingState() {
  return (
    <div className="state-block">
      <div className="skeleton title" />
      <div className="skeleton line" />
      <div className="skeleton line short" />
      <div className="skeleton line" />
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="state-block state-error">
      <strong>Could not load articles</strong>
      <p>{message}</p>
      <p className="state-hint">Try another state or run the server again after the RSS feed recovers.</p>
    </div>
  );
}

function NewsList({ payload }: { payload: StateNewsResponse }) {
  if (payload.articles.length === 0) {
    return (
      <div className="state-block">
        <strong>No matching stories found yet.</strong>
        <p>
          The search terms for {payload.stateName} were too strict for the current window. Try a different
          state or relax the keyword filter in the server service.
        </p>
      </div>
    );
  }

  return (
    <div className="news-list">
      {payload.articles.map((article) => (
        <NewsItem key={`${article.link}-${article.publishedAt}`} article={article} />
      ))}
    </div>
  );
}

function NewsItem({ article }: { article: NewsArticle }) {
  return (
    <article className="news-item">
      <div className="news-topline">
        <span>{article.source}</span>
        <time dateTime={article.publishedAt}>{format(new Date(article.publishedAt), 'dd MMM yyyy')}</time>
      </div>
      <a href={article.link} target="_blank" rel="noreferrer">
        <h4>{article.title}</h4>
      </a>
      <p>{article.summary}</p>
      <div className="news-tags">
        {article.matchedTerms.slice(0, 4).map((term) => (
          <span key={term}>{term}</span>
        ))}
      </div>
    </article>
  );
}
