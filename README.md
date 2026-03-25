# Nexo Articles

Blog SEO en espanol sobre Inteligencia Artificial para negocios, operado por 8 agentes IA autonomos.

**Sitio:** [ia-negocio.vercel.app](https://ia-negocio.vercel.app)
**Dashboard:** [ia-negocio.vercel.app/dashboard](https://ia-negocio.vercel.app/dashboard)

---

## Que es Nexo Articles

Un blog que genera trafico organico desde Google y se monetiza con AdSense + afiliados. El contenido es generado y optimizado por un equipo de 8 agentes IA que trabajan de forma autonoma.

## Equipo de Agentes IA

| Agente | Rol | Estado |
|--------|-----|--------|
| Sofia Navarro | CEO - Direccion estrategica | Activo |
| Marco Riquelme | Director de Contenido | Activo |
| Luna Ferreyra | Especialista SEO | Activo |
| Diego Paredes | Marketing Digital | Standby |
| Valentina Rossi | Finanzas | Standby |
| Carlos Mendez | Desarrollador | Activo |
| Ana Gutierrez | Analytics | Activo |
| Tomas Alvarez | Ventas y Afiliados | Activo |

## Instalacion

```bash
# Clonar el repositorio
git clone https://github.com/nexotech-sys/ia-negocio.git
cd ia-negocio

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus credenciales

# Correr en desarrollo
npm run dev
```

## Variables de Entorno

Ver `.env.example` para la lista completa. Las esenciales:

| Variable | Descripcion | Obligatoria |
|----------|-------------|-------------|
| `ANTHROPIC_API_KEY` | API key de Claude | Si (para agentes) |
| `GITHUB_TOKEN` | Token de GitHub | Si (para auto-publish) |
| `NEXT_PUBLIC_GA_ID` | Google Analytics ID | No |

## Estructura del Proyecto

```
src/
  app/
    api/
      agent-action/       # Interaccion con agentes IA
      cron/daily-agents/   # Cron diario automatico
      verify-integration/  # Verificacion de credenciales
    blog/[slug]/           # Articulos del blog
    dashboard/             # Dashboard privado con agentes
  lib/
    agents.ts              # Definicion de los 8 agentes
    articles*.ts           # 150+ articulos SEO
    auto-articles/         # Articulos generados por cron
docs/
  ARQUITECTURA.md          # Arquitectura del sistema
  AGENTES.md               # Detalle de cada agente
  TAREAS.md                # Tareas manuales vs automaticas
  MONETIZACION.md          # Plan de monetizacion
.github/workflows/
  daily-agents.yml         # Cron diario via GitHub Actions
  weekly-health.yml        # Health check semanal
```

## Automatizacion

### Diaria (9am Argentina)
- Sofia decide que articulo escribir
- Marco lo escribe completo
- Luna optimiza SEO
- Carlos lo publica en GitHub
- Tomas sugiere afiliados
- Sofia actualiza el calendario

### Semanal (lunes)
- Health check automatico del sitio
- Verificacion de APIs y URLs

## Documentacion

- [Arquitectura](docs/ARQUITECTURA.md)
- [Agentes IA](docs/AGENTES.md)
- [Tareas manuales vs automaticas](docs/TAREAS.md)
- [Plan de monetizacion](docs/MONETIZACION.md)

## Tech Stack

- Next.js 16 + TypeScript + Tailwind CSS 4
- Vercel (hosting gratuito)
- Claude API (agentes IA)
- GitHub Actions (automatizacion)
- Google Analytics 4 + Search Console

## Replicar para otro proyecto

Ver el archivo `PROMPT-DASHBOARD-COMPLETO.docx` en la raiz del workspace para instrucciones de como replicar este sistema en otro negocio.

---

Desarrollado por **Nexo Tech** | 2026
