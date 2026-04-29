import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Download } from "lucide-react";
import { Streamdown } from "streamdown";

interface Slide {
  title: string;
  content: string;
  imageUrl?: string;
  layout: "title" | "content" | "image" | "comparison";
}

interface PresentationViewerProps {
  slides: Slide[];
  title: string;
  onDownload?: () => void;
}

export function PresentationViewer({ slides, title, onDownload }: PresentationViewerProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slide = slides[currentSlide];

  const handlePrevious = () => {
    setCurrentSlide((prev) => (prev > 0 ? prev - 1 : slides.length - 1));
  };

  const handleNext = () => {
    setCurrentSlide((prev) => (prev < slides.length - 1 ? prev + 1 : 0));
  };

  return (
    <div className="flex flex-col h-full bg-gray-950 rounded-lg border border-gray-800 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-800 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">{title}</h2>
        <Button
          onClick={onDownload}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <Download className="w-4 h-4" />
          Exportar
        </Button>
      </div>

      {/* Slide Content */}
      <div className="flex-1 overflow-hidden relative bg-gradient-to-br from-gray-900 to-gray-950">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 p-8 flex flex-col justify-center"
          >
            {slide.layout === "title" && (
              <div className="text-center">
                <h1 className="text-5xl font-bold text-white mb-4">{slide.title}</h1>
                <Streamdown className="text-xl text-gray-300">{slide.content}</Streamdown>
              </div>
            )}

            {slide.layout === "content" && (
              <div>
                <h2 className="text-4xl font-bold text-white mb-6">{slide.title}</h2>
                <div className="text-gray-300 space-y-3">
                  <Streamdown>{slide.content}</Streamdown>
                </div>
              </div>
            )}

            {slide.layout === "image" && (
              <div className="flex flex-col items-center gap-6">
                <h2 className="text-4xl font-bold text-white">{slide.title}</h2>
                {slide.imageUrl && (
                  <img
                    src={slide.imageUrl}
                    alt={slide.title}
                    className="max-h-96 rounded-lg"
                  />
                )}
                <Streamdown className="text-gray-300">{slide.content}</Streamdown>
              </div>
            )}

            {slide.layout === "comparison" && (
              <div>
                <h2 className="text-4xl font-bold text-white mb-6">{slide.title}</h2>
                <div className="grid grid-cols-2 gap-6">
                  <div className="p-4 bg-gray-800 rounded-lg">
                    <Streamdown className="text-gray-300">{slide.content}</Streamdown>
                  </div>
                  {slide.imageUrl && (
                    <img
                      src={slide.imageUrl}
                      alt="Comparison"
                      className="rounded-lg"
                    />
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-800 flex items-center justify-between bg-gray-900">
        <Button
          onClick={handlePrevious}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Anterior
        </Button>

        <div className="text-sm text-gray-400">
          Slide {currentSlide + 1} de {slides.length}
        </div>

        <Button
          onClick={handleNext}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          Próximo
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Slide Thumbnails */}
      <div className="p-2 bg-gray-900 border-t border-gray-800 flex gap-2 overflow-x-auto">
        {slides.map((s, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`flex-shrink-0 px-3 py-1 rounded text-xs font-medium transition-colors ${
              index === currentSlide
                ? "bg-purple-600 text-white"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
            }`}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </div>
  );
}
