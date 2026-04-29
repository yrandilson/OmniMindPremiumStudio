import { protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import * as webSearchService from "../services/webSearchService";
import * as videoGenerator from "../services/videoGenerator";
import * as collaborativeRefinement from "../services/collaborativeRefinement";
import * as db from "../db";

export const researchRouter = router({
  // Web Search
  identifyGaps: protectedProcedure
    .input(z.object({ projectId: z.number() }))
    .query(async ({ input }) => {
      try {
        const sources = await db.getProjectSources(input.projectId);
        const sourceContents = sources
          .map((s) => s.extractedText || "")
          .filter((c) => c.length > 0);

        const gaps = await webSearchService.identifyResearchGaps(sourceContents);
        return gaps;
      } catch (error) {
        console.error("Erro ao identificar lacunas:", error);
        return [];
      }
    }),

  generateSearchSuggestions: protectedProcedure
    .input(z.object({ projectId: z.number() }))
    .query(async ({ input }) => {
      try {
        const sources = await db.getProjectSources(input.projectId);
        const sourceContents = sources
          .map((s) => s.extractedText || "")
          .filter((c) => c.length > 0);

        const suggestions = await webSearchService.generateSearchSuggestions(sourceContents);
        return suggestions;
      } catch (error) {
        console.error("Erro ao gerar sugestões:", error);
        return [];
      }
    }),

  performSearch: protectedProcedure
    .input(z.object({ query: z.string(), limit: z.number().optional() }))
    .mutation(async ({ input }) => {
      try {
        const results = await webSearchService.searchWeb(input.query, input.limit);
        return results;
      } catch (error) {
        console.error("Erro ao buscar na web:", error);
        return [];
      }
    }),

  integrateSearchResults: protectedProcedure
    .input(
      z.object({
        projectId: z.number(),
        searchResults: z.array(
          z.object({
            title: z.string(),
            url: z.string(),
            snippet: z.string(),
            source: z.string(),
          })
        ),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const sources = await db.getProjectSources(input.projectId);
        const sourceContents = sources
          .map((s) => s.extractedText || "")
          .filter((c) => c.length > 0);

        const integrated = await webSearchService.integrateSearchResults(
          sourceContents,
          input.searchResults
        );

        return { success: true, integratedContent: integrated };
      } catch (error) {
        console.error("Erro ao integrar resultados:", error);
        return { success: false };
      }
    }),

  // Video Generation
  generateVideoScript: protectedProcedure
    .input(z.object({ content: z.string(), title: z.string(), duration: z.number().optional() }))
    .mutation(async ({ input }) => {
      try {
        const script = await videoGenerator.generateVideoScript(
          input.content,
          input.title,
          input.duration
        );
        return script;
      } catch (error) {
        console.error("Erro ao gerar script:", error);
        throw error;
      }
    }),

  generateVideo: protectedProcedure
    .input(
      z.object({
        projectId: z.number(),
        content: z.string(),
        title: z.string(),
        duration: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const result = await videoGenerator.generateVideoWithAvatar({
          content: input.content,
          title: input.title,
          duration: input.duration,
          avatarStyle: "professional",
        });

        // Salvar como output
        await db.createOutput(input.projectId, "video", input.title);

        return result;
      } catch (error) {
        console.error("Erro ao gerar vídeo:", error);
        throw error;
      }
    }),

  generateVideoClips: protectedProcedure
    .input(z.object({ content: z.string(), title: z.string(), clipCount: z.number().optional() }))
    .mutation(async ({ input }) => {
      try {
        const clips = await videoGenerator.generateVideoClips(
          input.content,
          input.title,
          input.clipCount
        );
        return clips;
      } catch (error) {
        console.error("Erro ao gerar clipes:", error);
        throw error;
      }
    }),

  // Collaborative Refinement
  refineOutput: protectedProcedure
    .input(
      z.object({
        outputId: z.number(),
        originalContent: z.string(),
        feedback: z.string(),
        adjustments: z.object({
          hierarchy: z.enum(["increase", "decrease", "flatten"]).optional(),
          emphasis: z.array(z.string()).optional(),
          style: z.enum(["concise", "detailed", "visual", "textual"]).optional(),
          tone: z.enum(["professional", "casual", "academic"]).optional(),
        }),
        outputType: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const refined = await collaborativeRefinement.refineOutput(
          input.originalContent,
          {
            outputId: input.outputId,
            feedback: input.feedback,
            adjustments: input.adjustments,
          },
          input.outputType
        );

        return refined;
      } catch (error) {
        console.error("Erro ao refinar:", error);
        throw error;
      }
    }),

  generateRefinementSuggestions: protectedProcedure
    .input(z.object({ content: z.string(), outputType: z.string() }))
    .query(async ({ input }) => {
      try {
        const suggestions = await collaborativeRefinement.generateRefinementSuggestions(
          input.content,
          input.outputType
        );
        return suggestions;
      } catch (error) {
        console.error("Erro ao gerar sugestões:", error);
        return [];
      }
    }),

  compareVersions: protectedProcedure
    .input(z.object({ version1: z.string(), version2: z.string(), outputType: z.string() }))
    .query(async ({ input }) => {
      try {
        const comparison = await collaborativeRefinement.compareVersions(
          input.version1,
          input.version2,
          input.outputType
        );
        return comparison;
      } catch (error) {
        console.error("Erro ao comparar versões:", error);
        return { differences: [], improvements: [] };
      }
    }),
});
