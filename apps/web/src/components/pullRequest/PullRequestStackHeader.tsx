import { MenuGroupLabel } from "../ui/menu";
import { Tooltip, TooltipPopup, TooltipTrigger } from "../ui/tooltip";
import { useI18n } from "../../i18n/WebI18nProvider";
import { translateWebSource } from "../../i18n/messages";

export function PullRequestStackHeader({
  number,
  notice,
  stale = false,
}: {
  number: number;
  notice?: string | null | undefined;
  stale?: boolean;
}) {
  const { locale } = useI18n();
  const localize = (value: string) => translateWebSource(locale, value);
  return (
    <MenuGroupLabel className="flex items-center justify-between gap-2">
      <span>
        {localize("Stack #")}#{number}
      </span>
      {notice ? (
        <Tooltip>
          <TooltipTrigger render={<span role="status" className="text-xs font-normal" />}>
            {localize(stale ? "May be stale" : "Refreshing…")}
          </TooltipTrigger>
          <TooltipPopup>{notice}</TooltipPopup>
        </Tooltip>
      ) : null}
    </MenuGroupLabel>
  );
}
