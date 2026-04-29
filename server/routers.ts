import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { invokeLLM } from "./_core/llm";
import { storagePut } from "./storage";
import { researchRouter } from "./routers/researchRouter";

export const appRouter = router({
  system: systemRouter,
  research: researchRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // ============ Projects ============
  projects: router({
    create: protectedProcedure
      .input(z.object({
        title: z.string().min(1),
        description: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        return db.createProject(ctx.user.id, input.title, input.description);
      }),

    list: protectedProcedure
      .query(async ({ ctx }) => {
        return db.getUserProjects(ctx.user.id);
      }),

    get: protectedProcedure
      .input(z.object({ projectId: z.number() }))
      .query(async ({ input }) => {
        return db.getProjectById(input.projectId);
      }),
  }),

  // ============ Sources ============
  sources: router({
    upload: protectedProcedure
      .input(z.object({
        projectId: z.number(),
        type: z.enum(["pdf", "doc", "video", "audio", "image", "csv", "json", "url"]),
        originalName: z.string(),
        fileBuffer: z.instanceof(Buffer).optional(),
        url: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        let storageKey: string | undefined;
        
        // Se for arquivo, fazer upload para S3
        if (input.fileBuffer) {
          const mimeTypes: Record<string, string> = {
            pdf: "application/pdf",
            doc: "application/msword",
            video: "video/mp4",
            audio: "audio/mpeg",
            image: "image/jpeg",
            csv: "text/csv",
            json: "application/json",
          };
          
          const { key } = await storagePut(
            `projects/${input.projectId}/sources/${Date.now()}-${input.originalName}`,
            input.fileBuffer,
            mimeTypes[input.type] || "application/octet-stream"
          );
          storageKey = key;
        }
        
        return db.createSource(
          input.projectId,
          input.type,
          input.originalName,
          storageKey,
          input.url
        );
      }),

    list: protectedProcedure
      .input(z.object({ projectId: z.number() }))
      .query(async ({ input }) => {
        return db.getProjectSources(input.projectId);
      }),

    process: protectedProcedure
      .input(z.object({
        sourceId: z.number(),
        projectId: z.number(),
      }))
      .mutation(async ({ input }) => {
        // Aqui seria chamado o processamento de transcrição/extração
        // Por enquanto, apenas marca como processado
        return db.updateSourceContent(input.sourceId, "Conteúdo extraído...");
      }),
  }),

  // ============ Chat ============
  chat: router({
    send: protectedProcedure
      .input(z.object({
        projectId: z.number(),
        message: z.string(),
        sourceIds: z.array(z.number()).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        // Salvar mensagem do usuário
        await db.createChatMessage(
          input.projectId,
          ctx.user.id,
          "user",
          input.message
        );

        // Recuperar contexto das fontes
        let context = "";
        if (input.sourceIds && input.sourceIds.length > 0) {
          const sources = await db.getProjectSources(input.projectId);
          const relevantSources = sources.filter(s => input.sourceIds?.includes(s.id));
          context = relevantSources
            .map(s => `[${s.originalName}]: ${s.extractedText || ""}`)
            .join("\n\n");
        }

        // Chamar LLM
        const messages = [
          {
            role: "system" as const,
            content: `Você é um assistente especializado em análise de documentos e geração de conhecimento. 
              Ajude o usuário a entender, resumir e gerar insights a partir das fontes fornecidas.
              ${context ? `\n\nContexto das fontes:\n${context}` : ""}`,
          },
          {
            role: "user" as const,
            content: input.message,
          },
        ];

        const response = await invokeLLM({
          messages: messages as any,
        });

        const assistantMessage = (response.choices[0]?.message?.content as string) || "";

        // Salvar resposta do assistente
        await db.createChatMessage(
          input.projectId,
          ctx.user.id,
          "assistant",
          assistantMessage
        );

        return {
          message: assistantMessage,
        };
      }),

    history: protectedProcedure
      .input(z.object({
        projectId: z.number(),
        limit: z.number().default(50),
        offset: z.number().default(0),
      }))
      .query(async ({ input }) => {
        return db.getProjectChatHistory(input.projectId, input.limit, input.offset);
      }),
  }),

  // ============ Canvas ============
  canvas: router({
    save: protectedProcedure
      .input(z.object({
        projectId: z.number(),
        items: z.array(z.any()),
      }))
      .mutation(async ({ input }) => {
        // Aqui seria implementado o versionamento do canvas
        return { success: true, version: 1 };
      }),

    load: protectedProcedure
      .input(z.object({ projectId: z.number() }))
      .query(async ({ input }) => {
        return db.getProjectCanvasItems(input.projectId);
      }),
  }),

  // ============ Outputs ============
  outputs: router({
    generate: protectedProcedure
      .input(z.object({
        projectId: z.number(),
        type: z.enum(["mindmap", "infographic", "report", "presentation", "video"]),
        title: z.string(),
        sourceIds: z.array(z.number()).optional(),
        prompt: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        // Criar output com status "generating"
        const result = await db.createOutput(
          input.projectId,
          input.type,
          input.title
        );

        // TODO: Implementar geração real baseada no tipo
        // Por enquanto, apenas retorna o ID

        return {
          outputId: (result as any).insertId || 0,
          status: "generating",
        };
      }),

    list: protectedProcedure
      .input(z.object({ projectId: z.number() }))
      .query(async ({ input }) => {
        return db.getProjectOutputs(input.projectId);
      }),
  }),

  // ============ Preferences ============
  preferences: router({
    get: protectedProcedure
      .query(async ({ ctx }) => {
        return db.getUserPreferences(ctx.user.id);
      }),

    update: protectedProcedure
      .input(z.object({
        preferredFormats: z.array(z.string()).optional(),
        stylePreferences: z.record(z.string(), z.any()).optional(),
        researchPermission: z.boolean().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        return db.upsertUserPreferences(
          ctx.user.id,
          input.preferredFormats || undefined,
          input.stylePreferences || undefined,
          input.researchPermission
        );
      }),
  }),
});

export type AppRouter = typeof appRouter;
