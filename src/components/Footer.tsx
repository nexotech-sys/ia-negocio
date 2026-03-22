import Link from "next/link";

const categoryLinks = [
  { href: "/blog/que-es-la-inteligencia-artificial", label: "Guías" },
  { href: "/blog/mejores-herramientas-ia-gratis", label: "Herramientas" },
  { href: "/blog/ia-para-marketing-digital", label: "Marketing" },
  { href: "/blog/ia-para-ventas", label: "Ventas" },
  { href: "/blog/ia-para-ecommerce", label: "E-commerce" },
  { href: "/blog/futuro-ia-negocios-2026", label: "Tendencias" },
];

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-950">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2">
              <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                Nexo
              </span>
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                Articles
              </span>
            </Link>
            <p className="mt-3 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
              Tu recurso en español sobre inteligencia artificial aplicada a los
              negocios. Guías prácticas, herramientas y estrategias para
              emprendedores que quieren crecer con IA.
            </p>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-900 dark:text-white">
              Categorías
            </h3>
            <ul className="mt-3 space-y-2">
              {categoryLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-600 transition-colors hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* About */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-900 dark:text-white">
              Sobre Nosotros
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
              Somos un equipo apasionado por la tecnología y los negocios.
              Creamos contenido práctico y accesible para que emprendedores de
              habla hispana puedan aprovechar el poder de la inteligencia
              artificial.
            </p>
          </div>
        </div>

        <div className="mt-10 border-t border-gray-200 pt-6 dark:border-gray-800">
          <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
            <p className="text-xs text-gray-500 dark:text-gray-500">
              &copy; 2026 Nexo Articles. Todos los derechos reservados.
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-600">
              Algunos links son de afiliados. Esto no afecta nuestras
              recomendaciones.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
