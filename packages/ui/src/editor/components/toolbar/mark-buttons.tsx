import { type Editor } from "@tiptap/react";
import { Button } from "@nhatnang/ui/components/ui/button";
import { Bold, Italic } from "lucide-react";
import { cn } from "@nhatnang/ui/lib/utils";

interface MarkButtonsProps {
  editor: Editor;
}

export const MarkButtons = ({ editor }: MarkButtonsProps) => {
  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={cn("px-2", editor.isActive("bold") && "bg-muted")}
      >
        <Bold className="h-4 w-4" />
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={cn("px-2", editor.isActive("italic") && "bg-muted")}
      >
        <Italic className="h-4 w-4" />
      </Button>
    </>
  );
};
