import { NextResponse } from 'next/server';

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || '';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';
const REPO_OWNER = 'nexotech-sys';
const REPO_NAME = 'ia-negocio';

async function askClaude(systemPrompt: string, userPrompt: string): Promise<string> {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20241022',
      max_tokens: 4000,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    }),
  });
  const data = await res.json();
  if (data.content && data.content[0]) {
    return data.content[0].text;
  }
  throw new Error('No response from Claude: ' + JSON.stringify(data));
}

async function commitToGitHub(filePath: string, content: string, message: string) {
  // Get the current SHA of the file if it exists
  const getRes = await fetch(
    `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${filePath}`,
    { headers: { Authorization: `Bearer ${GITHUB_TOKEN}`, 'User-Agent': 'ia-negocio-bot' } }
  );

  let sha: string | undefined;
  if (getRes.ok) {
    const existing = await getRes.json();
    sha = existing.sha;
  }

  // Create or update the file
  const body: Record<string, string> = {
    message,
    content: Buffer.from(content).toString('base64'),
    branch: 'main',
  };
  if (sha) body.sha = sha;

  const putRes = await fetch(
    `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${filePath}`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        'User-Agent': 'ia-negocio-bot',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    }
  );

  if (!putRes.ok) {
    const err = await putRes.text();
    throw new Error(`GitHub commit failed: ${err}`);
  }
  return putRes.json();
}

