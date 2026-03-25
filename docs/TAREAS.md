# Tareas - Manuales vs Automaticas

## AUTOMATICAS (no requieren intervencion)

| Tarea | Frecuencia | Agente | Detalle |
|-------|------------|--------|---------|
| Generar articulo nuevo | Diaria (9am) | Sofia+Marco+Luna+Carlos | Cron en Vercel + GitHub Actions |
| Optimizar SEO del articulo | Diaria | Luna | Se ejecuta dentro del cron |
| Sugerir afiliados | Diaria | Tomas | Analiza cada articulo nuevo |
| Actualizar calendario | Diaria | Sofia | Escribe status.json |
| Publicar en GitHub | Diaria | Carlos | Commit automatico via API |
| Auto-deploy en Vercel | Cada push | Vercel | Detecta cambios en main |
| Health check del sitio | Semanal (lunes) | GitHub Actions | Verifica URLs y APIs |
| Indexacion Google | Continuo | Google | Crawlea el sitemap automaticamente |

## MANUALES (requieren accion de Nacho)

| Tarea | Cuando | Agente que lo pide | Que hacer |
|-------|--------|-------------------|-----------|
| Aplicar a Google AdSense | Mes 2-3 (cuando haya trafico) | Valentina | Ir a adsense.google.com y aplicar |
| Registrarse en programas de afiliados | Semana 2-3 | Tomas | Crear cuentas en Jasper, Canva, Hostinger |
| Crear cuenta PayPal | Semana 3 | Valentina | paypal.com/signup + conectar banco |
| Recargar credito API | Cuando se agote (~cada 2 meses) | Carlos | console.anthropic.com/settings/billing |
| Revisar informes semanales | Viernes | Sofia | Abrir dashboard > Calendario |
| Conectar nuevas integraciones | Cuando los agentes pidan | Varios | Dashboard > Integraciones |

## SEMI-AUTOMATICAS (el agente prepara, Nacho aprueba)

| Tarea | Frecuencia | Agente | Detalle |
|-------|------------|--------|---------|
| Solicitudes de acceso | Cuando surjan | Varios | Dashboard > Solicitudes > Aprobar/Rechazar |
| Cambios en el calendario | Diaria | Sofia | Sofia actualiza, Nacho revisa |
| Nuevas integraciones | Cuando surjan | Varios | Aparecen en Integraciones con instrucciones |
