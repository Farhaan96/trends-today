import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { getAllArticles } from '@/lib/article-utils'
import { getCategoryKey, getCategoryStyles, getCategoryDescription } from '@/lib/categories'

type Params = { category: string }

export function generateStaticParams() {
  const categories = ['science','culture','psychology','technology','health','mystery']
  return categories.map((c) => ({ category: c }))
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const key = getCategoryKey(params.category)
  const title = `${key.charAt(0).toUpperCase() + key.slice(1)} | Trends Today`
  const description = getCategoryDescription(key)
  return {
    title,
    description,
  }
}

export default async function CategoryPage({ params }: { params: Params }) {
  const key = getCategoryKey(params.category)
  const styles = getCategoryStyles(key)
  const description = getCategoryDescription(key)

  // Use category-based loader so pages work with content/science, content/culture, etc.
  const all = await getAllArticles()
  const posts = all.filter((p) => (p.category || p.frontmatter?.category || '').toString().toLowerCase() === key)

  const title = key.charAt(0).toUpperCase() + key.slice(1)

  return (
    <main className="bg-white">
      {/* Themed Category Header */}
      <section className={`border-b ${styles.headerBg}`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
          <div className="mb-3">
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${styles.badge}`}>
              {title}
            </span>
          </div>
          <h1 className="font-serif text-4xl font-extrabold tracking-tight text-gray-900">{title}</h1>
          {description && <p className="mt-2 text-gray-600">{description}</p>}
          <p className="mt-3 text-sm text-gray-500">{posts.length} {posts.length === 1 ? 'article' : 'articles'}</p>
        </div>
      </section>

      {/* Articles list */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        {posts.length === 0 ? (
          <p className="text-gray-600">No articles in this category yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((article) => {
              const href = `/${key}/${article.slug}`
              const img = (article.image || article.frontmatter?.image) as string | undefined
              const atitle = (article.title || article.frontmatter?.title) as string
              const date = new Date(
                (article.publishedAt || article.frontmatter?.publishedAt || new Date().toISOString()) as string
              ).toLocaleDateString()
              return (
                <article key={href} className="group">
                  <Link href={href}>
                    <div className="relative w-full aspect-[16/9] bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                      {img ? (
                        <Image src={img} alt={atitle} fill className="object-cover transition-transform duration-300 group-hover:scale-105" sizes="(max-width: 1024px) 100vw, 33vw" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">Image</div>
                      )}
                      <div className="absolute top-3 left-3">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wide ${styles.badge}`}>
                          {key}
                        </span>
                      </div>
                    </div>
                  </Link>
                  <Link href={href}>
                    <h2 className="mt-3 text-lg font-bold text-gray-900 group-hover:text-gray-800 leading-snug">
                      {atitle}
                    </h2>
                  </Link>
                  <div className="text-sm text-gray-500">{date}</div>
                </article>
              )
            })}
          </div>
        )}
      </section>
    </main>
  )
}
