import { LoaderCircleIcon } from "lucide-react";
import { observeVisibleAnimation } from "~/lib/visibleAnimation";
import { cn } from "~/lib/utils";
import { useI18n } from "../../i18n/WebI18nProvider";
import { translateWebSource } from "../../i18n/messages";

function Spinner({ className, ...props }: React.ComponentPropsWithoutRef<typeof LoaderCircleIcon>) {
  const { locale } = useI18n();
  return (
    <LoaderCircleIcon
      aria-label={translateWebSource(locale, "Loading")}
      ref={observeVisibleAnimation}
      className={cn("motion-safe:visible-animate-spin", className)}
      role="status"
      {...props}
    />
  );
}

export { Spinner };
