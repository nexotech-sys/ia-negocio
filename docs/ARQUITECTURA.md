# Arquitectura de Nexo Articles

## Estructura del Proyecto

```
ia-negocio/
├── .github/workflows/       # Automatizaciones GitHub Actions
│   ├── daily-agents.yml     # Cron diario: Sofia+Marco+Luna+Carlos+Tomas
│   └── weekly-health.yml    # Health check semanal
├── docs/                    # Documentacion
│   ├── ARQUITECTURA.md      # Este archivo
│   ├── AGENTES.md           # Detalle de cada agente IA
│   ├── TAREAS.md            # Tareas manuales vs automaticas
│   └── MONETIZACION.md      # Plan de monetizacion
├── logs/                    # Logs de ejecucion (gitignored)
├── public/
│   └── status.json          # Estado dinamico (actualizado por cron)
├── reports/                 # Reportes generados por agentes
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── agent-action/     # API para interaccion con agentes
│   │   │   ├── cron/daily-agents/ # Cron diario automatico
│   │   │   └── verify-integration/ # Verificacion de integraciones
│   │   ├── blog/[slug]/     # Paginas de articulos
│   │   ├── dashboard/       # Dashboard privado
│   │   └── page.tsx         # Homepage del blog
│   ├── components/          # Componentes React reutilizables
│   └── lib/
│       ├── agents.ts        # Definicion de agentes IA
│       ├── articles.ts      # Articulos base (10)
│       ├── articles-extra.ts # Batch 1 (5 articulos)
│       ├── articles-batch2.ts # Batch 2 (15 articulos)
│       ├── articles-batch3.ts # Batch 3 (10 articulos)
│       ├── articles-batch5-9.ts # Batches 5-9 (100 articulos)
│       └── auto-articles/   # Articulos generados por cron
├── .env.example             # Variables de entorno (template)
├── vercel.json              # Config de Vercel + cron
├── package.json
└── tsconfig.json
```

## Stack Tecnologico

- **Framework:** Next.js 16 (App Router)
- **Lenguaje:** TypeScript
- **Estilos:** Tailwind CSS 4
- **Hosting:** Vercel (Hobby plan)
- **IA:** Claude API (Anthropic)
- **Repositorio:** GitHub (nexotech-sys/ia-negocio)
- **SEO:** Google Search Console
- **Analytics:** Google Analytics 4

## Flujo de Datos

```
[Cron diario 9am]
    → Sofia (CEO) decide tema
    → Marco (Contenido) escribe articulo
    → Luna (SEO) optimiza meta tags
    → Carlos (Dev) publica en GitHub
    → Tomas (Ventas) sugiere afiliados
    → Sofia actualiza status.json (calendario + integraciones)
    → Vercel auto-deploya desde GitHub
```

## APIs

| Endpoint | Metodo | Descripcion |
|----------|--------|-------------|
| `/api/agent-action` | POST | Interactuar con cualquier agente |
| `/api/cron/daily-agents` | GET | Ejecutar cadena diaria de agentes |
| `/api/verify-integration` | POST | Verificar credenciales |
