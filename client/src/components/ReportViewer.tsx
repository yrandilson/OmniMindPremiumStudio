import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Download, FileText } from "lucide-react";
import { Streamdown } from "streamdown";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ReportViewerProps {
  content: string;
  title: string;
  onDownload?: () => void;
}

export function ReportViewer({ content, title, onDownload }: ReportViewerProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col h-full bg-gray-950 rounded-lg border border-gray-800 overflow-hidden"
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-800 bg-gray-900 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText className="w-6 h-6 text-purple-400" />
          <h1 className="text-2xl font-bold text-white">{title}</h1>
        </div>
        <Button
          onClick={onDownload}
          className="bg-purple-600 hover:bg-purple-700 gap-2"
        >
          <Download className="w-4 h-4" />
          Exportar PDF
        </Button>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-8 max-w-4xl mx-auto">
          <div className="prose prose-invert max-w-none">
            <Streamdown>{content}</Streamdown>
          </div>
        </div>
      </ScrollArea>
    </motion.div>
  );
}
