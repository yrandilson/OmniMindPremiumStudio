import { useEffect, useMemo, useState } from "react";
import { useParams } from "wouter";
import {
  ArrowLeft,
  Brain,
  ChevronLeft,
  ChevronRight,
  Filter,
  FileText,
  ImagePlus,
  LayoutGrid,
  Loader2,
  MessageSquare,
  PanelLeft,
  PanelRight,
  Search,
  Sparkles,
  Table2,
  Wand2,
} from "lucide-react";

import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";


type WorkspaceTool = {
  id: string;
  label: string;
  description: string;
  icon: typeof Brain;
  accent: string;
};

type WorkspaceMessage = {
  id: number;
  role: "user" | "assistant";
  content: string;
};

const workspaceTools: WorkspaceTool[] = [
  {
    id: "mindmap",
    label: "Mapa mental",
    description: "Estruture ideias, hierarquias e relações.",
    icon: Brain,
    accent: "from-fuchsia-500/30 to-violet-500/10",
  },
  {
    id: "infographic",
    label: "Infográfico",
    description: "Transforme dados em blocos visuais.",
    icon: LayoutGrid,
    accent: "from-cyan-500/30 to-blue-500/10",
  },
  {
    id: "summary",
    label: "Resumo",
    description: "Condense a conversa em uma saída objetiva.",
    icon: FileText,
    accent: "from-amber-500/30 to-orange-500/10",
  },
  {
    id: "presentation",
    label: "Apresentação",
    description: "Monte slides com narrativa e blocos.",
    icon: Wand2,
    accent: "from-emerald-500/30 to-teal-500/10",
  },
  {
    id: "table",
    label: "Tabela",
    description: "Organize fontes e achados lado a lado.",
    icon: Table2,
    accent: "from-rose-500/30 to-pink-500/10",
  },
  {
    id: "image",
    label: "Imagem",
    description: "Crie assets visuais para a ideia escolhida.",
    icon: ImagePlus,
    accent: "from-indigo-500/30 to-purple-500/10",
  },
];

