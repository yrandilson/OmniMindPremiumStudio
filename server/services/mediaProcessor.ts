/**
 * Media Processor Service
 * Responsável por transcrição, extração de conteúdo e processamento de mídias
 */

import { transcribeAudio } from "../_core/voiceTranscription";
import { invokeLLM } from "../_core/llm";
import * as db from "../db";

/**
 * Processa um arquivo de áudio ou vídeo
 * Retorna o texto transcrito
 */
export async function processAudioFile(fileUrl: string, sourceId: number): Promise<string> {
  try {
    console.log(`[MediaProcessor] Transcrevendo áudio: ${fileUrl}`);
    
    const result = await transcribeAudio({
      audioUrl: fileUrl,
      language: "pt",
    });

    if ('error' in result) {
      throw new Error(`Erro na transcrição: ${result.error}`);
    }

    const transcription = result.text || "";
    
    // Salvar transcrição no banco
    await db.updateSourceContent(sourceId, transcription, {
      language: result.language || "pt",
    });

    console.log(`[MediaProcessor] Transcrição concluída: ${transcription.length} caracteres`);
    return transcription;
  } catch (error) {
    console.error("[MediaProcessor] Erro ao transcrever áudio:", error);
    throw error;
  }
}

/**
 * Extrai texto de um PDF usando LLM
 */
export async function extractPDFContent(fileUrl: string, sourceId: number): Promise<string> {
  try {
    console.log(`[MediaProcessor] Extraindo conteúdo de PDF: ${fileUrl}`);
    
    // Usar LLM para analisar o PDF
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: "Você é um assistente especializado em extração de conteúdo de documentos PDF. Extraia o texto principal, mantendo a estrutura e hierarquia.",
        },
        {
          role: "user",
          content: [
            {
              type: "file_url",
              file_url: {
                url: fileUrl,
                mime_type: "application/pdf",
              },
            } as any,
            {
              type: "text",
              text: "Por favor, extraia todo o conteúdo importante deste PDF. Mantenha a estrutura e hierarquia.",
            },
          ] as any,
        },
      ],
    });

    const extractedText = (response.choices[0]?.message?.content as string) || "";
    
    // Salvar conteúdo extraído
    await db.updateSourceContent(sourceId, extractedText, {
      extractionMethod: "llm",
    });

    console.log(`[MediaProcessor] Extração concluída: ${extractedText.length} caracteres`);
    return extractedText;
  } catch (error) {
    console.error("[MediaProcessor] Erro ao extrair PDF:", error);
    throw error;
  }
}

/**
 * Extrai texto de uma imagem usando LLM (OCR)
 */
export async function extractImageContent(fileUrl: string, sourceId: number): Promise<string> {
  try {
    console.log(`[MediaProcessor] Extraindo conteúdo de imagem: ${fileUrl}`);
    
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: "Você é um assistente especializado em análise de imagens. Extraia todo o texto visível e descreva o conteúdo visual importante.",
        },
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: {
                url: fileUrl,
                detail: "high",
              },
            } as any,
            {
              type: "text",
              text: "Por favor, extraia todo o texto desta imagem e descreva o conteúdo visual.",
            },
          ] as any,
        },
      ],
    });

    const extractedText = (response.choices[0]?.message?.content as string) || "";
    
    await db.updateSourceContent(sourceId, extractedText, {
      extractionMethod: "vision",
    });

    console.log(`[MediaProcessor] Extração de imagem concluída: ${extractedText.length} caracteres`);
    return extractedText;
  } catch (error) {
    console.error("[MediaProcessor] Erro ao extrair imagem:", error);
    throw error;
  }
}

/**
 * Processa CSV: lê e estrutura os dados
 */
