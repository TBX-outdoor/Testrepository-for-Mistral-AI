import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Mistral } from '@mistralai/mistralai';

const MODEL = 'mistral-small-latest';
const MAX_MESSAGES = 50;
const MAX_CONTENT_CHARS = 8000;

const apiKey = process.env.MISTRAL_API_KEY;
if (!apiKey) {
  console.error('Fehler: MISTRAL_API_KEY ist nicht gesetzt (Umgebungsvariable oder .env-Datei).');
  process.exit(1);
}

const client = new Mistral({ apiKey });

type ChatRole = 'system' | 'user' | 'assistant';

interface ChatMessage {
  role: ChatRole;
  content: string;
}

type SDKMessages = Parameters<typeof client.chat.complete>[0]['messages'];

function isValidMessages(body: unknown): body is { messages: ChatMessage[] } {
  if (typeof body !== 'object' || body === null) return false;
  const messages = (body as { messages?: unknown }).messages;
  if (!Array.isArray(messages) || messages.length === 0 || messages.length > MAX_MESSAGES) return false;
  return messages.every(
    (m) =>
      typeof m === 'object' &&
      m !== null &&
      ['system', 'user', 'assistant'].includes((m as ChatMessage).role) &&
      typeof (m as ChatMessage).content === 'string' &&
      (m as ChatMessage).content.trim().length > 0 &&
      (m as ChatMessage).content.length <= MAX_CONTENT_CHARS,
  );
}

function contentToText(content: unknown): string {
  if (typeof content === 'string') return content;
  if (Array.isArray(content)) {
    return content
      .map((chunk) =>
        typeof chunk === 'object' && chunk !== null && 'text' in chunk && typeof (chunk as { text?: unknown }).text === 'string'
          ? (chunk as { text: string }).text
          : '',
      )
      .join('');
  }
  return '';
}

const app = express();
app.use(express.json({ limit: '64kb' }));

app.post('/api/chat', async (req, res) => {
  if (!isValidMessages(req.body)) {
    return res.status(400).json({ error: 'Ungültige Anfrage: "messages" fehlt oder ist ungültig.' });
  }
  try {
    const response = await client.chat.complete({
      model: MODEL,
      messages: req.body.messages as SDKMessages,
    });
    const reply = contentToText(response.choices?.[0]?.message?.content);
    if (!reply) {
      return res.status(502).json({ error: 'Die Mistral-API hat eine leere Antwort geliefert.' });
    }
    return res.json({ reply });
  } catch (error) {
    console.error('Mistral-API-Fehler:', error);
    return res.status(502).json({ error: 'Die Mistral-API konnte nicht erreicht werden.' });
  }
});

const publicDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'public');
app.use(express.static(publicDir));

const port = Number(process.env.PORT ?? 3000);
app.listen(port, () => {
  console.log(`Chat-App läuft auf http://localhost:${port} (Modell: ${MODEL})`);
});
