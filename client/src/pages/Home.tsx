import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { getLoginUrl, hasLoginConfig } from "@/const";
import {
  ArrowRight,
  Brain,
  ChevronRight,
  FileText,
  LayoutGrid,
  Loader2,
  Plus,
  Sparkles,
  Upload,
  Play,
} from "lucide-react";
import { toast } from "sonner";

export default function Home() {
  const { user, isAuthenticated, loading } = useAuth();
  const [, navigate] = useLocation();
  const [projects, setProjects] = useState<any[]>([]);
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [newProjectTitle, setNewProjectTitle] = useState("");

  // Carregar projetos
  const { data: userProjects, isLoading: projectsLoading } = trpc.projects.list.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  // Mutation para criar projeto
  const createProjectMutation = trpc.projects.create.useMutation({
    onSuccess: (result: any) => {
      toast.success("Projeto criado com sucesso!");
      setNewProjectTitle("");
      setIsCreatingProject(false);
      // Navegar para o novo projeto
      navigate(`/studio/${result.insertId || result.id}`);
    },
    onError: () => {
      toast.error("Erro ao criar projeto");
    },
  });

  // Mutation para deletar projeto
  const deleteProjectMutation = trpc.projects.create.useMutation({
    onSuccess: () => {
      toast.success("Projeto deletado");
    },
  });

  useEffect(() => {
    if (userProjects) {
      setProjects(userProjects);
    }
  }, [userProjects]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-950">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  if (!isAuthenticated) {
    const loginConfigured = hasLoginConfig();
    const primaryActionLabel = loginConfigured ? "Entrar no workspace" : "Abrir modo local";
    const primaryActionHref = loginConfigured ? getLoginUrl() : "/preview";

    return (
      <div className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(109,40,217,0.24),_rgba(2,6,23,1)_40%)] text-white">
        <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
          <header className="flex items-center justify-between border-b border-white/10 pb-5">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-violet-300/70">OmniMind Premium Studio</p>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">Workspace local inteligente</h1>
            </div>
            <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-white/70">
              {loginConfigured ? "OAuth pronto" : "Modo local ativo"}
            </div>
          </header>

          <main className="grid flex-1 gap-6 py-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
            <section className="space-y-8">
              <div className="space-y-5">
                <div className="inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-500/10 px-4 py-2 text-xs uppercase tracking-[0.22em] text-violet-100">
                  <Sparkles className="h-3.5 w-3.5" />
                  Modo notebook visual
                </div>

                <div className="space-y-4">
                  <h2 className="max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
                    Transforme fontes em síntese, mapa mental e entregáveis sem sair da mesma tela.
                  </h2>
                  <p className="max-w-xl text-base leading-7 text-white/70 sm:text-lg">
                    Entrada mais limpa, workspace mais rico e acesso local quando OAuth não estiver configurado.
                    O foco aqui é abrir projeto, escolher fontes e trabalhar em três áreas ao mesmo tempo.
                  </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button
                    onClick={() => window.location.href = primaryActionHref}
                    size="lg"
                    className="h-12 bg-violet-500 px-6 text-white hover:bg-violet-600"
                  >
                    {primaryActionLabel}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>

                  <Button
                    onClick={() => window.location.href = "/preview"}
                    size="lg"
                    variant="outline"
                    className="h-12 border-white/10 bg-white/5 px-6 text-white hover:bg-white/10"
                  >
                    Ver modo local
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>

                {!loginConfigured && (
                  <p className="max-w-xl text-sm text-white/55">
                    OAuth não está configurado nesta execução. Você ainda pode usar o modo local para navegar e testar a interface.
                  </p>
                )}
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {[
                  { icon: Brain, title: "Mapa mental", text: "Converta contexto em árvore de ideias." },
                  { icon: LayoutGrid, title: "Infográfico", text: "Monte saídas visuais em blocos." },
                  { icon: FileText, title: "Resumo", text: "Recorte o essencial com rapidez." },
                  { icon: Sparkles, title: "Notebook LLM", text: "Chat + fontes + entregáveis em uma visão." },
                ].map((item) => {
                  const Icon = item.icon;

                  return (
                    <Card key={item.title} className="border-white/10 bg-white/5 p-4 backdrop-blur">
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-500/15 text-violet-100 ring-1 ring-violet-400/20">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-white">{item.title}</h3>
                          <p className="mt-1 text-xs leading-5 text-white/60">{item.text}</p>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </section>

            <section className="relative">
              <div className="absolute -inset-8 rounded-[2rem] bg-violet-500/10 blur-3xl" />
              <Card className="relative overflow-hidden border-white/10 bg-slate-950/75 p-5 shadow-2xl shadow-black/30 backdrop-blur-xl">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.22em] text-violet-300/70">Preview do workspace</p>
                    <h3 className="mt-1 text-lg font-semibold text-white">Fontes, chat e ferramentas</h3>
                  </div>
                  <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] text-white/60">
                    Layout em 3 painéis
                  </div>
                </div>

                <div className="mt-5 grid gap-3 lg:grid-cols-[0.9fr_1.2fr_0.9fr]">
                  <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-white/40">Fontes</p>
                    <div className="mt-4 space-y-3">
                      <div className="rounded-2xl bg-slate-950/70 p-3 ring-1 ring-white/10">
                        <p className="text-sm font-medium">PDF - Pesquisa</p>
                        <p className="mt-1 text-xs text-white/55">Trecho extraído para contexto.</p>
                      </div>
                      <div className="rounded-2xl bg-slate-950/70 p-3 ring-1 ring-white/10">
                        <p className="text-sm font-medium">URL - Referência</p>
                        <p className="mt-1 text-xs text-white/55">Fonte web marcada para consulta.</p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-3xl border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.07),rgba(255,255,255,0.03))] p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-white/40">Chat</p>
                    <div className="mt-4 space-y-3">
                      <div className="ml-auto max-w-[85%] rounded-3xl bg-violet-500 px-4 py-3 text-sm">
                        Agrupe as fontes e gere uma síntese.
                      </div>
                      <div className="max-w-[85%] rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80">
                        Posso organizar, resumir e transformar em entregável.
                      </div>
                    </div>
                    <div className="mt-4 rounded-2xl border border-dashed border-white/10 bg-slate-950/60 p-3 text-xs text-white/45">
                      Campo de mensagem + seleção de fontes + resposta em markdown
                    </div>
                  </div>

                  <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-white/40">Ferramentas</p>
                    <div className="mt-4 space-y-3">
                      <div className="rounded-2xl bg-violet-500/15 p-3 ring-1 ring-violet-400/20">
                        <p className="text-sm font-medium">Mapa mental</p>
                      </div>
                      <div className="rounded-2xl bg-white/5 p-3 ring-1 ring-white/10">
                        <p className="text-sm font-medium">Infográfico</p>
                      </div>
                      <div className="rounded-2xl bg-white/5 p-3 ring-1 ring-white/10">
                        <p className="text-sm font-medium">Resumo</p>
                      </div>
                      <div className="rounded-2xl bg-white/5 p-3 ring-1 ring-white/10">
                        <p className="text-sm font-medium">Apresentação</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </section>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-900">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">OmniMind Studio</h1>
              <p className="text-gray-400 mt-1">Bem-vindo, {user?.name}</p>
            </div>
            <Button
              onClick={() => setIsCreatingProject(true)}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo Projeto
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Create Project Modal */}
        {isCreatingProject && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md bg-gray-900 border-gray-800">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-white mb-4">Novo Projeto</h2>
                <Input
                  value={newProjectTitle}
                  onChange={(e) => setNewProjectTitle(e.target.value)}
                  placeholder="Nome do projeto..."
                  className="mb-4 bg-gray-800 border-gray-700 text-white"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      createProjectMutation.mutate({
                        title: newProjectTitle,
                      });
                    }
                  }}
                />
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsCreatingProject(false);
                      setNewProjectTitle("");
                    }}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={() => {
                      if (newProjectTitle.trim()) {
                        createProjectMutation.mutate({
                          title: newProjectTitle,
                        });
                      }
                    }}
                    disabled={!newProjectTitle.trim()}
                    className="flex-1 bg-purple-600 hover:bg-purple-700"
                  >
                    Criar
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Projects Grid */}
        {projectsLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
          </div>
        ) : projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Card
                key={project.id}
                className="bg-gray-900 border-gray-800 hover:border-purple-500 transition-colors cursor-pointer group"
                onClick={() => navigate(`/studio/${project.id}`)}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white group-hover:text-purple-400 transition-colors">
                        {project.title}
                      </h3>
                      <p className="text-sm text-gray-400 mt-1">
                        {new Date(project.createdAt).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/upload/${project.id}`);
                        }}
                        className="p-2 hover:bg-purple-900/20 rounded transition-colors"
                        title="Adicionar fontes"
                      >
                        <Upload className="w-4 h-4 text-gray-400 hover:text-purple-400" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/studio/${project.id}`);
                        }}
                        className="p-2 hover:bg-purple-900/20 rounded transition-colors"
                        title="Abrir projeto"
                      >
                        <Play className="w-4 h-4 text-gray-400 hover:text-purple-400" />
                      </button>
                    </div>
                  </div>

                  {project.description && (
                    <p className="text-sm text-gray-400 mb-4 line-clamp-2">
                      {project.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-gray-800">
                    <span className="text-xs text-gray-500">
                      {project.description || "Sem descrição"}
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="inline-block p-6 bg-gray-900 rounded-lg border border-gray-800">
              <Upload className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Nenhum projeto</h3>
              <p className="text-gray-400 mb-6">Crie seu primeiro projeto para começar</p>
              <Button
                onClick={() => setIsCreatingProject(true)}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Criar Projeto
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
