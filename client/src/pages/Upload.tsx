import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Upload, File, Music, Video, Image as ImageIcon, FileText, Database, Link as LinkIcon, Loader2, X } from "lucide-react";
import { toast } from "sonner";

type SourceType = "pdf" | "doc" | "video" | "audio" | "image" | "csv" | "json" | "url";

interface UploadedFile {
  name: string;
  type: SourceType;
  size: number;
  file?: File;
}

export default function UploadPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const [, navigate] = useLocation();
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [urlInput, setUrlInput] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const uploadMutation = trpc.sources.upload.useMutation({
    onSuccess: () => {
      toast.success("Fonte carregada com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao carregar fonte");
    },
  });

  const fileTypeConfig: Record<SourceType, { label: string; icon: React.ReactNode; accept: string }> = {
    pdf: { label: "PDF", icon: <FileText className="w-6 h-6" />, accept: ".pdf" },
    doc: { label: "Documento", icon: <FileText className="w-6 h-6" />, accept: ".doc,.docx" },
    video: { label: "Vídeo", icon: <Video className="w-6 h-6" />, accept: ".mp4,.webm,.mov" },
    audio: { label: "Áudio", icon: <Music className="w-6 h-6" />, accept: ".mp3,.wav,.m4a" },
    image: { label: "Imagem", icon: <ImageIcon className="w-6 h-6" />, accept: ".jpg,.jpeg,.png,.gif" },
    csv: { label: "CSV", icon: <Database className="w-6 h-6" />, accept: ".csv" },
    json: { label: "JSON", icon: <Database className="w-6 h-6" />, accept: ".json" },
    url: { label: "URL", icon: <LinkIcon className="w-6 h-6" />, accept: "" },
  };

  const handleFileSelect = (type: SourceType, files: FileList | null) => {
    if (!files) return;

    Array.from(files).forEach((file) => {
      setUploadedFiles((prev) => [
        ...prev,
        {
          name: file.name,
          type,
          size: file.size,
          file,
        },
      ]);
    });
  };

  const handleAddUrl = () => {
    if (!urlInput.trim()) return;

    setUploadedFiles((prev) => [
      ...prev,
      {
        name: urlInput,
        type: "url",
        size: 0,
      },
    ]);
    setUrlInput("");
  };

  const handleRemoveFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUploadAll = async () => {
    if (uploadedFiles.length === 0) return;

    setIsUploading(true);

    try {
      for (const file of uploadedFiles) {
        if (file.type === "url") {
          await uploadMutation.mutateAsync({
            projectId: parseInt(projectId || "0"),
            type: "url",
            originalName: file.name,
            url: file.name,
          });
        } else if (file.file) {
          const buffer = await file.file.arrayBuffer();
          await uploadMutation.mutateAsync({
            projectId: parseInt(projectId || "0"),
            type: file.type,
            originalName: file.name,
            fileBuffer: new Uint8Array(buffer) as any,
          });
        }
      }

      toast.success("Todas as fontes foram carregadas!");
      setUploadedFiles([]);
      // Navegar de volta para o studio
      navigate(`/studio/${projectId}`);
    } catch (error) {
      toast.error("Erro ao carregar fontes");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Carregar Fontes</h1>
          <p className="text-gray-400">
            Adicione múltiplos arquivos e URLs para análise inteligente
          </p>
        </div>

        {/* Upload Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {(Object.entries(fileTypeConfig) as [SourceType, any][]).map(([type, config]) => (
            <label
              key={type}
              className="relative cursor-pointer group"
            >
              <input
                type="file"
                multiple
                accept={config.accept}
                onChange={(e) => handleFileSelect(type, e.target.files)}
                className="hidden"
              />
              <Card className="p-6 bg-gray-900 border-gray-800 hover:border-purple-500 hover:bg-gray-800 transition-all text-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="text-gray-400 group-hover:text-purple-400 transition-colors">
                    {config.icon}
                  </div>
                  <p className="text-sm font-medium text-white">{config.label}</p>
                </div>
              </Card>
            </label>
          ))}
        </div>

        {/* URL Input */}
        <Card className="p-6 bg-gray-900 border-gray-800 mb-8">
          <h3 className="text-sm font-semibold text-white mb-4">Adicionar URL</h3>
          <div className="flex gap-3">
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://exemplo.com"
              className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded text-white placeholder-gray-500"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleAddUrl();
                }
              }}
            />
            <Button
              onClick={handleAddUrl}
              disabled={!urlInput.trim()}
              className="bg-purple-600 hover:bg-purple-700"
            >
              Adicionar
            </Button>
          </div>
        </Card>

        {/* Uploaded Files List */}
        {uploadedFiles.length > 0 && (
          <Card className="p-6 bg-gray-900 border-gray-800 mb-8">
            <h3 className="text-sm font-semibold text-white mb-4">
              Arquivos Selecionados ({uploadedFiles.length})
            </h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {uploadedFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-800 rounded border border-gray-700"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="text-gray-400">
                      {fileTypeConfig[file.type].icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{file.name}</p>
                      <p className="text-xs text-gray-400">
                        {file.size > 0 ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : "URL"}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveFile(index)}
                    className="p-2 hover:bg-red-900/20 rounded transition-colors"
                  >
                    <X className="w-4 h-4 text-gray-400 hover:text-red-400" />
                  </button>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            onClick={() => navigate(`/studio/${projectId}`)}
            variant="outline"
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleUploadAll}
            disabled={uploadedFiles.length === 0 || isUploading}
            className="flex-1 bg-purple-600 hover:bg-purple-700"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Carregando...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Carregar {uploadedFiles.length} arquivo{uploadedFiles.length !== 1 ? "s" : ""}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
