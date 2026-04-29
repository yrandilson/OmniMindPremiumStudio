import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Download, BarChart3 } from "lucide-react";
import { Streamdown } from "streamdown";
import { ScrollArea } from "@/components/ui/scroll-area";

interface InfographicSection {
  heading: string;
  content: string;
  imageUrl?: string;
}

interface InfographicViewerProps {
  title: string;
  sections: InfographicSection[];
  onDownload?: () => void;
}

export function InfographicViewer({ title, sections, onDownload }: InfographicViewerProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 },
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col h-full bg-gray-950 rounded-lg border border-gray-800 overflow-hidden"
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-800 bg-gray-900 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BarChart3 className="w-6 h-6 text-purple-400" />
          <h1 className="text-2xl font-bold text-white">{title}</h1>
        </div>
        <Button
          onClick={onDownload}
          className="bg-purple-600 hover:bg-purple-700 gap-2"
        >
          <Download className="w-4 h-4" />
          Exportar
        </Button>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="p-8 space-y-8 max-w-5xl mx-auto"
        >
          {sections.map((section, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="space-y-4"
            >
              {/* Divider */}
              {index > 0 && <div className="h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent" />}

              {/* Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-3">{section.heading}</h2>
                  <div className="text-gray-300">
                    <Streamdown>{section.content}</Streamdown>
                  </div>
                </div>

                {section.imageUrl && (
                  <motion.img
                    src={section.imageUrl}
                    alt={section.heading}
                    className="rounded-lg shadow-lg"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.2 }}
                  />
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </ScrollArea>
    </motion.div>
  );
}
