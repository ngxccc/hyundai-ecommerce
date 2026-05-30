import { useTranslations } from "next-intl";
import { Image as ImageIcon } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@nhatnang/ui/components/ui/card";
import {
  FormControl,
  FormItem,
  FormMessage,
} from "@nhatnang/ui/components/ui/form";
import { Input } from "@nhatnang/ui/components/ui/input";

interface BrandImageSectionProps {
  logo: string;
  setLogo: (value: string) => void;
}

export const BrandImageSection = ({
  logo,
  setLogo,
}: BrandImageSectionProps) => {
  const t = useTranslations("AdminBrandForm");

  return (
    <Card className="py-4 shadow-sm">
      <CardHeader className="border-b px-4 pb-1!">
        <CardTitle className="text-primary flex items-center gap-2 text-lg">
          <ImageIcon className="text-primary h-5 w-5" />
          {t("sections.media")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 px-4">
        <div className="border-border bg-muted/20 hover:bg-muted/50 flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 text-center transition-colors">
          <ImageIcon className="text-muted-foreground mb-2 h-10 w-10 opacity-50" />
          <p className="text-foreground font-medium">
            {t("fields.dragDropImage")}
          </p>
          <p className="text-muted-foreground mt-1 text-sm">
            {t("fields.orClickToSelect")}
          </p>
        </div>
        <div>
          <label className="text-muted-foreground mb-2 block text-sm font-medium">
            {t("fields.orEnterUrl")}
          </label>
          <FormItem className="space-y-0">
            <FormControl>
              <Input
                value={logo}
                onChange={(event) => setLogo(event.target.value)}
                placeholder={t("placeholders.logo")}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </div>
      </CardContent>
    </Card>
  );
};
