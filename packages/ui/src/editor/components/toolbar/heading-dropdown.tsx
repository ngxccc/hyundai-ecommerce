import { type Editor } from "@tiptap/react";
import { Button } from "@nhatnang/ui/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@nhatnang/ui/components/ui/dropdown-menu";
import { Heading, ChevronDown } from "lucide-react";
import { cn } from "@nhatnang/ui/lib/utils";

interface HeadingDropdownProps {
  editor: Editor;
}

export const HeadingDropdown = ({ editor }: HeadingDropdownProps) => {
  const headingLevels = [1, 2, 3, 4, 5, 6] as const;
  const activeHeading = headingLevels.find((level) =>
    editor.isActive("heading", { level }),
  );

  return (
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
  );
};
