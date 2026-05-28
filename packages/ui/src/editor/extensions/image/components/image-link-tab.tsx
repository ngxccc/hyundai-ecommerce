import { Button } from "@nhatnang/ui/components/ui/button";
import { Input } from "@nhatnang/ui/components/ui/input";

interface ImageLinkTabProps {
  link: string;
  setLink: (val: string) => void;
  t: (key: string) => string;
  onSubmit: (e: React.SyntheticEvent<HTMLFormElement>) => void;
}

export const ImageLinkTab = ({
  link,
  setLink,
  t,
  onSubmit,
}: ImageLinkTabProps) => {
  return (
    <form onSubmit={onSubmit}>
      <div className="flex items-center gap-2">
        <Input
          autoFocus
          onChange={(e) => setLink(e.target.value)}
          placeholder={t("editor.image.dialog.placeholder")}
          required
          type="url"
          value={link}
        />

        <Button type="submit">{t("editor.image.dialog.button.apply")}</Button>
      </div>
    </form>
  );
};