export async function processCSVContent(fileUrl: string, sourceId: number): Promise<string> {
  try {
    console.log(`[MediaProcessor] Processando CSV: ${fileUrl}`);
    
    // Usar LLM para analisar o CSV
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: "Você é um assistente especializado em análise de dados CSV. Analise a estrutura, identifique colunas, tipos de dados e padrões importantes.",
        },
        {
          role: "user",
          content: [
            {
              type: "file_url",
              file_url: {
                url: fileUrl,
                mime_type: "text/csv",
              },
            } as any,
            {
              type: "text",
              text: "Por favor, analise este CSV e descreva sua estrutura, colunas, tipos de dados e insights principais.",
            },
          ] as any,
        },
      ],
    });

    const analysis = (response.choices[0]?.message?.content as string) || "";
    
    await db.updateSourceContent(sourceId, analysis, {
      processingMethod: "csv-analysis",
    });

    console.log(`[MediaProcessor] Análise CSV concluída: ${analysis.length} caracteres`);
    return analysis;
  } catch (error) {
    console.error("[MediaProcessor] Erro ao processar CSV:", error);
    throw error;
  }
}

/**
 * Processa JSON: estrutura e valida
 */
export async function processJSONContent(fileUrl: string, sourceId: number): Promise<string> {
  try {
    console.log(`[MediaProcessor] Processando JSON: ${fileUrl}`);
    
    // Usar LLM para analisar o JSON
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: "Você é um assistente especializado em análise de dados JSON. Analise a estrutura, identifique campos principais e padrões.",
        },
        {
          role: "user",
          content: [
            {
              type: "file_url",
              file_url: {
                url: fileUrl,
                mime_type: "application/json",
              },
            } as any,
            {
              type: "text",
              text: "Por favor, analise este JSON e descreva sua estrutura, campos principais e insights.",
            },
          ] as any,
        },
      ],
    });

    const analysis = (response.choices[0]?.message?.content as string) || "";
    
    await db.updateSourceContent(sourceId, analysis, {
      processingMethod: "json-analysis",
    });

    console.log(`[MediaProcessor] Análise JSON concluída: ${analysis.length} caracteres`);
    return analysis;
  } catch (error) {
    console.error("[MediaProcessor] Erro ao processar JSON:", error);
    throw error;
  }
}

/**
 * Processa uma URL web: scraping e análise
 */
export async function processWebURL(url: string, sourceId: number): Promise<string> {
  try {
    console.log(`[MediaProcessor] Processando URL: ${url}`);
    
    // Usar LLM para analisar a página web
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: "Você é um assistente especializado em análise de conteúdo web. Extraia o conteúdo principal, ignorando navegação e publicidade.",
        },
        {
          role: "user",
          content: `Por favor, acesse e analise o conteúdo da URL: ${url}. Extraia o texto principal e descreva os pontos-chave.`,
        },
      ],
    });

    const content = (response.choices[0]?.message?.content as string) || "";
    
    await db.updateSourceContent(sourceId, content, {
      processingMethod: "web-scraping",
      url,
    });

    console.log(`[MediaProcessor] Análise de URL concluída: ${content.length} caracteres`);
    return content;
  } catch (error) {
    console.error("[MediaProcessor] Erro ao processar URL:", error);
    throw error;
  }
}

/**
 * Processa qualquer tipo de fonte
 */
export async function processSource(sourceId: number, sourceType: string, fileUrl: string): Promise<string> {
  console.log(`[MediaProcessor] Iniciando processamento: tipo=${sourceType}, sourceId=${sourceId}`);
  
  try {
    let content = "";
    
    switch (sourceType) {
      case "audio":
      case "video":
        content = await processAudioFile(fileUrl, sourceId);
        break;
      case "pdf":
        content = await extractPDFContent(fileUrl, sourceId);
        break;
      case "image":
        content = await extractImageContent(fileUrl, sourceId);
        break;
      case "csv":
        content = await processCSVContent(fileUrl, sourceId);
        break;
      case "json":
        content = await processJSONContent(fileUrl, sourceId);
        break;
      case "url":
        content = await processWebURL(fileUrl, sourceId);
        break;
      case "doc":
        // DOC pode ser tratado como PDF
        content = await extractPDFContent(fileUrl, sourceId);
        break;
      default:
        throw new Error(`Tipo de fonte não suportado: ${sourceType}`);
    }
    
    console.log(`[MediaProcessor] Processamento concluído com sucesso`);
    return content;
  } catch (error) {
    console.error(`[MediaProcessor] Erro ao processar fonte:`, error);
    throw error;
  }
}
