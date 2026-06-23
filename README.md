#  DiabetesCare

Plataforma web para monitoramento glicêmico e educação em saúde voltada para pacientes com diabetes, com foco em autonomia, organização de dados clínicos e acesso a informações confiáveis.

---

##  Sobre o Projeto

O **DiabetesCare** é uma aplicação desenvolvida para auxiliar pacientes no controle diário da glicemia, permitindo o registro estruturado de dados, visualização de informações e interação com profissionais da saúde.

A solução busca reduzir a distância entre o acompanhamento clínico e o cotidiano do paciente, promovendo melhor tomada de decisão e adesão ao tratamento.

---

##  Objetivos

* Facilitar o registro de dados glicêmicos
* Organizar informações clínicas de forma estruturada
* Oferecer suporte educativo por especialistas
* Melhorar a comunicação entre pacientes e profissionais
* Gerar relatórios para acompanhamento médico

---

##  Arquitetura do Sistema

O sistema segue uma arquitetura **cliente-servidor em três camadas (3-tier)**:

* **Frontend:** React + TypeScript + Tailwind CSS
* **Backend:** Node.js + TypeScript (API REST)
* **Banco de Dados:** PostgreSQL (Supabase)

```text
Frontend → Backend → Banco de Dados
```

---

##  Tecnologias Utilizadas

### Frontend

* React
* TypeScript
* Tailwind CSS

### Backend

* Node.js
* Express
* TypeScript

### Banco de Dados

* Supabase (PostgreSQL)

### Segurança

* JSON Web Tokens (JWT)
* BCrypt
* HTTPS

---

## 🔄 Funcionalidades (em desenvolvimento)

* Cadastro e autenticação de usuários
* Registro de glicemia
* Dashboard com gráficos
* Fórum de dúvidas
* Publicação de conteúdos por especialistas
* Geração de relatórios

---

## 🔒 Segurança

* Autenticação baseada em JWT
* Senhas criptografadas com BCrypt
* Controle de acesso por perfil (RBAC)
* Proteção de dados conforme LGPD

---

## 👥 Equipe

* Áurea Letícia Carvalho Macedo
* Luis Gustavo Luz de Deus Ramos
* Samylle Rose de Brito Silva
* Pedro Henrique de Carvalho Sousa
* Viviany da Silva Araújo
* Válber Carvalho Bezerra Policarpo

---

## 📚 Licença

Projeto acadêmico desenvolvido para a disciplina de Projeto e Desenvolvimento de Sistemas de Informação II.

---

## 🤖 Diabetica (IA) — jeito fácil para produção

### Opção recomendada: Groq (sem servidor Python)

1. Crie uma conta grátis em [console.groq.com](https://console.groq.com)
2. Gere uma API Key
3. Na Vercel → **Settings → Environment Variables** → adicione:
   - `GROQ_API_KEY` = sua chave
4. Faça **Redeploy**

Pronto. O chat funciona em produção sem subir o `app.py`.

### Desenvolvimento local

```bash
# Terminal 1 — API Python (opcional, usa o modelo Diabetica real)
cd Diabetica && ./start.sh

# Terminal 2 — Next.js
npm run dev
```

Localmente, se o Python estiver rodando, ele tem prioridade. Se não estiver, usa `GROQ_API_KEY` se configurada.

### Opção avançada: servidor Python na nuvem

Se quiser usar o modelo **WaltonFuture/Diabetica-1.5B** real em produção, publique a pasta `Diabetica/` (Docker/Railway/Render) e configure:

| Variável | Valor |
|----------|-------|
| `DIABETICA_API_URL` | `https://SUA-URL/predict` |

Requisito: ~4 GB de RAM.
