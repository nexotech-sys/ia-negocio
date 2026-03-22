import Link from "next/link";
import type { Article } from "@/lib/articles";

const categoryColors: Record<string, string> = {
  "Guías": "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  Herramientas:
    "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  Marketing:
    "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
  Ventas:
    "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
  "E-commerce": "bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300",
  Tendencias:
    "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
};

function formatDate(dateString: string): string {
  const date = new Date(dateString + "T00:00:00");
  return date.toLocaleDateString("es-AR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function ArticleCard({ article }: { article: Article }) {
  const colorClass =
    categoryColors[article.category] ||
    "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";

  return (
    <Link
      href={`/blog/${article.slug}`}
      className="group block rounded-xl border border-gray-200 bg-white p-6 transition-all hover:border-blue-300 hover:shadow-lg dark:border-gray-800 dark:bg-gray-900 dark:hover:border-blue-700"
    >
      <div className="flex items-center gap-3">
        <span
          className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${colorClass}`}
        >
          {article.category}
        </span>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {article.readTime} de lectura
        </span>
      </div>

      <h3 className="mt-3 text-lg font-semibold leading-snug text-gray-900 transition-colors group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
        {article.title}
      </h3>

      <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
        {article.description}
      </p>

      <div className="mt-4 flex items-center justify-between">
        <time
          dateTime={article.date}
          className="text-xs text-gray-500 dark:text-gray-500"
        >
          {formatDate(article.date)}
        </time>
        <span className="text-sm font-medium text-blue-600 transition-colors group-hover:text-blue-700 dark:text-blue-400 dark:group-hover:text-blue-300">
          Leer más &rarr;
        </span>
      </div>
    </Link>
  );
}
