import { useEffect, useRef, useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Send } from "lucide-react";
import { Streamdown } from "streamdown";

interface ChatPanelProps {
  projectId: number;
}

interface ChatMessage {
  id: number;
  role: "user" | "assistant";
  content: string;
  createdAt: Date;
}

export function ChatPanel({ projectId }: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Carregar histórico de chat
  const { data: history } = trpc.chat.history.useQuery(
    { projectId, limit: 50, offset: 0 },
    { enabled: !!projectId }
  );

  // Mutation para enviar mensagem
  const sendMessageMutation = trpc.chat.send.useMutation({
    onSuccess: (response) => {
      // Adicionar resposta do assistente
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: "assistant",
          content: response.message,
          createdAt: new Date(),
        },
      ]);
      setIsLoading(false);
    },
    onError: (error) => {
      console.error("Erro ao enviar mensagem:", error);
      setIsLoading(false);
    },
  });

  // Carregar histórico quando disponível
  useEffect(() => {
    if (history) {
      setMessages(
        history.map((msg: any) => ({
          id: msg.id,
          role: msg.role,
          content: msg.content,
          createdAt: new Date(msg.createdAt),
        }))
      );
    }
  }, [history]);

  // Auto-scroll para última mensagem
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = input;
    setInput("");

    // Adicionar mensagem do usuário
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        role: "user",
        content: userMessage,
        createdAt: new Date(),
      },
    ]);

    setIsLoading(true);

    // Enviar para o servidor
    sendMessageMutation.mutate({
      projectId,
      message: userMessage,
      sourceIds: [],
    });
  };

  return (
    <div className="flex flex-col h-full bg-gray-900">
      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <h3 className="text-sm font-semibold text-white">Chat Inteligente</h3>
        <p className="text-xs text-gray-400 mt-1">Analise suas fontes com IA</p>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-8">
              <p className="text-sm text-gray-400">Comece uma conversa</p>
              <p className="text-xs text-gray-600 mt-2">
                Faça perguntas sobre suas fontes carregadas
              </p>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-xs px-4 py-2 rounded-lg ${
                  message.role === "user"
                    ? "bg-purple-600 text-white"
                    : "bg-gray-800 text-gray-100"
                }`}
              >
                {message.role === "assistant" ? (
                  <Streamdown>{message.content}</Streamdown>
                ) : (
                  <p className="text-sm">{message.content}</p>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-800 px-4 py-2 rounded-lg">
                <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
              </div>
            </div>
          )}

          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t border-gray-800">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="Faça uma pergunta..."
            className="bg-gray-800 border-gray-700 text-white placeholder-gray-500"
            disabled={isLoading}
          />
          <Button
            onClick={handleSendMessage}
            disabled={isLoading || !input.trim()}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
