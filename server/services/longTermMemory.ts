/**
 * Long-Term Memory Service
 * Gerencia preferências, histórico de interações e padrões de uso do usuário
 * Implementação simplificada. Em produção, usar Mem0 SDK
 */

import * as db from "../db";

interface UserMemory {
  userId: number;
  preferredFormats: string[];
  stylePreferences: Record<string, any>;
  interactionHistory: InteractionRecord[];
  learnings: string[];
}

interface InteractionRecord {
  timestamp: Date;
  action: string;
  context: Record<string, any>;
  outcome: "success" | "failure" | "neutral";
}

/**
 * Inicializa ou carrega a memória do usuário
 */
export async function loadUserMemory(userId: number): Promise<UserMemory> {
  try {
    console.log(`[LongTermMemory] Carregando memória do usuário: ${userId}`);

    const preferences = await db.getUserPreferences(userId);

    const memory: UserMemory = {
      userId,
      preferredFormats: (Array.isArray(preferences?.preferredFormats) ? preferences.preferredFormats : ["mindmap", "summary"]),
      stylePreferences: (preferences?.stylePreferences as Record<string, any>) || {
        theme: "dark",
        colorScheme: "purple",
        layout: "compact",
      },
      interactionHistory: [],
      learnings: [],
    };

    console.log(`[LongTermMemory] Memória carregada com sucesso`);
    return memory;
  } catch (error) {
    console.error("[LongTermMemory] Erro ao carregar memória:", error);
    throw error;
  }
}

/**
 * Registra uma interação na memória
 */
export async function recordInteraction(
  userId: number,
  action: string,
  context: Record<string, any>,
  outcome: "success" | "failure" | "neutral"
): Promise<void> {
  try {
    console.log(`[LongTermMemory] Registrando interação: ${action}`);

    // Aqui seria salvo em um banco de dados ou Mem0
    // Por enquanto, apenas log
    const record: InteractionRecord = {
      timestamp: new Date(),
      action,
      context,
      outcome,
    };

    console.log(`[LongTermMemory] Interação registrada:`, record);
  } catch (error) {
    console.error("[LongTermMemory] Erro ao registrar interação:", error);
  }
}

/**
 * Aprende preferências de formato a partir do histórico
 */
export async function learnFormatPreferences(userId: number, memory: UserMemory): Promise<string[]> {
  try {
    console.log(`[LongTermMemory] Aprendendo preferências de formato`);

    // Simular análise de padrões
    // Em produção, usar análise de frequência do histórico
    const preferences = (Array.isArray(memory.preferredFormats) ? memory.preferredFormats : ["mindmap", "summary"]);

    console.log(`[LongTermMemory] Preferências aprendidas:`, preferences);
    return preferences;
  } catch (error) {
    console.error("[LongTermMemory] Erro ao aprender preferências:", error);
    return memory.preferredFormats;
  }
}

/**
 * Aprende preferências de estilo
 */
export async function learnStylePreferences(userId: number, memory: UserMemory): Promise<Record<string, any>> {
  try {
    console.log(`[LongTermMemory] Aprendendo preferências de estilo`);

    // Simular análise de padrões
    // Em produção, usar análise de cliques e ajustes do usuário
    const stylePrefs = (memory.stylePreferences as Record<string, any>) || {
      theme: "dark",
      colorScheme: "purple",
      layout: "compact",
    };

    console.log(`[LongTermMemory] Preferências de estilo aprendidas:`, stylePrefs);
    return stylePrefs;
  } catch (error) {
    console.error("[LongTermMemory] Erro ao aprender estilo:", error);
    return memory.stylePreferences;
  }
}

/**
 * Gera um prompt de sistema que incorpora a memória do usuário
 */
export function generateSystemPromptWithMemory(memory: UserMemory): string {
  const formatsText = memory.preferredFormats.join(", ");
  const styleText = JSON.stringify(memory.stylePreferences);

  return `Você é um assistente especializado em análise de documentos e geração de conhecimento.

## Preferências do Usuário (Aprendidas):
- Formatos preferidos: ${formatsText}
- Estilo preferido: ${styleText}

## Instruções:
1. Sempre respeite as preferências de formato do usuário
2. Adapte o estilo de apresentação conforme as preferências aprendidas
3. Use o histórico de interações para antecipar necessidades
4. Seja conciso e direto, respeitando o estilo preferido do usuário`;
}

/**
 * Atualiza as preferências do usuário no banco
 */
export async function updateUserPreferences(
  userId: number,
  preferredFormats?: string[],
  stylePreferences?: Record<string, any>
): Promise<void> {
  try {
    console.log(`[LongTermMemory] Atualizando preferências do usuário: ${userId}`);

    await db.upsertUserPreferences(
      userId,
      preferredFormats,
      stylePreferences,
      undefined
    );

    console.log(`[LongTermMemory] Preferências atualizadas com sucesso`);
  } catch (error) {
    console.error("[LongTermMemory] Erro ao atualizar preferências:", error);
    throw error;
  }
}

/**
 * Extrai insights do histórico de interações
 */
export function extractInsights(memory: UserMemory): string[] {
  const insights: string[] = [];

  // Analisar padrões de uso
  if (memory.interactionHistory.length > 0) {
    const successRate =
      memory.interactionHistory.filter(i => i.outcome === "success").length /
      memory.interactionHistory.length;

    if (successRate > 0.8) {
      insights.push("O usuário tem alta taxa de sucesso em suas interações");
    }
  }

  // Analisar preferências
  if (memory.preferredFormats.includes("mindmap")) {
    insights.push("O usuário prefere visualizações em forma de mapa mental");
  }

  if (memory.stylePreferences?.theme === "dark") {
    insights.push("O usuário prefere tema escuro");
  }

  return insights;
}

/**
 * Recomenda próximos passos baseado na memória
 */
export function recommendNextSteps(memory: UserMemory, context: Record<string, any>): string[] {
  const recommendations: string[] = [];

  // Recomendar formatos baseado em preferências
  if (memory.preferredFormats.includes("mindmap")) {
    recommendations.push("Gerar um mapa mental dos conceitos principais");
  }

  if (memory.preferredFormats.includes("infographic")) {
    recommendations.push("Criar um infográfico visual dos dados");
  }

  // Recomendar ações baseado em contexto
  if (context.sourceCount > 5) {
    recommendations.push("Considere criar um relatório consolidado");
  }

  if (context.hasVideo) {
    recommendations.push("Gerar um resumo em vídeo com avatar IA");
  }

  return recommendations;
}

/**
 * Calcula um score de confiança para recomendações
 */
export function calculateConfidenceScore(memory: UserMemory): number {
  let score = 0.5; // Score base

  // Aumentar score com base no histórico
  if (memory.interactionHistory.length > 10) score += 0.2;
  if (memory.interactionHistory.length > 50) score += 0.1;

  // Aumentar score se há preferências definidas
  if (memory.preferredFormats.length > 0) score += 0.1;
  if (Object.keys(memory.stylePreferences).length > 0) score += 0.1;

  return Math.min(1, score);
}
