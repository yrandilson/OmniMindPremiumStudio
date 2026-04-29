import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Download, Loader2, Plus, Trash2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { MindMapViewer } from "./MindMapViewer";
import { PresentationViewer } from "./PresentationViewer";
import { ReportViewer } from "./ReportViewer";
import { InfographicViewer } from "./InfographicViewer";

interface StudioPanelProps {
  projectId: number;
  outputs?: any[];
}

type OutputType = "mindmap" | "infographic" | "report" | "presentation" | "summary" | "video";

export function StudioPanel({ projectId, outputs = [] }: StudioPanelProps) {
  const [selectedType, setSelectedType] = useState<OutputType>("mindmap");
  const [isGenerating, setIsGenerating] = useState(false);

  const generateOutputMutation = trpc.outputs.generate.useMutation({
    onSuccess: (result) => {
      toast.success(`Gerando ${selectedType}...`);
      setIsGenerating(false);
    },
    onError: (error) => {
      toast.error("Erro ao gerar entregável");
      setIsGenerating(false);
    },
  });

  const handleGenerateOutput = async () => {
    setIsGenerating(true);
    const validTypes: ("mindmap" | "infographic" | "report" | "presentation" | "video")[] = [
      "mindmap",
      "infographic",
      "report",
      "presentation",
      "video",
    ];
    const type = validTypes.includes(selectedType as any) ? selectedType : "mindmap";
    generateOutputMutation.mutate({
      projectId,
      type: type as "mindmap" | "infographic" | "report" | "presentation" | "video",
      title: `${selectedType.charAt(0).toUpperCase() + selectedType.slice(1)} - ${new Date().toLocaleDateString("pt-BR")}`,
    });
  };

  const outputTypeConfig: Record<OutputType, { label: string; icon: string; description: string }> = {
    mindmap: {
      label: "Mapa Mental",
      icon: "🧠",
      description: "Visualização hierárquica de conceitos",
    },
    infographic: {
      label: "Infográfico",
      icon: "📊",
      description: "Dados visuais e estatísticas",
    },
    report: {
      label: "Relatório",
      icon: "📄",
      description: "Documento estruturado e detalhado",
    },
    presentation: {
      label: "Apresentação",
      icon: "🎯",
      description: "Slides com imagens e animações",
    },
    summary: {
      label: "Resumo",
      icon: "📝",
      description: "Resumo executivo conciso",
    },
    video: {
      label: "Vídeo",
      icon: "🎬",
      description: "Avatar IA narrando resumo",
    },
  };

  return (
    <div className="flex flex-col h-full bg-gray-900">
      {/* Generator Section */}
      <div className="p-4 border-b border-gray-800">
        <h3 className="text-sm font-semibold text-white mb-4">Gerar Entregável</h3>

        {/* Type Selection */}
        <div className="space-y-2 mb-4">
          {(Object.keys(outputTypeConfig) as (keyof typeof outputTypeConfig)[]).map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`w-full text-left p-3 rounded-lg transition-all ${
                selectedType === type
                  ? "bg-purple-600 border-purple-500"
                  : "bg-gray-800 border-gray-700 hover:bg-gray-700"
              } border`}
            >
                <div className="flex items-start gap-3">
                  <span className="text-lg">{outputTypeConfig[type].icon}</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">{outputTypeConfig[type].label}</p>
                    <p className="text-xs text-gray-400 mt-1">{outputTypeConfig[type].description}</p>
                  </div>
                </div>
            </button>
          ))}
        </div>

        <Button
          onClick={handleGenerateOutput}
          disabled={isGenerating}
          className="w-full bg-purple-600 hover:bg-purple-700"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Gerando...
            </>
          ) : (
            <>
              <Plus className="w-4 h-4 mr-2" />
              Gerar {outputTypeConfig[selectedType].label}
            </>
          )}
        </Button>
      </div>

      {/* Outputs List */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-3">
          {outputs && outputs.length > 0 ? (
            outputs.map((output: any) => (
              <div
                key={output.id}
                className="p-3 bg-gray-800 rounded-lg border border-gray-700 hover:border-purple-500 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{output.title}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {output.type} • {new Date(output.createdAt).toLocaleDateString("pt-BR")}
                    </p>
                    <div className="mt-2">
                      <span
                        className={`inline-block px-2 py-1 text-xs rounded ${
                          output.status === "completed"
                            ? "bg-green-900 text-green-200"
                            : output.status === "failed"
                              ? "bg-red-900 text-red-200"
                              : "bg-yellow-900 text-yellow-200"
                        }`}
                      >
                        {output.status === "completed"
                          ? "Concluído"
                          : output.status === "failed"
                            ? "Erro"
                            : "Gerando..."}
                      </span>
                    </div>
                  </div>

                  {output.status === "completed" && (
                    <div className="flex gap-2">
                      <button className="p-2 hover:bg-gray-700 rounded transition-colors">
                        <Download className="w-4 h-4 text-gray-400 hover:text-white" />
                      </button>
                      <button className="p-2 hover:bg-gray-700 rounded transition-colors">
                        <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-400" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-sm text-gray-400">Nenhum entregável gerado</p>
              <p className="text-xs text-gray-600 mt-2">Comece gerando um acima</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
