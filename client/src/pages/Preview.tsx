import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Brain, FileText, LayoutGrid, PanelLeft } from "lucide-react";
import { useLocation } from "wouter";

export default function Preview() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(88,28,135,0.28),_rgba(2,6,23,1)_42%)] text-white">
      <div className="mx-auto flex min-h-screen max-w-6xl items-center p-6 sm:p-8 lg:p-10">
        <Card className="w-full overflow-hidden border-white/10 bg-slate-950/75 shadow-2xl shadow-black/30 backdrop-blur-xl">
          <CardContent className="grid gap-0 p-0 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="space-y-8 p-8 sm:p-10 lg:p-12">
              <div className="inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-500/10 px-4 py-2 text-xs uppercase tracking-[0.24em] text-violet-100">
                <PanelLeft className="h-3.5 w-3.5" />
                Modo local
              </div>

              <div className="space-y-4">
                <h1 className="max-w-xl text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
                  Uma entrada limpa para testar o workspace sem login.
                </h1>
                <p className="max-w-xl text-base leading-7 text-white/68 sm:text-lg">
                  Esta página serve como ponto de entrada local para navegar na interface, abrir a Home e visualizar a experiência de trabalho em três áreas: fontes, chat e ferramentas.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  onClick={() => setLocation("/")}
                  className="h-12 bg-violet-500 px-6 text-white hover:bg-violet-600"
                >
                  Ir para a Home
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>

                <Button
                  onClick={() => setLocation("/")}
                  variant="outline"
                  className="h-12 border-white/10 bg-white/5 px-6 text-white hover:bg-white/10"
                >
                  Explorar interface local
                </Button>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  {
                    icon: Brain,
                    title: "Fontes",
                    text: "Carregue e selecione anexos para contexto.",
                  },
                  {
                    icon: LayoutGrid,
                    title: "Ferramentas",
                    text: "Escolha mapa mental, resumo, gráfico e mais.",
                  },
                  {
                    icon: FileText,
                    title: "Saídas",
                    text: "Transforme tudo em entregáveis visuais.",
                  },
                ].map((item) => {
                  const Icon = item.icon;

                  return (
                    <div
                      key={item.title}
                      className="rounded-3xl border border-white/10 bg-white/5 p-4"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-500/15 text-violet-100 ring-1 ring-violet-400/20">
                        <Icon className="h-4 w-4" />
                      </div>
                      <h2 className="mt-4 text-sm font-semibold text-white">{item.title}</h2>
                      <p className="mt-2 text-xs leading-5 text-white/60">{item.text}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="border-t border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] p-8 sm:p-10 lg:border-l lg:border-t-0 lg:p-12">
              <div className="space-y-4">
                <p className="text-xs uppercase tracking-[0.24em] text-violet-300/70">Preview visual</p>
                <h2 className="text-2xl font-semibold tracking-tight text-white">Layout em 3 painéis</h2>
                <p className="text-sm leading-6 text-white/60">
                  A Home e a tela de trabalho agora seguem uma composição mais próxima de um notebook LLM: painel de fontes, chat central e rail de criação.
                </p>
              </div>

              <div className="mt-6 space-y-3">
                <div className="rounded-[1.6rem] border border-white/10 bg-slate-950/70 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-white/40">Fontes</p>
                  <div className="mt-3 space-y-2">
                    <div className="rounded-2xl bg-white/5 p-3 ring-1 ring-white/10">PDF anexado</div>
                    <div className="rounded-2xl bg-white/5 p-3 ring-1 ring-white/10">URL salva</div>
                  </div>
                </div>

                <div className="rounded-[1.6rem] border border-white/10 bg-slate-950/70 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-white/40">Chat</p>
                  <div className="mt-3 space-y-2">
                    <div className="ml-auto w-fit rounded-3xl bg-violet-500 px-4 py-2 text-sm">Gerar um resumo visual.</div>
                    <div className="w-fit rounded-3xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80">Claro. Vou montar a saída com base nas fontes selecionadas.</div>
                  </div>
                </div>

                <div className="rounded-[1.6rem] border border-white/10 bg-slate-950/70 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-white/40">Ferramentas</p>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    <div className="rounded-2xl bg-white/5 p-3 ring-1 ring-white/10">Mapa mental</div>
                    <div className="rounded-2xl bg-white/5 p-3 ring-1 ring-white/10">Infográfico</div>
                    <div className="rounded-2xl bg-white/5 p-3 ring-1 ring-white/10">Resumo</div>
                    <div className="rounded-2xl bg-white/5 p-3 ring-1 ring-white/10">Apresentação</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
