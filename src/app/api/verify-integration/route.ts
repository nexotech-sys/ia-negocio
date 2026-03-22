import { NextRequest, NextResponse } from 'next/server';

// Real connection verification for each integration
// Tests actual API endpoints to confirm credentials work

type VerifyResult = {
  success: boolean;
  status: 'connected' | 'failed' | 'format_only';
  message: string;
  details?: string;
};

async function verifyNotionKey(apiKey: string): Promise<VerifyResult> {
  try {
    const res = await fetch('https://api.notion.com/v1/users/me', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Notion-Version': '2022-06-28',
      },
    });
    if (res.ok) {
      const data = await res.json();
      return { success: true, status: 'connected', message: 'Conexion establecida con Notion', details: `Cuenta: ${data.name || 'verificada'}` };
    }
    if (res.status === 401) return { success: false, status: 'failed', message: 'API key de Notion invalida o expirada' };
    return { success: false, status: 'failed', message: `Notion respondio con error ${res.status}` };
  } catch {
    return { success: false, status: 'failed', message: 'No se pudo conectar con Notion — verifica tu conexion a internet' };
  }
}

async function verifySlackWebhook(webhookUrl: string): Promise<VerifyResult> {
  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: '✅ IA Negocio conectado exitosamente — este es un mensaje de verificacion' }),
    });
    if (res.ok) return { success: true, status: 'connected', message: 'Conexion establecida con Slack', details: 'Mensaje de prueba enviado al canal' };
    return { success: false, status: 'failed', message: 'Webhook de Slack invalido o canal eliminado' };
  } catch {
    return { success: false, status: 'failed', message: 'No se pudo conectar con Slack' };
  }
}

async function verifyGitHubToken(token: string): Promise<VerifyResult> {
  try {
    const res = await fetch('https://api.github.com/user', {
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/vnd.github+json' },
    });
    if (res.ok) {
      const data = await res.json();
      return { success: true, status: 'connected', message: 'Conexion establecida con GitHub', details: `Usuario: ${data.login}` };
    }
    if (res.status === 401) return { success: false, status: 'failed', message: 'Token de GitHub invalido o expirado' };
    return { success: false, status: 'failed', message: `GitHub respondio con error ${res.status}` };
  } catch {
    return { success: false, status: 'failed', message: 'No se pudo conectar con GitHub' };
  }
}

