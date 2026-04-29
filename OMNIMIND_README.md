# OmniMind Premium Studio

Um ecossistema inteligente de processamento e visualização de conhecimento que transforma múltiplas fontes em entregáveis ricos, interativos e multimodais.

## 🎯 Visão Geral

O OmniMind Premium Studio é uma plataforma web avançada que combina:

- **Canvas Infinito (Miro-like)**: Espaço infinito para organizar e conectar conhecimento
- **Grafo de Conhecimento Dinâmico**: Visualização automática de relações entre conceitos
- **Chat Inteligente com IA**: Análise conversacional de fontes
- **Geração Multimodal**: Mapas mentais, infográficos, relatórios, apresentações, vídeos
- **Busca Web Autônoma**: Pesquisa complementar com permissão do usuário
- **Refinamento Colaborativo**: Ajustes iterativos com feedback
- **Memória de Longo Prazo**: Aprendizado de preferências do usuário

## 🚀 Funcionalidades Principais

### 1. Upload e Processamento de Fontes

Suporte para múltiplos formatos:
- **Documentos**: PDF, DOC, DOCX
- **Mídia**: MP4, MP3, WAV
- **Imagens**: JPG, PNG, GIF
- **Dados**: CSV, JSON
- **Web**: URLs e websites

**Processamento Automático:**
- Transcrição de áudio/vídeo com Whisper API
- Extração de texto de PDFs e imagens (OCR)
- Análise semântica com embeddings
- Indexação para busca rápida

### 2. Canvas Infinito (Tldraw)

- Espaço de trabalho ilimitado
- Elementos organizáveis (cards, mapas, tabelas)
- Conexões manuais entre cards
- Versionamento automático
- Persistência em tempo real

### 3. Chat Inteligente

- Conversação com contexto das fontes
- Respostas em markdown
- Histórico persistente
- Suporte a múltiplas fontes simultâneas
- Streaming de respostas

### 4. Grafo de Conhecimento

- Extração automática de entidades e conceitos
- Visualização interativa de relações
- Busca semântica de conceitos
- Identificação de temas principais
- Análise de similaridade

### 5. Geração de Entregáveis

#### Mapas Mentais
- Estrutura hierárquica automática
- Visualização interativa
- Exportação em SVG/PNG

#### Infográficos
- Seções com dados visuais
- Imagens geradas por IA
- Layout responsivo
- Exportação em PDF

#### Relatórios
- Estrutura profissional
- Markdown com formatação
- Executivo, análise, conclusões
- Exportação em PDF

#### Apresentações
- Múltiplos layouts de slides
- Imagens geradas por IA
- Animações suaves
- Exportação em PDF/PPTX

#### Vídeos com Avatar
- Scripts automáticos
- Narração com TTS
- Avatar de IA
- Clipes curtos

### 6. Busca Web Autônoma

- Identificação automática de lacunas
- Busca com permissão do usuário
- Integração de resultados
- Sugestões de pesquisa
- Atualização de conteúdo

### 7. Refinamento Colaborativo

- Feedback do usuário
- Ajustes de hierarquia, ênfase, estilo
- Sugestões automáticas
- Comparação de versões
- Histórico de mudanças

### 8. Memória de Longo Prazo

- Preferências de estilo
- Histórico de interações
- Padrões de uso
- Recomendações personalizadas
- Persistência entre sessões

## 🏗️ Arquitetura Técnica

### Stack Tecnológico

**Frontend:**
- React 19 + Vite
- Tailwind CSS 4
- Tldraw (canvas infinito)
- Framer Motion (animações)
- Streamdown (markdown)

**Backend:**
- Express 4
- tRPC 11
- Drizzle ORM
- MySQL/TiDB

**Integrações:**
- Manus OAuth (autenticação)
- Manus LLM (processamento com IA)
- Manus Image Generation (imagens IA)
- Manus Voice Transcription (transcrição)
- Manus Storage (S3)

### Estrutura de Banco de Dados

```
users
├── id (PK)
├── openId (unique)
├── name
├── email
├── role (admin|user)
└── timestamps

projects
├── id (PK)
├── userId (FK)
├── title
├── description
└── timestamps

sources
├── id (PK)
├── projectId (FK)
├── type (pdf|doc|video|audio|image|csv|json|url)
├── originalName
├── storageKey
├── url
├── extractedText
├── embeddings
└── timestamps

canvas_items
├── id (PK)
├── projectId (FK)
├── type (text|image|mindmap|table)
├── content
├── position
├── size
└── timestamps

chat_messages
├── id (PK)
├── projectId (FK)
├── userId (FK)
├── role (user|assistant)
├── content
└── timestamps

outputs
├── id (PK)
├── projectId (FK)
├── type (mindmap|infographic|report|presentation|video)
├── title
├── content
├── status (generating|completed|failed)
└── timestamps

user_preferences
├── id (PK)
├── userId (FK)
├── preferredFormats (JSON)
├── stylePreferences (JSON)
├── researchPermission (boolean)
└── timestamps
```

### Fluxo de Dados

1. **Upload** → Arquivo enviado → S3 storage
2. **Processamento** → Extração de conteúdo → Embeddings
3. **Indexação** → Armazenamento em DB → Grafo construído
4. **Chat** → Contexto recuperado → LLM processa → Resposta
5. **Geração** → Análise com LLM → Imagens IA → Entregável
6. **Refinamento** → Feedback → Ajustes → Nova versão

