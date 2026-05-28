import { mergeAttributes, type CommandProps } from "@tiptap/core";
import TiptapImage from "@tiptap/extension-image";
import { ReactNodeViewRenderer, type Editor } from "@tiptap/react";

import ImageView from "./image-view";

export interface SetImageAttrsOptions {
  src?: string;
  /** The alternative text for the image. */
  alt?: string;
  /** The caption of the image. */
  caption?: string;
  /** The width of the image. */
  width?: number | string | null;
  /** The alignment of the image. */
  align?: "left" | "center" | "right";
  /** Whether the image is inline. */
  inline?: boolean;
  /** image FlipX */
  flipX?: boolean;
  /** image FlipY */
  flipY?: boolean;
}

export const DEFAULT_OPTIONS = {
  acceptMimes: ["image/jpeg", "image/gif", "image/png", "image/jpg"],
  maxSize: 1024 * 1024 * 5, // 5MB
  multiple: true,
  resourceImage: "both",
  defaultInline: false,
  enableAlt: true,
} satisfies Pick<
  IImageOptions,
  | "acceptMimes"
  | "maxSize"
  | "multiple"
  | "resourceImage"
  | "defaultInline"
  | "enableAlt"
>;

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    imageUpload: {
      /**
       * Add an image
       */
      setImageInline: (options: Partial<SetImageAttrsOptions>) => ReturnType;
      /**
       * Update an image
       */
      updateImage: (options: Partial<SetImageAttrsOptions>) => ReturnType;
      /**
       * Set image alignment
       */
      setAlignImage: (align: "left" | "center" | "right") => ReturnType;
    };
  }
}

export interface IImageOptions {
  /** Function for uploading files */
  upload?: (file: File) => Promise<string>;

  HTMLAttributes?: Record<string, unknown>;

  multiple?: boolean;
  acceptMimes?: string[];
  maxSize?: number;

  /** The source URL of the image */
  resourceImage: "upload" | "link" | "both";
  defaultInline?: boolean;

  // Enable alternative text input
  enableAlt?: boolean;

  button?: (args: {
    editor: Editor | null;
    extension: { options: IImageOptions };
    t: (key: string) => string;
  }) => {
    componentProps: {
      action: () => boolean;
      upload: (file: File) => Promise<string>;
      disabled: boolean;
      icon: string;
      tooltip: string;
    };
  };

  /** Function to handle errors during file validation */
  onError?: (error: {
    type: "size" | "type" | "upload";
    message: string;
    file?: File;
  }) => void;
}

