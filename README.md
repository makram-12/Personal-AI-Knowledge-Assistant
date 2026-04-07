# Personal AI Knowledge Assistant

Production-ready Personal AI Knowledge Assistant built with:

- Node.js + Express
- MongoDB
- React + Vite
- Gemini API

This project provides a private RAG workflow:

1. Ingest user knowledge (text/long content)
2. Split into chunks
3. Generate embeddings per chunk
4. Retrieve top-k relevant chunks
5. Generate grounded AI responses in chat

## Architecture

### Backend

- Auth and security:
  - JWT authentication
  - Route protection middleware
  - `helmet` + `express-rate-limit`
- RAG pipeline:
  - Chunk ingestion service
  - Embedding generation with in-memory cache
  - Similarity search (cosine similarity)
  - Context limiting before LLM call
- Chat system:
  - Multi-session chat
  - Message history per session
  - Context-aware responses with retrieved sources

### Frontend

- Login/Register screen
- Dashboard layout with:
  - Chat sessions
  - Chat conversation panel
  - Knowledge ingestion panel
  - Knowledge list summary

## Project Structure

```text
Personal AI Knowledge Assistant/
  client/
  server/
    src/
      config/
      controllers/
      middleware/
      models/
      routes/
      services/
      utils/
```

## Environment Variables

### Server

Copy `server/.env.example` to `server/.env` and fill values:

- `MONGO_URI`
- `GEMINI_API_KEY`
- `JWT_SECRET`
- `JWT_EXPIRES_IN` (optional, default `7d`)
- `CORS_ORIGIN` (comma-separated if multiple)
- `GEMINI_CHAT_MODEL`
- `GEMINI_EMBEDDING_MODEL`

### Client

Copy `client/.env.example` to `client/.env`:

- `VITE_API_URL` (default `http://localhost:5000/api`)

## Run Locally

### 1) Install dependencies

```bash
cd server
npm install

cd ../client
npm install
```

### 2) Start backend

```bash
cd server
npm run dev
```

### 3) Start frontend

```bash
cd client
npm run dev
```

Frontend runs on `http://localhost:5173`.

## Build Frontend

```bash
cd client
npm run build
```

## API Overview

Base URL: `/api`

### Auth

- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`

### Knowledge (protected)

- `POST /knowledge/ingest`
- `POST /knowledge`
- `GET /knowledge`
- `POST /knowledge/search`
- `POST /knowledge/ask`
- `POST /knowledge/summarize`

### Chat (protected)

- `GET /chat/sessions`
- `POST /chat/sessions`
- `GET /chat/sessions/:sessionId/messages`
- `POST /chat/message`

## Notes

- Keep `.env` private. Never commit secrets.
- If embedding model is unavailable for your API/account, set:
  - `GEMINI_EMBEDDING_MODEL=gemini-embedding-001`
- `@google/genai` is the active SDK used in runtime config.

## Suggested Next Improvements

- Switch similarity retrieval to MongoDB Atlas Vector Search
- Add streaming responses (SSE/WebSocket)
- Add file ingestion for PDF/DOCX
- Add tests for services and controllers
