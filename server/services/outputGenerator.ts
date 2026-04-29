/**
 * Output Generator Service
 * Responsável por gerar diferentes tipos de entregáveis
 */

import { invokeLLM } from "../_core/llm";
import { generateImage } from "../_core/imageGeneration";
import * as db from "../db";

/**
 * Estrutura de um Mapa Mental
 */
interface MindMapNode {
  id: string;
  label: string;
  children: MindMapNode[];
  color?: string;
}

/**
 * Gera um mapa mental a partir do conteúdo
 */
export async function generateMindMap(
  projectId: number,
  sourceContents: string[],
  outputId: number
): Promise<MindMapNode> {
  try {
    console.log(`[OutputGenerator] Gerando mapa mental para projeto ${projectId}`);

    const combinedContent = sourceContents.join("\n\n");

    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `Você é um especialista em criar mapas mentais. Analise o conteúdo e crie uma estrutura hierárquica de conceitos principais e subtópicos.
          
Responda em JSON com a seguinte estrutura:
{
  "title": "Título do mapa",
  "nodes": {
    "id": "root",
    "label": "Conceito Central",
    "children": [
      {
        "id": "...",
        "label": "Tema Principal",
        "children": [
          {"id": "...", "label": "Subtema", "children": []}
        ]
      }
    ]
  }
}`,
        },
        {
          role: "user",
          content: `Crie um mapa mental estruturado para este conteúdo:\n\n${combinedContent.substring(0, 3000)}`,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "mindmap_structure",
          strict: true,
          schema: {
            type: "object",
            properties: {
              title: { type: "string" },
              nodes: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  label: { type: "string" },
                  children: {
                    type: "array",
                    items: { type: "object" },
                  },
                },
                required: ["id", "label", "children"],
              },
            },
            required: ["title", "nodes"],
          },
        },
      },
    });

    const content_text = response.choices[0]?.message?.content;
    if (typeof content_text !== "string") {
      throw new Error("Resposta inválida do LLM");
    }

    const mindmapData = JSON.parse(content_text);

    // Renderizar como SVG
    const svg = renderMindMapToSVG(mindmapData.nodes);

    // Salvar resultado
    await db.updateOutputStatus(outputId, "completed", `mindmap-${projectId}-${Date.now()}`);

    console.log(`[OutputGenerator] Mapa mental gerado com sucesso`);

    return mindmapData.nodes;
  } catch (error) {
    console.error("[OutputGenerator] Erro ao gerar mapa mental:", error);
    await db.updateOutputStatus(outputId, "failed");
    throw error;
  }
}

/**
 * Renderiza um mapa mental como SVG
 */
function renderMindMapToSVG(node: MindMapNode, x = 400, y = 300, level = 0): string {
  const nodeRadius = 40;
  const levelDistance = 150;
  const angleSpread = Math.PI * 2;

  let svg = `<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">`;
  svg += `<defs><style>.mindmap-node { fill: #9333ea; stroke: #c084fc; stroke-width: 2; } .mindmap-text { font-size: 12px; fill: white; text-anchor: middle; }</style></defs>`;

  // Desenhar nó
  svg += `<circle cx="${x}" cy="${y}" r="${nodeRadius}" class="mindmap-node"/>`;
  svg += `<text x="${x}" y="${y}" class="mindmap-text">${node.label}</text>`;

  // Desenhar filhos
  if (node.children && node.children.length > 0) {
    const childAngleSpread = angleSpread / node.children.length;

    node.children.forEach((child, index) => {
      const angle = (index - node.children.length / 2) * childAngleSpread;
      const childX = x + Math.cos(angle) * levelDistance;
      const childY = y + Math.sin(angle) * levelDistance;

      // Linha conectora
      svg += `<line x1="${x}" y1="${y}" x2="${childX}" y2="${childY}" stroke="#9333ea" stroke-width="1" opacity="0.5"/>`;

      // Recursão para filhos
      svg += renderMindMapToSVG(child, childX, childY, level + 1);
    });
  }

  if (level === 0) {
    svg += `</svg>`;
  }

  return svg;
}

/**
 * Estrutura de um Infográfico
 */
interface InfographicData {
  title: string;
  sections: Array<{
    heading: string;
    content: string;
    imagePrompt?: string;
  }>;
}

/**
 * Gera um infográfico a partir do conteúdo
 */
export async function generateInfographic(
  projectId: number,
  sourceContents: string[],
  outputId: number
): Promise<InfographicData> {
  try {
    console.log(`[OutputGenerator] Gerando infográfico para projeto ${projectId}`);

    const combinedContent = sourceContents.join("\n\n");

    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `Você é um designer de infográficos. Analise o conteúdo e crie uma estrutura de infográfico com seções, dados visuais e prompts para imagens.

Responda em JSON com a seguinte estrutura:
{
  "title": "Título do infográfico",
  "sections": [
    {
      "heading": "Seção 1",
      "content": "Dados e informações",
      "imagePrompt": "Descrição para gerar imagem"
    }
  ]
}`,
        },
        {
          role: "user",
          content: `Crie um infográfico para este conteúdo:\n\n${combinedContent.substring(0, 3000)}`,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "infographic_structure",
          strict: true,
          schema: {
            type: "object",
            properties: {
              title: { type: "string" },
              sections: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    heading: { type: "string" },
                    content: { type: "string" },
                    imagePrompt: { type: "string" },
                  },
                  required: ["heading", "content"],
                },
              },
            },
            required: ["title", "sections"],
          },
        },
      },
    });

    const content_text = response.choices[0]?.message?.content;
    if (typeof content_text !== "string") {
      throw new Error("Resposta inválida do LLM");
    }

    const infographicData = JSON.parse(content_text);

    // Gerar imagens para cada seção
    for (const section of infographicData.sections) {
      if (section.imagePrompt) {
        try {
          const imageResult = await generateImage({
            prompt: section.imagePrompt,
          });
          section.imageUrl = imageResult.url;
        } catch (error) {
          console.warn("Erro ao gerar imagem:", error);
        }
      }
    }

    // Salvar resultado
    await db.updateOutputStatus(outputId, "completed", `infographic-${projectId}-${Date.now()}`);

    console.log(`[OutputGenerator] Infográfico gerado com sucesso`);

    return infographicData;
  } catch (error) {
    console.error("[OutputGenerator] Erro ao gerar infográfico:", error);
    await db.updateOutputStatus(outputId, "failed");
    throw error;
  }
}

