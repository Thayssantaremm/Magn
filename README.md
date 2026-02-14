# Magn (Secure MVP) — Auth + Workspace + RBAC + Audit + Encryption

✅ Inclui:
- Login + Cadastro (email/senha) com sessão httpOnly
- Workspace (multi-tenant) + papéis (OWNER/ADMIN/MANAGER/MEMBER/VIEWER)
- Auditoria (logs)
- Criptografia AES-256-GCM para PII (telefone/email/instagram) e mensagens/notes
- Notion-like editor + emojis + planner + inbox + CRM

## Rodar local
1) Crie `.env` baseado em `.env.example`
2) Gere uma chave de criptografia (32 bytes) e coloque em `ENCRYPTION_KEY_BASE64`
   - Exemplo (PowerShell):
     `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`
3) Instale e migre:
```bash
npm i
npm run prisma:migrate
npm run dev
```

Abra: http://localhost:3000  
Crie uma conta em /signup.

## Deploy (Vercel)
Env vars:
- DATABASE_URL
- META_VERIFY_TOKEN
- ENCRYPTION_KEY_BASE64
- DEFAULT_WORKSPACE_ID (opcional; necessário para receber webhook no workspace certo)

Depois do primeiro signup no ar:
- pegue o workspaceId (você pode ver via DB / ou adaptar endpoint) e coloque em DEFAULT_WORKSPACE_ID.

## Segurança
- Segredos NÃO vão pro GitHub.
- Cookies são httpOnly e secure.
