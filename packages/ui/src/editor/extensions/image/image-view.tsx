import { NodeViewWrapper, type NodeViewProps } from "@tiptap/react";
import { clamp, isNumber, throttle } from "lodash-es";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  IMAGE_MAX_SIZE,
  IMAGE_MIN_SIZE,
  IMAGE_THROTTLE_WAIT_TIME,
} from "@nhatnang/ui/lib/constants";

interface Size {
  width: number;
  height: number;
}

interface ImageAttrs {
  src?: string;
  alt?: string;
  title?: string;
  align?: "left" | "center" | "right";
  inline?: boolean;
  width?: number | string | null;
  height?: number | string | null;
  flipX?: boolean;
  flipY?: boolean;
}

const ResizeDirection = {
  TOP_LEFT: "tl",
  TOP_RIGHT: "tr",
  BOTTOM_LEFT: "bl",
  BOTTOM_RIGHT: "br",
};

function ImageView({
  node,
  editor,
  getPos,
  selected,
  updateAttributes,
}: NodeViewProps) {
  const [maxSize, setMaxSize] = useState<Size>({
    width: IMAGE_MAX_SIZE,
    height: IMAGE_MAX_SIZE,
  });

  const [originalSize, setOriginalSize] = useState({
    width: 0,
    height: 0,
  });

  const [resizeDirections] = useState<string[]>([
    ResizeDirection.TOP_LEFT,
    ResizeDirection.TOP_RIGHT,
    ResizeDirection.BOTTOM_LEFT,
    ResizeDirection.BOTTOM_RIGHT,
  ]);

  const [resizing, setResizing] = useState<boolean>(false);

  const [resizerState, setResizerState] = useState({
    x: 0,
    y: 0,
    w: 0,
    h: 0,
    dir: "",
  });

  const attrs = node.attrs as ImageAttrs;
  const { align, inline } = attrs;
  const inlineFloat = inline && (align === "left" || align === "right");

  const imgAttrs = useMemo(() => {
    const { src, alt, width: w, height: h, flipX, flipY } = attrs;

    const width = isNumber(w) ? `${w}px` : w;
    const height = isNumber(h) ? `${h}px` : h;
    const transformStyles: string[] = [];

    if (flipX) transformStyles.push("rotateX(180deg)");
    if (flipY) transformStyles.push("rotateY(180deg)");
    const transform = transformStyles.join(" ");

    const floatStyle = inlineFloat ? { float: align } : {};

    return {
      src: src ?? undefined,
      alt: alt ?? undefined,
      style: {
        width: width ?? undefined,
        height: height ?? undefined,
        transform: transform ?? "none",
        ...floatStyle,
      },
    };
  }, [attrs, inlineFloat]);

  const imageMaxStyle = useMemo(() => {
    const {
      style: { width },
    } = imgAttrs;

    return { width: width === "100%" ? width : undefined };
  }, [imgAttrs]);

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    setOriginalSize({
      width: e.currentTarget.width,
      height: e.currentTarget.height,
    });
  }

  // https://github.com/scrumpy/tiptap/issues/361#issuecomment-540299541
  function selectImage() {
    const position = typeof getPos === "function" ? getPos() : getPos;
    if (typeof position !== "number") {
      return;
    }

    editor.commands.setNodeSelection(position);
  }

  const getMaxSize = useCallback(
    throttle(() => {
      const { width } = getComputedStyle(editor.view.dom);
      setMaxSize((prev) => {
        return {
          ...prev,
          width: Number.parseInt(width, 10),
        };
      });
    }, IMAGE_THROTTLE_WAIT_TIME),
    [editor],
  );

  function onMouseDown(e: React.MouseEvent<HTMLSpanElement>, dir: string) {
    e.preventDefault();
    e.stopPropagation();

    const originalWidth = originalSize.width;
    const originalHeight = originalSize.height;
    const aspectRatio = originalWidth / originalHeight;

    let width = Number(attrs.width ?? 0);
    let height = Number(attrs.height ?? 0);
    const maxWidth = maxSize.width;

    if (width && !height) {
      width = width > maxWidth ? maxWidth : width;
      height = Math.round(width / aspectRatio);
    } else if (height && !width) {
      width = Math.round(height * aspectRatio);
      width = width > maxWidth ? maxWidth : width;
    } else if (!width && !height) {
      width = originalWidth > maxWidth ? maxWidth : originalWidth;
      height = Math.round(width / aspectRatio);
    } else {
      width = width > maxWidth ? maxWidth : width;
    }

    setResizing(true);

    setResizerState({
      x: e.clientX,
      y: e.clientY,
      w: width,
      h: height,
      dir,
    });
  }

  const onMouseMove = useCallback(
    throttle((e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (!resizing) {
        return;
      }

      const { x, w, dir } = resizerState;

      const dx = (e.clientX - x) * (dir.includes("l") ? -1 : 1);
      // const dy = (e.clientY - y) * (/t/.test(dir) ? -1 : 1)

      const width = clamp(w + dx, IMAGE_MIN_SIZE, maxSize.width);
      const height = null;

      updateAttributes({
        width,
        height,
      });
    }, IMAGE_THROTTLE_WAIT_TIME),
    [resizing, resizerState, maxSize, updateAttributes],
  );

  const onMouseUp = useCallback(
    (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!resizing) {
        return;
      }

      setResizerState({
        x: 0,
        y: 0,
        w: 0,
        h: 0,
        dir: "",
      });
      setResizing(false);

      selectImage();
    },
    [resizing, selectImage],
  );

  const onEvents = useCallback(() => {
    document?.addEventListener("mousemove", onMouseMove, true);
    document?.addEventListener("mouseup", onMouseUp, true);
  }, [onMouseMove, onMouseUp]);

  const offEvents = useCallback(() => {
    document?.removeEventListener("mousemove", onMouseMove, true);
    document?.removeEventListener("mouseup", onMouseUp, true);
  }, [onMouseMove, onMouseUp]);

  useEffect(() => {
    if (resizing) {
      onEvents();
    } else {
      offEvents();
    }

    return () => {
      offEvents();
    };
  }, [resizing, onEvents, offEvents]);

  const resizeOb: ResizeObserver = useMemo(() => {
    return new ResizeObserver(() => getMaxSize());
  }, [getMaxSize]);

  useEffect(() => {
    resizeOb.observe(editor.view.dom);

    return () => {
      resizeOb.disconnect();
    };
  }, [editor.view.dom, resizeOb]);

  return (
    <NodeViewWrapper
      as={inline ? "span" : "div"}
      className="image-view"
      style={{
        float: inlineFloat ? align : undefined,
        margin: inlineFloat
          ? align === "left"
            ? "1em 1em 1em 0"
            : "1em 0 1em 1em"
          : undefined,
        display: inline ? "inline" : "block",
        textAlign: inlineFloat ? undefined : align,
        width: imgAttrs.style?.width ?? "auto",
        ...(inlineFloat ? {} : imageMaxStyle),
      }}
    >
      <div
        data-drag-handle
        draggable="true"
        style={imageMaxStyle}
        className={`image-view__body ${selected ? "image-view__body--focused" : ""} ${
          resizing ? "image-view__body--resizing" : ""
        }`}
      >
        <img
          alt={imgAttrs.alt}
          className="image-view__body__image block"
          height="auto"
          onClick={selectImage}
          onLoad={onImageLoad}
          src={imgAttrs.src}
          style={imgAttrs.style}
        />

        {editor.view.editable && (selected || resizing) && (
          <div className="image-resizer">
            {resizeDirections?.map((direction) => {
              return (
                <span
                  className={`image-resizer__handler image-resizer__handler--${direction}`}
                  key={`image-dir-${direction}`}
                  onMouseDown={(e) => onMouseDown(e, direction)}
                />
              );
            })}
          </div>
        )}
      </div>
    </NodeViewWrapper>
  );
}

export default ImageView;
