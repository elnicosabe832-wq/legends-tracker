import OpenAI from 'openai';

const SYSTEM_PROMPT = `Eres un extractor de datos de EA Sports FC (Modo Carrera).
Lees capturas del "Menú de plantilla" → pestaña "Estadísticas".
Columnas: Pos., Nombre, Jug. (partidos), Goles, Asist., Portería a cero.
Los datos son el TOTAL de la temporada en TODAS las competiciones.
Responde con JSON: {"players":[{"name":"A. Dovbyk","pos":"DC","matches":52,"goals":33,"assists":2,"cleanSheets":15}]}
Reglas: name abreviado como en el juego, pos en español (POR, DFC, MC, MCO, DC...), solo jugadores visibles, números enteros.`;

function parsePlayersJson(raw) {
  if (!raw) throw new Error('La IA devolvió una respuesta vacía');

  let jsonStr = raw.replace(/^```json?\s*/i, '').replace(/```\s*$/i, '').trim();

  try {
    return JSON.parse(jsonStr);
  } catch {
    const match = jsonStr.match(/\{[\s\S]*"players"[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    throw new Error('La IA no devolvió JSON válido. Intenta con capturas más nítidas.');
  }
}

function normalizePlayers(players) {
  if (!Array.isArray(players)) {
    throw new Error('La IA no devolvió una lista de jugadores válida');
  }

  return players.map((p) => ({
    name: String(p.name || '').trim(),
    pos: String(p.pos || '—').trim(),
    matches: Number(p.matches) || 0,
    goals: Number(p.goals) || 0,
    assists: Number(p.assists) || 0,
    cleanSheets: Number(p.cleanSheets) || 0,
  })).filter((p) => p.name);
}

export async function extractPlayersFromImages(images, teamName) {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const content = [
    {
      type: 'text',
      text: `Extrae las estadísticas de todos los jugadores visibles en estas capturas del Modo Carrera del equipo "${teamName}".`,
    },
    ...images.map((img) => ({
      type: 'image_url',
      image_url: { url: img, detail: 'high' },
    })),
  ];

  const response = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content },
    ],
    max_tokens: 4096,
    temperature: 0.1,
  });

  const raw = response.choices[0]?.message?.content?.trim() || '';
  const parsed = parsePlayersJson(raw);
  return normalizePlayers(parsed.players);
}
