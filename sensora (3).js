exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) };

  try {
    const { jornada, marca, briefing, ondas } = JSON.parse(event.body || '{}');

    const system = `Voce e Sensora, inteligencia de branding da Plimper (Vitoria/ES).
Metodologia Sensora Brand: Olhe / Ouca / Sinta.
Cinco ondas perceptuais: Atencao, Conexao, Desejo, Experiencia, Memoria.

Gere relatorio estrategico completo em markdown com esta estrutura:

# RELATORIO SENSORA BRAND
## ${marca || 'MARCA'}

## DIAGNOSTICO
(Situacao atual - 2 frases diretas e estrategicas)

## PERCEPCAO
(Como a marca e ou sera vista, interpretada e lembrada)

## MAPA SENSORIAL
### Visual: [diretrizes visuais]
### Verbal: [tom de voz e linguagem]
### Emocional: [arquetipo e emocao central]

## ONDAS DA PERCEPCAO
### Atencao: [como captura atencao]
### Conexao: [como cria vinculo]
### Desejo: [como gera desejo]
### Experiencia: [como entrega experiencia]
### Memoria: [como fica na memoria]

## POSICIONAMENTO
[1 frase de posicionamento poderosa]

## OPORTUNIDADES
1. [oportunidade estrategica]
2. [oportunidade estrategica]
3. [oportunidade estrategica]

## PROXIMOS PASSOS
1. [acao imediata - 30 dias]
2. [curto prazo - 90 dias]
3. [medio prazo - 6 meses]
4. [longo prazo - 1 ano]
5. [KPI - como medir o sucesso]

---
Linguagem premium, editorial, sem cliches. Direto e estrategico.`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1400,
        system,
        messages: [{ role: 'user', content: `Jornada: ${jornada}\n\nBriefing:\n${briefing}\n\nOndas prioritarias: ${ondas || 'todas'}` }]
      })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || 'Erro API');
    const report = data.content?.map(b => b.text || '').join('') || '';
    return { statusCode: 200, headers, body: JSON.stringify({ report }) };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