async function verifyVercelToken(token: string): Promise<VerifyResult> {
  try {
    const res = await fetch('https://api.vercel.com/v2/user', {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      return { success: true, status: 'connected', message: 'Conexion establecida con Vercel', details: `Usuario: ${data.user?.username || 'verificado'}` };
    }
    if (res.status === 401 || res.status === 403) return { success: false, status: 'failed', message: 'Token de Vercel invalido o sin permisos' };
    return { success: false, status: 'failed', message: `Vercel respondio con error ${res.status}` };
  } catch {
    return { success: false, status: 'failed', message: 'No se pudo conectar con Vercel' };
  }
}

async function verifyStripeKey(secretKey: string): Promise<VerifyResult> {
  try {
    const res = await fetch('https://api.stripe.com/v1/balance', {
      headers: { 'Authorization': `Bearer ${secretKey}` },
    });
    if (res.ok) return { success: true, status: 'connected', message: 'Conexion establecida con Stripe', details: 'Balance accesible' };
    if (res.status === 401) return { success: false, status: 'failed', message: 'Secret key de Stripe invalida' };
    return { success: false, status: 'failed', message: `Stripe respondio con error ${res.status}` };
  } catch {
    return { success: false, status: 'failed', message: 'No se pudo conectar con Stripe' };
  }
}

async function verifyMailchimpKey(apiKey: string): Promise<VerifyResult> {
  try {
    // Mailchimp key format: hex32-usXX, datacenter is after the dash
    const dc = apiKey.split('-').pop();
    const res = await fetch(`https://${dc}.api.mailchimp.com/3.0/ping`, {
      headers: { 'Authorization': `Bearer ${apiKey}` },
    });
    if (res.ok) return { success: true, status: 'connected', message: 'Conexion establecida con Mailchimp', details: 'Cuenta verificada' };
    if (res.status === 401) return { success: false, status: 'failed', message: 'API key de Mailchimp invalida' };
    return { success: false, status: 'failed', message: `Mailchimp respondio con error ${res.status}` };
  } catch {
    return { success: false, status: 'failed', message: 'No se pudo conectar con Mailchimp' };
  }
}

async function verifyMetaToken(token: string): Promise<VerifyResult> {
  try {
    const res = await fetch(`https://graph.facebook.com/v19.0/me?access_token=${token}`);
    if (res.ok) {
      const data = await res.json();
      return { success: true, status: 'connected', message: 'Conexion establecida con Meta', details: `Cuenta: ${data.name || data.id}` };
    }
    if (res.status === 401 || (await res.json().catch(() => ({}))).error) {
      return { success: false, status: 'failed', message: 'Token de Meta invalido o expirado' };
    }
    return { success: false, status: 'failed', message: `Meta respondio con error ${res.status}` };
  } catch {
    return { success: false, status: 'failed', message: 'No se pudo conectar con Meta Business' };
  }
}

async function verifyTwitterBearer(token: string): Promise<VerifyResult> {
  try {
    const res = await fetch('https://api.twitter.com/2/users/me', {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      return { success: true, status: 'connected', message: 'Conexion establecida con Twitter/X', details: `@${data.data?.username || 'verificado'}` };
    }
    if (res.status === 401) return { success: false, status: 'failed', message: 'Bearer Token de Twitter invalido' };
    return { success: false, status: 'failed', message: `Twitter respondio con error ${res.status}` };
  } catch {
    return { success: false, status: 'failed', message: 'No se pudo conectar con Twitter/X' };
  }
}

async function verifyInstagramToken(token: string): Promise<VerifyResult> {
  try {
    const res = await fetch(`https://graph.instagram.com/me?fields=id,username&access_token=${token}`);
    if (res.ok) {
      const data = await res.json();
      return { success: true, status: 'connected', message: 'Conexion establecida con Instagram', details: `@${data.username || 'verificado'}` };
    }
    return { success: false, status: 'failed', message: 'Token de Instagram invalido o expirado' };
  } catch {
    return { success: false, status: 'failed', message: 'No se pudo conectar con Instagram' };
  }
}

async function verifyHubSpotToken(token: string): Promise<VerifyResult> {
  try {
    const res = await fetch('https://api.hubapi.com/crm/v3/objects/contacts?limit=1', {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (res.ok) return { success: true, status: 'connected', message: 'Conexion establecida con HubSpot', details: 'CRM accesible' };
    if (res.status === 401) return { success: false, status: 'failed', message: 'Token de HubSpot invalido' };
    return { success: false, status: 'failed', message: `HubSpot respondio con error ${res.status}` };
  } catch {
    return { success: false, status: 'failed', message: 'No se pudo conectar con HubSpot' };
  }
}

async function verifyMercadoPagoToken(token: string): Promise<VerifyResult> {
  try {
    const res = await fetch('https://api.mercadopago.com/v1/payment_methods', {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (res.ok) return { success: true, status: 'connected', message: 'Conexion establecida con MercadoPago', details: 'Metodos de pago accesibles' };
    if (res.status === 401) return { success: false, status: 'failed', message: 'Access Token de MercadoPago invalido' };
    return { success: false, status: 'failed', message: `MercadoPago respondio con error ${res.status}` };
  } catch {
    return { success: false, status: 'failed', message: 'No se pudo conectar con MercadoPago' };
  }
}

async function verifyUrlReachable(url: string, serviceName: string): Promise<VerifyResult> {
  try {
    const res = await fetch(url, { method: 'HEAD', redirect: 'follow' });
    if (res.ok || res.status === 301 || res.status === 302 || res.status === 405) {
      return { success: true, status: 'connected', message: `URL de ${serviceName} verificada`, details: `${url} accesible` };
    }
    return { success: false, status: 'failed', message: `La URL no responde correctamente (status ${res.status})` };
  } catch {
    return { success: false, status: 'failed', message: `No se pudo acceder a ${url}` };
  }
}

// Map integration names to their verification functions
const verificationMap: Record<string, (credential: string) => Promise<VerifyResult>> = {
  // APIs that can be tested directly
  'Notion': verifyNotionKey,
  'Slack': verifySlackWebhook,
  'GitHub': verifyGitHubToken,
  'Vercel': verifyVercelToken,
  'Stripe': verifyStripeKey,
  'Mailchimp': verifyMailchimpKey,
  'Facebook/Meta Ads': verifyMetaToken,
  'Twitter/X API': verifyTwitterBearer,
  'Instagram API': verifyInstagramToken,
  'HubSpot CRM': verifyHubSpotToken,
  'MercadoPago': verifyMercadoPagoToken,

  // URL-based verifications
  'Google Search Console': (url) => verifyUrlReachable(url, 'Search Console'),
  'WordPress/CMS': (cred) => verifyUrlReachable(cred.split('|')[0], 'WordPress'),

  // Affiliate links — verify the URL exists
  'Programa afiliados ChatGPT': (url) => verifyUrlReachable(url, 'OpenAI Affiliates'),
  'Programa afiliados Jasper': (url) => verifyUrlReachable(url, 'Jasper Affiliates'),
  'Programa afiliados Canva Pro': (url) => verifyUrlReachable(url, 'Canva Affiliates'),
  'Programa afiliados Hostinger': (url) => verifyUrlReachable(url, 'Hostinger Affiliates'),
};

// Integrations that can only be format-validated (no API to test)
const formatOnlyIntegrations = new Set([
  'Google Workspace',
  'Google Calendar',
  'Google Docs',
  'Google Sheets',
  'Looker Studio',
  'Grammarly API',
  'Canva',
  'Google Analytics 4',
  'Ahrefs',
  'Screaming Frog',
  'Hotjar',
  'Google Tag Manager',
  'Google AdSense',
  'Reddit Ads',
  'UptimeRobot',
  'Cloudflare',
]);

export async function POST(request: NextRequest) {
  try {
    const { integrationName, credential } = await request.json();

    if (!integrationName || !credential) {
      return NextResponse.json({ success: false, status: 'failed', message: 'Faltan datos' }, { status: 400 });
    }

    // Check if we have a real verification function
    const verifyFn = verificationMap[integrationName];
    if (verifyFn) {
      const result = await verifyFn(credential);
      return NextResponse.json(result);
    }

    // Format-only integrations — we validated the format already, can't test connection
    if (formatOnlyIntegrations.has(integrationName)) {
      return NextResponse.json({
        success: true,
        status: 'format_only',
        message: 'Formato valido — verificacion de conexion no disponible para este servicio',
        details: 'Este servicio requiere configuracion manual en su plataforma',
      });
    }

    // Unknown integration
    return NextResponse.json({
      success: false,
      status: 'format_only',
      message: 'No se puede verificar esta integracion automaticamente',
    });
  } catch {
    return NextResponse.json(
      { success: false, status: 'failed', message: 'Error interno al verificar' },
      { status: 500 }
    );
  }
}
