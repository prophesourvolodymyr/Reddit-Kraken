import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";

interface ImageViewerProps {
  src: string;
  alt?: string;
  onClose: () => void;
}

export default function ImageViewer({ src, alt, onClose }: ImageViewerProps) {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const startRef = useRef({ x: 0, y: 0, px: 0, py: 0 });

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "+" || e.key === "=") setScale((s) => Math.min(s + 0.25, 5));
      if (e.key === "-") setScale((s) => Math.max(s - 0.25, 0.25));
      if (e.key === "0") { setScale(1); setPosition({ x: 0, y: 0 }); }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setScale((s) => Math.max(0.25, Math.min(5, s + delta)));
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (scale <= 1) return;
    setIsDragging(true);
    startRef.current = { x: e.clientX, y: e.clientY, px: position.x, py: position.y };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setPosition({
      x: startRef.current.px + (e.clientX - startRef.current.x),
      y: startRef.current.py + (e.clientY - startRef.current.y),
    });
  };

  const handlePointerUp = () => setIsDragging(false);

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (scale > 1) {
      setScale(1);
      setPosition({ x: 0, y: 0 });
    } else {
      setScale(2);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-md flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
      >
        <motion.div
          className="relative"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          onClick={(e) => e.stopPropagation()}
        >
          <img
            ref={imgRef}
            src={src}
            alt={alt || ""}
            draggable={false}
            className="rounded-2xl max-w-[95vw] max-h-[90vh] select-none object-contain"
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
              cursor: scale > 1 ? (isDragging ? "grabbing" : "grab") : "zoom-in",
              transition: isDragging ? "none" : "transform 0.15s ease-out",
            }}
            onWheel={handleWheel}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onDoubleClick={handleDoubleClick}
          />
        </motion.div>

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors z-10"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/50 backdrop-blur rounded-full px-3 py-1.5 text-white/70 text-xs">
          <button onClick={() => setScale((s) => Math.max(s - 0.25, 0.25))} className="hover:text-white transition-colors">−</button>
          <span>{Math.round(scale * 100)}%</span>
          <button onClick={() => setScale((s) => Math.min(s + 0.25, 5))} className="hover:text-white transition-colors">+</button>
          <span className="text-white/30 mx-1">|</span>
          <button onClick={() => { setScale(1); setPosition({ x: 0, y: 0 }); }} className="hover:text-white transition-colors">Fit</button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
