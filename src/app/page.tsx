"use client";

import Link from "next/link";
import { getAllArticles } from "@/lib/articles";
import ArticleCard from "@/components/ArticleCard";
import { useState, useEffect, useRef } from "react";

const categories = [
  { name: "Guias", description: "Fundamentos de IA aplicada", slug: "que-es-la-inteligencia-artificial", icon: "📘" },
  { name: "Herramientas", description: "Software y plataformas de IA", slug: "mejores-herramientas-ia-gratis", icon: "🛠" },
  { name: "Marketing", description: "Estrategias digitales con IA", slug: "ia-para-marketing-digital", icon: "📣" },
  { name: "Ventas", description: "Automatizacion comercial", slug: "ia-para-ventas", icon: "💰" },
  { name: "E-commerce", description: "IA para tiendas online", slug: "ia-para-ecommerce", icon: "🛒" },
  { name: "Tendencias", description: "El futuro de la IA", slug: "futuro-ia-negocios-2026", icon: "🔮" },
];

const typingPhrases = [
  "para tu negocio",
  "para emprendedores",
  "para freelancers",
  "para startups",
  "para el futuro",
  "en espanol",
];

function useTypewriter(phrases: string[], typingSpeed = 80, deletingSpeed = 40, pauseTime = 2000) {
  const [text, setText] = useState("");
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentPhrase = phrases[phraseIndex];

    const timeout = setTimeout(() => {
      if (!isDeleting) {
        setText(currentPhrase.slice(0, text.length + 1));
        if (text.length === currentPhrase.length) {
          setTimeout(() => setIsDeleting(true), pauseTime);
        }
      } else {
        setText(currentPhrase.slice(0, text.length - 1));
        if (text.length === 0) {
          setIsDeleting(false);
          setPhraseIndex((prev) => (prev + 1) % phrases.length);
        }
      }
    }, isDeleting ? deletingSpeed : typingSpeed);

    return () => clearTimeout(timeout);
  }, [text, isDeleting, phraseIndex, phrases, typingSpeed, deletingSpeed, pauseTime]);

  return text;
}

