import { Tooltip, TooltipTrigger, TooltipPopup } from "../ui/tooltip";
import type { EnvironmentId, PullRequestRef, PullRequestStackMembership } from "@t3tools/contracts";
import { LayersIcon } from "lucide-react";
import { useState } from "react";
import { usePullRequestStack } from "~/state/usePullRequestStack";
import { Menu, MenuTrigger, MenuPopup, MenuGroup, MenuGroupLabel, MenuItem } from "../ui/menu";
import { PullRequestStackLayers } from "./PullRequestStackLayers";
import { PullRequestStackHeader } from "./PullRequestStackHeader";
import { useI18n } from "../../i18n/WebI18nProvider";
import { translateWebSource } from "../../i18n/messages";

/** Mounted only while the menu is open, so list rows do not each fetch a stack. */
function StackBody({
  environmentId,
  reference,
  onSelect,
  stackNumber,
}: {
  environmentId: EnvironmentId;
  reference: PullRequestRef;
  onSelect: (reference: PullRequestRef) => void;
  stackNumber: number;
}) {
  const { locale } = useI18n();
  const localize = (value: string) => translateWebSource(locale, value);
  const query = usePullRequestStack(environmentId, reference);
  if (query.data !== null) {
    return (
      <>
        <PullRequestStackHeader
          number={query.data.number}
          notice={query.notice}
          stale={!!query.error}
        />
        {query.error ? (
          <MenuItem onClick={query.refresh}>{localize("Retry stack refresh")}</MenuItem>
        ) : null}
        <PullRequestStackLayers stack={query.data} reference={reference} onSelect={onSelect} />
      </>
    );
  }
  return (
    <>
      <PullRequestStackHeader number={stackNumber} />
      <MenuGroupLabel>
        {query.error ??
          (query.isPending
            ? localize("Loading stack…")
            : localize("This pull request is no longer in a stack."))}
      </MenuGroupLabel>
    </>
  );
}

export function PullRequestStackPopover({
  environmentId,
  reference,
  membership,
  onSelect,
}: {
  environmentId: EnvironmentId;
  reference: PullRequestRef;
  membership: PullRequestStackMembership;
  onSelect: (reference: PullRequestRef) => void;
}) {
  const { locale } = useI18n();
  const localize = (value: string) => translateWebSource(locale, value);
  const [open, setOpen] = useState(false);
  return (
    <Menu open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger
          render={
            <MenuTrigger
              nativeButton={false}
              render={
                <span
                  role="button"
                  tabIndex={0}
                  className="inline-flex shrink-0 cursor-pointer items-center gap-1 text-xs font-normal text-muted-foreground"
                />
              }
              aria-label={`${localize("Stack")} ${membership.number}, ${localize("layer")} ${membership.position} ${localize("of")} ${membership.size}`}
              onClick={(event) => event.stopPropagation()}
              onKeyDown={(event) => event.stopPropagation()}
            >
              <LayersIcon aria-hidden className="size-3" />
              {membership.position}/{membership.size}
            </MenuTrigger>
          }
        />
        <TooltipPopup>
          {localize("View stack")} #{membership.number}, {localize("layer")} {membership.position}{" "}
          {localize("of")} {membership.size}
        </TooltipPopup>
      </Tooltip>
      <MenuPopup
        align="start"
        className="w-96 max-w-[calc(100vw-2rem)]"
        onClick={(event) => event.stopPropagation()}
        onKeyDown={(event) => event.stopPropagation()}
      >
        <MenuGroup>
          {open ? (
            <StackBody
              environmentId={environmentId}
              reference={reference}
              stackNumber={membership.number}
              onSelect={(target) => {
                setOpen(false);
                onSelect(target);
              }}
            />
          ) : null}
        </MenuGroup>
      </MenuPopup>
    </Menu>
  );
}
