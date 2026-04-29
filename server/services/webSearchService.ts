/**
 * Web Search Service
 * Responsável por buscar informações complementares na web
 */

import { invokeLLM } from "../_core/llm";

interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  source: string;
}

interface ResearchGap {
  topic: string;
  reason: string;
  suggestedSearches: string[];
  confidence: number;
}

/**
 * Analisa conteúdo para identificar lacunas de informação
 */
export async function identifyResearchGaps(
  sourceContents: string[]
): Promise<ResearchGap[]> {
  try {
    console.log("[WebSearchService] Analisando lacunas de pesquisa");

    const combinedContent = sourceContents.join("\n\n");

    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `Você é um especialista em pesquisa. Analise o conteúdo fornecido e identifique lacunas de informação que poderiam ser preenchidas com pesquisa adicional.

Responda em JSON com a seguinte estrutura:
{
  "gaps": [
    {
      "topic": "Tópico com lacuna",
      "reason": "Por que essa informação é importante",
      "suggestedSearches": ["Busca 1", "Busca 2"],
      "confidence": 0.8
    }
  ]
}`,
        },
        {
          role: "user",
          content: `Identifique lacunas de pesquisa neste conteúdo:\n\n${combinedContent.substring(0, 2000)}`,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "research_gaps",
          strict: true,
          schema: {
            type: "object",
            properties: {
              gaps: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    topic: { type: "string" },
                    reason: { type: "string" },
                    suggestedSearches: {
                      type: "array",
                      items: { type: "string" },
                    },
                    confidence: { type: "number" },
                  },
                  required: ["topic", "reason", "suggestedSearches", "confidence"],
                },
              },
            },
            required: ["gaps"],
          },
        },
      },
    });

    const content_text = response.choices[0]?.message?.content;
    if (typeof content_text !== "string") {
      throw new Error("Resposta inválida do LLM");
    }

    const gapsData = JSON.parse(content_text);

    console.log(`[WebSearchService] Identificadas ${gapsData.gaps.length} lacunas`);

    return gapsData.gaps.filter((gap: ResearchGap) => gap.confidence > 0.5);
  } catch (error) {
    console.error("[WebSearchService] Erro ao identificar lacunas:", error);
    return [];
  }
}

/**
 * Realiza busca web usando Data API
 */
export async function searchWeb(query: string, limit = 5): Promise<SearchResult[]> {
  try {
    console.log(`[WebSearchService] Buscando: ${query}`);

    // Simular busca web - em produção, usar Data API real
    // Por enquanto, retornar resultados simulados
    const mockResults: SearchResult[] = [
      {
        title: `Resultado sobre ${query}`,
        url: `https://example.com/search?q=${encodeURIComponent(query)}`,
        snippet: `Informações relevantes sobre ${query}. Este é um resultado simulado para demonstração.`,
        source: "example.com",
      },
      {
        title: `Análise de ${query}`,
        url: `https://research.example.com/${query.replace(/\s+/g, "-")}`,
        snippet: `Análise detalhada e pesquisa sobre ${query}. Conteúdo acadêmico e profissional.`,
        source: "research.example.com",
      },
      {
        title: `Guia completo: ${query}`,
        url: `https://guide.example.com/${query.replace(/\s+/g, "-")}`,
        snippet: `Guia abrangente cobrindo todos os aspectos de ${query}.`,
        source: "guide.example.com",
      },
    ];

    console.log(`[WebSearchService] Encontrados ${mockResults.length} resultados`);

    return mockResults.slice(0, limit);
  } catch (error) {
    console.error("[WebSearchService] Erro ao buscar na web:", error);
    return [];
  }
}

/**
 * Integra resultados de busca com conteúdo existente
 */
export async function integrateSearchResults(
  originalContent: string[],
  searchResults: SearchResult[]
): Promise<string> {
  try {
    console.log("[WebSearchService] Integrando resultados de busca");

    const searchContent = searchResults
      .map((r) => `Fonte: ${r.source}\nTítulo: ${r.title}\nConteúdo: ${r.snippet}`)
      .join("\n\n");

    const combinedContent = [...originalContent, searchContent].join("\n\n");

    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `Você é um especialista em síntese de informações. Integre os novos resultados de busca com o conteúdo existente, criando um texto coeso e bem estruturado.`,
        },
        {
          role: "user",
          content: `Conteúdo original:\n${originalContent.join("\n\n")}\n\nNovos resultados de busca:\n${searchContent}\n\nCrie um texto integrado que combine ambos de forma natural.`,
        },
      ],
    });

    const integratedContent = (response.choices[0]?.message?.content as string) || "";

    console.log("[WebSearchService] Resultados integrados com sucesso");

    return integratedContent;
  } catch (error) {
    console.error("[WebSearchService] Erro ao integrar resultados:", error);
    return originalContent.join("\n\n");
  }
}

/**
 * Gera sugestões de pesquisa complementar
 */
export async function generateSearchSuggestions(
  sourceContents: string[]
): Promise<string[]> {
  try {
    console.log("[WebSearchService] Gerando sugestões de pesquisa");

    const combinedContent = sourceContents.join("\n\n");

    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `Você é um especialista em pesquisa. Gere 5 sugestões de buscas complementares que enriqueceriam o conteúdo fornecido.

Responda em JSON com a seguinte estrutura:
{
  "suggestions": ["Busca 1", "Busca 2", "Busca 3", "Busca 4", "Busca 5"]
}`,
        },
        {
          role: "user",
          content: `Gere sugestões de pesquisa para este conteúdo:\n\n${combinedContent.substring(0, 2000)}`,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "search_suggestions",
          strict: true,
          schema: {
            type: "object",
            properties: {
              suggestions: {
                type: "array",
                items: { type: "string" },
              },
            },
            required: ["suggestions"],
          },
        },
      },
    });

    const content_text = response.choices[0]?.message?.content;
    if (typeof content_text !== "string") {
      throw new Error("Resposta inválida do LLM");
    }

    const suggestionsData = JSON.parse(content_text);

    console.log(`[WebSearchService] Geradas ${suggestionsData.suggestions.length} sugestões`);

    return suggestionsData.suggestions;
  } catch (error) {
    console.error("[WebSearchService] Erro ao gerar sugestões:", error);
    return [];
  }
}
