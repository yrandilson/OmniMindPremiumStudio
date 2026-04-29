import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

interface MindMapNode {
  id: string;
  label: string;
  children: MindMapNode[];
  color?: string;
}

interface MindMapViewerProps {
  data: MindMapNode;
  onNodeClick?: (node: MindMapNode) => void;
}

export function MindMapViewer({ data, onNodeClick }: MindMapViewerProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !data) return;

    const svg = svgRef.current;
    const width = svg.clientWidth;
    const height = svg.clientHeight;

    // Limpar SVG anterior
    while (svg.firstChild) {
      svg.removeChild(svg.firstChild);
    }

    // Criar grupo principal
    const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
    g.setAttribute("transform", `translate(${width / 2}, ${height / 2})`);

    // Desenhar nós
    drawNode(g, data, 0, 0, 0, width, height);

    svg.appendChild(g);
  }, [data]);

  function drawNode(
    parent: SVGGElement,
    node: MindMapNode,
    x: number,
    y: number,
    angle: number,
    width: number,
    height: number,
    level = 0
  ) {
    const nodeRadius = 30 - level * 3;
    const levelDistance = 150 - level * 20;

    // Desenhar círculo
    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("cx", String(x));
    circle.setAttribute("cy", String(y));
    circle.setAttribute("r", String(nodeRadius));
    circle.setAttribute("fill", node.color || "#9333ea");
    circle.setAttribute("stroke", "#c084fc");
    circle.setAttribute("stroke-width", "2");
    circle.style.cursor = "pointer";
    circle.addEventListener("click", () => onNodeClick?.(node));

    parent.appendChild(circle);

    // Desenhar texto
    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute("x", String(x));
    text.setAttribute("y", String(y));
    text.setAttribute("text-anchor", "middle");
    text.setAttribute("dominant-baseline", "middle");
    text.setAttribute("fill", "white");
    text.setAttribute("font-size", String(12 - level));
    text.setAttribute("font-weight", level === 0 ? "bold" : "normal");
    text.textContent = node.label.substring(0, 15);

    parent.appendChild(text);

    // Desenhar filhos
    if (node.children && node.children.length > 0) {
      const childAngleSpread = Math.PI * 1.5;
      const startAngle = -childAngleSpread / 2;

      node.children.forEach((child, index) => {
        const childAngle = startAngle + (index / (node.children.length - 1 || 1)) * childAngleSpread;
        const childX = x + Math.cos(childAngle) * levelDistance;
        const childY = y + Math.sin(childAngle) * levelDistance;

        // Linha conectora
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", String(x));
        line.setAttribute("y1", String(y));
        line.setAttribute("x2", String(childX));
        line.setAttribute("y2", String(childY));
        line.setAttribute("stroke", "#9333ea");
        line.setAttribute("stroke-width", "1");
        line.setAttribute("opacity", "0.3");

        parent.appendChild(line);

        // Recursão para filhos
        drawNode(parent, child, childX, childY, childAngle, width, height, level + 1);
      });
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full h-full bg-gray-950 rounded-lg border border-gray-800 overflow-hidden"
    >
      <svg
        ref={svgRef}
        className="w-full h-full"
        style={{ minHeight: "400px" }}
      />
    </motion.div>
  );
}
