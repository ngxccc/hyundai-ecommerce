import { Button } from "@nhatnang/ui/components/ui/button";
import { Loader2 } from "lucide-react";
import { type Editor } from "@tiptap/react";
import { ImageCropper } from "../image-cropper";
import { type ResolvedRichTextImageUploadOptions } from "../rich-text-image";

interface ImageUploadTabProps {
  isUploading: boolean;
  onUploadClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  t: (key: string) => string;
  alt: string;
  setAlt: (val: string) => void;
  editor: Editor | null;
  imageInline: boolean;
  uploadOptions: ResolvedRichTextImageUploadOptions;
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
}

export const ImageUploadTab = ({
  isUploading,
  onUploadClick,
  t,
  alt,
  setAlt,
  editor,
  imageInline,
  uploadOptions,
  onFileChange,
  fileInputRef,
}: ImageUploadTabProps) => {
  return (
    <>
      <div className="flex w-full items-center gap-2">
        <Button
          className="flex-1"
          disabled={isUploading}
          onClick={onUploadClick}
          size="sm"
        >
          {isUploading ? (
            <>
              {t("editor.imageUpload.uploading")}
              <Loader2 className="ml-1 h-4 w-4 animate-spin" />
            </>
          ) : (
            t("editor.image.dialog.tab.upload")
          )}
        </Button>

        <ImageCropper
          alt={alt}
          disabled={isUploading}
          editor={editor}
          imageInline={imageInline}
          onClose={() => {
            setAlt("");
          }}
          uploadOptions={uploadOptions}
          dictionary={t}
        />
      </div>

      <input
        accept={
          uploadOptions.acceptMimes.length > 0
            ? uploadOptions.acceptMimes.join(",")
            : "image/*"
        }
        multiple={uploadOptions.multiple}
        onChange={onFileChange}
        ref={fileInputRef}
        style={{ display: "none" }}
        type="file"
      />
    </>
  );
};
