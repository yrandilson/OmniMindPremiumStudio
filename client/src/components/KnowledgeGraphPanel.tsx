import { useEffect, useRef, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface KnowledgeGraphPanelProps {
  projectId: number;
}

interface Entity {
  id: string;
  name: string;
  type: "person" | "concept" | "place" | "event" | "organization";
  description?: string;
  sourceIds: number[];
}

interface Concept {
  id: string;
  name: string;
  definition?: string;
  sourceIds: number[];
}

export function KnowledgeGraphPanel({ projectId }: KnowledgeGraphPanelProps) {
  const [entities, setEntities] = useState<Entity[]>([]);
  const [concepts, setConcepts] = useState<Concept[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Simular carregamento do grafo
  useEffect(() => {
    setIsLoading(true);
    // Aqui seria chamada a API para carregar o grafo
    // Por enquanto, apenas simular com dados de exemplo
    setTimeout(() => {
      setEntities([
        {
          id: "entity-1",
          name: "Inteligência Artificial",
          type: "concept",
          description: "Campo da ciência que estuda máquinas inteligentes",
          sourceIds: [1, 2],
        },
        {
          id: "entity-2",
          name: "Machine Learning",
          type: "concept",
          description: "Subárea de IA focada em aprendizado automático",
          sourceIds: [2, 3],
        },
        {
          id: "entity-3",
          name: "Deep Learning",
          type: "concept",
          description: "Técnica de ML usando redes neurais profundas",
          sourceIds: [3],
        },
      ]);

      setConcepts([
        {
          id: "concept-1",
          name: "Redes Neurais",
          definition: "Modelo computacional inspirado em neurônios biológicos",
          sourceIds: [1, 2, 3],
        },
        {
          id: "concept-2",
          name: "Algoritmos",
          definition: "Sequência de passos para resolver um problema",
          sourceIds: [1, 2],
        },
        {
          id: "concept-3",
          name: "Dados",
          definition: "Informações brutas usadas para treinamento",
          sourceIds: [2, 3],
        },
      ]);

      setIsLoading(false);
    }, 1000);
  }, [projectId]);

  // Desenhar grafo no canvas
  useEffect(() => {
    if (!canvasRef.current || entities.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Limpar canvas
    ctx.fillStyle = "#111827";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Desenhar nós
    const nodeRadius = 30;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    entities.forEach((entity, index) => {
      const angle = (index / entities.length) * Math.PI * 2;
      const x = centerX + Math.cos(angle) * 150;
      const y = centerY + Math.sin(angle) * 150;

      // Desenhar círculo
      ctx.fillStyle = "#9333ea";
      ctx.beginPath();
      ctx.arc(x, y, nodeRadius, 0, Math.PI * 2);
      ctx.fill();

      // Desenhar borda
      ctx.strokeStyle = "#c084fc";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Desenhar texto
      ctx.fillStyle = "#ffffff";
      ctx.font = "12px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(entity.name.substring(0, 10), x, y);
    });

    // Desenhar conexões
    ctx.strokeStyle = "rgba(147, 51, 234, 0.3)";
    ctx.lineWidth = 1;
    for (let i = 0; i < entities.length; i++) {
      for (let j = i + 1; j < entities.length; j++) {
        const angle1 = (i / entities.length) * Math.PI * 2;
        const angle2 = (j / entities.length) * Math.PI * 2;
        const x1 = centerX + Math.cos(angle1) * 150;
        const y1 = centerY + Math.sin(angle1) * 150;
        const x2 = centerX + Math.cos(angle2) * 150;
        const y2 = centerY + Math.sin(angle2) * 150;

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }
    }
  }, [entities]);

  const filteredEntities = entities.filter((e) =>
    e.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredConcepts = concepts.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-gray-900">
      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <h3 className="text-sm font-semibold text-white mb-3">Grafo de Conhecimento</h3>
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar conceitos..."
            className="pl-10 bg-gray-800 border-gray-700 text-white placeholder-gray-500"
          />
        </div>
      </div>

      {/* Canvas Preview */}
      <div className="h-48 border-b border-gray-800 bg-gray-950">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-6 h-6 animate-spin text-purple-400" />
          </div>
        ) : (
          <canvas
            ref={canvasRef}
            width={384}
            height={192}
            className="w-full h-full"
          />
        )}
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {/* Entities */}
          {filteredEntities.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-gray-400 uppercase mb-2">Entidades</h4>
              <div className="space-y-2">
                {filteredEntities.map((entity) => (
                  <div
                    key={entity.id}
                    className="p-2 bg-gray-800 rounded border border-gray-700 hover:border-purple-500 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white">{entity.name}</p>
                        {entity.description && (
                          <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                            {entity.description}
                          </p>
                        )}
                      </div>
                      <Badge variant="secondary" className="text-xs whitespace-nowrap">
                        {entity.type}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Concepts */}
          {filteredConcepts.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-gray-400 uppercase mb-2">Conceitos</h4>
              <div className="space-y-2">
                {filteredConcepts.map((concept) => (
                  <div
                    key={concept.id}
                    className="p-2 bg-gray-800 rounded border border-gray-700 hover:border-purple-500 transition-colors cursor-pointer"
                  >
                    <p className="text-sm font-medium text-white">{concept.name}</p>
                    {concept.definition && (
                      <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                        {concept.definition}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {filteredEntities.length === 0 && filteredConcepts.length === 0 && (
            <div className="text-center py-8">
              <p className="text-sm text-gray-400">Nenhum resultado encontrado</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
