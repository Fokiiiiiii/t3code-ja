import { CheckIcon, CopyIcon } from "lucide-react";
import { useRef } from "react";
import { useCopyToClipboard } from "../hooks/useCopyToClipboard";
import {
  ANCHORED_COPY_TOAST_TIMEOUT_MS,
  showAnchoredCopyErrorToast,
  showAnchoredCopySuccessToast,
} from "./ui/anchoredCopyToast";
import { Button } from "./ui/button";
import { Tooltip, TooltipPopup, TooltipTrigger } from "./ui/tooltip";
import { useI18n } from "../i18n/WebI18nProvider";
import { translateWebSource } from "../i18n/messages";

export function DiffFilePathCopyButton({ filePath }: { filePath: string }) {
  const { locale } = useI18n();
  const localize = (value: string) => translateWebSource(locale, value);
  const ref = useRef<HTMLButtonElement>(null);
  const { copyToClipboard, isCopied } = useCopyToClipboard<void>({
    onCopy: () => showAnchoredCopySuccessToast(ref),
    onError: (error) => showAnchoredCopyErrorToast(ref, error),
    timeout: ANCHORED_COPY_TOAST_TIMEOUT_MS,
  });

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            ref={ref}
            size="icon-micro"
            variant="ghost"
            className="text-muted-foreground [:hover,[data-pressed]]:bg-transparent"
            aria-label={localize("Copy file path")}
            onClick={() => copyToClipboard(filePath, undefined)}
          />
        }
      >
        {isCopied ? <CheckIcon className="size-3 text-success" /> : <CopyIcon className="size-3" />}
      </TooltipTrigger>
      <TooltipPopup>
        <p>{localize(isCopied ? "Copied" : "Copy path")}</p>
      </TooltipPopup>
    </Tooltip>
  );
}
