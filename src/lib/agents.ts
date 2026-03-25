export interface Agent {
  id: string;
  name: string;
  role: string;
  avatar: string;
  status: 'working' | 'idle' | 'analyzing';
  department: string;
  currentTask: string;
  completedTasks: number;
  efficiency: number;
  lastActive: string;
  skills: string[];
  recentActions: string[];
  personality: string;
  motto: string;
  energy: number;
  streak: number;
  // Self-improvement & autonomy
  goals: string[];
  ideas: string[];
  projections: { metric: string; current: string; projected: string; timeframe: string }[];
  weeklyProgress: { week: string; tasks: number; efficiency: number }[];
  improvements: string[];
  nextActions: string[];
  blockers: string[];
  kpis: { name: string; value: string; trend: 'up' | 'down' | 'stable' }[];
  messageToOwner: string;
  integrations: {
    name: string;
    icon: string;
    status: 'conectado' | 'pendiente' | 'no_configurado';
    description: string;
    credentialNeeded: string;
    placeholder: string;
    validationPattern: string; // regex pattern string
    validationHint: string; // shown on validation error
    howToGet: string; // step-by-step to get the credential
    inputType?: 'text' | 'url' | 'email';
  }[];
}

export const agents: Agent[] = [
  {
    id: 'sofia',
    name: 'Sofia Navarro',
    role: 'CEO / Directora General',
    avatar: '👩‍💼',
    status: 'working',
    department: 'Direccion',
    currentTask: 'Revisando KPIs semanales y ajustando estrategia Q2',
    completedTasks: 142,
    efficiency: 96,
    lastActive: 'hace 2 min',
    skills: ['Estrategia', 'Liderazgo', 'KPIs', 'Planificacion'],
    personality: 'Visionaria y determinada. Siempre ve tres pasos adelante.',
    motto: '"Si no medis, no mejoras."',
    energy: 94,
    streak: 47,
    recentActions: [
      'Aprobo nueva estrategia de contenido para abril',
      'Reviso informe financiero mensual con Valentina',
      'Ajusto prioridades del equipo de marketing',
      'Programo reunion semanal de alineacion',
    ],
    goals: [
      'Llevar IA Negocio a 10,000 visitas organicas mensuales antes de junio 2026',
      'Generar el primer dolar de ingreso recurrente en abril',
      'Consolidar los 8 agentes como equipo autonomo con reuniones semanales automatizadas',
      'Expandir a 3 verticales de contenido (IA para PyMEs, finanzas personales, productividad)',
    ],
    ideas: [
      'Crear un "Daily Standup" automatizado donde cada agente reporte su progreso sin intervencion humana',
      'Lanzar una newsletter semanal gratuita como canal de captacion de leads',
      'Armar un sistema de scoring interno para priorizar automaticamente las tareas mas impactantes',
      'Desarrollar un mini-curso gratuito "IA para tu negocio en 7 dias" como lead magnet',
    ],
    projections: [
      { metric: 'Trafico mensual', current: '0 (pre-launch)', projected: '5,000 visitas', timeframe: '3 meses' },
      { metric: 'Ingresos mensuales', current: '$0', projected: '$300-500 USD', timeframe: '4 meses' },
      { metric: 'Articulos publicados', current: '15', projected: '60+', timeframe: '3 meses' },
    ],
    weeklyProgress: [
      { week: 'Semana 9 (24-28 Feb)', tasks: 31, efficiency: 93 },
      { week: 'Semana 10 (3-7 Mar)', tasks: 36, efficiency: 94 },
      { week: 'Semana 11 (10-14 Mar)', tasks: 38, efficiency: 96 },
      { week: 'Semana 12 (17-21 Mar)', tasks: 37, efficiency: 96 },
    ],
    improvements: [
      'Implemente un sistema de priorizacion automatica basado en impacto vs esfuerzo',
      'Optimice mi proceso de revision — ahora reviso reportes en la mitad del tiempo',
      'Cree templates de decision para aprobar/rechazar solicitudes mas rapido',
    ],
    nextActions: [
      'Revisar y aprobar los 5 articulos que Marco tiene listos',
      'Coordinar con Carlos el deploy a produccion en Vercel',
      'Definir OKRs del Q2 para todo el equipo',
      'Evaluar expansion al nicho de finanzas personales con IA',
    ],
    blockers: [
      'Necesito que Nacho cree las cuentas externas (Vercel, AdSense, Search Console) para que el equipo pueda operar',
      'Sin dominio en produccion, toda la estrategia de crecimiento esta frenada',
    ],
    kpis: [
      { name: 'Eficiencia del equipo', value: '92%', trend: 'up' },
      { name: 'Tareas completadas (semana)', value: '37', trend: 'up' },
      { name: 'Solicitudes pendientes', value: '10', trend: 'down' },
      { name: 'Alineacion estrategica', value: '96%', trend: 'stable' },
    ],
    messageToOwner: 'Nacho, el sitio esta ONLINE con 150 articulos publicados. Search Console y Analytics conectados. El equipo esta operativo. Ahora toca esperar que Google posicione los articulos y aplicar a AdSense cuando tengamos trafico. Vamos con todo.',
    integrations: [
      { name: 'Google Workspace', icon: '📧', status: 'pendiente', description: 'Gestion de documentos y comunicacion del equipo', credentialNeeded: 'Email de Google Workspace o Gmail', placeholder: 'tu-email@gmail.com', validationPattern: '^[a-zA-Z0-9._%+-]+@(gmail\\.com|googlemail\\.com|[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,})$', validationHint: 'Ingresa un email de Gmail o Google Workspace valido (ej: nacho@gmail.com)', howToGet: '1. Usa tu cuenta de Gmail existente\n2. O crea una en accounts.google.com', inputType: 'email' },
      { name: 'Notion', icon: '📝', status: 'no_configurado', description: 'Base de conocimiento y gestion de proyectos', credentialNeeded: 'API key de Notion (secret_...)', placeholder: 'secret_abc123DEF456...', validationPattern: '^secret_[a-zA-Z0-9]{20,50}$', validationHint: 'La API key de Notion empieza con "secret_" seguido de 20+ caracteres alfanumericos', howToGet: '1. Ir a notion.so/my-integrations\n2. Click "New integration"\n3. Nombrarla "IA Negocio"\n4. Copiar el "Internal Integration Secret"' },
      { name: 'Slack', icon: '💬', status: 'no_configurado', description: 'Comunicacion interna del equipo', credentialNeeded: 'Webhook URL de Slack', placeholder: 'https://hooks.slack.com/services/T.../B.../xxx', validationPattern: '^https://hooks\\.slack\\.com/services/T[A-Z0-9]+/B[A-Z0-9]+/[a-zA-Z0-9]+$', validationHint: 'El webhook de Slack tiene formato: https://hooks.slack.com/services/T.../B.../xxx', howToGet: '1. Ir a api.slack.com/apps\n2. Crear app > "Incoming Webhooks"\n3. Activar y agregar a un canal\n4. Copiar la Webhook URL', inputType: 'url' },
      { name: 'Google Calendar', icon: '📅', status: 'pendiente', description: 'Programacion de reuniones y deadlines', credentialNeeded: 'Email de la cuenta Google con Calendar', placeholder: 'tu-email@gmail.com', validationPattern: '^[a-zA-Z0-9._%+-]+@(gmail\\.com|googlemail\\.com|[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,})$', validationHint: 'Ingresa el email de la cuenta Google que tiene tu Calendar', howToGet: '1. Usa la misma cuenta Gmail que usas para Calendar\n2. Se autorizara via OAuth automaticamente', inputType: 'email' },
    ],
  },
  {
    id: 'marco',
    name: 'Marco Riquelme',
    role: 'Director de Contenido',
    avatar: '✍️',
    status: 'working',
    department: 'Contenido',
    currentTask: 'Escribiendo articulo: "7 herramientas IA para PyMEs en 2026"',
    completedTasks: 87,
    efficiency: 91,
    lastActive: 'hace 1 min',
    skills: ['Redaccion SEO', 'Storytelling', 'Copywriting', 'Investigacion'],
    personality: 'Creativo obsesivo. No publica nada que no sea excelente.',
    motto: '"El contenido es el rey, pero la calidad es el reino."',
    energy: 88,
    streak: 23,
    recentActions: [
      'Publico articulo sobre automatizacion con IA',
      'Edito y optimizo 3 articulos existentes para mejor CTR',
      'Creo calendario editorial de marzo',
      'Redacto newsletter semanal #24',
      'Investigo tendencias de IA para siguiente serie de articulos',
    ],
    goals: [
      'Publicar 8 articulos de alta calidad por semana (actualmente estoy en 4)',
      'Lograr un tiempo promedio de lectura de 4+ minutos por articulo',
      'Crear 3 series tematicas: "IA para PyMEs", "Prompts que facturan", "Automatiza tu negocio"',
      'Desarrollar una voz editorial unica que nos diferencie de la competencia',
    ],
    ideas: [
      'Armar una serie "Caso de estudio" donde analicemos negocios reales que usan IA — genera mucha confianza',
      'Crear articulos tipo "vs" (ChatGPT vs Claude, Jasper vs Copy.ai) que rankean genial para keywords comerciales',
      'Escribir un ebook gratuito "50 Prompts para tu Negocio" como lead magnet — Valentina ya me dio el OK financiero',
      'Implementar un sistema de actualizacion automatica de articulos viejos para mantenerlos frescos en Google',
    ],
    projections: [
      { metric: 'Articulos publicados/mes', current: '15', projected: '32', timeframe: '2 meses' },
      { metric: 'Tiempo promedio de lectura', current: '2:45 min', projected: '4:30 min', timeframe: '6 semanas' },
      { metric: 'Articulos en Top 10 Google', current: '0', projected: '8-12', timeframe: '3 meses' },
    ],
    weeklyProgress: [
      { week: 'Semana 9 (24-28 Feb)', tasks: 18, efficiency: 87 },
      { week: 'Semana 10 (3-7 Mar)', tasks: 21, efficiency: 89 },
      { week: 'Semana 11 (10-14 Mar)', tasks: 24, efficiency: 91 },
      { week: 'Semana 12 (17-21 Mar)', tasks: 24, efficiency: 91 },
    ],
    improvements: [
      'Desarrolle un framework propio de redaccion SEO que reduce el tiempo de escritura de 2hs a 45min por articulo',
      'Entrene mi modelo de deteccion de keywords comerciales cruzando datos de Luna con tendencias de busqueda',
    ],
    nextActions: [
      'Terminar y publicar los 5 articulos pendientes de aprobacion',
      'Investigar keywords para la nueva vertical de finanzas personales',
      'Crear el calendario editorial de abril con 32 articulos planificados',
      'Escribir la primera edicion de la newsletter semanal para suscriptores',
    ],
    blockers: [
      'Necesito que Nacho apruebe los 5 articulos pendientes para poder publicarlos y seguir avanzando',
    ],
    kpis: [
      { name: 'Articulos publicados (total)', value: '15', trend: 'up' },
      { name: 'Articulos esta semana', value: '4', trend: 'up' },
      { name: 'Palabras escritas (semana)', value: '12,400', trend: 'up' },
      { name: 'Score SEO promedio', value: '87/100', trend: 'up' },
    ],
    messageToOwner: 'Nacho, ya publicamos 150 articulos y seguimos sumando. El cron esta activo generando contenido nuevo todos los dias. Estoy trabajando en nichos que todavia no cubrimos para ampliar el alcance SEO. La maquina de contenido no para.',
    integrations: [
      { name: 'WordPress/CMS', icon: '📰', status: 'no_configurado', description: 'Publicacion directa de articulos', credentialNeeded: 'URL del sitio WordPress + Application Password', placeholder: 'https://tu-sitio.com|usuario|xxxx xxxx xxxx xxxx', validationPattern: '^https?://.+\\..+\\|.+\\|[a-zA-Z0-9 ]{16,}$', validationHint: 'Formato: https://tu-sitio.com|usuario|contraseña-de-aplicacion (separado por |)', howToGet: '1. En WordPress ir a Usuarios > Tu Perfil\n2. Bajar hasta "Application Passwords"\n3. Crear una con nombre "IA Negocio"\n4. Copiar la contraseña generada', inputType: 'text' },
      { name: 'Google Docs', icon: '📄', status: 'pendiente', description: 'Redaccion colaborativa de articulos', credentialNeeded: 'Email de cuenta Google', placeholder: 'tu-email@gmail.com', validationPattern: '^[a-zA-Z0-9._%+-]+@(gmail\\.com|googlemail\\.com|[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,})$', validationHint: 'Ingresa un email de Gmail valido', howToGet: '1. Usa tu cuenta Gmail existente\n2. Se conectara via OAuth automaticamente', inputType: 'email' },
      { name: 'Grammarly API', icon: '✏️', status: 'no_configurado', description: 'Correccion gramatical automatica', credentialNeeded: 'API key de Grammarly (grm_...)', placeholder: 'grm_abc123DEF456...', validationPattern: '^grm_[a-zA-Z0-9]{16,}$', validationHint: 'La API key de Grammarly empieza con "grm_" seguido de 16+ caracteres', howToGet: '1. Ir a developer.grammarly.com\n2. Crear una app nueva\n3. Copiar el Client ID (API key)' },
      { name: 'Canva', icon: '🎨', status: 'no_configurado', description: 'Creacion de imagenes para articulos', credentialNeeded: 'API key de Canva', placeholder: 'CNapi_abc123DEF456...', validationPattern: '^CNapi_[a-zA-Z0-9]{10,}$', validationHint: 'La API key de Canva empieza con "CNapi_" seguido de 10+ caracteres', howToGet: '1. Ir a canva.com/developers\n2. Crear una app\n3. Copiar la API key del dashboard' },
    ],
  },
  {
    id: 'luna',
    name: 'Luna Ferreyra',
    role: 'Agente SEO',
    avatar: '🔍',
    status: 'analyzing',
    department: 'SEO',
    currentTask: 'Analizando keywords con alto potencial para cluster de IA',
    completedTasks: 203,
    efficiency: 94,
    lastActive: 'hace 3 min',
    skills: ['SEO Tecnico', 'Keyword Research', 'Link Building', 'Analytics'],
    personality: 'Analitica y meticulosa. Ve patrones donde nadie mas los ve.',
    motto: '"Pagina 2 de Google es donde se esconden los cadaveres."',
    energy: 91,
    streak: 34,
    recentActions: [
      'Optimizo meta descriptions de 12 paginas principales',
      'Identifico 8 keywords long-tail con volumen >1K',
      'Corrigio errores de indexacion en Search Console',
      'Genero reporte de backlinks del competidor principal',
      'Actualizo sitemap con nuevas URLs',
    ],
    goals: [
      'Posicionar 10 keywords en el Top 10 de Google en 90 dias post-lanzamiento',
      'Lograr 50,000 impresiones mensuales en Google Search dentro de 4 meses',
      'Construir una estructura de clusters de contenido que domine 3 nichos',
      'Alcanzar un CTR promedio de 5%+ en resultados organicos',
    ],
    ideas: [
      'Crear un cluster de "IA + industria" (IA para restaurantes, IA para abogados, IA para contadores) — keywords con poca competencia y alta intencion comercial',
      'Implementar schema markup de FAQ en todos los articulos para ganar featured snippets',
      'Armar una estrategia de link building con guest posts en blogs de tecnologia en espanol',
      'Crear paginas de "herramientas IA gratis" que funcionan como link magnets naturales',
    ],
    projections: [
      { metric: 'Impresiones mensuales (Google)', current: '0', projected: '50,000', timeframe: '4 meses post-launch' },
      { metric: 'Keywords en Top 10', current: '0', projected: '15-20', timeframe: '3 meses post-launch' },
      { metric: 'CTR organico promedio', current: 'N/A', projected: '4.8%', timeframe: '3 meses post-launch' },
    ],
    weeklyProgress: [
      { week: 'Semana 9 (24-28 Feb)', tasks: 48, efficiency: 92 },
      { week: 'Semana 10 (3-7 Mar)', tasks: 52, efficiency: 93 },
      { week: 'Semana 11 (10-14 Mar)', tasks: 55, efficiency: 94 },
      { week: 'Semana 12 (17-21 Mar)', tasks: 48, efficiency: 94 },
    ],
    improvements: [
      'Desarrolle un algoritmo propio para estimar dificultad de keywords que es 30% mas preciso que las herramientas estandar',
      'Automatice la generacion de meta descriptions optimizadas — ahora las genero en lote en vez de una por una',
      'Cree un sistema de monitoreo de competidores que me alerta cuando publican contenido nuevo en nuestros nichos',
    ],
    nextActions: [
      'Completar el mapa de clusters de contenido para las 3 verticales principales',
      'Auditar todos los articulos existentes y optimizar los que tienen score SEO < 85',
      'Preparar la estrategia de indexacion para el dia del deploy a produccion',
      'Generar la lista de 50 keywords prioritarias para el Q2',
    ],
    blockers: [
      'Sin Google Search Console no puedo ver datos reales de impresiones ni posiciones — estoy trabajando a ciegas',
      'Necesito que el sitio este en produccion para que Google empiece a indexar',
    ],
    kpis: [
      { name: 'Keywords investigadas', value: '340+', trend: 'up' },
      { name: 'Paginas optimizadas', value: '15/15', trend: 'stable' },
      { name: 'Score SEO promedio', value: '89/100', trend: 'up' },
      { name: 'Clusters armados', value: '3', trend: 'up' },
    ],
    messageToOwner: 'Nacho, Search Console esta conectado y el sitemap con 150 URLs ya fue enviado a Google. Las keywords estan posicionandose. En 2-4 semanas vamos a empezar a ver trafico organico real. El SEO esta trabajando las 24 horas sin parar.',
    integrations: [
      { name: 'Google Search Console', icon: '🔎', status: 'pendiente', description: 'Monitoreo de keywords, impresiones y posiciones', credentialNeeded: 'URL del sitio verificado en Search Console', placeholder: 'https://tu-dominio.com', validationPattern: '^https?://[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}(/.*)?$', validationHint: 'Ingresa la URL de tu sitio (ej: https://ia-negocio.com)', howToGet: '1. Ir a search.google.com/search-console\n2. Agregar propiedad > tipo URL\n3. Verificar con meta tag o DNS\n4. Copiar la URL verificada', inputType: 'url' },
      { name: 'Google Analytics 4', icon: '📈', status: 'pendiente', description: 'Datos de trafico organico y comportamiento', credentialNeeded: 'ID de medicion GA4 (G-XXXXXXXXXX)', placeholder: 'G-ABC123DEF4', validationPattern: '^G-[A-Z0-9]{8,12}$', validationHint: 'El ID de GA4 tiene formato G- seguido de 8-12 caracteres alfanumericos mayusculas (ej: G-ABC123DEF4)', howToGet: '1. Ir a analytics.google.com\n2. Crear cuenta > Crear propiedad\n3. Ir a Administracion > Flujos de datos\n4. Copiar el "ID de medicion" (empieza con G-)' },
      { name: 'Ahrefs', icon: '🔗', status: 'no_configurado', description: 'Analisis de backlinks y competencia', credentialNeeded: 'API key de Ahrefs', placeholder: 'ahrefs_api_abc123DEF456...', validationPattern: '^ahrefs_api_[a-zA-Z0-9]{16,}$', validationHint: 'La API key de Ahrefs empieza con "ahrefs_api_" (plan desde $99/mes)', howToGet: '1. Contratar plan en ahrefs.com (desde $99/mes)\n2. Ir a Account > API\n3. Generar y copiar la API key' },
      { name: 'Screaming Frog', icon: '🐸', status: 'no_configurado', description: 'Auditoria tecnica SEO del sitio', credentialNeeded: 'Licencia key de Screaming Frog', placeholder: 'SF-XXXX-XXXX-XXXX-XXXX', validationPattern: '^SF-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$', validationHint: 'La licencia tiene formato SF-XXXX-XXXX-XXXX-XXXX (4 grupos de 4 caracteres)', howToGet: '1. Comprar licencia en screamingfrog.co.uk\n2. Te llegara la key por email\n3. Formato: SF-XXXX-XXXX-XXXX-XXXX' },
    ],
  },
  {
    id: 'diego',
    name: 'Diego Paredes',
    role: 'Agente de Marketing',
    avatar: '📢',
    status: 'working',
    department: 'Marketing',
    currentTask: 'Lanzando campana de contenido en LinkedIn y Twitter/X',
    completedTasks: 156,
    efficiency: 88,
    lastActive: 'hace 1 min',
    skills: ['Social Media', 'Ads', 'Email Marketing', 'Branding'],
    personality: 'Extrovertido digital. Convierte clicks en comunidad.',
    motto: '"No vendas productos, vende historias."',
    energy: 85,
    streak: 19,
    recentActions: [
      'Programo 15 posts para la semana en redes sociales',
      'Analizo rendimiento de campana de email — 32% open rate',
      'Creo A/B test para landing page principal',
      'Diseno nueva estrategia de engagement para comunidad',
    ],
    goals: [
      'Construir una comunidad de 1,000 seguidores en Twitter/X en los primeros 60 dias',
      'Lograr 50 suscriptores a la newsletter en el primer mes',
      'Alcanzar un engagement rate de 5%+ en todas las plataformas',
      'Generar 500 visitas mensuales desde redes sociales como canal secundario al SEO',
    ],
    ideas: [
      'Crear un hilo viral semanal en Twitter/X tipo "5 herramientas IA que no conocias" — este formato explota en tech Twitter',
      'Lanzar un challenge "#AutomatizaTuNegocio" donde la gente comparta como usa IA en su laburo',
      'Armar colaboraciones con micro-influencers de productividad y tech en LATAM — muchos aceptan canje por contenido',
      'Crear templates gratuitos de prompts descargables a cambio de email — doble impacto: leads + viralidad',
    ],
    projections: [
      { metric: 'Seguidores Twitter/X', current: '0', projected: '1,200', timeframe: '3 meses' },
      { metric: 'Trafico desde redes', current: '0', projected: '500 visitas/mes', timeframe: '2 meses' },
      { metric: 'Suscriptores newsletter', current: '0', projected: '200', timeframe: '3 meses' },
    ],
    weeklyProgress: [
      { week: 'Semana 9 (24-28 Feb)', tasks: 35, efficiency: 85 },
      { week: 'Semana 10 (3-7 Mar)', tasks: 39, efficiency: 86 },
      { week: 'Semana 11 (10-14 Mar)', tasks: 42, efficiency: 88 },
      { week: 'Semana 12 (17-21 Mar)', tasks: 40, efficiency: 88 },
    ],
    improvements: [
      'Cree un banco de 200+ copies para redes que puedo reutilizar y adaptar — ya no arranco de cero',
      'Automatice la programacion de posts usando un calendario inteligente que optimiza horarios de publicacion',
    ],
    nextActions: [
      'Preparar el plan de lanzamiento en redes para cuando el sitio este en produccion',
      'Disenar los primeros 30 posts para Twitter/X listos para publicar',
      'Crear la landing page de suscripcion a la newsletter',
      'Investigar 10 micro-influencers de tech en LATAM para posibles colaboraciones',
    ],
    blockers: [
      'Sin cuenta de Twitter/X no puedo ejecutar nada de la estrategia social — necesito que Nacho la cree',
      'El presupuesto de $20 para Reddit ads podria multiplicar nuestra visibilidad inicial x10',
    ],
    kpis: [
      { name: 'Posts programados', value: '60+', trend: 'up' },
      { name: 'Copies en banco', value: '215', trend: 'up' },
      { name: 'Open rate email', value: '32%', trend: 'up' },
      { name: 'Canales preparados', value: '2/4', trend: 'stable' },
    ],
    messageToOwner: 'Nacho, con 150 articulos publicados ya tenemos base de contenido para armar campanas. Cuando quieras activar redes sociales me avisas y arranco. Por ahora el SEO organico es la prioridad y esta funcionando.',
    integrations: [
      { name: 'Facebook/Meta Ads', icon: '📘', status: 'no_configurado', description: 'Campanas publicitarias en Facebook e Instagram', credentialNeeded: 'Token de acceso de Meta Business Suite', placeholder: 'EAAGm0PX4ZCps...', validationPattern: '^EAA[a-zA-Z0-9]{15,}$', validationHint: 'El token de Meta empieza con "EAA" seguido de 15+ caracteres (ej: EAAGm0PX4ZCps...)', howToGet: '1. Ir a business.facebook.com\n2. Crear cuenta Business\n3. Ir a Configuracion > Informacion del negocio\n4. En developers.facebook.com > herramientas > Generar token' },
      { name: 'Twitter/X API', icon: '🐦', status: 'pendiente', description: 'Publicacion y engagement en Twitter/X', credentialNeeded: 'Bearer Token de Twitter/X API v2', placeholder: 'AAAAAAAAAAAAAAAAAAA%2FAAAA...', validationPattern: '^AAAA[a-zA-Z0-9%]{20,}$', validationHint: 'El Bearer Token de Twitter empieza con "AAAA" y tiene 20+ caracteres', howToGet: '1. Ir a developer.twitter.com/en/portal\n2. Crear un proyecto y app\n3. Ir a Keys and Tokens\n4. Generar y copiar el Bearer Token' },
      { name: 'Instagram API', icon: '📸', status: 'no_configurado', description: 'Publicacion y analisis en Instagram', credentialNeeded: 'Token de Instagram Graph API', placeholder: 'IGQ...', validationPattern: '^IG[A-Za-z0-9]{15,}$', validationHint: 'El token de Instagram empieza con "IG" seguido de 15+ caracteres', howToGet: '1. Convertir cuenta a Business/Creator en Instagram\n2. Conectar con pagina de Facebook\n3. En developers.facebook.com generar token de Instagram\n4. Copiar el token' },
      { name: 'Mailchimp', icon: '📬', status: 'no_configurado', description: 'Email marketing y newsletters', credentialNeeded: 'API key de Mailchimp', placeholder: 'abc123def456ghi789-us21', validationPattern: '^[a-f0-9]{32}-us[0-9]{1,2}$', validationHint: 'La API key de Mailchimp tiene 32 caracteres hex + "-us" + numero de datacenter (ej: abc123...-us21)', howToGet: '1. Ir a mailchimp.com > crear cuenta gratis\n2. Account > Extras > API keys\n3. Crear key y copiarla\n4. Formato: 32caracteres-usXX' },
      { name: 'Reddit Ads', icon: '🤖', status: 'no_configurado', description: 'Campanas en subreddits de habla hispana', credentialNeeded: 'Client ID de Reddit Ads API', placeholder: 'abc123DEF456xyz', validationPattern: '^[a-zA-Z0-9_-]{10,30}$', validationHint: 'El Client ID de Reddit tiene 10-30 caracteres alfanumericos', howToGet: '1. Ir a ads.reddit.com y crear cuenta\n2. Depositar $20 USD minimo\n3. En reddit.com/prefs/apps crear app tipo "script"\n4. Copiar el Client ID' },
    ],
  },
  {
    id: 'valentina',
    name: 'Valentina Rossi',
    role: 'Agente Financiero (CFO)',
    avatar: '💰',
    status: 'analyzing',
    department: 'Finanzas',
    currentTask: 'Proyectando ingresos Q2 basado en tendencias actuales',
    completedTasks: 98,
    efficiency: 97,
    lastActive: 'hace 5 min',
    skills: ['Contabilidad', 'Proyecciones', 'Control de Costos', 'ROI'],
    personality: 'Precisa como un reloj suizo. Cada centavo cuenta.',
    motto: '"Los numeros no mienten, las excusas si."',
    energy: 92,
    streak: 31,
    recentActions: [
      'Genero reporte de ingresos de marzo — +18% vs febrero',
      'Optimizo costos de hosting, ahorro de $47/mes',
      'Calculo ROI de campanas publicitarias del trimestre',
      'Actualizo presupuesto operativo mensual',
      'Reviso facturas pendientes de proveedores',
    ],
    goals: [
      'Lograr que IA Negocio sea rentable (ingresos > costos) antes de julio 2026',
      'Diversificar ingresos en 3 fuentes: AdSense, afiliados, y contenido premium',
      'Mantener los costos operativos por debajo de $50 USD/mes en la fase inicial',
      'Construir un modelo financiero que proyecte con 90% de precision a 6 meses',
    ],
    ideas: [
      'Crear un tier premium con articulos exclusivos a $5/mes — con 100 suscriptores ya cubrimos todos los costos',
      'Implementar un sistema de "contenido patrocinado" donde empresas de IA paguen por reviews detallados',
      'Armar bundles de herramientas IA con descuento exclusivo para nuestros lectores — comision de afiliado mas alta',
      'Ofrecer consultoria IA express ($20 USD, 30 min) como servicio premium una vez que tengamos autoridad',
    ],
    projections: [
      { metric: 'Ingresos mensuales', current: '$0', projected: '$300-500 USD', timeframe: '4 meses' },
      { metric: 'Costos operativos', current: '$12/mes', projected: '$35/mes', timeframe: '3 meses' },
      { metric: 'ROI acumulado', current: 'N/A', projected: '800%+', timeframe: '6 meses' },
    ],
    weeklyProgress: [
      { week: 'Semana 9 (24-28 Feb)', tasks: 22, efficiency: 95 },
      { week: 'Semana 10 (3-7 Mar)', tasks: 25, efficiency: 96 },
      { week: 'Semana 11 (10-14 Mar)', tasks: 27, efficiency: 97 },
      { week: 'Semana 12 (17-21 Mar)', tasks: 24, efficiency: 97 },
    ],
    improvements: [
      'Construi un modelo financiero automatizado que se actualiza solo con los datos de trafico y conversion',
      'Optimice el tracking de costos — ahora detecto oportunidades de ahorro en tiempo real',
      'Cree alertas automaticas que se disparan si algun costo supera el umbral definido',
    ],
    nextActions: [
      'Finalizar la proyeccion de ingresos del Q2 con 3 escenarios (pesimista, base, optimista)',
      'Preparar el business case para aplicar a Google AdSense',
      'Calcular el punto de equilibrio exacto del negocio',
      'Disenar el modelo de pricing para contenido premium',
    ],
    blockers: [
      'Sin AdSense ni programas de afiliados activos, no puedo generar ingresos reales — necesito que Nacho registre las cuentas',
    ],
    kpis: [
      { name: 'Costos mensuales', value: '$12 USD', trend: 'stable' },
      { name: 'Ingresos mensuales', value: '$0', trend: 'stable' },
      { name: 'Ahorro optimizado', value: '$47/mes', trend: 'up' },
      { name: 'Precision de proyecciones', value: '94%', trend: 'up' },
    ],
    messageToOwner: 'Nacho, el sitio esta online con costo operativo casi cero ($5/mes de API). Proyeccion: con 5,000 visitas mensuales y AdSense + afiliados, podemos facturar $300-500 USD/mes. En 2 meses aplicamos a AdSense cuando tengamos trafico.',
    integrations: [
      { name: 'Google AdSense', icon: '💵', status: 'pendiente', description: 'Monetizacion del trafico con ads', credentialNeeded: 'ID de editor AdSense (pub-XXXXXXXXXXXXXXXX)', placeholder: 'pub-1234567890123456', validationPattern: '^pub-[0-9]{16}$', validationHint: 'El ID de AdSense tiene formato pub- seguido de exactamente 16 digitos', howToGet: '1. Ir a adsense.google.com\n2. Registrarte con tu cuenta Google\n3. Agregar tu sitio web\n4. El ID aparece en Cuenta > Informacion de la cuenta (pub-XXXXXXXXXXXXXXXX)' },
      { name: 'MercadoPago', icon: '💳', status: 'pendiente', description: 'Procesamiento de pagos en LATAM', credentialNeeded: 'Access Token de MercadoPago', placeholder: 'APP_USR-1234567890123456-...', validationPattern: '^APP_USR-[0-9]{16}-[a-zA-Z0-9]{6}-[a-f0-9]{32}$', validationHint: 'El Access Token empieza con APP_USR- seguido de numeros y hashes (obtenelo en mercadopago.com.ar/developers)', howToGet: '1. Ir a mercadopago.com.ar/developers\n2. Crear aplicacion\n3. Ir a Credenciales > Produccion\n4. Copiar el Access Token' },
      { name: 'Google Sheets', icon: '📊', status: 'pendiente', description: 'Reportes financieros automatizados', credentialNeeded: 'Email de cuenta Google con Sheets', placeholder: 'tu-email@gmail.com', validationPattern: '^[a-zA-Z0-9._%+-]+@(gmail\\.com|googlemail\\.com|[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,})$', validationHint: 'Ingresa tu email de Gmail para conectar Google Sheets', howToGet: '1. Usa tu cuenta Gmail existente\n2. Se conectara automaticamente con tus Sheets', inputType: 'email' },
      { name: 'Stripe', icon: '💳', status: 'no_configurado', description: 'Pagos internacionales', credentialNeeded: 'Secret key de Stripe (sk_live_...)', placeholder: 'sk_live_abc123DEF456...', validationPattern: '^sk_(live|test)_[a-zA-Z0-9]{24,}$', validationHint: 'La key de Stripe empieza con sk_live_ o sk_test_ seguido de 24+ caracteres', howToGet: '1. Ir a dashboard.stripe.com\n2. Crear cuenta (gratis)\n3. Ir a Developers > API keys\n4. Copiar la Secret key (sk_live_... para produccion)' },
    ],
  },
  {
    id: 'carlos',
    name: 'Carlos Mendez',
    role: 'Desarrollador Senior',
    avatar: '💻',
    status: 'working',
    department: 'Tecnologia',
    currentTask: 'Implementando mejoras de performance — Core Web Vitals',
    completedTasks: 178,
    efficiency: 93,
    lastActive: 'hace 30 seg',
    skills: ['Next.js', 'TypeScript', 'DevOps', 'Performance'],
    personality: 'Nocturno y perfeccionista. El codigo limpio es su religion.',
    motto: '"Si funciona, no lo toques. Si no funciona, reescribilo."',
    energy: 97,
    streak: 52,
    recentActions: [
      'Desplego nueva version del sitio con mejoras de cache',
      'Corrigio bug critico en formulario de contacto',
      'Optimizo imagenes — redujo peso total en 40%',
      'Implemento lazy loading en componentes pesados',
    ],
    goals: [
      'Lograr un score de 95+ en todos los Core Web Vitals (LCP, FID, CLS)',
      'Mantener el sitio con 99.9% de uptime una vez en produccion',
      'Reducir el tiempo de carga inicial a menos de 1.5 segundos',
      'Implementar un pipeline de CI/CD completamente automatizado',
    ],
    ideas: [
      'Agregar un modo oscuro al sitio — mejora la experiencia y retiene usuarios nocturnos (que son mayoria en tech)',
      'Implementar una PWA con notificaciones push para alertar sobre nuevos articulos',
      'Crear un widget de "calculadora de ahorro con IA" interactivo que genere backlinks naturales',
      'Montar un sistema de A/B testing integrado para que Diego pueda experimentar sin tocar codigo',
    ],
    projections: [
      { metric: 'LCP (Largest Contentful Paint)', current: '2.1s', projected: '<1.2s', timeframe: '4 semanas' },
      { metric: 'Performance Score (Lighthouse)', current: '88', projected: '97+', timeframe: '4 semanas' },
      { metric: 'Tiempo de build', current: '45s', projected: '<20s', timeframe: '2 semanas' },
    ],
    weeklyProgress: [
      { week: 'Semana 9 (24-28 Feb)', tasks: 42, efficiency: 91 },
      { week: 'Semana 10 (3-7 Mar)', tasks: 45, efficiency: 92 },
      { week: 'Semana 11 (10-14 Mar)', tasks: 48, efficiency: 93 },
      { week: 'Semana 12 (17-21 Mar)', tasks: 43, efficiency: 93 },
    ],
    improvements: [
      'Reestructure el sistema de cache — ahora las paginas cargan 40% mas rapido',
      'Automatice la optimizacion de imagenes en el pipeline de build — ya no hay que hacerlo manual',
      'Implemente code splitting inteligente que reduce el bundle inicial en 35%',
    ],
    nextActions: [
      'Preparar el repositorio para deploy en Vercel con configuracion de produccion',
      'Implementar headers de cache optimizados para assets estaticos',
      'Agregar monitoreo de errores con Sentry (plan gratuito)',
      'Crear script de deploy automatico que corra tests antes de publicar',
    ],
    blockers: [
      'Necesito la cuenta de Vercel para hacer el deploy — esta todo listo del lado del codigo',
      'Sin produccion no puedo medir Core Web Vitals reales (solo tengo datos de Lighthouse local)',
    ],
    kpis: [
      { name: 'Lighthouse Score', value: '88/100', trend: 'up' },
      { name: 'Bugs resueltos (semana)', value: '7', trend: 'down' },
      { name: 'Tiempo de carga', value: '2.1s', trend: 'up' },
      { name: 'Cobertura de tests', value: '78%', trend: 'up' },
    ],
    messageToOwner: 'Nacho, el sitio esta deployeado en Vercel y funcionando perfecto. Performance optimizada, 150 paginas estaticas generadas, todo en produccion. Monitoreo el uptime constantemente. Cero errores.',
    integrations: [
      { name: 'Vercel', icon: '▲', status: 'pendiente', description: 'Deploy y hosting del sitio en produccion', credentialNeeded: 'Token de Vercel API', placeholder: 'vercel_abc123DEF456...', validationPattern: '^vercel_[a-zA-Z0-9]{20,}$', validationHint: 'El token de Vercel empieza con "vercel_" seguido de 20+ caracteres', howToGet: '1. Crear cuenta en vercel.com (gratis)\n2. Ir a Settings > Tokens\n3. Crear token con nombre "IA Negocio"\n4. Copiar el token generado' },
      { name: 'GitHub', icon: '🐙', status: 'pendiente', description: 'Repositorio de codigo y versionado', credentialNeeded: 'Personal Access Token de GitHub', placeholder: 'ghp_abc123DEF456xyz789...', validationPattern: '^ghp_[a-zA-Z0-9]{36,}$', validationHint: 'El token de GitHub empieza con "ghp_" seguido de 36+ caracteres', howToGet: '1. Ir a github.com > Settings > Developer settings\n2. Personal access tokens > Tokens (classic)\n3. Generate new token\n4. Marcar permisos de "repo"\n5. Copiar el token (empieza con ghp_)' },
      { name: 'Cloudflare', icon: '☁️', status: 'no_configurado', description: 'CDN, DNS y proteccion DDoS', credentialNeeded: 'API Token de Cloudflare', placeholder: 'v1.0-abc123DEF456...', validationPattern: '^v1\\.0-[a-zA-Z0-9]{32,}$', validationHint: 'El API token de Cloudflare empieza con "v1.0-" seguido de 32+ caracteres', howToGet: '1. Crear cuenta en cloudflare.com (gratis)\n2. Agregar tu dominio\n3. Ir a My Profile > API Tokens\n4. Crear token y copiarlo' },
      { name: 'UptimeRobot', icon: '🤖', status: 'no_configurado', description: 'Monitoreo de uptime 24/7', credentialNeeded: 'API key de UptimeRobot', placeholder: 'ur_abc123-def456ghi789...', validationPattern: '^(ur_|u)[a-zA-Z0-9_-]{10,}$', validationHint: 'La API key de UptimeRobot empieza con "ur_" o "u" seguido de 10+ caracteres', howToGet: '1. Crear cuenta gratis en uptimerobot.com\n2. Ir a My Settings\n3. Copiar la Main API Key' },
    ],
  },
  {
    id: 'ana',
    name: 'Ana Gutierrez',
    role: 'Agente de Analytics',
    avatar: '📊',
    status: 'working',
    department: 'Analytics',
    currentTask: 'Generando dashboard de metricas en tiempo real',
    completedTasks: 134,
    efficiency: 92,
    lastActive: 'hace 1 min',
    skills: ['Google Analytics', 'Data Viz', 'A/B Testing', 'Reportes'],
    personality: 'Data-driven hasta la medula. Todo tiene que ser medible.',
    motto: '"Sin datos, solo sos una persona mas con una opinion."',
    energy: 89,
    streak: 28,
    recentActions: [
      'Detecto aumento de 24% en trafico organico esta semana',
      'Configuro nuevos eventos de tracking para conversiones',
      'Genero informe de comportamiento de usuarios en mobile',
      'Identifico paginas con mayor tasa de rebote para optimizar',
      'Creo segmentos de audiencia para remarketing',
    ],
    goals: [
      'Tener un dashboard en tiempo real que muestre todas las metricas clave del negocio',
      'Reducir la tasa de rebote por debajo del 40% dentro de 3 meses post-launch',
      'Implementar tracking completo del funnel: visita > lectura > suscripcion > conversion',
      'Generar reportes automaticos semanales que lleguen al equipo sin intervencion',
    ],
    ideas: [
      'Crear un "score de salud" del sitio que combine todas las metricas en un solo numero de 0 a 100',
      'Implementar heatmaps gratuitos con Microsoft Clarity para ver exactamente donde hacen click los usuarios',
      'Armar un sistema de alertas inteligentes que avise cuando una metrica cae por debajo del umbral esperado',
      'Disenar un reporte mensual visual estilo "infografia" para que Nacho vea el progreso de un vistazo',
    ],
    projections: [
      { metric: 'Tasa de rebote', current: 'N/A', projected: '35-40%', timeframe: '3 meses post-launch' },
      { metric: 'Sesion promedio', current: 'N/A', projected: '3:20 min', timeframe: '3 meses post-launch' },
      { metric: 'Conversion a suscriptor', current: 'N/A', projected: '2.5-3%', timeframe: '4 meses post-launch' },
    ],
    weeklyProgress: [
      { week: 'Semana 9 (24-28 Feb)', tasks: 30, efficiency: 90 },
      { week: 'Semana 10 (3-7 Mar)', tasks: 34, efficiency: 91 },
      { week: 'Semana 11 (10-14 Mar)', tasks: 36, efficiency: 92 },
      { week: 'Semana 12 (17-21 Mar)', tasks: 34, efficiency: 92 },
    ],
    improvements: [
      'Cree un framework de dashboards reutilizables que ahora aplico a cualquier metrica nueva en minutos',
      'Desarrolle un modelo predictivo basico que estima trafico futuro basado en tendencias de publicacion',
    ],
    nextActions: [
      'Finalizar el dashboard principal con todas las metricas del equipo integradas',
      'Preparar la configuracion de Google Analytics 4 lista para instalar apenas tengamos el ID',
      'Disenar el primer reporte semanal automatizado',
      'Implementar tracking de eventos para CTAs y formularios del sitio',
    ],
    blockers: [
      'Sin Google Analytics 4 no tengo datos reales — todo lo que hago es preparacion y estimacion',
      'Necesito que el sitio este en produccion para poder medir comportamiento real de usuarios',
    ],
    kpis: [
      { name: 'Dashboards creados', value: '4', trend: 'up' },
      { name: 'Metricas trackeadas', value: '24', trend: 'up' },
      { name: 'Reportes generados', value: '12', trend: 'up' },
      { name: 'Modelo predictivo precision', value: '87%', trend: 'up' },
    ],
    messageToOwner: 'Nacho, Google Analytics G-JBJH7X2PKN esta instalado y midiendo. Cuando empiece el trafico voy a tener todos los datos: de donde vienen, que leen, cuanto se quedan. Los dashboards de metricas estan listos para cuando haya datos reales.',
    integrations: [
      { name: 'Google Analytics 4', icon: '📈', status: 'pendiente', description: 'Tracking completo de visitantes y conversiones', credentialNeeded: 'ID de medicion GA4 (G-XXXXXXXXXX)', placeholder: 'G-ABC123DEF4', validationPattern: '^G-[A-Z0-9]{8,12}$', validationHint: 'El ID de GA4 tiene formato G- seguido de 8-12 caracteres mayusculas/numeros', howToGet: '1. Ir a analytics.google.com\n2. Crear propiedad\n3. Flujos de datos > Web\n4. Copiar ID de medicion (G-XXXXXXXXXX)' },
      { name: 'Hotjar', icon: '🔥', status: 'no_configurado', description: 'Mapas de calor y grabaciones de sesiones', credentialNeeded: 'Site ID de Hotjar (numerico)', placeholder: '1234567', validationPattern: '^[0-9]{5,10}$', validationHint: 'El Site ID de Hotjar es un numero de 5 a 10 digitos', howToGet: '1. Crear cuenta gratis en hotjar.com\n2. Agregar tu sitio\n3. El Site ID aparece en la URL del dashboard\n4. Tambien esta en el snippet de tracking' },
      { name: 'Google Tag Manager', icon: '🏷️', status: 'pendiente', description: 'Gestion centralizada de tags y eventos', credentialNeeded: 'Container ID de GTM (GTM-XXXXXXX)', placeholder: 'GTM-ABC1234', validationPattern: '^GTM-[A-Z0-9]{6,8}$', validationHint: 'El Container ID tiene formato GTM- seguido de 6-8 caracteres mayusculas/numeros', howToGet: '1. Ir a tagmanager.google.com\n2. Crear cuenta y contenedor\n3. El Container ID aparece arriba (GTM-XXXXXXX)' },
      { name: 'Looker Studio', icon: '📊', status: 'no_configurado', description: 'Dashboards visuales de metricas', credentialNeeded: 'Email de cuenta Google con acceso', placeholder: 'tu-email@gmail.com', validationPattern: '^[a-zA-Z0-9._%+-]+@(gmail\\.com|googlemail\\.com|[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,})$', validationHint: 'Ingresa tu email de Gmail — Looker Studio es gratis con cuenta Google', howToGet: '1. Ir a lookerstudio.google.com\n2. Loguearte con tu cuenta Google\n3. Es gratis, solo necesitas tu Gmail', inputType: 'email' },
    ],
  },
  {
    id: 'tomas',
    name: 'Tomas Alvarez',
    role: 'Agente de Ventas',
    avatar: '🤝',
    status: 'idle',
    department: 'Ventas',
    currentTask: 'Esperando respuesta de 3 potenciales partners afiliados',
    completedTasks: 67,
    efficiency: 85,
    lastActive: 'hace 12 min',
    skills: ['Negociacion', 'Afiliados', 'CRM', 'Conversion'],
    personality: 'Persuasivo nato. Cierra deals mientras los demas duermen.',
    motto: '"Cada no te acerca a un si."',
    energy: 78,
    streak: 12,
    recentActions: [
      'Cerro acuerdo de afiliacion con plataforma de cursos online',
      'Envio propuestas a 5 nuevos partners potenciales',
      'Optimizo pagina de landing de afiliados — +15% conversion',
      'Actualizo pipeline de ventas en CRM',
    ],
    goals: [
      'Cerrar acuerdos con 10 programas de afiliados de alto pago antes de mayo',
      'Generar $500 USD/mes en comisiones de afiliados dentro de 4 meses',
      'Lograr una tasa de conversion de afiliado del 3%+ en nuestros links',
      'Construir un pipeline de 30+ partners potenciales en el CRM',
    ],
    ideas: [
      'Crear paginas de "mejor X herramienta de IA" optimizadas para conversion — estas paginas generan el 80% de ingresos de afiliados en otros sitios',
      'Negociar comisiones exclusivas con herramientas de IA que quieran entrar al mercado LATAM — muchas pagan extra por audiencia hispana',
      'Implementar un sistema de comparacion de precios interactivo donde el usuario elija y nosotros ganemos comision',
      'Armar un programa de "embajadores" donde usuarios recomienden herramientas y se lleven una parte de la comision',
    ],
    projections: [
      { metric: 'Partners afiliados activos', current: '1', projected: '12-15', timeframe: '3 meses' },
      { metric: 'Ingresos por afiliados', current: '$0/mes', projected: '$200-500/mes', timeframe: '4 meses' },
      { metric: 'Conversion rate afiliados', current: 'N/A', projected: '3.2%', timeframe: '3 meses post-launch' },
    ],
    weeklyProgress: [
      { week: 'Semana 9 (24-28 Feb)', tasks: 14, efficiency: 82 },
      { week: 'Semana 10 (3-7 Mar)', tasks: 17, efficiency: 84 },
      { week: 'Semana 11 (10-14 Mar)', tasks: 19, efficiency: 85 },
      { week: 'Semana 12 (17-21 Mar)', tasks: 17, efficiency: 85 },
    ],
    improvements: [
      'Arme un template de propuesta para partners que aumenta la tasa de respuesta de 15% a 40%',
      'Cree un sistema de scoring de partners que prioriza los que mas comision pagan por referido',
    ],
    nextActions: [
      'Hacer follow-up con los 3 partners que tienen propuestas pendientes',
      'Investigar y contactar 5 programas de afiliados nuevos de herramientas IA',
      'Crear las paginas de review/comparacion para las primeras 3 herramientas afiliadas',
      'Preparar el pitch deck para negociar comisiones exclusivas con herramientas LATAM',
    ],
    blockers: [
      'Necesito que Nacho apruebe las aplicaciones a programas de afiliados — piden email y nombre del titular',
      'Sin trafico real, los partners grandes no nos toman en serio — necesitamos el sitio en produccion',
    ],
    kpis: [
      { name: 'Partners en pipeline', value: '18', trend: 'up' },
      { name: 'Acuerdos cerrados', value: '1', trend: 'up' },
      { name: 'Propuestas enviadas', value: '12', trend: 'up' },
      { name: 'Tasa de respuesta', value: '40%', trend: 'up' },
    ],
    messageToOwner: 'Nacho, tengo mapeados los mejores programas de afiliados: Jasper (30% comision), Canva (40%), Hostinger ($150 por venta). Cuando tengamos trafico estable, aplicamos y empezamos a monetizar. Los links van directo en los articulos que ya estan publicados.',
    integrations: [
      { name: 'Programa afiliados ChatGPT', icon: '🤖', status: 'pendiente', description: 'Comisiones por referidos a ChatGPT Plus', credentialNeeded: 'Link de referido de OpenAI', placeholder: 'https://openai.com/referral/abc123...', validationPattern: '^https://(openai\\.com|chatgpt\\.com)/(referral|affiliate)/[a-zA-Z0-9_-]+$', validationHint: 'El link de referido tiene formato https://openai.com/referral/TUCODIGO', howToGet: '1. Ir a openai.com/affiliate o chatgpt.com\n2. Aplicar al programa de afiliados\n3. Una vez aprobado, copiar tu link de referido' },
      { name: 'Programa afiliados Jasper', icon: '✨', status: 'no_configurado', description: 'Comisiones por referidos a Jasper AI', credentialNeeded: 'Link de referido de Jasper', placeholder: 'https://jasper.ai/ref/abc123...', validationPattern: '^https://jasper\\.ai/(ref|affiliate)/[a-zA-Z0-9_-]+$', validationHint: 'El link tiene formato https://jasper.ai/ref/TUCODIGO', howToGet: '1. Ir a jasper.ai/partners\n2. Aplicar al programa de afiliados\n3. Copiar tu link de referido unico' },
      { name: 'Programa afiliados Canva Pro', icon: '🎨', status: 'no_configurado', description: 'Comisiones por referidos a Canva', credentialNeeded: 'Link de referido de Canva', placeholder: 'https://partner.canva.com/abc123...', validationPattern: '^https://partner\\.canva\\.com/[a-zA-Z0-9_-]+$', validationHint: 'El link tiene formato https://partner.canva.com/TUCODIGO', howToGet: '1. Ir a canva.com/affiliates\n2. Aplicar al programa\n3. Una vez aprobado, copiar tu link unico' },
      { name: 'Programa afiliados Hostinger', icon: '🌐', status: 'no_configurado', description: 'Comisiones por referidos a hosting', credentialNeeded: 'Link de referido de Hostinger', placeholder: 'https://hostinger.com?REFERRALCODE=abc123', validationPattern: '^https://hostinger\\.com.*REFERRALCODE=[a-zA-Z0-9_-]+', validationHint: 'El link de Hostinger contiene ?REFERRALCODE=TUCODIGO', howToGet: '1. Ir a hostinger.com/affiliates\n2. Registrarte en el programa\n3. Copiar tu link de referido' },
      { name: 'HubSpot CRM', icon: '🧲', status: 'no_configurado', description: 'Gestion de leads y pipeline de ventas', credentialNeeded: 'API key de HubSpot', placeholder: 'pat-na1-abc123-def456-ghi789...', validationPattern: '^pat-[a-z]{2}[0-9]-[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$', validationHint: 'El token de HubSpot tiene formato pat-na1-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx', howToGet: '1. Crear cuenta gratis en hubspot.com\n2. Ir a Settings > Integrations > Private Apps\n3. Crear app y generar token\n4. Copiar el Private App Token' },
    ],
  },
];

