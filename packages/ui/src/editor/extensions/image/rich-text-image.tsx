import { useId, useMemo, useRef, useState } from "react";
import { ImageIcon } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@nhatnang/ui/components/ui/dialog";
import { type Editor } from "@tiptap/react";
import { Button } from "@nhatnang/ui/components/ui/button";
import { Checkbox } from "@nhatnang/ui/components/ui/checkbox";
import { Input } from "@nhatnang/ui/components/ui/input";
import { Label } from "@nhatnang/ui/components/ui/label";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@nhatnang/ui/components/ui/tabs";
import { validateFiles } from "@nhatnang/ui/lib/file-utils";
import { ImageUploadTab } from "./components/image-upload-tab";
import { ImageLinkTab } from "./components/image-link-tab";

interface RichTextImageUploadOptions {
  upload?: (file: File) => Promise<string>;
  acceptMimes?: string[];
  maxSize?: number;
  resourceImage: "upload" | "link" | "both";
  enableAlt?: boolean;
  multiple?: boolean;
  defaultInline?: boolean;
  onError?: (error: {
    type: "size" | "type" | "upload";
    message: string;
    file?: File;
  }) => void;
}

export type ResolvedRichTextImageUploadOptions = Omit<
  RichTextImageUploadOptions,
  | "acceptMimes"
  | "maxSize"
  | "resourceImage"
  | "enableAlt"
  | "multiple"
  | "defaultInline"
> &
  Required<
    Pick<
      RichTextImageUploadOptions,
      | "acceptMimes"
      | "maxSize"
      | "resourceImage"
      | "enableAlt"
      | "multiple"
      | "defaultInline"
    >
  >;

export const DEFAULT_OPTIONS: Required<
  Pick<
    RichTextImageUploadOptions,
    | "acceptMimes"
    | "maxSize"
    | "resourceImage"
    | "enableAlt"
    | "multiple"
    | "defaultInline"
  >
> = {
  acceptMimes: ["image/jpeg", "image/png", "image/gif", "image/webp"],
  maxSize: 1024 * 1024 * 5,
  resourceImage: "both",
  enableAlt: true,
  multiple: false,
  defaultInline: false,
};

export interface RichTextImageProps {
  editor: Editor | null;
  uploadOptions?: Partial<RichTextImageUploadOptions>;
  dictionary?: (key: string) => string;
}

