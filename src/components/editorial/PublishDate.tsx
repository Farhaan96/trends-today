import {
  formatArticleDateWithWeekday,
  datesAreDifferent,
} from '@/lib/editorial';

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
  const showUpdated = datesAreDifferent(publishedAt, modifiedAt);
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