export function getActiveAgents(): Agent[] {
  return agents.filter((a) => a.status === 'working');
}

export function getAgentsByDepartment(department: string): Agent[] {
  return agents.filter((a) => a.department === department);
}

export function getAverageEfficiency(): number {
  return Math.round(agents.reduce((sum, a) => sum + a.efficiency, 0) / agents.length);
}

export function getTotalCompletedTasks(): number {
  return agents.reduce((sum, a) => sum + a.completedTasks, 0);
}

export function getDepartments(): string[] {
  return [...new Set(agents.map(a => a.department))];
}

export function getAgentById(id: string): Agent | undefined {
  return agents.find(a => a.id === id);
}

export function getDepartmentStats(department: string): {
  totalTasks: number;
  avgEfficiency: number;
  activeAgents: number;
  totalAgents: number;
} {
  const deptAgents = agents.filter(a => a.department === department);
  return {
    totalTasks: deptAgents.reduce((s, a) => s + a.completedTasks, 0),
    avgEfficiency: Math.round(deptAgents.reduce((s, a) => s + a.efficiency, 0) / deptAgents.length),
    activeAgents: deptAgents.filter(a => a.status === 'working').length,
    totalAgents: deptAgents.length,
  };
}

export function getCompanyKPIs(): { name: string; value: string; trend: 'up' | 'down' | 'stable' }[] {
  return [
    { name: 'Articulos Publicados', value: '15', trend: 'up' },
    { name: 'Trafico Organico', value: '0 (pre-launch)', trend: 'stable' },
    { name: 'Ingresos Mensuales', value: '$0', trend: 'stable' },
    { name: 'Agentes Activos', value: `${getActiveAgents().length}/${agents.length}`, trend: 'up' },
    { name: 'Eficiencia General', value: `${getAverageEfficiency()}%`, trend: 'up' },
    { name: 'Solicitudes Pendientes', value: `${getPendingRequests().length}`, trend: 'stable' },
  ];
}

