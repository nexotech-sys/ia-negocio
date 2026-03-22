import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllArticles, getArticleBySlug } from "@/lib/articles";
import ArticleCard from "@/components/ArticleCard";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const articles = getAllArticles();
  return articles.map((article) => ({
    slug: article.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticleBySlug(slug);

  if (!article) {
    return {
      title: "Artículo no encontrado",
    };
  }

  return {
    title: article.metaTitle,
    description: article.metaDescription,
    keywords: article.tags,
    openGraph: {
      title: article.metaTitle,
      description: article.metaDescription,
      type: "article",
      publishedTime: article.date,
      authors: ["Equipo IA Negocio"],
      tags: article.tags,
      locale: "es_AR",
      siteName: "IA Negocio",
    },
    twitter: {
      card: "summary_large_image",
      title: article.metaTitle,
      description: article.metaDescription,
    },
  };
}

function formatDate(dateString: string): string {
  const date = new Date(dateString + "T00:00:00");
  return date.toLocaleDateString("es-AR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  const allArticles = getAllArticles();
  const relatedArticles = allArticles
    .filter(
      (a) =>
        a.slug !== article.slug &&
        (a.category === article.category ||
          a.tags.some((tag) => article.tags.includes(tag)))
    )
    .slice(0, 3);

  const shareUrl = `https://ianegocio.com/blog/${article.slug}`;
  const shareText = encodeURIComponent(article.title);

  return (
    <div className="px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-6xl">
        {/* Breadcrumbs */}
        <nav className="mb-6 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <Link
            href="/"
            className="transition-colors hover:text-blue-600 dark:hover:text-blue-400"
          >
            Inicio
          </Link>
          <span>/</span>
          <span className="text-gray-700 dark:text-gray-300">
            {article.category}
          </span>
          <span>/</span>
          <span className="truncate text-gray-900 dark:text-white">
            {article.title}
          </span>
        </nav>

        <div className="flex flex-col gap-10 lg:flex-row">
          {/* Main content */}
          <article className="min-w-0 flex-1">
            {/* Article header */}
            <header className="mb-8">
              <span className="inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                {article.category}
              </span>
              <h1 className="mt-3 text-3xl font-bold leading-tight tracking-tight text-gray-900 sm:text-4xl dark:text-white">
                {article.title}
              </h1>
              <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                <time dateTime={article.date}>{formatDate(article.date)}</time>
                <span>{article.readTime} de lectura</span>
              </div>
            </header>

            {/* Article body */}
            <div
              className="prose prose-gray max-w-none dark:prose-invert prose-headings:scroll-mt-20 prose-headings:font-bold prose-h2:mt-10 prose-h2:text-2xl prose-h3:mt-6 prose-h3:text-xl prose-p:leading-relaxed prose-a:text-blue-600 prose-li:leading-relaxed dark:prose-a:text-blue-400"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />

            {/* Tags */}
            <div className="mt-10 border-t border-gray-200 pt-6 dark:border-gray-800">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                Etiquetas
              </h3>
              <div className="mt-2 flex flex-wrap gap-2">
                {article.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Share buttons */}
            <div className="mt-6 border-t border-gray-200 pt-6 dark:border-gray-800">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                Compartir
              </h3>
              <div className="mt-2 flex gap-3">
                <a
                  href={`https://twitter.com/intent/tweet?text=${shareText}&url=${encodeURIComponent(shareUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
                >
                  Twitter / X
                </a>
                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
                >
                  LinkedIn
                </a>
                <a
                  href={`https://api.whatsapp.com/send?text=${shareText}%20${encodeURIComponent(shareUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
                >
                  WhatsApp
                </a>
              </div>
            </div>

            {/* Author */}
            <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-6 dark:border-gray-800 dark:bg-gray-900">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-lg font-bold text-white">
                  IA
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    Equipo IA Negocio
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Creamos contenido práctico sobre inteligencia artificial para
                    emprendedores de habla hispana.
                  </p>
                </div>
              </div>
            </div>

            {/* Back link */}
            <div className="mt-8">
              <Link
                href="/"
                className="inline-flex items-center text-sm font-medium text-blue-600 transition-colors hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >
                &larr; Volver al inicio
              </Link>
            </div>
          </article>

          {/* Sidebar */}
          <aside className="w-full shrink-0 lg:w-80">
            <div className="sticky top-8">
              {relatedArticles.length > 0 && (
                <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Artículos relacionados
                  </h3>
                  <div className="mt-4 flex flex-col gap-4">
                    {relatedArticles.map((related) => (
                      <Link
                        key={related.slug}
                        href={`/blog/${related.slug}`}
                        className="group block"
                      >
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {related.category}
                        </span>
                        <h4 className="mt-1 text-sm font-medium leading-snug text-gray-900 transition-colors group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
                          {related.title}
                        </h4>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Newsletter sidebar CTA */}
              <div className="mt-6 rounded-xl bg-blue-600 p-6 text-white dark:bg-blue-700">
                <h3 className="text-lg font-semibold">
                  Newsletter de IA Negocio
                </h3>
                <p className="mt-2 text-sm text-blue-100">
                  Recibí guías y herramientas de IA en tu email cada semana.
                </p>
                <div className="mt-4">
                  <input
                    type="email"
                    placeholder="Tu email"
                    className="w-full rounded-lg border-0 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-white"
                    aria-label="Email para newsletter"
                  />
                  <button
                    type="button"
                    className="mt-2 w-full rounded-lg bg-white px-4 py-2 text-sm font-semibold text-blue-600 transition-colors hover:bg-blue-50"
                  >
                    Suscribirme
                  </button>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
