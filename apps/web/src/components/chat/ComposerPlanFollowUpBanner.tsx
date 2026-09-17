import { memo } from "react";
import { ComposerBanner } from "./ComposerBanner";
import { useI18n } from "../../i18n/WebI18nProvider";
import { translateWebSource } from "../../i18n/messages";

export const ComposerPlanFollowUpBanner = memo(function ComposerPlanFollowUpBanner({
  planTitle,
}: {
  planTitle: string | null;
}) {
  const { locale } = useI18n();
  return (
    <ComposerBanner.Row>
      <ComposerBanner.Icon />
      <ComposerBanner.Content>
        <span className="shrink-0 font-medium text-muted-foreground">
          {translateWebSource(locale, "Plan ready")}
        </span>
        {planTitle ? (
          <span className="min-w-0 flex-1 truncate text-foreground/85">{planTitle}</span>
        ) : null}
      </ComposerBanner.Content>
    </ComposerBanner.Row>
  );
});
