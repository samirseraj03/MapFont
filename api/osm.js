export default async function handler(req, res) {
  // Configuración de CORS para permitir solicitudes desde cualquier origen (app nativa Capacitor o web)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Respuesta rápida para pre-flight requests de CORS
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Extraer la query de Overpass enviada por el frontend
  let overpassQuery = '';
  if (req.body && req.body.data) {
    overpassQuery = req.body.data;
  } else if (typeof req.body === 'string') {
    if (req.body.startsWith('data=')) {
      overpassQuery = decodeURIComponent(req.body.substring(5));
    } else {
      overpassQuery = req.body;
    }
  }

  if (!overpassQuery) {
    return res.status(400).json({ error: 'No query provided' });
  }

  // Servidores Overpass a los que el proxy intentará conectarse
  const overpassEndpoints = [
      'https://overpass.openstreetmap.fr/api/interpreter',
      'https://lz4.overpass-api.de/api/interpreter',
      'https://overpass-api.de/api/interpreter',
      'https://z.overpass-api.de/api/interpreter',
      'https://overpass.openstreetmap.ru/api/interpreter'
  ];

  let textData = '';
  let success = false;

  for (const url of overpassEndpoints) {
      try {
          const response = await fetch(url, {
              method: 'POST',
              headers: { 
                'Content-Type': 'application/x-www-form-urlencoded',
                // Overpass API exige un User-Agent identificativo. Sin esto, bloquean las solicitudes.
                'User-Agent': 'MapFont-App/1.0 (Contact: admin@mapfont.vercel.app)'
              },
              body: 'data=' + encodeURIComponent(overpassQuery),
              // Vercel function timeout is usually 10s on hobby plan, so we set a timeout using abort controller
              signal: AbortSignal.timeout ? AbortSignal.timeout(8000) : undefined
          });

          if (response.ok) {
              textData = await response.text();
              success = true;
              break;
          } else {
              console.warn(`[Proxy] Server ${url} responded with status ${response.status}`);
          }
      } catch (err) {
          console.error(`[Proxy] Network error with ${url}:`, err.message);
      }
  }

  if (success) {
      res.status(200).send(textData);
  } else {
      res.status(502).json({ error: 'All Overpass endpoints failed or timed out from proxy.' });
  }
}