export async function GET() {
  try {
    if (!ANTHROPIC_API_KEY) {
      return NextResponse.json({ error: 'No API key configured' }, { status: 500 });
    }

    const today = new Date().toISOString().split('T')[0];
    const log: string[] = [];

    // ============ STEP 1: Sofia (CEO) thinks and gives directions ============
    log.push('Sofia (CEO) analizando estrategia...');

    const sofiaDirective = await askClaude(
      `Sos Sofia Navarro, CEO de IA Negocio, un blog en español sobre inteligencia artificial para negocios y emprendedores latinoamericanos.
Tu personalidad: visionaria, estratégica, directa, con mentalidad de Elon Musk.
El sitio tiene ~50 articulos publicados sobre IA para negocios.
Tu trabajo: pensar QUE articulo nuevo necesita el blog hoy para crecer en SEO y trafico.
IMPORTANTE: El articulo debe ser sobre un tema NUEVO que no exista todavia, orientado a keywords con alto volumen de busqueda en español.`,
      `Hoy es ${today}. Deci el titulo del articulo, el slug (en formato url-friendly), la categoria (Guias, Herramientas, Marketing, Ventas o E-commerce), y 5 tags relevantes. Responde SOLO en formato JSON asi: {"title":"...","slug":"...","category":"...","tags":["..."],"directive":"instruccion corta para Marco sobre que escribir"}`
    );

    let directive;
    try {
      const jsonMatch = sofiaDirective.match(/\{[\s\S]*\}/);
      directive = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
    } catch {
      log.push('Error parsing Sofia directive');
      return NextResponse.json({ log, error: 'Sofia parse error' }, { status: 500 });
    }

    if (!directive) {
      return NextResponse.json({ log, error: 'No directive from Sofia' }, { status: 500 });
    }

    log.push(`Sofia decidio: "${directive.title}"`);

    // ============ STEP 2: Marco writes the article ============
    log.push('Marco (Contenido) escribiendo articulo...');

    const articleContent = await askClaude(
      `Sos Marco Riquelme, Director de Contenido de IA Negocio. Escribis articulos SEO en español argentino (usas "vos", "podes", "tenes") para emprendedores latinoamericanos.
Tu estilo: practico, directo, con ejemplos reales, sin relleno.`,
      `Sofia te pidio que escribas este articulo:
Titulo: ${directive.title}
Instruccion: ${directive.directive}

Escribi el articulo completo en HTML (solo el body content, sin <html> ni <head>).
Usa <h2> para secciones principales, <h3> para subsecciones, <p> para parrafos, <ul><li> para listas, <strong> para negritas.
El articulo debe tener entre 800 y 1200 palabras, ser util y practico.
NO uses emojis. NO pongas el titulo como <h1> (eso lo pone el sitio).
Responde SOLO con el HTML del articulo, nada mas.`
    );

    log.push('Marco termino de escribir');

    // ============ STEP 3: Luna optimizes SEO ============
    log.push('Luna (SEO) optimizando meta tags...');

    const lunaOptimization = await askClaude(
      `Sos Luna Ferreyra, Especialista SEO de IA Negocio. Tu trabajo es optimizar titulos y meta descriptions para maximo CTR en Google.`,
      `Optimiza el SEO de este articulo:
Titulo: ${directive.title}
Categoria: ${directive.category}

Responde SOLO en JSON: {"metaTitle":"titulo optimizado max 60 chars","metaDescription":"description optimizada max 155 chars","readTime":"X min"}`
    );

    let seoData;
    try {
      const jsonMatch = lunaOptimization.match(/\{[\s\S]*\}/);
      seoData = jsonMatch ? JSON.parse(jsonMatch[0]) : { metaTitle: directive.title, metaDescription: directive.title, readTime: '10 min' };
    } catch {
      seoData = { metaTitle: directive.title, metaDescription: directive.title, readTime: '10 min' };
    }

    log.push('Luna optimizo los meta tags');

    // ============ STEP 4: Build the article file and commit to GitHub ============
    log.push('Carlos (Dev) publicando articulo...');

    const articleTs = `import { type Article } from '../articles';

// Auto-generated by IA Negocio agents on ${today}
// Sofia (CEO) -> Marco (Contenido) -> Luna (SEO) -> Carlos (Dev)

export const autoArticle_${directive.slug.replace(/-/g, '_')}: Article = {
  slug: "${directive.slug}",
  title: ${JSON.stringify(directive.title)},
  description: ${JSON.stringify(seoData.metaDescription)},
  content: ${JSON.stringify(articleContent)},
  category: "${directive.category}",
  date: "${today}",
  readTime: "${seoData.readTime}",
  tags: ${JSON.stringify(directive.tags)},
  metaTitle: ${JSON.stringify(seoData.metaTitle)},
  metaDescription: ${JSON.stringify(seoData.metaDescription)},
};
`;

    // Commit the article file
    await commitToGitHub(
      `src/lib/auto-articles/${directive.slug}.ts`,
      articleTs,
      `[Auto] Nuevo articulo: ${directive.title} — by Sofia+Marco+Luna+Carlos`
    );

    log.push(`Articulo publicado: ${directive.slug}`);

    // ============ STEP 5: Update the auto-articles index ============
    // Read existing index
    const indexRes = await fetch(
      `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/src/lib/auto-articles/index.ts`,
      { headers: { Authorization: `Bearer ${GITHUB_TOKEN}`, 'User-Agent': 'ia-negocio-bot' } }
    );

    let existingIndex = '';
    let indexSha: string | undefined;
    if (indexRes.ok) {
      const indexData = await indexRes.json();
      existingIndex = Buffer.from(indexData.content, 'base64').toString('utf-8');
      indexSha = indexData.sha;
    }

    const varName = `autoArticle_${directive.slug.replace(/-/g, '_')}`;
    const importLine = `import { ${varName} } from './${directive.slug}';\n`;

    if (!existingIndex) {
      existingIndex = `import { type Article } from '../articles';\n\n${importLine}\nexport const autoArticles: Article[] = [\n  ${varName},\n];\n`;
    } else {
      // Add import at top (after existing imports)
      const lines = existingIndex.split('\n');
      const lastImportIdx = lines.reduce((acc, line, i) => line.startsWith('import') ? i : acc, 0);
      lines.splice(lastImportIdx + 1, 0, importLine.trim());

      // Add to array
      const arrayMatch = existingIndex.match(/export const autoArticles: Article\[\] = \[/);
      if (arrayMatch) {
        existingIndex = lines.join('\n').replace(
          'export const autoArticles: Article[] = [',
          `export const autoArticles: Article[] = [\n  ${varName},`
        );
      } else {
        existingIndex = lines.join('\n');
      }
    }

    const indexBody: Record<string, string> = {
      message: `[Auto] Update auto-articles index — added ${directive.slug}`,
      content: Buffer.from(existingIndex).toString('base64'),
      branch: 'main',
    };
    if (indexSha) indexBody.sha = indexSha;

    await fetch(
      `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/src/lib/auto-articles/index.ts`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          'User-Agent': 'ia-negocio-bot',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(indexBody),
      }
    );

    log.push('Index actualizado');

    // ============ STEP 6: Tomas checks affiliate opportunities ============
    log.push('Tomas (Ventas) analizando oportunidades de afiliados...');

    const tomasReport = await askClaude(
      `Sos Tomas Alvarez, Agente de Ventas de IA Negocio. Tu trabajo es encontrar oportunidades de monetizacion en los articulos del blog.`,
      `Se acaba de publicar un articulo nuevo: "${directive.title}". Sugeri 2-3 programas de afiliados que podriamos linkear en este articulo. Responde en 2-3 oraciones cortas.`
    );

    log.push(`Tomas: ${tomasReport}`);

    // ============ DONE ============
    return NextResponse.json({
      status: 'ok',
      date: today,
      article: {
        title: directive.title,
        slug: directive.slug,
        category: directive.category,
      },
      agents: {
        sofia: 'Definio estrategia y eligio tema',
        marco: 'Escribio el articulo completo',
        luna: 'Optimizo meta tags SEO',
        carlos: 'Publico en GitHub (auto-deploy)',
        tomas: tomasReport,
      },
      log,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Cron failed', details: String(error) },
      { status: 500 }
    );
  }
}