export default function StudioPage() {
  const { user } = useAuth();
  const { projectId } = useParams<{ projectId: string }>();
  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [centerMode, setCenterMode] = useState<"chat" | "table">("chat");
  const [selectedTool, setSelectedTool] = useState(workspaceTools[0]);
  const [draftMessage, setDraftMessage] = useState("");
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [expandedTable, setExpandedTable] = useState(true);
  const [selectedSourceIds, setSelectedSourceIds] = useState<number[]>([]);
  const [messages, setMessages] = useState<WorkspaceMessage[]>([
    {
      id: 1,
      role: "assistant",
      content:
        "Envie uma fonte e eu posso organizar a conversa, gerar um mapa mental ou montar um resumo estruturado.",
    },
  ]);

  const projectIdNumber = parseInt(projectId || "0");

  const { data: project, isLoading: projectLoading } = trpc.projects.get.useQuery(
    { projectId: projectIdNumber },
    { enabled: !!projectIdNumber }
  );

  const { data: sources } = trpc.sources.list.useQuery(
    { projectId: projectIdNumber },
    { enabled: !!projectIdNumber }
  );

  const { data: outputs } = trpc.outputs.list.useQuery(
    { projectId: projectIdNumber },
    { enabled: !!projectIdNumber }
  );

  const { data: history } = trpc.chat.history.useQuery(
    { projectId: projectIdNumber, limit: 50, offset: 0 },
    { enabled: !!projectIdNumber }
  );

  const sendMessageMutation = trpc.chat.send.useMutation({
    onSuccess: (response) => {
      setMessages((current) => [
        ...current,
        {
          id: Date.now() + 1,
          role: "assistant",
          content: response.message,
        },
      ]);
      setCenterMode("chat");
      setSelectedSourceIds([]);
    },
  });

  const sourceRows = useMemo(
    () =>
      sources?.map((source) => ({
        id: source.id,
        name: source.originalName,
        type: source.type,
        excerpt: source.extractedText?.slice(0, 92) || "Sem extração ainda.",
      })) ?? [],
    [sources]
  );

  const outputRows = useMemo(
    () =>
      outputs?.map((output) => ({
        id: output.id,
        title: output.title,
        type: output.type,
        status: output.status,
      })) ?? [],
    [outputs]
  );

  useEffect(() => {
    if (!history) return;

    setMessages(
      history
        .slice()
        .reverse()
        .map((message) => ({
          id: message.id,
          role: message.role,
          content: message.content,
        }))
    );
  }, [history]);

  useEffect(() => {
    if (!user) return;

    setMessages((current) =>
      current.length > 0
        ? current
        : [
          {
            id: 1,
            role: "assistant",
            content:
              "Envie uma fonte e eu posso organizar a conversa, gerar um mapa mental ou montar um resumo estruturado.",
          },
        ]
    );
  }, [user]);

  const toggleSourceSelection = (sourceId: number) => {
    setSelectedSourceIds((current) =>
      current.includes(sourceId)
        ? current.filter((id) => id !== sourceId)
        : [...current, sourceId]
    );
  };

  const handleSendMessage = () => {
    if (!draftMessage.trim() || sendMessageMutation.isPending) return;

    const userMessage = draftMessage.trim();

    setMessages((current) => [
      ...current,
      { id: Date.now(), role: "user", content: userMessage },
    ]);
    setDraftMessage("");
    setCenterMode("chat");
    setExpandedTable(true);

    sendMessageMutation.mutate({
      projectId: projectIdNumber,
      message: userMessage,
      sourceIds: selectedSourceIds,
    });
  };

  if (projectLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <Loader2 className="h-8 w-8 animate-spin text-violet-400" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <p className="text-gray-400">Projeto não encontrado</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(88,28,135,0.28),_rgba(2,6,23,1)_36%)] text-white">
      <div className="flex h-screen w-full">
        <aside
          className={`relative flex h-full shrink-0 flex-col border-r border-white/10 bg-slate-950/70 backdrop-blur-xl transition-all duration-300 ${leftCollapsed ? "w-[4.75rem]" : "w-[19rem]"
            }`}
        >
          <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-4">
            {!leftCollapsed ? (
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-[0.24em] text-violet-300/70">Fontes</p>
                <h2 className="truncate text-base font-semibold text-white">{project.title}</h2>
              </div>
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/5 text-violet-200 ring-1 ring-white/10">
                <PanelLeft className="h-4 w-4" />
              </div>
            )}

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLeftCollapsed((current) => !current)}
              className="shrink-0 rounded-xl border border-white/10 bg-white/5 text-white hover:bg-white/10"
            >
              {leftCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
          </div>

          {!leftCollapsed ? (
            <>
              <div className="border-b border-white/10 p-4">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-white/35" />
                  <Input
                    placeholder="Buscar fonte, trecho, tag..."
                    className="h-11 border-white/10 bg-white/5 pl-9 text-white placeholder:text-white/30"
                  />
                </div>
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-white/70">
                  <span className="rounded-full bg-white/5 px-3 py-1 ring-1 ring-white/10">PDF</span>
                  <span className="rounded-full bg-white/5 px-3 py-1 ring-1 ring-white/10">DOC</span>
                  <span className="rounded-full bg-white/5 px-3 py-1 ring-1 ring-white/10">URL</span>
                  <span className="rounded-full bg-white/5 px-3 py-1 ring-1 ring-white/10">Áudio</span>
                </div>
                {selectedSourceIds.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-violet-100">
                    {selectedSourceIds.map((id) => (
                      <span key={id} className="rounded-full bg-violet-500/20 px-3 py-1 ring-1 ring-violet-400/30">
                        Fonte #{id}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <ScrollArea className="flex-1">
                <div className="space-y-3 p-4">
                  {sourceRows.length > 0 ? (
                    sourceRows.map((source) => (
                      <Card
                        key={source.id}
                        className={`border-white/10 p-4 text-left shadow-lg shadow-black/10 transition-all hover:-translate-y-0.5 hover:border-violet-400/60 hover:bg-white/[0.08] ${selectedSourceIds.includes(source.id) ? "bg-violet-500/15" : "bg-white/5"
                          }`}
                        onClick={() => toggleSourceSelection(source.id)}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-white">{source.name}</p>
                            <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-violet-200/70">
                              {source.type}
                            </p>
                          </div>
                          <Filter className={`h-4 w-4 ${selectedSourceIds.includes(source.id) ? "text-violet-200" : "text-white/30"}`} />
                        </div>
                        <p className="mt-3 text-xs leading-5 text-white/55">{source.excerpt}</p>
                      </Card>
                    ))
                  ) : (
                    <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-6 text-center text-sm text-white/55">
                      Nenhuma fonte carregada ainda.
                    </div>
                  )}
                </div>
              </ScrollArea>
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center gap-3 px-2 py-4">
              {sourceRows.slice(0, 4).map((source) => (
                <div
                  key={source.id}
                  className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/5 text-[10px] font-semibold uppercase tracking-[0.16em] text-violet-200 ring-1 ring-white/10"
                  title={source.name}
                >
                  {source.type}
                </div>
              ))}
              <div className="mt-2 flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-500/15 text-violet-100 ring-1 ring-violet-400/30">
                {sourceRows.length}
              </div>
            </div>
          )}
        </aside>

        <main className="flex min-w-0 flex-1 flex-col border-r border-white/10 bg-slate-950/55 backdrop-blur-md">
          <div className="flex items-center justify-between gap-4 border-b border-white/10 px-5 py-4">
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-[0.24em] text-violet-300/70">Workspace</p>
              <h1 className="truncate text-xl font-semibold text-white">{project.title}</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button
                className={
                  centerMode === "chat"
                    ? "bg-violet-500 hover:bg-violet-600"
                    : "border border-white/10 bg-white/5 text-white hover:bg-white/10"
                }
                onClick={() => setCenterMode("chat")}
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                Chat
              </Button>
              <Button
                className={
                  centerMode === "table"
                    ? "bg-violet-500 hover:bg-violet-600"
                    : "border border-white/10 bg-white/5 text-white hover:bg-white/10"
                }
                onClick={() => setCenterMode("table")}
              >
                <Table2 className="mr-2 h-4 w-4" />
                Tabelas
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowCommandPalette((current) => !current)}
                className="rounded-xl border border-white/10 bg-white/5 text-white hover:bg-white/10"
              >
                <Sparkles className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="grid flex-1 min-h-0 gap-4 p-4 xl:grid-rows-[minmax(0,1.2fr)_minmax(0,0.7fr)]">
            <section className="overflow-hidden rounded-[1.8rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] shadow-2xl shadow-black/20">
              <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-white/45">Chat central</p>
                  <h2 className="text-sm font-semibold text-white">Notebook de conversa + geração</h2>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-full border border-white/10 bg-white/5 text-white hover:bg-white/10"
                  onClick={() => setExpandedTable((current) => !current)}
                >
                  {expandedTable ? "Ocultar tabelas" : "Expandir tabelas"}
                </Button>
              </div>

              <div className="grid h-full min-h-0 gap-0 xl:grid-rows-[minmax(0,1fr)_auto]">
                <ScrollArea className="min-h-0 px-4 py-4">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[min(44rem,88%)] rounded-3xl px-4 py-3 text-sm leading-6 shadow-lg ${message.role === "user"
                            ? "bg-violet-500 text-white"
                            : "border border-white/10 bg-white/5 text-white/90"
                            }`}
                        >
                          {message.content}
                        </div>
                      </div>
                    ))}

                    {showCommandPalette && (
                      <div className="rounded-3xl border border-dashed border-violet-400/30 bg-violet-500/10 p-4 text-sm text-violet-100">
                        Atalho rápido: escolha uma ferramenta à direita para gerar um novo bloco.
                      </div>
                    )}
                  </div>
                </ScrollArea>

                <div className="border-t border-white/10 bg-slate-950/65 px-4 py-4">
                  <Textarea
                    value={draftMessage}
                    onChange={(event) => setDraftMessage(event.target.value)}
                    placeholder="Escreva a pergunta, selecione a fonte e peça uma saída..."
                    className="min-h-[92px] resize-none border-white/10 bg-white/5 text-white placeholder:text-white/30"
                  />
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-xs text-white/45">
                      <PanelRight className="h-4 w-4" />
                      Saída conectada à ferramenta: <span className="text-white/75">{selectedTool.label}</span>
                    </div>
                    <Button onClick={handleSendMessage} className="bg-violet-500 hover:bg-violet-600" disabled={sendMessageMutation.isPending}>
                      {sendMessageMutation.isPending ? "Enviando..." : "Enviar para o workspace"}
                    </Button>
                  </div>
                </div>
              </div>
            </section>

            <section className={`overflow-hidden rounded-[1.8rem] border border-white/10 bg-white/5 ${expandedTable ? "opacity-100" : "opacity-70"}`}>
              <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-white/45">Tabelas / blocos</p>
                  <h2 className="text-sm font-semibold text-white">Resumo tabular expansível</h2>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-full border border-white/10 bg-white/5 text-white hover:bg-white/10"
                  onClick={() => setExpandedTable((current) => !current)}
                >
                  {expandedTable ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </Button>
              </div>

              {expandedTable ? (
                <ScrollArea className="h-[18rem] xl:h-full">
                  <div className="p-4">
                    <div className="grid gap-3 lg:grid-cols-2 xl:grid-cols-3">
                      {sourceRows.slice(0, 6).map((source, index) => (
                        <Card key={source.id} className="border-white/10 bg-slate-950/60 p-4 text-white shadow-lg shadow-black/10">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-xs uppercase tracking-[0.18em] text-white/40">Fonte {index + 1}</p>
                              <h3 className="mt-1 line-clamp-1 text-sm font-semibold text-white">{source.name}</h3>
                            </div>
                            <Filter className="h-4 w-4 text-white/30" />
                          </div>
                          <p className="mt-3 text-xs leading-5 text-white/60">{source.excerpt}</p>
                        </Card>
                      ))}

                      {outputRows.slice(0, 3).map((output) => (
                        <Card key={output.id} className="border-white/10 bg-violet-500/10 p-4 text-white shadow-lg shadow-black/10">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-xs uppercase tracking-[0.18em] text-violet-200/60">Saída</p>
                              <h3 className="mt-1 line-clamp-1 text-sm font-semibold text-white">{output.title}</h3>
                            </div>
                            <span className="rounded-full bg-white/5 px-2 py-1 text-[10px] uppercase tracking-[0.16em] text-white/70 ring-1 ring-white/10">
                              {output.type}
                            </span>
                          </div>
                          <p className="mt-3 text-xs leading-5 text-white/60">
                            Status: {output.status}
                          </p>
                        </Card>
                      ))}

                      {sourceRows.length === 0 && outputRows.length === 0 && (
                        <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-6 text-sm text-white/55 lg:col-span-2 xl:col-span-3">
                          Nenhuma tabela pronta. Quando você conectar as fontes, esse espaço vira uma área de síntese, comparação e saída estruturada.
                        </div>
                      )}
                    </div>
                  </div>
                </ScrollArea>
              ) : (
                <div className="flex h-[6rem] items-center px-4 text-sm text-white/55">
                  A tabela está recolhida. Clique para expandir.
                </div>
              )}
            </section>
          </div>
        </main>

        <aside className="flex h-full w-[22rem] shrink-0 flex-col bg-slate-950/70 backdrop-blur-xl">
          <div className="border-b border-white/10 px-4 py-4">
            <p className="text-xs uppercase tracking-[0.24em] text-violet-300/70">Criação</p>
            <h2 className="text-base font-semibold text-white">Ferramentas do projeto</h2>
            <p className="mt-2 text-sm text-white/55">Escolha o formato e monte a saída sem sair da tela.</p>
          </div>

          <ScrollArea className="flex-1">
            <div className="space-y-3 p-4">
              {workspaceTools.map((tool) => {
                const Icon = tool.icon;
                const isActive = selectedTool.id === tool.id;

                return (
                  <button
                    key={tool.id}
                    onClick={() => setSelectedTool(tool)}
                    className={`group w-full rounded-[1.6rem] border p-4 text-left transition-all duration-200 ${isActive
                      ? "border-violet-400/60 bg-white/10 shadow-xl shadow-violet-500/10"
                      : "border-white/10 bg-white/[0.04] hover:border-white/20 hover:bg-white/[0.08]"
                      }`}
                  >
                    <div className={`rounded-[1.3rem] bg-gradient-to-br ${tool.accent} p-4`}>
                      <div className="flex items-start gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950/70 text-violet-100 ring-1 ring-white/10">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <h3 className="truncate text-sm font-semibold text-white">{tool.label}</h3>
                            <Sparkles className={`h-4 w-4 ${isActive ? "text-violet-200" : "text-white/35"}`} />
                          </div>
                          <p className="mt-2 text-xs leading-5 text-white/75">{tool.description}</p>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </ScrollArea>

          <div className="border-t border-white/10 p-4">
            <Card className="border-white/10 bg-white/5 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-white/40">Selecionado</p>
                  <h3 className="mt-1 text-sm font-semibold text-white">{selectedTool.label}</h3>
                </div>
                <ArrowLeft className="h-4 w-4 rotate-180 text-white/35" />
              </div>
              <p className="mt-3 text-xs leading-5 text-white/60">{selectedTool.description}</p>
              <div className="mt-4 flex flex-wrap gap-2 text-[11px] text-white/70">
                <span className="rounded-full bg-white/5 px-3 py-1 ring-1 ring-white/10">Notebook LLM</span>
                <span className="rounded-full bg-white/5 px-3 py-1 ring-1 ring-white/10">Editor visual</span>
                <span className="rounded-full bg-white/5 px-3 py-1 ring-1 ring-white/10">Saída rica</span>
              </div>

              <Button className="mt-4 w-full bg-violet-500 hover:bg-violet-600">Gerar com esta ferramenta</Button>
            </Card>
          </div>
        </aside>
      </div>
    </div>
  );
}
