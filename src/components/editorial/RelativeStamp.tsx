'use client';

import { useEffect, useState } from 'react';
import { formatRelativeUpdate } from '@/lib/freshness';

export default function RelativeStamp({
  iso,
  absolute,
}: {
  iso: string;
  absolute: string;
}) {
  const [label, setLabel] = useState(absolute);

  useEffect(() => {
    const next = formatRelativeUpdate(iso, new Date());
    if (next) setLabel(next);
  }, [absolute, iso]);

  return <time dateTime={iso}>{label}</time>;
}
