# Testrepository-for-Mistral-AI
This is just for testing the collaboration of Mistral AI and Github

Minimale Web-App: Ein Node.js/TypeScript-Server ruft die Mistral-API über das offizielle
SDK [`@mistralai/mistralai`](https://www.npmjs.com/package/@mistralai/mistralai) auf
(Modell: `mistral-small-latest`) und liefert eine einfache Chat-Seite im Browser aus.

Der API-Key liegt ausschließlich auf dem Server (`MISTRAL_API_KEY` in der Umgebung bzw.
`.env`, siehe `.gitignore`) und wird nie an den Browser gesendet. Das Frontend schickt
lediglich den Chat-Verlauf an `POST /api/chat`; der Server ergänzt den Key und fragt
Mistral ab.

## Voraussetzungen

- Node.js 20+ (getestet mit Node 22) und npm
- Ein Mistral-API-Key von <https://console.mistral.ai/api-keys/>

## Installation

```bash
npm install
```

## API-Key konfigurieren

```bash
cp .env.example .env
```

Dann in `.env` den eigenen Key eintragen:

```bash
MISTRAL_API_KEY=sk-...
```

Alternativ ohne `.env`-Datei direkt als Umgebungsvariable:

```bash
export MISTRAL_API_KEY=sk-...   # Linux/macOS
# set MISTRAL_API_KEY=sk-...    # Windows (CMD)
```

## Lokal starten

Entwicklung (mit automatischem-Neuladen via `tsx watch`):

```bash
npm run dev
```

Produktion:

```bash
npm run build
npm start
```

Danach im Browser öffnen: <http://localhost:3000>

Der Port lässt sich über `PORT=8080 npm run dev` ändern.

## Projektstruktur

```
src/server.ts      Express-Server: statische Dateien + POST /api/chat (Mistral-SDK)
public/index.html  Chat-Oberfläche (Vanilla JS, kein Build-Schritt fürs Frontend)
.env               API-Key (lokal, nicht commiten)
```

## API-Endpunkt

`POST /api/chat`

```json
{
  "messages": [
    { "role": "user", "content": "Hallo!" }
  ]
}
```

Antwort:

```json
{ "reply": "Hallo! Wie kann ich dir helfen?" }
```
