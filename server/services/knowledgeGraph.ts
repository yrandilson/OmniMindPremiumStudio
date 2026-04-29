/**
 * Knowledge Graph Service
 * Gerencia o grafo de conhecimento usando FalkorDB (via Redis)
 * Extrai entidades, conceitos e relações do conteúdo
 */

import { invokeLLM } from "../_core/llm";

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

interface Relationship {
  source: string;
  target: string;
  type: "mentions" | "relates_to" | "extracted_from" | "similar_to";
  weight?: number;
}

/**
 * Extrai entidades e conceitos do conteúdo usando LLM
 */
export async function extractEntitiesAndConcepts(
  content: string,
  sourceId: number,
  sourceType: string
): Promise<{ entities: Entity[]; concepts: Concept[] }> {
  try {
    console.log(`[KnowledgeGraph] Extraindo entidades e conceitos de ${sourceType}:${sourceId}`);

    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `Você é um especialista em extração de conhecimento. Analise o conteúdo e extraia:
1. Entidades principais (pessoas, lugares, organizações, eventos)
2. Conceitos e temas principais
3. Relações entre eles

Responda em JSON com a seguinte estrutura:
{
  "entities": [
    {"name": "...", "type": "person|concept|place|event|organization", "description": "..."}
  ],
  "concepts": [
    {"name": "...", "definition": "..."}
  ],
  "relationships": [
    {"source": "...", "target": "...", "type": "mentions|relates_to"}
  ]
}`,
        },
        {
          role: "user",
          content: `Por favor, extraia entidades e conceitos deste conteúdo:\n\n${content.substring(0, 2000)}`,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "knowledge_extraction",
          strict: true,
          schema: {
            type: "object",
            properties: {
              entities: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    type: { type: "string", enum: ["person", "concept", "place", "event", "organization"] },
                    description: { type: "string" },
                  },
                  required: ["name", "type"],
                },
              },
              concepts: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    definition: { type: "string" },
                  },
                  required: ["name"],
                },
              },
              relationships: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    source: { type: "string" },
                    target: { type: "string" },
                    type: { type: "string", enum: ["mentions", "relates_to"] },
                  },
                  required: ["source", "target", "type"],
                },
              },
            },
            required: ["entities", "concepts"],
            additionalProperties: false,
          },
        },
      },
    });

    const content_text = response.choices[0]?.message?.content;
    if (typeof content_text !== "string") {
      throw new Error("Resposta inválida do LLM");
    }

    const extracted = JSON.parse(content_text);

    // Converter para nossos tipos
    const entities: Entity[] = (extracted.entities || []).map((e: any, idx: number) => ({
      id: `entity-${sourceId}-${idx}`,
      name: e.name,
      type: e.type,
      description: e.description,
      sourceIds: [sourceId],
    }));

    const concepts: Concept[] = (extracted.concepts || []).map((c: any, idx: number) => ({
      id: `concept-${sourceId}-${idx}`,
      name: c.name,
      definition: c.definition,
      sourceIds: [sourceId],
    }));

    console.log(`[KnowledgeGraph] Extração concluída: ${entities.length} entidades, ${concepts.length} conceitos`);

    return { entities, concepts };
  } catch (error) {
    console.error("[KnowledgeGraph] Erro ao extrair entidades:", error);
    throw error;
  }
}

/**
 * Calcula similaridade entre conceitos
 */
export async function calculateConceptSimilarity(
  concept1: string,
  concept2: string
): Promise<number> {
  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `Você é um especialista em análise semântica. Compare dois conceitos e retorne um score de similaridade de 0 a 1.
Responda apenas com um número entre 0 e 1.`,
        },
        {
          role: "user",
          content: `Compare a similaridade entre "${concept1}" e "${concept2}". Retorne apenas o número.`,
        },
      ],
    });

    const score_text = response.choices[0]?.message?.content as string;
    const score = parseFloat(score_text) || 0;

    return Math.max(0, Math.min(1, score));
  } catch (error) {
    console.error("[KnowledgeGraph] Erro ao calcular similaridade:", error);
    return 0;
  }
}

/**
 * Constrói o grafo de conhecimento a partir de múltiplas fontes
 * Nota: Implementação simplificada. Em produção, usar FalkorDB/Neo4j
 */
