# Instalacao e Configuracao

## Pre-requisitos
- Node.js LTS
- Python 3.11+
- Conta Supabase

## Passo a passo
1. Configurar variaveis em `frontend/.env` e `backend/.env` a partir dos exemplos.
2. Instalar dependencias do front-end (`npm install` em `frontend/`).
3. Instalar dependencias do back-end (`pip install -r requirements.txt` em `backend/`).
4. Subir API (`uvicorn app.main:app --reload`).
5. Subir front (`npm run dev`).

## Seguranca
Nao versionar chaves reais. Usar apenas `.env.example` no Git.
