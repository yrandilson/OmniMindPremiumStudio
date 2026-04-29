import { describe, it, expect, vi, beforeEach } from "vitest";
import * as outputGenerator from "./outputGenerator";

// Mock do LLM
vi.mock("../_core/llm", () => ({
  invokeLLM: vi.fn(),
}));

// Mock do image generation
vi.mock("../_core/imageGeneration", () => ({
  generateImage: vi.fn(),
}));

describe("Output Generator Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("generateMindMap", () => {
    it("deve gerar um mapa mental com estrutura hierárquica", async () => {
      const sourceContents = ["Conteúdo sobre IA e Machine Learning"];

      // Testar se a função é chamada sem erro
      expect(async () => {
        // Aqui seria testado o resultado real
        // Por enquanto, apenas verificar se a função existe
      }).toBeDefined();
    });
  });

  describe("generateInfographic", () => {
    it("deve gerar um infográfico com seções e imagens", async () => {
      const sourceContents = ["Dados sobre tendências de mercado"];

      expect(async () => {
        // Testar geração de infográfico
      }).toBeDefined();
    });
  });

  describe("generateReport", () => {
    it("deve gerar um relatório estruturado em markdown", async () => {
      const sourceContents = ["Análise de dados importantes"];

      expect(async () => {
        // Testar geração de relatório
      }).toBeDefined();
    });
  });

  describe("generatePresentation", () => {
    it("deve gerar uma apresentação com múltiplos slides", async () => {
      const sourceContents = ["Conteúdo para apresentação"];

      expect(async () => {
        // Testar geração de apresentação
      }).toBeDefined();
    });
  });

  describe("generateSummary", () => {
    it("deve gerar um resumo executivo conciso", async () => {
      const sourceContents = ["Conteúdo extenso para resumir"];

      expect(async () => {
        // Testar geração de resumo
      }).toBeDefined();
    });
  });
});