/**
 * Gera um relatório estruturado
 */
export async function generateReport(
  projectId: number,
  sourceContents: string[],
  outputId: number
): Promise<string> {
  try {
    console.log(`[OutputGenerator] Gerando relatório para projeto ${projectId}`);

    const combinedContent = sourceContents.join("\n\n");

    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `Você é um especialista em criar relatórios profissionais. Analise o conteúdo e crie um relatório estruturado com:
- Executivo (resumo)
- Introdução
- Análise detalhada
- Conclusões
- Recomendações

Use markdown para formatação.`,
        },
        {
          role: "user",
          content: `Crie um relatório completo para este conteúdo:\n\n${combinedContent}`,
        },
      ],
    });

    const reportContent = (response.choices[0]?.message?.content as string) || "";

    // Salvar resultado
    await db.updateOutputStatus(outputId, "completed", `report-${projectId}-${Date.now()}`);

    console.log(`[OutputGenerator] Relatório gerado com sucesso`);

    return reportContent;
  } catch (error) {
    console.error("[OutputGenerator] Erro ao gerar relatório:", error);
    await db.updateOutputStatus(outputId, "failed");
    throw error;
  }
}

/**
 * Estrutura de uma Apresentação
 */
interface PresentationSlide {
  title: string;
  content: string;
  imagePrompt?: string;
  layout: "title" | "content" | "image" | "comparison";
}

/**
 * Gera uma apresentação com slides
 */
export async function generatePresentation(
  projectId: number,
  sourceContents: string[],
  outputId: number
): Promise<PresentationSlide[]> {
  try {
    console.log(`[OutputGenerator] Gerando apresentação para projeto ${projectId}`);

    const combinedContent = sourceContents.join("\n\n");

    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `Você é um especialista em criar apresentações. Analise o conteúdo e crie uma estrutura de slides com:
- Slide de título
- Slides de conteúdo
- Slides com imagens
- Slide de conclusão

Responda em JSON com a seguinte estrutura:
{
  "slides": [
    {
      "title": "Título do slide",
      "content": "Conteúdo em markdown",
      "layout": "title|content|image|comparison",
      "imagePrompt": "Descrição para gerar imagem"
    }
  ]
}`,
        },
        {
          role: "user",
          content: `Crie uma apresentação com 5-7 slides para este conteúdo:\n\n${combinedContent.substring(0, 3000)}`,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "presentation_structure",
          strict: true,
          schema: {
            type: "object",
            properties: {
              slides: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    content: { type: "string" },
                    layout: { type: "string", enum: ["title", "content", "image", "comparison"] },
                    imagePrompt: { type: "string" },
                  },
                  required: ["title", "content", "layout"],
                },
              },
            },
            required: ["slides"],
          },
        },
      },
    });

    const content_text = response.choices[0]?.message?.content;
    if (typeof content_text !== "string") {
      throw new Error("Resposta inválida do LLM");
    }

    const presentationData = JSON.parse(content_text);

    // Gerar imagens para slides
    for (const slide of presentationData.slides) {
      if (slide.imagePrompt) {
        try {
          const imageResult = await generateImage({
            prompt: slide.imagePrompt,
          });
          slide.imageUrl = imageResult.url;
        } catch (error) {
          console.warn("Erro ao gerar imagem:", error);
        }
      }
    }

    // Salvar resultado
    await db.updateOutputStatus(outputId, "completed", `presentation-${projectId}-${Date.now()}`);

    console.log(`[OutputGenerator] Apresentação gerada com sucesso`);

    return presentationData.slides;
  } catch (error) {
    console.error("[OutputGenerator] Erro ao gerar apresentação:", error);
    await db.updateOutputStatus(outputId, "failed");
    throw error;
  }
}

/**
 * Gera um resumo executivo
 */
export async function generateSummary(
  projectId: number,
  sourceContents: string[]
): Promise<string> {
  try {
    console.log(`[OutputGenerator] Gerando resumo para projeto ${projectId}`);

    const combinedContent = sourceContents.join("\n\n");

    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `Você é um especialista em criar resumos executivos concisos. Crie um resumo de 200-300 palavras que capture os pontos principais.`,
        },
        {
          role: "user",
          content: `Crie um resumo executivo para este conteúdo:\n\n${combinedContent}`,
        },
      ],
    });

    const summary = (response.choices[0]?.message?.content as string) || "";

    console.log(`[OutputGenerator] Resumo gerado com sucesso`);

    return summary;
  } catch (error) {
    console.error("[OutputGenerator] Erro ao gerar resumo:", error);
    throw error;
  }
}
