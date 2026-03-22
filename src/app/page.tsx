import Link from "next/link";
import { getAllArticles } from "@/lib/articles";
import ArticleCard from "@/components/ArticleCard";

const categories = [
  {
    name: "Guías",
    description: "Aprendé los fundamentos de la IA para negocios",
    slug: "que-es-la-inteligencia-artificial",
    icon: "📘",
  },
  {
    name: "Herramientas",
    description: "Las mejores herramientas de IA del mercado",
    slug: "mejores-herramientas-ia-gratis",
    icon: "🛠",
  },
  {
    name: "Marketing",
    description: "Potenciá tu marketing digital con IA",
    slug: "ia-para-marketing-digital",
    icon: "📣",
  },
  {
    name: "Ventas",
    description: "Vendé más con inteligencia artificial",
    slug: "ia-para-ventas",
    icon: "💰",
  },
  {
    name: "E-commerce",
    description: "IA para tiendas online",
    slug: "ia-para-ecommerce",
    icon: "🛒",
  },
  {
    name: "Tendencias",
    description: "El futuro de la IA en los negocios",
    slug: "futuro-ia-negocios-2026",
    icon: "🔮",
  },
];

export default function Home() {
  const allArticles = getAllArticles();
  const featuredArticles = allArticles.slice(0, 3);

  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-blue-50 to-white px-4 py-16 sm:px-6 sm:py-24 dark:from-gray-900 dark:to-gray-950">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-4xl font-bold leading-tight tracking-tight text-gray-900 sm:text-5xl lg:text-6xl dark:text-white">
            Inteligencia Artificial{" "}
            <span className="text-blue-600 dark:text-blue-400">
              para tu Negocio
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-gray-600 sm:text-xl dark:text-gray-300">
            Guías prácticas, herramientas y estrategias para emprendedores que
            quieren transformar sus negocios con IA. Todo en español, sin
            tecnicismos innecesarios.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/blog/que-es-la-inteligencia-artificial"
              className="inline-flex items-center rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
            >
              Empezar a aprender
            </Link>
            <Link
              href="/blog/mejores-herramientas-ia-gratis"
              className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-700 shadow-sm transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
            >
              Ver herramientas gratuitas
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Articles */}
      <section className="px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl dark:text-white">
            Artículos destacados
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Lo más reciente sobre IA aplicada a los negocios
          </p>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featuredArticles.map((article) => (
              <ArticleCard key={article.slug} article={article} />
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="bg-gray-50 px-4 py-16 sm:px-6 dark:bg-gray-900">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl dark:text-white">
            Explorá por categoría
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Encontrá el contenido que más te sirve
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((cat) => (
              <Link
                key={cat.name}
                href={`/blog/${cat.slug}`}
                className="group rounded-xl border border-gray-200 bg-white p-5 transition-all hover:border-blue-300 hover:shadow-md dark:border-gray-800 dark:bg-gray-900 dark:hover:border-blue-700"
              >
                <span className="text-2xl">{cat.icon}</span>
                <h3 className="mt-2 text-lg font-semibold text-gray-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
                  {cat.name}
                </h3>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  {cat.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-2xl rounded-2xl bg-blue-600 px-6 py-10 text-center sm:px-12 dark:bg-blue-700">
          <h2 className="text-2xl font-bold text-white sm:text-3xl">
            Recibí las últimas novedades de IA
          </h2>
          <p className="mt-3 text-blue-100">
            Suscribite a nuestro newsletter semanal con las mejores guías,
            herramientas y estrategias de IA para tu negocio.
          </p>
          <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <input
              type="email"
              placeholder="Tu email"
              className="w-full rounded-lg border-0 px-4 py-3 text-sm text-gray-900 shadow-sm placeholder:text-gray-500 focus:ring-2 focus:ring-white sm:max-w-xs"
              aria-label="Email para newsletter"
            />
            <button
              type="button"
              className="w-full rounded-lg bg-white px-6 py-3 text-sm font-semibold text-blue-600 shadow-sm transition-colors hover:bg-blue-50 sm:w-auto"
            >
              Suscribirme
            </button>
          </div>
          <p className="mt-3 text-xs text-blue-200">
            Sin spam. Podés desuscribirte en cualquier momento.
          </p>
        </div>
      </section>

      {/* All Articles */}
      <section className="bg-gray-50 px-4 py-16 sm:px-6 dark:bg-gray-900">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl dark:text-white">
            Todos los artículos
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Explorá nuestra biblioteca completa de guías sobre IA
          </p>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {allArticles.map((article) => (
              <ArticleCard key={article.slug} article={article} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
