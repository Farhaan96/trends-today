interface ArticleHighlightsProps {
  highlights?: string[];
}

export default function ArticleHighlights({
  highlights = [],
}: ArticleHighlightsProps) {
  const usableHighlights = highlights.filter(Boolean).slice(0, 5);

  if (usableHighlights.length === 0) return null;

  return (
    <aside
      className="article-highlights"
      aria-labelledby="article-highlights-title"
    >
      <p className="article-highlights__eyebrow">At a glance</p>
      <h2 id="article-highlights-title">What you need to know</h2>
      <ul>
        {usableHighlights.map((highlight) => (
          <li key={highlight}>{highlight}</li>
        ))}
      </ul>
    </aside>
  );
}
