import { type Editor } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  FlipHorizontal,
  FlipVertical,
  Trash2,
} from "lucide-react";
import { Button } from "@nhatnang/ui/components/ui/button";
import { cn } from "@nhatnang/ui/lib/utils";

export const ImageBubbleMenu = ({ editor }: { editor: Editor | null }) => {
  if (!editor) return null;

  return (
    <BubbleMenu
      editor={editor}
      shouldShow={({ editor }) => editor.isActive("image")}
      className="border-border bg-background flex items-center gap-1 rounded-md border p-1 shadow-md"
    >
      <Button
        size="sm"
        variant="ghost"
        className={cn(
          "h-8 w-8 p-0",
          editor.isActive("image", { align: "left" }) && "bg-muted",
        )}
        onClick={() =>
          editor
            .chain()
            .focus()
            .updateAttributes("image", { align: "left" })
            .run()
        }
      >
        <AlignLeft className="h-4 w-4" />
      </Button>
      <Button
        size="sm"
        variant="ghost"
        className={cn(
          "h-8 w-8 p-0",
          editor.isActive("image", { align: "center" }) && "bg-muted",
        )}
        onClick={() =>
          editor
            .chain()
            .focus()
            .updateAttributes("image", { align: "center" })
            .run()
        }
      >
        <AlignCenter className="h-4 w-4" />
      </Button>
      <Button
        size="sm"
        variant="ghost"
        className={cn(
          "h-8 w-8 p-0",
          editor.isActive("image", { align: "right" }) && "bg-muted",
        )}
        onClick={() =>
          editor
            .chain()
            .focus()
            .updateAttributes("image", { align: "right" })
            .run()
        }
      >
        <AlignRight className="h-4 w-4" />
      </Button>

      <div className="bg-border mx-1 h-4 w-px" />

      <Button
        size="sm"
        variant="ghost"
        className={cn(
          "h-8 w-8 p-0",
          editor.getAttributes("image")?.["flipX"] ? "bg-muted" : undefined,
        )}
        onClick={() =>
          editor
            .chain()
            .focus()
            .updateAttributes("image", {
              flipX: !editor.getAttributes("image")?.["flipX"],
            })
            .run()
        }
      >
        <FlipHorizontal className="h-4 w-4" />
      </Button>

      <Button
        size="sm"
        variant="ghost"
        className={cn(
          "h-8 w-8 p-0",
          editor.getAttributes("image")?.["flipY"] ? "bg-muted" : undefined,
        )}
        onClick={() =>
          editor
            .chain()
            .focus()
            .updateAttributes("image", {
              flipY: !editor.getAttributes("image")?.["flipY"],
            })
            .run()
        }
      >
        <FlipVertical className="h-4 w-4" />
      </Button>

      <div className="bg-border mx-1 h-4 w-px" />

      <Button
        size="sm"
        variant="ghost"
        className="text-destructive hover:bg-destructive/10 hover:text-destructive h-8 w-8 p-0"
        onClick={() => editor.chain().focus().deleteSelection().run()}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </BubbleMenu>
  );
};
