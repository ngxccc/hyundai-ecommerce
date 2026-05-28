"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { Link } from "@tiptap/extension-link";
import type { JSONContent } from "@tiptap/core";
import { useEffect, useState } from "react";
import { cn } from "@/shared/lib/utils";

import { CustomImage } from "./extensions/custom-image";
import { EditorToolbar } from "./toolbar";
import { ImageBubbleMenu } from "./components/image-bubble-menu";

interface RichTextEditorProps {
  value?: JSONContent | null;
  onChange?: (value: JSONContent) => void;
  className?: string;
}

export const RichTextEditor = ({
  value,
  onChange,
  className,
}: RichTextEditorProps) => {
  const [showInvisibles, setShowInvisibles] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      CustomImage,
      Link.configure({
        openOnClick: false,
      }),
    ],
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: cn(
          "prose dark:prose-invert prose-sm sm:prose-base focus:outline-none max-w-none min-h-[150px] p-4 bg-background transition-all",
          "prose-headings:mt-6 prose-headings:mb-2 prose-p:my-2 prose-ul:my-2 prose-ol:my-2",
          showInvisibles && "show-invisibles",
          className,
        ),
      },
    },
    ...(value ? { content: value } : {}),
    onUpdate: ({ editor }) => {
      onChange?.(editor.getJSON());
    },
  });

  useEffect(() => {
    if (editor && !editor.isDestroyed && value) {
      if (
        typeof value === "object" &&
        Object.keys(value).length > 0 &&
        value.type === "doc"
      ) {
        if (editor.isEmpty) {
          editor.commands.setContent(value);
        }
      }
    }
  }, [editor, value]);

  return (
    <div className="border-border flex flex-col overflow-hidden rounded-md border">
      <EditorToolbar
        editor={editor}
        showInvisibles={showInvisibles}
        onToggleInvisibles={() => setShowInvisibles(!showInvisibles)}
      />
      <ImageBubbleMenu editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
};
