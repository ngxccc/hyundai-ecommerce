import { type Editor } from "@tiptap/react";
import { Button } from "@nhatnang/ui/components/ui/button";
import { List, ListOrdered } from "lucide-react";
import { cn } from "@nhatnang/ui/lib/utils";

interface ListButtonsProps {
  editor: Editor;
}

export const ListButtons = ({ editor }: ListButtonsProps) => {
  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={cn("px-2", editor.isActive("bulletList") && "bg-muted")}
      >
        <List className="h-4 w-4" />
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={cn("px-2", editor.isActive("orderedList") && "bg-muted")}
      >
        <ListOrdered className="h-4 w-4" />
      </Button>
    </>
  );
};
