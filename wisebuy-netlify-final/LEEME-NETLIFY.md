# WiseBuy en Netlify — guía desde el móvil

Tu web lista para Netlify. La parte de servidor (que protege tu clave de API)
ya está colocada donde Netlify la espera.

## Necesitas antes de empezar
1. Tu CLAVE DE API de Anthropic (empieza por sk-ant-...). Se saca en
   console.anthropic.com y hay que tenerle saldo.
2. Una cuenta en netlify.com (gratis, entra con email o Google).

## Método recomendado: conectar con GitHub (para que la IA funcione)
1. Sube esta carpeta a un repositorio de GitHub.
2. En Netlify: "Add new site" -> "Import an existing project" -> GitHub
   -> elige tu repositorio.
3. Netlify detecta la configuración (netlify.toml) solo. No cambies nada.
4. En "Environment variables" añade:
       Clave:  ANTHROPIC_API_KEY
       Valor:  (pega tu clave sk-ant-...)
5. Deploy. En un par de minutos tendrás un enlace tipo
       https://wisebuy-algo.netlify.app
   Ese es el enlace que puedes abrir y pasar a quien quieras.

## Importante
- El método "arrastrar y soltar" de Netlify NO despliega bien la función del
  servidor: la web se vería pero la IA daría error. Usa el método de GitHub.
- Sin la variable ANTHROPIC_API_KEY, la web se ve pero la IA da error.
- El pago de 29,99 € es demostración (desbloquea sin cobrar). Cobrar de
  verdad requiere conectar Stripe, más adelante.

## Dominio propio (opcional)
Site settings -> Domain management -> añade tu dominio (p.ej. wisebuy.es)
y sigue los pasos de DNS.
