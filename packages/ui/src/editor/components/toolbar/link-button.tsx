import { type Editor } from "@tiptap/react";
import { Button } from "@nhatnang/ui/components/ui/button";
import { Link2 } from "lucide-react";
import { cn } from "@nhatnang/ui/lib/utils";

interface LinkButtonProps {
  editor: Editor;
}

export const LinkButton = ({ editor }: LinkButtonProps) => {
  return (
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
  );
};