## 📁 Estrutura de Pastas

```
omnimind-studio/
├── client/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home.tsx
│   │   │   ├── Studio.tsx
│   │   │   └── Upload.tsx
│   │   ├── components/
│   │   │   ├── ChatPanel.tsx
│   │   │   ├── StudioPanel.tsx
│   │   │   ├── KnowledgeGraphPanel.tsx
│   │   │   ├── MindMapViewer.tsx
│   │   │   ├── PresentationViewer.tsx
│   │   │   ├── ReportViewer.tsx
│   │   │   ├── InfographicViewer.tsx
│   │   │   ├── RefinementPanel.tsx
│   │   │   └── WebSearchPanel.tsx
│   │   └── App.tsx
│   └── index.html
├── server/
│   ├── services/
│   │   ├── mediaProcessor.ts
│   │   ├── knowledgeGraph.ts
│   │   ├── longTermMemory.ts
│   │   ├── outputGenerator.ts
│   │   ├── webSearchService.ts
│   │   ├── videoGenerator.ts
│   │   └── collaborativeRefinement.ts
│   ├── routers/
│   │   ├── outputRouter.ts
│   │   └── researchRouter.ts
│   ├── routers.ts
│   ├── db.ts
│   └── _core/
├── drizzle/
│   └── schema.ts
└── package.json
```

## 🔄 Fluxo de Uso

### 1. Criar Projeto
```
Home → Novo Projeto → Nome e Descrição
```

### 2. Carregar Fontes
```
Projeto → Upload → Selecionar Arquivos/URLs → Processar
```

### 3. Explorar Conhecimento
```
Studio → Canvas → Chat com IA → Grafo de Conhecimento
```

### 4. Gerar Entregáveis
```
Studio → Painel Studio → Selecionar Tipo → Gerar → Visualizar
```

### 5. Refinar Resultado
```
Entregável → Painel de Refinamento → Feedback → Refinar
```

### 6. Buscar Complementos
```
Studio → Painel de Busca → Buscar na Web → Integrar
```

## 🎨 Design Visual

### Paleta de Cores
- **Primária**: Purple (#9333ea)
- **Secundária**: Gray (#111827)
- **Acentos**: Cyan, Pink
- **Fundo**: Dark Gray (#0f172a)

### Tipografia
- **Headings**: Inter Bold
- **Body**: Inter Regular
- **Mono**: JetBrains Mono

### Componentes
- Buttons com hover states
- Cards com shadows suaves
- Inputs com focus rings
- Modais com backdrop blur
- Animações com Framer Motion

## 🔐 Segurança

- Autenticação OAuth via Manus
- Autorização baseada em roles
- Proteção de dados com HTTPS
- S3 com acesso controlado
- Validação de entrada com Zod
- Rate limiting em APIs

## 📊 Performance

- Lazy loading de componentes
- Caching de resultados
- Indexação semântica
- Compressão de mídia
- Otimização de imagens
- Streaming de respostas

## 🧪 Testes

```bash
# Executar testes
pnpm test

# Testes unitários
- outputGenerator.test.ts
- webSearchService.test.ts
- collaborativeRefinement.test.ts

# Cobertura
pnpm test:coverage
```

## 📝 API Reference

### Projects
- `POST /api/trpc/projects.create` - Criar projeto
- `GET /api/trpc/projects.list` - Listar projetos
- `GET /api/trpc/projects.get` - Obter projeto

### Sources
- `POST /api/trpc/sources.upload` - Upload de fonte
- `GET /api/trpc/sources.list` - Listar fontes
- `POST /api/trpc/sources.process` - Processar fonte

### Chat
- `POST /api/trpc/chat.send` - Enviar mensagem
- `GET /api/trpc/chat.history` - Histórico

### Outputs
- `POST /api/trpc/outputs.generate` - Gerar entregável
- `GET /api/trpc/outputs.list` - Listar entregáveis

### Research
- `GET /api/trpc/research.identifyGaps` - Identificar lacunas
- `POST /api/trpc/research.performSearch` - Buscar web
- `POST /api/trpc/research.refineOutput` - Refinar
- `POST /api/trpc/research.generateVideo` - Gerar vídeo

## 🚀 Deploy

O projeto está pronto para deploy em:
- Manus Cloud (recomendado)
- Vercel
- Netlify
- Railway
- Render

## 📚 Documentação Adicional

- [Guia de Usuário](./docs/USER_GUIDE.md)
- [Guia de Desenvolvedor](./docs/DEVELOPER_GUIDE.md)
- [API Reference](./docs/API_REFERENCE.md)
- [Troubleshooting](./docs/TROUBLESHOOTING.md)

## 🤝 Contribuições

Contribuições são bem-vindas! Por favor:
1. Fork o repositório
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

MIT License - veja LICENSE.md para detalhes

## 🎓 Créditos

Desenvolvido com tecnologias de ponta:
- React, Vite, Tailwind CSS
- tRPC, Express, Drizzle
- Manus Platform APIs
- Tldraw, Framer Motion

## 📞 Suporte

Para suporte:
- Email: support@omnimind.studio
- Docs: https://docs.omnimind.studio
- Issues: GitHub Issues

---

**OmniMind Premium Studio** - Transformando conhecimento em inteligência 🧠✨
