import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, RefreshCw, Send, Lightbulb } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface RefinementPanelProps {
  outputId: number;
  originalContent: string;
  outputType: string;
  onRefined?: (refinedContent: string) => void;
}

export function RefinementPanel({
  outputId,
  originalContent,
  outputType,
  onRefined,
}: RefinementPanelProps) {
  const [feedback, setFeedback] = useState("");
  const [isRefining, setIsRefining] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

  // Mutation para refinar
  const refineMutation = trpc.research.refineOutput.useMutation({
    onSuccess: (result: any) => {
      toast.success("Entregável refinado com sucesso!");
      onRefined?.(result.refinedContent);
      setFeedback("");
      setIsRefining(false);
    },
    onError: () => {
      toast.error("Erro ao refinar");
      setIsRefining(false);
    },
  });

  // Query para sugestões (não usada por enquanto)
  // const { data: refinementSuggestions, isLoading: suggestionsLoading } =
  //   trpc.research.generateRefinementSuggestions.useQuery(
  //     { content: originalContent, outputType },
  //     { enabled: false }
  //   );

  const handleRefine = () => {
    if (!feedback.trim()) {
      toast.error("Por favor, forneça feedback");
      return;
    }

    setIsRefining(true);
    refineMutation.mutate({
      outputId,
      originalContent,
      feedback,
      adjustments: {
        style: "detailed",
        tone: "professional",
      },
      outputType,
    });
  };

  const handleLoadSuggestions = () => {
    setIsLoadingSuggestions(true);
    // Simular carregamento de sugestões
    setTimeout(() => {
      setSuggestions([
        "Adicionar mais exemplos práticos",
        "Expandir a seção de conclusões",
        "Incluir dados estatísticos",
        "Melhorar a estrutura visual",
        "Adicionar referências e fontes",
      ]);
      setIsLoadingSuggestions(false);
    }, 1000);
  };

  const handleApplySuggestion = (suggestion: string) => {
    setFeedback((prev) => (prev ? `${prev}\n- ${suggestion}` : `- ${suggestion}`));
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 rounded-lg border border-gray-800">
      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <h3 className="text-sm font-semibold text-white mb-2">Refinamento Colaborativo</h3>
        <p className="text-xs text-gray-400">Forneça feedback para melhorar o entregável</p>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {/* Feedback Input */}
          <div>
            <label className="text-xs font-medium text-gray-300 block mb-2">
              Seu Feedback
            </label>
            <Textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Descreva como gostaria que o entregável fosse melhorado..."
              className="bg-gray-800 border-gray-700 text-white placeholder-gray-500 min-h-24"
            />
          </div>

          {/* Suggestions */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-gray-300">Sugestões de Refinamento</label>
              <Button
                onClick={handleLoadSuggestions}
                disabled={isLoadingSuggestions}
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs"
              >
                {isLoadingSuggestions ? (
                  <Loader2 className="w-3 h-3 animate-spin mr-1" />
                ) : (
                  <Lightbulb className="w-3 h-3 mr-1" />
                )}
                Gerar
              </Button>
            </div>

            {suggestions.length > 0 && (
              <div className="space-y-2">
                {suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="p-2 bg-gray-800 rounded border border-gray-700 hover:border-purple-500 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs text-gray-300 flex-1">{suggestion}</p>
                      <Button
                        onClick={() => handleApplySuggestion(suggestion)}
                        variant="ghost"
                        size="sm"
                        className="h-5 px-2 text-xs text-purple-400 hover:text-purple-300"
                      >
                        +
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Adjustment Options */}
          <div>
            <label className="text-xs font-medium text-gray-300 block mb-2">
              Ajustes Rápidos
            </label>
            <div className="flex flex-wrap gap-2">
              {["Mais detalhado", "Mais conciso", "Mais visual", "Mais formal"].map((option) => (
                <Badge
                  key={option}
                  variant="outline"
                  className="cursor-pointer hover:bg-purple-600/20 transition-colors"
                  onClick={() => handleApplySuggestion(option)}
                >
                  {option}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t border-gray-800 flex gap-2">
        <Button
          onClick={() => setFeedback("")}
          variant="outline"
          size="sm"
          className="flex-1"
        >
          Limpar
        </Button>
        <Button
          onClick={handleRefine}
          disabled={isRefining || !feedback.trim()}
          className="flex-1 bg-purple-600 hover:bg-purple-700 gap-2"
        >
          {isRefining ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Refinando...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Refinar
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