export const RichTextImage = ({
  editor,
  uploadOptions: userOptions,
  dictionary: t = (k: string) => k,
}: RichTextImageProps) => {
  const [open, setOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const [link, setLink] = useState<string>("");
  const [alt, setAlt] = useState<string>("");
  const fileInput = useRef<HTMLInputElement>(null);

  const uploadOptions = useMemo<ResolvedRichTextImageUploadOptions>(
    () => ({
      ...DEFAULT_OPTIONS,
      ...userOptions,
    }),
    [userOptions],
  );

  const defaultInline = uploadOptions.defaultInline ?? false;
  const [imageInline, setImageInline] = useState(defaultInline);
  const inlineCheckboxId = useId();

  async function handleFile(event: React.ChangeEvent<HTMLInputElement>) {
    const files = event.currentTarget.files;
    if (
      !editor ||
      editor.isDestroyed ||
      !files ||
      files.length === 0 ||
      isUploading
    ) {
      event.currentTarget.value = "";
      return;
    }

    const validFiles = validateFiles(files, {
      acceptMimes: uploadOptions.acceptMimes,
      maxSize: uploadOptions.maxSize,
      t,
      toast,
      ...(uploadOptions.onError ? { onError: uploadOptions.onError } : {}),
    });

    if (validFiles.length <= 0) {
      event.currentTarget.value = "";
      return;
    }

    setIsUploading(true);
    try {
      if (uploadOptions.multiple) {
        // Handle multiple files upload
        const uploadPromises = validFiles.map(async (file) => {
          return uploadOptions.upload
            ? uploadOptions.upload(file)
            : URL.createObjectURL(file);
        });

        const srcs = await Promise.all(uploadPromises);
        // Insert all images (you might want to adjust this based on your editor's capabilities)
        srcs.forEach((src) => {
          editor
            .chain()
            .focus()
            .setImageInline({ src, inline: imageInline, alt })
            .run();
        });
      } else {
        // Single file upload (take the first valid file)
        const file = validFiles[0];
        if (!file) return;
        const src = uploadOptions.upload
          ? await uploadOptions.upload(file)
          : URL.createObjectURL(file);
        editor
          .chain()
          .focus()
          .setImageInline({ src, inline: imageInline, alt })
          .run();
      }

      setOpen(false);
      setAlt("");
      setImageInline(defaultInline);
    } catch (error) {
      console.error("Error uploading image", error);
      if (uploadOptions.onError) {
        uploadOptions.onError({
          type: "upload",
          message: t("editor.upload.error"),
        });
      } else {
        toast.error(t("editor.upload.error"));
      }
    } finally {
      setIsUploading(false);
      event.currentTarget.value = "";
    }
  }

  function handleLink(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    e.stopPropagation();

    if (!editor || editor.isDestroyed) {
      return;
    }

    editor
      .chain()
      .focus()
      .setImageInline({ src: link, inline: imageInline, alt })
      .run();
    setOpen(false);
    setImageInline(defaultInline);
    setLink("");
    setAlt("");
  }

  function handleClick(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    fileInput.current?.click();
  }

  return (
    <>
      <Button
        aria-pressed={open}
        className="data-[state=on]:bg-muted"
        onClick={() => setOpen((prev) => !prev)}
        size="sm"
        type="button"
        variant={open ? "secondary" : "ghost"}
      >
        <ImageIcon className="h-4 w-4" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogPortal>
          <DialogOverlay className="fixed inset-0 z-50 bg-black/50" />
          <DialogContent className="bg-background fixed top-1/2 left-1/2 z-50 grid w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 gap-4 rounded-lg border p-6 shadow-lg">
            <DialogTitle className="mb-1.5 text-lg leading-none font-semibold tracking-tight">
              {t("editor.image.dialog.title")}
            </DialogTitle>
            <DialogDescription className="sr-only">
              {t("editor.image.dialog.title")}
            </DialogDescription>

            <Tabs
              activationMode="manual"
              defaultValue={
                uploadOptions.resourceImage === "both" ||
                uploadOptions.resourceImage === "upload"
                  ? "upload"
                  : "link"
              }
            >
              {uploadOptions.resourceImage === "both" && (
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="upload">
                    {t("editor.image.dialog.tab.upload")}
                  </TabsTrigger>

                  <TabsTrigger value="link">
                    {t("editor.image.dialog.tab.url")}
                  </TabsTrigger>
                </TabsList>
              )}

              <div className="my-2.5 flex items-center gap-1">
                <Checkbox
                  id={inlineCheckboxId}
                  checked={imageInline}
                  onCheckedChange={(v) => {
                    setImageInline(Boolean(v));
                  }}
                />

                <Label htmlFor={inlineCheckboxId} className="cursor-pointer">
                  {t("editor.link.dialog.inline")}
                </Label>
              </div>

              {uploadOptions.enableAlt && (
                <div className="my-2.5">
                  <Label className="mb-1.5">
                    {t("editor.imageUpload.alt")}
                  </Label>

                  <Input
                    onChange={(e) => setAlt(e.target.value)}
                    required
                    type="text"
                    value={alt}
                  />
                </div>
              )}

              <TabsContent value="upload" className="mt-4">
                <ImageUploadTab
                  isUploading={isUploading}
                  onUploadClick={handleClick}
                  t={t}
                  alt={alt}
                  setAlt={setAlt}
                  editor={editor}
                  imageInline={imageInline}
                  uploadOptions={uploadOptions}
                  onFileChange={handleFile}
                  fileInputRef={fileInput}
                />
              </TabsContent>

              <TabsContent value="link">
                <ImageLinkTab
                  link={link}
                  setLink={setLink}
                  t={t}
                  onSubmit={handleLink}
                />
              </TabsContent>
            </Tabs>
          </DialogContent>
        </DialogPortal>
      </Dialog>
    </>
  );
}
