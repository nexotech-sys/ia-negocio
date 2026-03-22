import { NextRequest, NextResponse } from 'next/server';

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO = 'nexotech-sys/ia-negocio';

// Vercel Cron calls this daily — Marco writes a new article autonomously
export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'No API key' }, { status: 500 });
  }

  try {
    // Step 1: Ask Claude to generate a new article
    const aiResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4000,
        system: `Sos Marco Riquelme, Director de Contenido de IA Negocio. Escribis articulos SEO en español argentino (usa "vos", "podes", "tenes") sobre inteligencia artificial para negocios y emprendedores.

IMPORTANTE: Responde SOLO con un JSON valido, sin texto adicional. El formato EXACTO:
{
  "slug": "slug-del-articulo",
  "title": "Titulo del Articulo",
  "description": "Descripcion breve de 1-2 oraciones",
  "category": "Guias",
  "date": "${new Date().toISOString().split('T')[0]}",
  "readTime": "10 min",
  "tags": ["tag1", "tag2", "tag3"],
  "metaTitle": "Meta titulo SEO",
  "metaDescription": "Meta descripcion SEO de maximo 160 caracteres",
  "content": "<h2>Titulo</h2><p>Contenido HTML completo del articulo con h2, p, ul, li. Minimo 800 palabras.</p>"
}`,
        messages: [{
          role: 'user',
          content: `Escribi un articulo nuevo sobre un tema trending de IA para negocios que todavia no haya sido cubierto. Elige un tema especifico y practico. Responde SOLO con el JSON.`,
        }],
      }),
    });

    if (!aiResponse.ok) {
      return NextResponse.json({ error: `Claude API error: ${aiResponse.status}` }, { status: 500 });
    }

    const aiData = await aiResponse.json();
    const articleText = aiData.content?.[0]?.text || '';

    // Parse the JSON article
    let article;
    try {
      article = JSON.parse(articleText);
    } catch {
      // Try to extract JSON from the response
      const jsonMatch = articleText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        article = JSON.parse(jsonMatch[0]);
      } else {
        return NextResponse.json({ error: 'Could not parse article JSON' }, { status: 500 });
      }
    }

    // Step 2: Log the article (for now just return it — GitHub push requires PAT)
    // In future: commit to GitHub repo automatically

    return NextResponse.json({
      status: 'ok',
      message: `Marco escribio: "${article.title}"`,
      article: {
        slug: article.slug,
        title: article.title,
        category: article.category,
        date: article.date,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
