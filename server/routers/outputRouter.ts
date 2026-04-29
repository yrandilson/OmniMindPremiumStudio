import { protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import * as db from "../db";
import * as outputGenerator from "../services/outputGenerator";

export const outputRouter = router({
  generate: protectedProcedure
    .input(
      z.object({
        projectId: z.number(),
        type: z.enum(["mindmap", "infographic", "report", "presentation", "summary"]),
        title: z.string(),
        sourceIds: z.array(z.number()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        // Criar output com status "generating"
        const result = await db.createOutput(input.projectId, input.type, input.title);
        const outputId = (result as any).insertId || 0;

        // Recuperar conteúdo das fontes
        const sources = await db.getProjectSources(input.projectId);
        const sourceContents = sources
          .filter((s) => !input.sourceIds || input.sourceIds.includes(s.id))
          .map((s) => s.extractedText || "")
          .filter((c) => c.length > 0);

        if (sourceContents.length === 0) {
          throw new Error("Nenhuma fonte com conteúdo disponível");
        }

        // Gerar entregável baseado no tipo
        let generatedContent: any;

        switch (input.type) {
          case "mindmap":
            generatedContent = await outputGenerator.generateMindMap(
              input.projectId,
              sourceContents,
              outputId
            );
            break;

          case "infographic":
            generatedContent = await outputGenerator.generateInfographic(
              input.projectId,
              sourceContents,
              outputId
            );
            break;

          case "report":
            generatedContent = await outputGenerator.generateReport(
              input.projectId,
              sourceContents,
              outputId
            );
            break;

          case "presentation":
            generatedContent = await outputGenerator.generatePresentation(
              input.projectId,
              sourceContents,
              outputId
            );
            break;

          case "summary":
            generatedContent = await outputGenerator.generateSummary(
              input.projectId,
              sourceContents
            );
            await db.updateOutputStatus(outputId, "completed", `summary-${input.projectId}-${Date.now()}`);
            break;

          default:
            throw new Error(`Tipo de entregável não suportado: ${input.type}`);
        }

        return {
          outputId,
          status: "completed",
          type: input.type,
        };
      } catch (error) {
        console.error("[OutputRouter] Erro ao gerar entregável:", error);
        throw error;
      }
    }),

  list: protectedProcedure
    .input(z.object({ projectId: z.number() }))
    .query(async ({ input }) => {
      return db.getProjectOutputs(input.projectId);
    }),

  get: protectedProcedure
    .input(z.object({ outputId: z.number() }))
    .query(async ({ input }) => {
      // Implementar busca de output específico
      return null;
    }),

  download: protectedProcedure
    .input(z.object({ outputId: z.number(), format: z.enum(["pdf", "pptx", "json"]) }))
    .mutation(async ({ input }) => {
      // Implementar download de entregável
      return { url: "" };
    }),

  delete: protectedProcedure
    .input(z.object({ outputId: z.number() }))
    .mutation(async ({ input }) => {
      // Implementar deleção de entregável
      return { success: true };
    }),
});
