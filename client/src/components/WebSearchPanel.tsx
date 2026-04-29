import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, CheckCircle, AlertCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface WebSearchPanelProps {
  projectId: number;
  onSearchComplete?: (results: any[]) => void;
}

export function WebSearchPanel({ projectId, onSearchComplete }: WebSearchPanelProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedResults, setSelectedResults] = useState<number[]>([]);

  // Query para identificar lacunas
  const { data: gaps, isLoading: gapsLoading } = trpc.research.identifyGaps.useQuery(
    { projectId },
    { enabled: false }
  );

  // Query para sugestões de busca
  const { data: suggestions, isLoading: suggestionsLoading } =
    trpc.research.generateSearchSuggestions.useQuery({ projectId }, { enabled: false });

  // Mutation para buscar
  const searchMutation = trpc.research.performSearch.useMutation({
    onSuccess: (results) => {
      setSearchResults(results);
      toast.success(`${results.length} resultados encontrados`);
      setIsSearching(false);
    },
    onError: () => {
      toast.error("Erro ao buscar");
      setIsSearching(false);
    },
  });

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      toast.error("Digite uma busca");
      return;
    }

    setIsSearching(true);
    searchMutation.mutate({
      query: searchQuery,
      limit: 5,
    });
  };

  const handleToggleResult = (index: number) => {
    setSelectedResults((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const handleIntegrateResults = () => {
    if (selectedResults.length === 0) {
      toast.error("Selecione pelo menos um resultado");
      return;
    }

    const selected = selectedResults.map((i) => searchResults[i]);
    onSearchComplete?.(selected);
    toast.success("Resultados integrados");
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 rounded-lg border border-gray-800">
      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <h3 className="text-sm font-semibold text-white mb-2">Busca Web Autônoma</h3>
        <p className="text-xs text-gray-400">Encontre informações complementares</p>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {/* Search Input */}
          <div>
            <label className="text-xs font-medium text-gray-300 block mb-2">
              Buscar na Web
            </label>
            <div className="flex gap-2">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Digite sua busca..."
                className="bg-gray-800 border-gray-700 text-white placeholder-gray-500"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSearch();
                  }
                }}
              />
              <Button
                onClick={handleSearch}
                disabled={isSearching || !searchQuery.trim()}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {isSearching ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div>
              <label className="text-xs font-medium text-gray-300 block mb-2">
                Resultados ({selectedResults.length} selecionados)
              </label>
              <div className="space-y-2">
                {searchResults.map((result, index) => (
                  <div
                    key={index}
                    onClick={() => handleToggleResult(index)}
                    className={`p-3 rounded border cursor-pointer transition-colors ${
                      selectedResults.includes(index)
                        ? "bg-purple-900/30 border-purple-500"
                        : "bg-gray-800 border-gray-700 hover:border-purple-500"
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {selectedResults.includes(index) ? (
                        <CheckCircle className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                      ) : (
                        <div className="w-4 h-4 border border-gray-600 rounded-full flex-shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{result.title}</p>
                        <p className="text-xs text-gray-400 mt-1 line-clamp-2">{result.snippet}</p>
                        <Badge variant="secondary" className="text-xs mt-2">
                          {result.source}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Suggested Searches */}
          {!searchResults.length && (
            <div>
              <label className="text-xs font-medium text-gray-300 block mb-2">
                Buscas Sugeridas
              </label>
              <div className="space-y-2">
                {[
                  "Tendências recentes",
                  "Dados estatísticos",
                  "Estudos acadêmicos",
                  "Análises de especialistas",
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => setSearchQuery(suggestion)}
                    className="w-full text-left p-2 bg-gray-800 hover:bg-gray-700 rounded border border-gray-700 text-sm text-gray-300 transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Footer */}
      {searchResults.length > 0 && (
        <div className="p-4 border-t border-gray-800 flex gap-2">
          <Button
            onClick={() => {
              setSearchResults([]);
              setSelectedResults([]);
              setSearchQuery("");
            }}
            variant="outline"
            size="sm"
            className="flex-1"
          >
            Limpar
          </Button>
          <Button
            onClick={handleIntegrateResults}
            disabled={selectedResults.length === 0}
            className="flex-1 bg-purple-600 hover:bg-purple-700"
          >
            Integrar {selectedResults.length} resultado{selectedResults.length !== 1 ? "s" : ""}
          </Button>
        </div>
      )}
    </div>
  );
}