export async function buildKnowledgeGraph(
  sources: Array<{ id: number; content: string; type: string }>
): Promise<{
  entities: Entity[];
  concepts: Concept[];
  relationships: Relationship[];
}> {
  try {
    console.log(`[KnowledgeGraph] Construindo grafo a partir de ${sources.length} fontes`);

    const allEntities: Entity[] = [];
    const allConcepts: Concept[] = [];
    const allRelationships: Relationship[] = [];

    // Extrair de cada fonte
    for (const source of sources) {
      const { entities, concepts } = await extractEntitiesAndConcepts(
        source.content,
        source.id,
        source.type
      );

      allEntities.push(...entities);
      allConcepts.push(...concepts);

      // Criar relações entre entidades da mesma fonte
      for (let i = 0; i < entities.length; i++) {
        for (let j = i + 1; j < entities.length; j++) {
          allRelationships.push({
            source: entities[i].id,
            target: entities[j].id,
            type: "mentions",
            weight: 0.5,
          });
        }
      }
    }

    // Mesclar conceitos similares
    const mergedConcepts: Concept[] = [];
    const processedIndices = new Set<number>();

    for (let i = 0; i < allConcepts.length; i++) {
      if (processedIndices.has(i)) continue;

      const concept = allConcepts[i];
      const similar = [concept];
      processedIndices.add(i);

      // Encontrar conceitos similares
      for (let j = i + 1; j < allConcepts.length; j++) {
        if (processedIndices.has(j)) continue;

        const similarity = await calculateConceptSimilarity(concept.name, allConcepts[j].name);
        if (similarity > 0.7) {
          similar.push(allConcepts[j]);
          processedIndices.add(j);

          // Adicionar relação de similaridade
          allRelationships.push({
            source: concept.id,
            target: allConcepts[j].id,
            type: "similar_to",
            weight: similarity,
          });
        }
      }

      // Mesclar conceitos similares
      if (similar.length > 1) {
        const sourceIdSet = new Set(similar.flatMap(c => c.sourceIds));
        const sourceIds = Array.from(sourceIdSet);
        const mergedConcept: Concept = {
          id: concept.id,
          name: concept.name,
          definition: concept.definition,
          sourceIds,
        };
        mergedConcepts.push(mergedConcept);
      } else {
        mergedConcepts.push(concept);
      }
    }

    console.log(`[KnowledgeGraph] Grafo construído: ${allEntities.length} entidades, ${mergedConcepts.length} conceitos, ${allRelationships.length} relações`);

    return {
      entities: allEntities,
      concepts: mergedConcepts,
      relationships: allRelationships,
    };
  } catch (error) {
    console.error("[KnowledgeGraph] Erro ao construir grafo:", error);
    throw error;
  }
}

/**
 * Consulta o grafo para encontrar entidades relacionadas
 */
export async function queryRelatedEntities(
  entityName: string,
  graph: {
    entities: Entity[];
    concepts: Concept[];
    relationships: Relationship[];
  }
): Promise<Entity[]> {
  const entity = graph.entities.find(e => e.name.toLowerCase() === entityName.toLowerCase());
  if (!entity) return [];

  const relatedIds = graph.relationships
    .filter(r => r.source === entity.id || r.target === entity.id)
    .map(r => (r.source === entity.id ? r.target : r.source));

  return graph.entities.filter(e => relatedIds.includes(e.id));
}

/**
 * Encontra conceitos principais do grafo
 */
export function findMainConcepts(
  graph: {
    entities: Entity[];
    concepts: Concept[];
    relationships: Relationship[];
  },
  limit: number = 10
): Concept[] {
  // Ordenar por frequência de aparição em relações
  const conceptFrequency = new Map<string, number>();

  for (const concept of graph.concepts) {
    const count = graph.relationships.filter(
      r => r.source === concept.id || r.target === concept.id
    ).length;
    conceptFrequency.set(concept.id, count);
  }

  return graph.concepts
    .sort((a, b) => (conceptFrequency.get(b.id) || 0) - (conceptFrequency.get(a.id) || 0))
    .slice(0, limit);
}
