import { type Editor } from "@tiptap/react";
import { useEffect, useState } from "react";
import { Button } from "@nhatnang/ui/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@nhatnang/ui/components/ui/dropdown-menu";
import {
  Bold,
  Italic,
  ChevronDown,
  Heading,
  List,
  ListOrdered,
  Link2,
  Pilcrow,
} from "lucide-react";
import { cn } from "@nhatnang/ui/lib/utils";
import { RichTextImage } from "./extensions/image/rich-text-image";

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

  const headingLevels = [1, 2, 3, 4, 5, 6] as const;
  const activeHeading = headingLevels.find((level) =>
    editor.isActive("heading", { level }),
  );

  return (
    <div className="border-border/50 bg-muted/20 flex flex-wrap items-center gap-1 border-b p-1">
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="w-30 justify-between font-normal"
            type="button"
          >
            <span className="flex items-center gap-2">
              <Heading className="h-4 w-4" />
              {activeHeading ? `Heading ${activeHeading}` : "Normal"}
            </span>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          className="w-30"
          onCloseAutoFocus={(e) => {
            e.preventDefault();
            editor.commands.focus();
          }}
        >
          <DropdownMenuItem
            onSelect={() => editor.chain().focus().setParagraph().run()}
            className={cn(
              "font-normal",
              editor.isActive("paragraph") && "bg-muted",
            )}
          >
            Normal
          </DropdownMenuItem>
          {headingLevels.map((level) => (
            <DropdownMenuItem
              key={level}
              onSelect={() =>
                editor.chain().focus().toggleHeading({ level: level }).run()
              }
              className={cn(
                "font-medium",
                editor.isActive("heading", { level }) && "bg-muted",
              )}
            >
              Heading {level}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="bg-border mx-1 h-4 w-px" />

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

      <div className="bg-border mx-1 h-4 w-px" />

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

      <div className="bg-border mx-1 h-4 w-px" />

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => {
          const previousUrl =
            (editor.getAttributes("link")["href"] as string) ?? "";
          const url = window.prompt("URL liên kết:", previousUrl);

          if (url === null) {
            return;
          }
          if (url === "") {
            editor.chain().focus().extendMarkRange("link").unsetLink().run();
            return;
          }
          editor
            .chain()
            .focus()
            .extendMarkRange("link")
            .setLink({ href: url })
            .run();
        }}
        className={cn("px-2", editor.isActive("link") && "bg-muted")}
      >
        <Link2 className="h-4 w-4" />
      </Button>

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