export const Image = /* @__PURE__ */ TiptapImage.extend<IImageOptions>({
  group: "inline",
  inline: true,
  defining: true,
  draggable: true,
  selectable: true,

  addOptions() {
    return {
      ...DEFAULT_OPTIONS,
      ...this.parent?.(),
      upload: () => Promise.reject(new Error("Image Upload Function")),
      button: ({
        editor,
        extension,
        t,
      }: {
        editor: Editor | null;
        extension: { options: IImageOptions };
        t: (key: string) => string;
      }) => ({
        componentProps: {
          action: () => {
            return true;
          },
          upload:
            extension.options.upload ??
            (() => Promise.reject(new Error("Image Upload Function"))),
          /* If setImage is not available(when Image Component is not imported), the button is disabled */
          disabled: !(editor?.can().setImage?.({ src: "" }) ?? false),
          icon: "ImageUp",
          tooltip: t("editor.image.tooltip"),
        },
      }),
    };
  },
  addAttributes() {
    return {
      ...this.parent?.(),
      flipX: {
        default: false,
      },
      flipY: {
        default: false,
      },
      width: {
        default: null,
        parseHTML: (element) => {
          const width =
            element.style.width ?? element.getAttribute("width") ?? null;
          return !width ? null : Number.parseInt(width, 10);
        },
        renderHTML: (attributes) => {
          return {
            width: attributes["width"] as number | string | null,
          };
        },
      },
      align: {
        default: "center",
        parseHTML: (element) => element.getAttribute("align"),
        renderHTML: (attributes) => {
          return {
            align: attributes["align"] as "left" | "center" | "right" | null,
          };
        },
      },
      inline: {
        default: false,
        parseHTML: (element) => Boolean(element.getAttribute("inline")),
        renderHTML: (attributes) => {
          return {
            inline: Boolean(attributes["inline"]),
          };
        },
      },
      alt: {
        default: "",
        parseHTML: (element) => element.getAttribute("alt"),
        renderHTML: (attributes) => {
          return {
            alt: String(attributes["alt"] ?? ""),
          };
        },
      },
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(ImageView);
  },
  addCommands() {
    return {
      ...this.parent?.(),
      setImageInline:
        (options: Partial<SetImageAttrsOptions>) =>
        ({ commands }: CommandProps) => {
          return commands.insertContent({
            type: this.name,
            attrs: {
              ...options,
              inline: options.inline ?? this.options.defaultInline,
            },
          });
        },
      updateImage:
        (options: Partial<SetImageAttrsOptions>) =>
        ({ commands }: CommandProps) => {
          return commands.updateAttributes(this.name, options);
        },
      setAlignImage:
        (align: "left" | "center" | "right") =>
        ({ commands }: CommandProps) => {
          return commands.updateAttributes(this.name, { align });
        },
    };
  },
  renderHTML({ HTMLAttributes }) {
    const { flipX, flipY, align, inline } = HTMLAttributes as {
      flipX?: boolean;
      flipY?: boolean;
      align?: "left" | "center" | "right";
      inline?: boolean;
    };
    const inlineFloat = inline && (align === "left" || align === "right");

    const transformStyle =
      flipX || flipY
        ? `transform: rotateX(${flipX ? "180" : "0"}deg) rotateY(${flipY ? "180" : "0"}deg);`
        : "";

    const textAlignStyle = inlineFloat ? "" : `text-align: ${align};`;

    const floatStyle = inlineFloat ? `float: ${align};` : "";

    const marginStyle = inlineFloat
      ? align === "left"
        ? "margin: 1em 1em 1em 0;"
        : "margin: 1em 0 1em 1em;"
      : "";

    const style = `${floatStyle}${marginStyle}${transformStyle}`;

    return [
      inline ? "span" : "div",
      {
        style: textAlignStyle,
        class: "image",
      },
      [
        "img",
        mergeAttributes(
          {
            height: "auto",
            style,
          },
          this.options.HTMLAttributes ?? {},
          HTMLAttributes,
        ),
      ],
    ];
  },
  parseHTML() {
    return [
      {
        tag: "span.image img",
        getAttrs: (img) => {
          const element = img?.parentElement;

          const width = img?.getAttribute("width");

          const flipX = img?.getAttribute("flipx") ?? false;
          const flipY = img?.getAttribute("flipy") ?? false;

          return {
            src: img?.getAttribute("src"),
            alt: img?.getAttribute("alt"),
            caption: img?.getAttribute("caption"),
            width: width ? Number.parseInt(width, 10) : null,
            align:
              img?.getAttribute("align") ?? element?.style?.textAlign ?? null,
            inline: img?.getAttribute("inline") ?? false,
            flipX: flipX === "true",
            flipY: flipY === "true",
          };
        },
      },
      {
        tag: "div[class=image]",
        getAttrs: (element) => {
          const img = element.querySelector("img");

          const width = img?.getAttribute("width");
          const flipX = img?.getAttribute("flipx") ?? false;
          const flipY = img?.getAttribute("flipy") ?? false;

          return {
            src: img?.getAttribute("src"),
            alt: img?.getAttribute("alt"),
            caption: img?.getAttribute("caption"),
            width: width ? Number.parseInt(width, 10) : null,
            align:
              img?.getAttribute("align") ?? element.style.textAlign ?? null,
            inline: img?.getAttribute("inline") ?? false,
            flipX: flipX === "true",
            flipY: flipY === "true",
          };
        },
      },
      {
        tag: "img[src]",
      },
    ];
  },

  // addProseMirrorPlugins() {
  //   const validateFile = (file: File): boolean => {
  //     // @ts-expect-error
  //     if (!this.options.acceptMimes.includes(file.type)) {
  //       // toast({ description: t.value('editor.imageUpload.fileTypeNotSupported'), duration: 2000 });
  //       return false;
  //     }
  //     // @ts-expect-error
  //     if (file.size > this.options.maxSize) {
  //       // toast({
  //       //   description: `${t.value('editor.imageUpload.fileSizeTooBig')} ${formatFileSize(
  //       //     this.options.maxSize,
  //       //   )}.`,
  //       //   duration: 2000,
  //       // });
  //       return false;
  //     }
  //     return true;
  //   };

  //   const uploadFn = createImageUpload({
  //     validateFn: validateFile,
  //     onUpload: this.options.upload as any,
  //     // postUpload: this.options.postUpload,
  //     defaultInline: this.options.defaultInline,
  //   });

  //   return [
  //     UploadImagesPlugin(),

  //     new Plugin({
  //       key: new PluginKey(`richtextCustomPlugin${this.name}`),
  //       props: {
  //         handlePaste: (view, event) => {
  //           const hasFiles =
  //               event.clipboardData &&
  //               event.clipboardData.files &&
  //               event.clipboardData.files?.length;

  //           if (!hasFiles) {
  //             return;
  //           }

  //           const items = [...(event.clipboardData.files || [])];

  //           if (items.some(x => x.type === 'text/html')) {
  //             return false;
  //           }

  //           return handleImagePaste(view, event, uploadFn);
  //         },
  //         handleDrop: (view, event, _, moved) => {
  //           if (!(event instanceof DragEvent) || !event.dataTransfer) {
  //             return false;
  //           }

  //           handleImageDrop(view, event, moved, uploadFn);
  //           return false;
  //         },
  //       },
  //     }),
  //   ];
  // },
});