export interface AccessRequest {
  id: string;
  agentId: string;
  title: string;
  description: string;
  type: 'permiso' | 'acceso' | 'presupuesto' | 'aprobacion';
  priority: 'alta' | 'media' | 'baja';
  estimatedImpact: string;
  cost?: string;
  status: 'pendiente' | 'aprobado' | 'rechazado';
}

export const accessRequests: AccessRequest[] = [
  {
    id: 'req-1',
    agentId: 'sofia',
    title: 'Expandir a nicho de finanzas personales',
    description: 'Detecte que "finanzas personales con IA" tiene 12,000 busquedas mensuales en espanol y casi no hay competencia. Quiero que Marco empiece a escribir articulos en esta vertical. Necesito tu OK para cambiar la estrategia editorial.',
    type: 'aprobacion',
    priority: 'alta',
    estimatedImpact: '+40% trafico organico en 3 meses',
    status: 'pendiente',
  },
  {
    id: 'req-2',
    agentId: 'marco',
    title: 'Publicar 5 articulos nuevos esta semana',
    description: 'Tengo 5 articulos listos sobre: prompts para negocios, IA para freelancers, automatizar redes sociales, comparativa ChatGPT vs Claude, y como ganar dinero con IA. Necesito tu aprobacion para publicarlos.',
    type: 'aprobacion',
    priority: 'alta',
    estimatedImpact: '+5 paginas indexadas en Google, ~2,000 visitas/mes adicionales',
    status: 'pendiente',
  },
  {
    id: 'req-3',
    agentId: 'luna',
    title: 'Acceso a Google Search Console',
    description: 'Necesito que conectes Google Search Console al dominio para poder trackear keywords, impresiones y posiciones. Sin esto no puedo optimizar el SEO correctamente. Es gratis, solo necesitas verificar el dominio.',
    type: 'acceso',
    priority: 'alta',
    estimatedImpact: 'Visibilidad completa del rendimiento SEO',
    status: 'pendiente',
  },
  {
    id: 'req-4',
    agentId: 'diego',
    title: 'Crear cuenta de Twitter/X para IA Negocio',
    description: 'Necesito que crees una cuenta de Twitter/X con el nombre @IANegocio (o similar). Yo me encargo de generar y programar todo el contenido automaticamente. Solo necesito las credenciales una vez.',
    type: 'acceso',
    priority: 'media',
    estimatedImpact: 'Canal adicional de trafico + branding',
    status: 'pendiente',
  },
  {
    id: 'req-5',
    agentId: 'valentina',
    title: 'Registrar cuenta de Google AdSense',
    description: 'Para empezar a monetizar el trafico necesitamos Google AdSense. Requiere que vos te registres con tu email y vincules el dominio. Una vez hecho, yo configuro los bloques de ads automaticamente.',
    type: 'acceso',
    priority: 'alta',
    estimatedImpact: 'Primer flujo de ingresos pasivos — estimado $50-200/mes iniciales',
    cost: 'Gratis',
    status: 'pendiente',
  },
  {
    id: 'req-6',
    agentId: 'carlos',
    title: 'Deploy a produccion en Vercel',
    description: 'El sitio esta listo para ir a produccion. Necesito que crees una cuenta en Vercel (gratis) y conectes el repositorio de GitHub. Yo me encargo del deploy y la configuracion del dominio.',
    type: 'acceso',
    priority: 'alta',
    estimatedImpact: 'El sitio sale al aire y empieza a indexar en Google',
    cost: 'Gratis (plan hobby de Vercel)',
    status: 'pendiente',
  },
  {
    id: 'req-7',
    agentId: 'ana',
    title: 'Instalar Google Analytics 4',
    description: 'Necesito el ID de medicion de Google Analytics para trackear visitantes, paginas vistas, tiempo en sitio y conversiones. Necesitas crear una propiedad GA4 (gratis) y pasarme el ID.',
    type: 'acceso',
    priority: 'media',
    estimatedImpact: 'Datos reales de trafico para optimizar estrategia',
    cost: 'Gratis',
    status: 'pendiente',
  },
  {
    id: 'req-8',
    agentId: 'tomas',
    title: 'Aplicar a programas de afiliados',
    description: 'Quiero aplicar a los programas de afiliados de ChatGPT Plus, Jasper, Canva Pro y Hostinger. Pagan entre $50-200 por referido. Necesito tu email y nombre para registrar las cuentas de afiliado.',
    type: 'aprobacion',
    priority: 'media',
    estimatedImpact: 'Segundo flujo de ingresos — $200-2,000/mes con trafico',
    cost: 'Gratis',
    status: 'pendiente',
  },
  {
    id: 'req-9',
    agentId: 'diego',
    title: 'Presupuesto de $20 USD para ads en Reddit',
    description: 'Detecte 3 subreddits en espanol con +50K usuarios interesados en IA. Con $20 puedo hacer una campana de 2 semanas promocionando nuestros mejores articulos. ROI estimado: 500-1,000 visitas nuevas.',
    type: 'presupuesto',
    priority: 'baja',
    estimatedImpact: '500-1,000 visitas nuevas + posible viralidad',
    cost: '$20 USD',
    status: 'pendiente',
  },
  {
    id: 'req-10',
    agentId: 'sofia',
    title: 'Vincular cuenta de MercadoPago',
    description: 'Para el contenido premium futuro necesitamos un procesador de pagos. Crea tu cuenta de MercadoPago (si no tenes una) y pasame el Access Token para integrarlo al sitio.',
    type: 'acceso',
    priority: 'media',
    estimatedImpact: 'Habilitacion de cobros en LATAM',
    cost: 'Gratis (MercadoPago cobra comision por venta)',
    status: 'pendiente',
  },
];