export default function Home() {
  const allArticles = getAllArticles();
  const featuredArticles = allArticles.slice(0, 6);
  const typedText = useTypewriter(typingPhrases);
  const tickerRef = useRef<HTMLDivElement>(null);
  const [scrollY, setScrollY] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Article ticker - auto scroll
  const [tickerOffset, setTickerOffset] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setTickerOffset((prev) => prev - 1);
    }, 30);
    return () => clearInterval(interval);
  }, []);

  const articleCount = allArticles.length;

  return (
    <>
      {/* ====== HERO ====== */}
      <section className="relative overflow-hidden bg-gray-950 px-4 py-20 sm:px-6 sm:py-32">
        {/* Animated background grid */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }} />

        {/* Gradient orbs */}
        <div className="absolute top-20 left-[10%] h-72 w-72 rounded-full bg-blue-600/10 blur-[100px]" style={{ transform: `translateY(${scrollY * 0.1}px)` }} />
        <div className="absolute bottom-10 right-[10%] h-72 w-72 rounded-full bg-purple-600/10 blur-[100px]" style={{ transform: `translateY(${-scrollY * 0.05}px)` }} />

        <div className="relative mx-auto max-w-5xl text-center">
          {/* Badge */}
          <div className={`inline-flex items-center gap-2 rounded-full border border-gray-700/50 bg-gray-900/80 px-4 py-1.5 text-xs font-medium text-gray-400 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
            </span>
            {articleCount} articulos publicados y creciendo
          </div>

          {/* Main title with typewriter */}
          <h1 className={`mt-8 text-5xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-6xl lg:text-7xl transition-all duration-700 delay-100 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            <span className="block">Articulos de IA</span>
            <span className="mt-2 block bg-gradient-to-r from-blue-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
              {typedText}
              <span className="animate-pulse text-blue-400">|</span>
            </span>
          </h1>

          <p className={`mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-gray-400 sm:text-xl transition-all duration-700 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            Contenido especializado en inteligencia artificial aplicada a negocios.
            Guias practicas, analisis de herramientas y estrategias. Todo en espanol.
          </p>

          {/* Stats row */}
          <div className={`mt-10 flex items-center justify-center gap-8 sm:gap-12 transition-all duration-700 delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            <div className="text-center">
              <p className="text-3xl font-bold text-white">{articleCount}+</p>
              <p className="mt-1 text-xs text-gray-500 uppercase tracking-wider">Articulos</p>
            </div>
            <div className="h-8 w-px bg-gray-800" />
            <div className="text-center">
              <p className="text-3xl font-bold text-white">6</p>
              <p className="mt-1 text-xs text-gray-500 uppercase tracking-wider">Categorias</p>
            </div>
            <div className="h-8 w-px bg-gray-800" />
            <div className="text-center">
              <p className="text-3xl font-bold text-white">24/7</p>
              <p className="mt-1 text-xs text-gray-500 uppercase tracking-wider">Online</p>
            </div>
          </div>

          {/* CTA */}
          <div className={`mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row transition-all duration-700 delay-[400ms] ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            <Link
              href={`/blog/${allArticles[0]?.slug || 'que-es-la-inteligencia-artificial'}`}
              className="group inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 text-sm font-semibold text-gray-900 shadow-lg shadow-white/10 transition-all hover:shadow-white/20 hover:scale-[1.02]"
            >
              Leer ultimo articulo
              <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
            </Link>
            <Link
              href="#categorias"
              className="inline-flex items-center gap-2 rounded-xl border border-gray-700 px-7 py-3.5 text-sm font-semibold text-gray-300 transition-all hover:border-gray-500 hover:text-white"
            >
              Explorar categorias
            </Link>
          </div>
        </div>
      </section>

      {/* ====== ARTICLE TICKER ====== */}
      <section className="overflow-hidden border-y border-gray-800 bg-gray-900/50 py-4">
        <div className="relative" ref={tickerRef}>
          <div
            className="flex gap-6 whitespace-nowrap"
            style={{ transform: `translateX(${tickerOffset}px)` }}
          >
            {[...allArticles.slice(0, 20), ...allArticles.slice(0, 20)].map((article, i) => (
              <Link
                key={`${article.slug}-${i}`}
                href={`/blog/${article.slug}`}
                className="inline-flex items-center gap-2 rounded-full border border-gray-800 bg-gray-900 px-4 py-1.5 text-xs text-gray-400 transition-colors hover:border-blue-600 hover:text-blue-400"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                {article.title.length > 45 ? article.title.slice(0, 43) + '..' : article.title}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ====== FEATURED ARTICLES ====== */}
      <section className="bg-gray-950 px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-blue-500">Destacados</p>
              <h2 className="mt-2 text-3xl font-bold text-white">
                Lo mas reciente
              </h2>
            </div>
            <Link href="#todos" className="hidden text-sm font-medium text-gray-400 transition-colors hover:text-white sm:block">
              Ver todos →
            </Link>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featuredArticles.map((article, i) => (
              <Link
                key={article.slug}
                href={`/blog/${article.slug}`}
                className="group relative overflow-hidden rounded-2xl border border-gray-800 bg-gray-900/60 p-6 transition-all duration-300 hover:border-gray-700 hover:bg-gray-900/80 hover:shadow-xl hover:shadow-blue-500/5"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                {/* Category badge */}
                <span className="inline-block rounded-full bg-blue-500/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-blue-400">
                  {article.category}
                </span>
                {/* Title */}
                <h3 className="mt-4 text-lg font-bold leading-snug text-white transition-colors group-hover:text-blue-400">
                  {article.title}
                </h3>
                {/* Meta */}
                <div className="mt-4 flex items-center gap-3 text-xs text-gray-500">
                  <span>{article.readTime} de lectura</span>
                  <span className="h-1 w-1 rounded-full bg-gray-700" />
                  <span>{new Date(article.date).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })}</span>
                </div>
                {/* Description */}
                <p className="mt-3 text-sm leading-relaxed text-gray-500 line-clamp-2">
                  {article.description}
                </p>
                {/* Arrow */}
                <div className="mt-4 flex items-center gap-1 text-xs font-medium text-blue-500 opacity-0 transition-opacity group-hover:opacity-100">
                  Leer articulo <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ====== CATEGORIES ====== */}
      <section id="categorias" className="border-t border-gray-800 bg-gray-900/30 px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-purple-500">Categorias</p>
          <h2 className="mt-2 text-3xl font-bold text-white">
            Explora por tema
          </h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((cat) => (
              <Link
                key={cat.name}
                href={`/blog/${cat.slug}`}
                className="group flex items-start gap-4 rounded-2xl border border-gray-800 bg-gray-900/40 p-5 transition-all duration-300 hover:border-gray-600 hover:bg-gray-900/70"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gray-800 text-2xl transition-transform group-hover:scale-110">
                  {cat.icon}
                </span>
                <div>
                  <h3 className="text-base font-bold text-white group-hover:text-blue-400 transition-colors">
                    {cat.name}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {cat.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ====== NEWSLETTER ====== */}
      <section className="border-t border-gray-800 px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-xl text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-emerald-500">Newsletter</p>
          <h2 className="mt-3 text-3xl font-bold text-white">
            Recibí lo nuevo cada semana
          </h2>
          <p className="mt-4 text-sm text-gray-400">
            Un resumen semanal con los mejores articulos, herramientas y estrategias de IA para tu negocio.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <input
              type="email"
              placeholder="tu@email.com"
              className="w-full rounded-xl border border-gray-700 bg-gray-900 px-4 py-3 text-sm text-white placeholder:text-gray-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:max-w-xs"
              aria-label="Email para newsletter"
            />
            <button
              type="button"
              className="w-full rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-500 sm:w-auto"
            >
              Suscribirme
            </button>
          </div>
        </div>
      </section>

      {/* ====== ALL ARTICLES ====== */}
      <section id="todos" className="border-t border-gray-800 bg-gray-900/30 px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-blue-500">Biblioteca</p>
              <h2 className="mt-2 text-3xl font-bold text-white">
                Todos los articulos
              </h2>
              <p className="mt-2 text-sm text-gray-500">{articleCount} articulos disponibles</p>
            </div>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {allArticles.map((article) => (
              <Link
                key={article.slug}
                href={`/blog/${article.slug}`}
                className="group rounded-xl border border-gray-800 bg-gray-900/40 p-5 transition-all duration-200 hover:border-gray-700 hover:bg-gray-900/70"
              >
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-blue-500/10 px-2 py-0.5 text-[10px] font-semibold text-blue-400">{article.category}</span>
                  <span className="text-[10px] text-gray-600">{article.readTime}</span>
                </div>
                <h3 className="mt-3 text-sm font-semibold leading-snug text-gray-200 transition-colors group-hover:text-white">
                  {article.title}
                </h3>
                <p className="mt-2 text-xs text-gray-600 line-clamp-2">{article.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
