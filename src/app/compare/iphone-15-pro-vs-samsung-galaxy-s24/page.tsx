import fs from 'fs';
import path from 'path';
import Link from 'next/link';

export const dynamic = 'force-static';

function loadData() {
  const p = path.join(process.cwd(), 'content', 'comparisons', 'iphone-15-pro-vs-samsung-galaxy-s24.json');
  try {
    const raw = fs.readFileSync(p, 'utf8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export default function Page() {
  const data = loadData();
  if (!data) {
    return (
      <main className="max-w-5xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">iPhone 15 Pro vs Samsung Galaxy S24</h1>
        <p className="text-gray-900">Comparison data not found. Return to <Link className="text-blue-600 underline" href="/compare">Comparisons</Link>.</p>
      </main>
    );
  }

  return (
    <main className="max-w-5xl mx-auto px-4 py-12">
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">iPhone 15 Pro vs Samsung Galaxy S24</h1>
      {data.summary && <p className="text-lg text-gray-900 mb-8">{data.summary}</p>}

      {Array.isArray(data.sections) && data.sections.length > 0 && (
        <div className="space-y-8">
          {data.sections.map((s: any, i: number) => (
            <section key={i}>
              {s.title && <h2 className="text-2xl font-bold text-gray-900 mb-2">{s.title}</h2>}
              {s.content && <p className="text-gray-900">{s.content}</p>}
              {Array.isArray(s.items) && (
                <ul className="list-disc pl-5 text-gray-900">
                  {s.items.map((it: string, j: number) => (
                    <li key={j}>{it}</li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>
      )}
    </main>
  );
}

