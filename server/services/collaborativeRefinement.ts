/**
 * Collaborative Refinement Service
 * Responsável por refinamento iterativo com feedback do usuário
 */

import { invokeLLM } from "../_core/llm";

interface RefinementFeedback {
  outputId: number;
  feedback: string;
  adjustments: {
    hierarchy?: "increase" | "decrease" | "flatten";
    emphasis?: string[];
    style?: "concise" | "detailed" | "visual" | "textual";
    tone?: "professional" | "casual" | "academic";
  };
}

interface RefinedOutput {
  originalId: number;
  refinedContent: string;
  changes: string[];
  version: number;
}

/**
 * Processa feedback do usuário e refina o entregável
 */
export async function refineOutput(
  originalContent: string,
  feedback: RefinementFeedback,
  outputType: string
): Promise<RefinedOutput> {
  try {
    console.log(`[CollaborativeRefinement] Refinando ${outputType} com feedback do usuário`);

    const adjustmentInstructions = buildAdjustmentInstructions(feedback.adjustments);

    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `Você é um especialista em refinamento de conteúdo. O usuário forneceu feedback sobre um ${outputType}.

Instruções de ajuste:
${adjustmentInstructions}

Refine o conteúdo de acordo com o feedback, mantendo a qualidade e coerência.`,
        },
        {
          role: "user",
          content: `Conteúdo original:
${originalContent}

Feedback do usuário:
${feedback.feedback}

Por favor, refine o conteúdo de acordo com o feedback e as instruções acima.`,
        },
      ],
    });

    const refinedContent = (response.choices[0]?.message?.content as string) || "";

    // Gerar lista de mudanças
    const changes = extractChanges(originalContent, refinedContent);

    console.log(
      `[CollaborativeRefinement] ${outputType} refinado com ${changes.length} mudanças`
    );

    return {
      originalId: feedback.outputId,
      refinedContent,
      changes,
      version: 2,
    };
  } catch (error) {
    console.error("[CollaborativeRefinement] Erro ao refinar:", error);
    throw error;
  }
}

/**
 * Constrói instruções de ajuste a partir do feedback
 */
function buildAdjustmentInstructions(adjustments: RefinementFeedback["adjustments"]): string {
  const instructions: string[] = [];

  if (adjustments.hierarchy === "increase") {
    instructions.push("- Aumentar a hierarquia: adicionar mais níveis de detalhamento");
  } else if (adjustments.hierarchy === "decrease") {
    instructions.push("- Diminuir a hierarquia: simplificar e consolidar informações");
  } else if (adjustments.hierarchy === "flatten") {
    instructions.push("- Achatar a hierarquia: apresentar informações em nível similar");
  }

  if (adjustments.emphasis && adjustments.emphasis.length > 0) {
    instructions.push(
      `- Dar ênfase aos seguintes tópicos: ${adjustments.emphasis.join(", ")}`
    );
  }

  if (adjustments.style === "concise") {
    instructions.push("- Ser conciso: remover informações redundantes");
  } else if (adjustments.style === "detailed") {
    instructions.push("- Ser detalhado: adicionar mais contexto e explicações");
  } else if (adjustments.style === "visual") {
    instructions.push("- Focar em elementos visuais: descrever com mais detalhes visuais");
  } else if (adjustments.style === "textual") {
    instructions.push("- Focar em texto: usar descrições textuais detalhadas");
  }

  if (adjustments.tone === "professional") {
    instructions.push("- Usar tom profissional e formal");
  } else if (adjustments.tone === "casual") {
    instructions.push("- Usar tom casual e amigável");
  } else if (adjustments.tone === "academic") {
    instructions.push("- Usar tom acadêmico e técnico");
  }

  return instructions.join("\n");
}

/**
 * Extrai mudanças entre versões
 */
function extractChanges(original: string, refined: string): string[] {
  // Análise simplificada de mudanças
  const changes: string[] = [];

  const originalLength = original.length;
  const refinedLength = refined.length;

  if (refinedLength > originalLength * 1.2) {
    changes.push("Conteúdo expandido com mais detalhes");
  } else if (refinedLength < originalLength * 0.8) {
    changes.push("Conteúdo condensado e simplificado");
  }

  // Detectar mudanças de estrutura
  const originalLines = original.split("\n").length;
  const refinedLines = refined.split("\n").length;

  if (refinedLines > originalLines * 1.5) {
    changes.push("Estrutura reorganizada com mais seções");
  }

  changes.push("Conteúdo refinado de acordo com feedback");

  return changes;
}

/**
 * Gera sugestões de refinamento automático
 */
export async function generateRefinementSuggestions(
  content: string,
  outputType: string
): Promise<string[]> {
  try {
    console.log(`[CollaborativeRefinement] Gerando sugestões de refinamento`);

    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `Você é um especialista em análise de qualidade. Analise o ${outputType} fornecido e gere 3-5 sugestões de refinamento que melhorariam a qualidade.

Responda em JSON com a seguinte estrutura:
{
  "suggestions": [
    "Sugestão 1",
    "Sugestão 2",
    "Sugestão 3"
  ]
}`,
        },
        {
          role: "user",
          content: `Analise este ${outputType} e gere sugestões de refinamento:\n\n${content.substring(0, 2000)}`,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "refinement_suggestions",
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

    console.log(
      `[CollaborativeRefinement] Geradas ${suggestionsData.suggestions.length} sugestões`
    );

    return suggestionsData.suggestions;
  } catch (error) {
    console.error("[CollaborativeRefinement] Erro ao gerar sugestões:", error);
    return [];
  }
}

/**
 * Compara duas versões de um entregável
 */
export async function compareVersions(
  version1: string,
  version2: string,
  outputType: string
): Promise<{ differences: string[]; improvements: string[] }> {
  try {
    console.log(`[CollaborativeRefinement] Comparando versões`);

    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `Você é um especialista em análise comparativa. Compare as duas versões do ${outputType} e identifique as diferenças e melhorias.

Responda em JSON com a seguinte estrutura:
{
  "differences": ["Diferença 1", "Diferença 2"],
  "improvements": ["Melhoria 1", "Melhoria 2"]
}`,
        },
        {
          role: "user",
          content: `Versão 1:\n${version1}\n\nVersão 2:\n${version2}`,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "version_comparison",
          strict: true,
          schema: {
            type: "object",
            properties: {
              differences: {
                type: "array",
                items: { type: "string" },
              },
              improvements: {
                type: "array",
                items: { type: "string" },
              },
            },
            required: ["differences", "improvements"],
          },
        },
      },
    });

    const content_text = response.choices[0]?.message?.content;
    if (typeof content_text !== "string") {
      throw new Error("Resposta inválida do LLM");
    }

    const comparisonData = JSON.parse(content_text);

    console.log(
      `[CollaborativeRefinement] Comparação concluída: ${comparisonData.differences.length} diferenças, ${comparisonData.improvements.length} melhorias`
    );

    return comparisonData;
  } catch (error) {
    console.error("[CollaborativeRefinement] Erro ao comparar versões:", error);
    return { differences: [], improvements: [] };
  }
}
