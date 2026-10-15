import { formatArticleDateWithWeekday } from '@/lib/editorial';

interface PublishDateProps {
  publishedAt?: string;
  modifiedAt?: string;
  className?: string;
}

/**
 * Displays a clear, prominent publish date on article pages.
 * Shows "Published Mon, Sep 8, 2026" format.
 * If modifiedAt differs from publishedAt, also shows "Updated ..." date.
 */
export default function PublishDate({
  publishedAt,
  modifiedAt,
  className = '',
}: PublishDateProps) {
  if (!publishedAt) return null;

  const formattedPublishDate = formatArticleDateWithWeekday(publishedAt);
  const publishedTime = Date.parse(publishedAt);
  const modifiedTime = modifiedAt ? Date.parse(modifiedAt) : Number.NaN;
  const showUpdated =
    Number.isFinite(publishedTime) &&
    Number.isFinite(modifiedTime) &&
    publishedTime !== modifiedTime;
  const formattedModifiedDate = showUpdated
    ? formatArticleDateWithWeekday(modifiedAt)
    : null;

  return (
    <div className={`publish-date ${className}`}>
      <time dateTime={publishedAt} className="publish-date__published">
        Published {formattedPublishDate}
      </time>
      {showUpdated && formattedModifiedDate && (
        <time dateTime={modifiedAt} className="publish-date__updated">
          Updated {formattedModifiedDate}
        </time>
      )}
    </div>
  );
}
