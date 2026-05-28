import { NodeViewWrapper, type NodeViewProps } from "@tiptap/react";
import { useState, useRef } from "react";
import { cn } from "@/shared/lib/utils";

export const ResizableImageNode = ({
  node,
  updateAttributes,
  selected,
}: NodeViewProps) => {
  const [isResizing, setIsResizing] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);

    const startX = e.clientX;
    const startWidth = imgRef.current?.clientWidth || 0;

    const handleMouseMove = (mouseMoveEvent: MouseEvent) => {
      const deltaX = mouseMoveEvent.clientX - startX;
      // Allow minimum width of 100px
      const newWidth = Math.max(100, startWidth + deltaX);
      updateAttributes({ width: newWidth });
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  const { src, alt, title, align, width, height } = node.attrs;

  return (
    <NodeViewWrapper
      className={cn(
        "group relative mx-auto my-4 max-w-full",
        align === "left" && "float-left mr-6",
        align === "right" && "float-right ml-6",
        align === "center" && "mx-auto block",
        // If not aligned left or right, we can ensure it displays as a block
        (!align || align === "center") && "flex justify-center",
      )}
      style={{
        clear: align === "center" ? "both" : "none",
      }}
    >
      <div className="relative inline-block max-w-full">
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          title={title}
          className={cn(
            "max-w-full rounded-md border-2 transition-colors",
            selected ? "border-primary" : "border-transparent",
            isResizing && "opacity-80",
          )}
          style={{
            width: typeof width === "number" ? `${width}px` : width,
            height: height || "auto",
            display: "block",
          }}
        />

        {/* Drag Handle to Resize */}
        {selected && (
          <div
            className="absolute -right-2 top-0 bottom-0 w-4 cursor-ew-resize opacity-0 transition-opacity group-hover:opacity-100"
            onMouseDown={handleMouseDown}
          >
            <div className="bg-primary absolute right-2 top-1/2 h-8 w-1.5 -translate-y-1/2 rounded-full shadow" />
          </div>
        )}
      </div>
    </NodeViewWrapper>
  );
};