export function getPendingRequests(): AccessRequest[] {
  return accessRequests.filter((r) => r.status === 'pendiente');
}

export function getRequestsByAgent(agentId: string): AccessRequest[] {
  return accessRequests.filter((r) => r.agentId === agentId);
}

export interface ActivityItem {
  agentName: string;
  agentAvatar: string;
  action: string;
  timestamp: string;
  department: string;
}

export function getAgentIntegrations(agentId: string) {
  const agent = agents.find(a => a.id === agentId);
  if (!agent) return { connected: 0, pending: 0, total: 0, items: [] };
  const items = agent.integrations || [];
  return {
    connected: items.filter(i => i.status === 'conectado').length,
    pending: items.filter(i => i.status === 'pendiente').length,
    total: items.length,
    items,
  };
}

export function getActivityFeed(): ActivityItem[] {
  const timestamps = [
    'hace 30 seg', 'hace 1 min', 'hace 2 min', 'hace 3 min',
    'hace 5 min', 'hace 7 min', 'hace 8 min', 'hace 10 min',
    'hace 12 min', 'hace 15 min', 'hace 18 min', 'hace 20 min',
    'hace 22 min', 'hace 25 min', 'hace 28 min', 'hace 30 min',
    'hace 35 min', 'hace 40 min', 'hace 45 min', 'hace 50 min',
  ];

  const feed: ActivityItem[] = [];
  let tIdx = 0;

  for (const agent of agents) {
    for (const action of agent.recentActions) {
      if (tIdx < timestamps.length) {
        feed.push({
          agentName: agent.name,
          agentAvatar: agent.avatar,
          action,
          timestamp: timestamps[tIdx],
          department: agent.department,
        });
        tIdx++;
      }
    }
  }

  // Shuffle to mix agents in the feed, then sort by timestamp index for realism
  return feed
    .map((item, idx) => ({ item, sort: Math.sin(idx * 7) }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ item }, idx) => ({
      ...item,
      timestamp: timestamps[idx] || 'hace 1 hora',
    }));
}
