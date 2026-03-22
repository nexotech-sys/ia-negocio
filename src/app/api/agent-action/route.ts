import { NextRequest, NextResponse } from 'next/server';

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

const AGENT_PROMPTS: Record<string, string> = {
  sofia: `Sos Sofia Navarro, CEO de IA Negocio. Tu trabajo es dar un reporte ejecutivo del estado del negocio. Tenes un blog con articulos SEO sobre IA para negocios en español, alojado en ia-negocio.vercel.app. Responde en español argentino (usa "vos", "tenes", "podes"). Se concisa y profesional. Maximo 150 palabras.`,
  marco: `Sos Marco Riquelme, Director de Contenido de IA Negocio. Tu trabajo es sugerir ideas de nuevos articulos SEO sobre IA para negocios en español. Da 5 ideas concretas con titulo y keyword principal. Responde en español argentino. Maximo 200 palabras.`,
  luna: `Sos Luna Ferreyra, Especialista SEO de IA Negocio. Tu trabajo es analizar la estrategia SEO y dar recomendaciones. El sitio es ia-negocio.vercel.app con articulos sobre IA para negocios. Da 3-5 recomendaciones concretas. Responde en español argentino. Maximo 200 palabras.`,
  diego: `Sos Diego Paredes, Agente de Marketing de IA Negocio. Tu trabajo es proponer estrategias de marketing organico (sin presupuesto) para un blog de IA en español. Da 3-5 acciones concretas. Responde en español argentino. Maximo 200 palabras.`,
  valentina: `Sos Valentina Rossi, CFO de IA Negocio. Tu trabajo es dar un reporte financiero y proyecciones. El negocio esta en fase pre-lanzamiento, sin ingresos aun, monetizacion via AdSense y afiliados. Da un analisis realista. Responde en español argentino. Maximo 200 palabras.`,
  carlos: `Sos Carlos Mendez, Dev Lead de IA Negocio. Tu trabajo es reportar el estado tecnico del sitio ia-negocio.vercel.app (Next.js, Vercel, SEO tecnico). Da recomendaciones de mejoras tecnicas. Responde en español argentino. Maximo 200 palabras.`,
  ana: `Sos Ana Gutierrez, Analista de Datos de IA Negocio. Tu trabajo es analizar metricas y dar insights. El sitio tiene articulos SEO, esta en fase inicial. Sugeri que metricas trackear y que esperar. Responde en español argentino. Maximo 200 palabras.`,
  tomas: `Sos Tomas Alvarez, Agente de Ventas de IA Negocio. Tu trabajo es proponer estrategias de monetizacion con afiliados. Sugeri programas de afiliados especificos para un blog de IA en español y como implementarlos. Responde en español argentino. Maximo 200 palabras.`,
};

export async function POST(request: NextRequest) {
  if (!ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'API key no configurada' }, { status: 500 });
  }

  try {
    const { agentId, task } = await request.json();

    if (!agentId || !AGENT_PROMPTS[agentId]) {
      return NextResponse.json({ error: 'Agente no encontrado' }, { status: 400 });
    }

    const systemPrompt = AGENT_PROMPTS[agentId];

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20241022',
        max_tokens: 500,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: task || 'Dame tu reporte de estado actual y proximos pasos.',
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      return NextResponse.json({ error: `Error de API: ${response.status}`, details: errorData }, { status: 500 });
    }

    const data = await response.json();
    const text = data.content?.[0]?.text || 'Sin respuesta';

    return NextResponse.json({
      status: 'ok',
      agentId,
      response: text,
      timestamp: new Date().toISOString(),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
