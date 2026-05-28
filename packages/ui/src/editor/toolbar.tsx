import { type Editor } from "@tiptap/react";
import { useEffect, useState } from "react";
import { Button } from "@nhatnang/ui/components/ui/button";
import { Pilcrow } from "lucide-react";
import { cn } from "@nhatnang/ui/lib/utils";
import { RichTextImage } from "./extensions/image/rich-text-image";
import { HeadingDropdown } from "./components/toolbar/heading-dropdown";
import { MarkButtons } from "./components/toolbar/mark-buttons";
import { ListButtons } from "./components/toolbar/list-buttons";
import { LinkButton } from "./components/toolbar/link-button";

interface EditorToolbarProps {
  editor: Editor | null;
  showInvisibles: boolean;
  onToggleInvisibles: () => void;
  dictionary?: (key: string) => string;
}

export const EditorToolbar = ({
  editor,
  showInvisibles,
  onToggleInvisibles,
  dictionary,
}: EditorToolbarProps) => {
  const [, setTick] = useState(0);

  useEffect(() => {
    if (!editor) return;

    const handleUpdate = () => {
      setTick((t) => t + 1);
    };

    editor.on("transaction", handleUpdate);

    return () => {
      editor.off("transaction", handleUpdate);
    };
  }, [editor]);

  if (!editor) return null;

  return (
    <div className="border-border/50 bg-muted/20 flex flex-wrap items-center gap-1 border-b p-1">
      <HeadingDropdown editor={editor} />
      
      <div className="bg-border mx-1 h-4 w-px" />
      
      <MarkButtons editor={editor} />
      
      <div className="bg-border mx-1 h-4 w-px" />
      
      <ListButtons editor={editor} />
      
      <div className="bg-border mx-1 h-4 w-px" />
      
      <LinkButton editor={editor} />

      <RichTextImage editor={editor} {...(dictionary ? { dictionary } : {})} />

      <div className="flex-1" />

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onMouseDown={(e) => e.preventDefault()}
        onClick={onToggleInvisibles}
        className={cn("px-2", showInvisibles && "bg-muted")}
        title="Show Paragraph Marks (¶)"
      >
        <Pilcrow className="text-muted-foreground h-4 w-4" />
      </Button>
    </div>
  );
};
