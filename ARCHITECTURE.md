# OmniMind Premium Studio - Arquitetura Técnica

## Visão Geral

OmniMind é um ecossistema inteligente de processamento de conhecimento que transforma múltiplas fontes (PDF, DOC, vídeo, áudio, imagens, CSV, JSON, URLs) em entregáveis ricos e interativos através de um agente de IA com memória de longo prazo.

## Stack Tecnológico

### Frontend
- **React 19** com TypeScript
- **Tldraw** (v2.x) - Canvas infinito estilo Miro com suporte a shapes customizados
- **Tailwind CSS 4** - Styling premium dark
- **Framer Motion** - Micro-animações e transições fluidas
- **React Query** - Sincronização de estado com servidor
- **Zustand** - State management local (canvas, UI state)

### Backend
- **Express 4** - Servidor HTTP
- **tRPC 11** - Type-safe RPC
- **Node.js** - Runtime

### Banco de Dados
- **MySQL/TiDB** (via Drizzle ORM) - Dados estruturados
- **FalkorDB** (via Redis) - Grafo de conhecimento (alternativa: Neo4j)
- **Embeddings + Vector Search** - Indexação semântica (via Manus Built-in API)

### Processamento de IA
- **Manus Built-in LLM API** - Chat, análise, geração de estruturas
- **Whisper API** (via Manus) - Transcrição de áudio/vídeo
- **Leonardo.ai API** - Geração de imagens para infográficos
- **HeyGen API** - Geração de vídeos com avatar (opcional)
- **Mem0 SDK** - Memória persistente de longo prazo

### Busca e Pesquisa
- **Tavily AI API** ou **Exa AI** - Busca web autônoma com permissão do usuário
- **Data API (Manus)** - Integração com fontes acadêmicas

## Arquitetura de Dados

### Schema Principal (MySQL)

```
users
├── id (PK)
├── openId (OAuth)
├── name, email
├── role (user/admin)
├── preferences (JSON: estilo de mapas, formato preferido, etc)
└── createdAt, updatedAt

projects
├── id (PK)
├── userId (FK)
├── title, description
├── status (active/archived)
└── createdAt, updatedAt

sources
├── id (PK)
├── projectId (FK)
├── type (pdf/doc/video/audio/image/csv/json/url)
├── originalName
├── storageKey (S3)
├── contentHash (para dedup)
├── extractedText (resumo do conteúdo)
├── metadata (JSON: duração, tamanho, etc)
├── processedAt
└── createdAt

canvas_items
├── id (PK)
├── projectId (FK)
├── type (summary/mindmap/table/card/image)
├── content (JSON)
├── position (x, y, width, height)
├── connections (JSON: array de edge IDs)
├── generatedBy (LLM model/version)
└── createdAt, updatedAt

chat_messages
├── id (PK)
├── projectId (FK)
├── userId (FK)
├── role (user/assistant)
├── content
├── sourceContext (array de source IDs referenciados)
└── createdAt

user_preferences
├── id (PK)
├── userId (FK)
├── preferredFormats (JSON: ["mindmap", "infographic", "table"])
├── stylePreferences (JSON: colors, typography, layout)
├── researchPermission (boolean)
└── updatedAt
```

### Grafo de Conhecimento (FalkorDB)

```
Nodes:
- Entity (name, type: person/concept/place/event, sourceIds)
- Concept (name, definition, sourceIds)
- Document (title, type, sourceId)

Edges:
- MENTIONS (Entity -> Entity)
- RELATES_TO (Concept -> Concept)
- EXTRACTED_FROM (Entity/Concept -> Document)
- SIMILAR_TO (Concept -> Concept, similarity_score)
```

## Fluxo de Processamento

### 1. Ingestão de Fontes
```
Upload → Validação → S3 Storage → Extração de Conteúdo
  ↓
  Transcrição (se áudio/vídeo)
  ↓
  Chunking + Embedding
  ↓
  Indexação no Grafo
  ↓
  Atualizar Memória (Mem0)
```

### 2. Processamento com LLM
```
Usuário envia prompt → Contexto de Fontes
  ↓
  Recuperação semântica (RAG)
  ↓
  Memória de Preferências (Mem0)
  ↓
  LLM gera resposta + estrutura
  ↓
  Validação + Formatação
  ↓
  Envio para Canvas
```

### 3. Geração de Entregáveis
```
Usuário seleciona tipo (Mapa Mental, Infográfico, Apresentação, etc)
  ↓
  LLM estrutura dados
  ↓
  Geração de imagens (Leonardo.ai) se necessário
  ↓
  Renderização (SVG, HTML, PPTX)
  ↓
  Exportação (PDF, PNG, PPTX)
```

## Componentes Principais

### Frontend

#### Canvas Infinito
- Tldraw como base
- Shapes customizados: SummaryCard, MindMapNode, TableCard, ImageCard
- Binding system para conexões entre cards
- Persistência automática

#### Chat Interface
- Message list com streaming
- Suggestion pills
- Context awareness (mostra sources referenciadas)
- Typing indicator

#### Studio Panel
- Tabs: Outputs, Graph, Preferences
- Output cards com preview
- Export buttons
- Refinement workflow

### Backend

#### API Routes (tRPC)
- `sources.upload` - Upload e processamento
- `sources.list` - Listar fontes do projeto
- `sources.delete` - Remover fonte
- `chat.send` - Enviar mensagem
- `chat.history` - Recuperar histórico
- `canvas.save` - Persistir canvas
- `canvas.load` - Carregar canvas
- `outputs.generate` - Gerar entregável
- `outputs.export` - Exportar em formato
- `graph.query` - Consultar grafo
- `research.search` - Busca web com permissão
- `preferences.update` - Atualizar preferências

#### Workers/Jobs
- `processSource` - Transcrição, embedding, indexação
- `generateOutput` - Geração de entregáveis
- `updateMemory` - Atualizar Mem0 com preferências

## Fluxo de Memória de Longo Prazo

```
Interação do Usuário
  ↓
  Mem0: Armazenar preferência (estilo, formato, tom)
  ↓
  Próxima sessão: Recuperar preferências
  ↓
  LLM: Usar preferências no prompt system
  ↓
  Refinamento: Usuário ajusta, Mem0 aprende
```

## Direção Visual

### Paleta de Cores (Dark Premium)
- Background: #0A0A0F (quase preto)
- Surface: #10101A, #13111F (tons de cinza profundo)
- Accent: #5D4FD9 (roxo elétrico)
- Text: #F0EEF9 (branco suave)
- Secondary: #8A87A0 (cinza médio)

### Tipografia
- Headlines: Bricolage Grotesque (bold, geometric)
- Body: Instrument Sans (clean, modern)
- Monospace: Fira Code (código)

### Micro-animações
- Fade-in suave (200ms)
- Slide-up ao aparecer (300ms)
- Hover states com cor + escala
- Transições de canvas fluidas

## Segurança

- OAuth Manus para autenticação
- JWT para sessões
- CORS restrito
- Rate limiting em endpoints de LLM
- Validação de tipos tRPC
- Sanitização de entrada
- Permissões explícitas para busca web

## Escalabilidade

- S3 para storage de arquivos
- Caching de embeddings
- Batch processing de transcrições
- Queue system para jobs pesados
- Compressão de canvas snapshots

## Próximas Fases

1. **MVP**: Upload, chat, canvas básico, resumos
2. **V1.1**: Grafo, mapas mentais, infográficos
3. **V1.2**: Apresentações, imagens IA, exportação
4. **V1.3**: Memória de longo prazo, busca web
5. **V1.4**: Vídeos com avatar, refinamento colaborativo
