/**
 * Video Generator Service
 * Responsável por gerar vídeos com avatar de IA
 */

import { invokeLLM } from "../_core/llm";

interface VideoScript {
  title: string;
  scenes: Array<{
    duration: number;
    narration: string;
    visualPrompt: string;
  }>;
}

interface VideoGenerationRequest {
  content: string;
  title: string;
  duration?: number; // em segundos
  avatarStyle?: "professional" | "casual" | "academic";
}

/**
 * Gera um script de vídeo a partir do conteúdo
 */
export async function generateVideoScript(
  content: string,
  title: string,
  duration = 120
): Promise<VideoScript> {
  try {
    console.log(`[VideoGenerator] Gerando script de vídeo: ${title}`);

    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `Você é um roteirista especializado em criar scripts para vídeos com avatar de IA. 
          
Crie um script de vídeo que:
- Tenha duração aproximada de ${duration} segundos
- Seja engajante e informativo
- Divida o conteúdo em cenas com narração e descrições visuais
- Cada cena deve ter 10-20 segundos

Responda em JSON com a seguinte estrutura:
{
  "title": "Título do vídeo",
  "scenes": [
    {
      "duration": 15,
      "narration": "Texto a ser narrado",
      "visualPrompt": "Descrição visual para gerar imagem de fundo"
    }
  ]
}`,
        },
        {
          role: "user",
          content: `Crie um script de vídeo para este conteúdo:\n\n${content}`,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "video_script",
          strict: true,
          schema: {
            type: "object",
            properties: {
              title: { type: "string" },
              scenes: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    duration: { type: "number" },
                    narration: { type: "string" },
                    visualPrompt: { type: "string" },
                  },
                  required: ["duration", "narration", "visualPrompt"],
                },
              },
            },
            required: ["title", "scenes"],
          },
        },
      },
    });

    const content_text = response.choices[0]?.message?.content;
    if (typeof content_text !== "string") {
      throw new Error("Resposta inválida do LLM");
    }

    const scriptData = JSON.parse(content_text);

    console.log(`[VideoGenerator] Script gerado com ${scriptData.scenes.length} cenas`);

    return scriptData;
  } catch (error) {
    console.error("[VideoGenerator] Erro ao gerar script:", error);
    throw error;
  }
}

/**
 * Gera narração de áudio para o script
 * Nota: Em produção, usar serviço de TTS (Text-to-Speech)
 */
export async function generateNarration(
  script: VideoScript
): Promise<{ sceneIndex: number; audioUrl: string }[]> {
  try {
    console.log(`[VideoGenerator] Gerando narração para ${script.scenes.length} cenas`);

    // Simular geração de áudio
    // Em produção, usar serviço como Google Cloud TTS, Azure Speech, ou similar
    const narrations = script.scenes.map((scene, index) => ({
      sceneIndex: index,
      audioUrl: `/audio/narration-${index}.mp3`, // URL simulada
      duration: scene.duration,
    }));

    console.log(`[VideoGenerator] Narração gerada para ${narrations.length} cenas`);

    return narrations.map((n) => ({
      sceneIndex: n.sceneIndex,
      audioUrl: n.audioUrl,
    }));
  } catch (error) {
    console.error("[VideoGenerator] Erro ao gerar narração:", error);
    throw error;
  }
}

/**
 * Gera um vídeo completo com avatar
 * Nota: Em produção, usar serviço como HeyGen, D-ID ou similar
 */
export async function generateVideoWithAvatar(
  request: VideoGenerationRequest
): Promise<{ videoUrl: string; duration: number; status: string }> {
  try {
    console.log(`[VideoGenerator] Gerando vídeo com avatar: ${request.title}`);

    // Gerar script
    const script = await generateVideoScript(
      request.content,
      request.title,
      request.duration
    );

    // Gerar narração
    const narrations = await generateNarration(script);

    // Simular geração de vídeo
    // Em produção, chamar API de geração de vídeo (HeyGen, D-ID, etc.)
    const videoUrl = `/videos/generated-${Date.now()}.mp4`;
    const totalDuration = script.scenes.reduce((sum, scene) => sum + scene.duration, 0);

    console.log(
      `[VideoGenerator] Vídeo gerado com sucesso: ${videoUrl} (${totalDuration}s)`
    );

    return {
      videoUrl,
      duration: totalDuration,
      status: "completed",
    };
  } catch (error) {
    console.error("[VideoGenerator] Erro ao gerar vídeo:", error);
    throw error;
  }
}

/**
 * Gera múltiplos vídeos curtos a partir de um conteúdo
 */
export async function generateVideoClips(
  content: string,
  title: string,
  clipCount = 3
): Promise<Array<{ title: string; videoUrl: string; duration: number }>> {
  try {
    console.log(`[VideoGenerator] Gerando ${clipCount} clipes de vídeo`);

    const clips = [];

    for (let i = 0; i < clipCount; i++) {
      const clipContent = content.substring(
        (i * content.length) / clipCount,
        ((i + 1) * content.length) / clipCount
      );

      const result = await generateVideoWithAvatar({
        content: clipContent,
        title: `${title} - Parte ${i + 1}`,
        duration: 30,
        avatarStyle: "professional",
      });

      clips.push({
        title: `${title} - Parte ${i + 1}`,
        videoUrl: result.videoUrl,
        duration: result.duration,
      });
    }

    console.log(`[VideoGenerator] ${clipCount} clipes gerados com sucesso`);

    return clips;
  } catch (error) {
    console.error("[VideoGenerator] Erro ao gerar clipes:", error);
    throw error;
  }
}
