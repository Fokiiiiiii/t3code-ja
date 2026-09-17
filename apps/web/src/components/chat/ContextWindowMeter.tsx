import { Button } from "../ui/button";
import { type ContextWindowSnapshot, formatContextWindowTokens } from "~/lib/contextWindow";
import { Popover, PopoverPopup, PopoverTrigger } from "../ui/popover";
import { resolveContextHygieneState } from "./ContextWindowMeter.logic";
import { Minimize2Icon } from "lucide-react";
import { composerFloatingLayerProps } from "./composerEventScope";
import { useI18n } from "../../i18n/WebI18nProvider";
import { translateWebSource } from "../../i18n/messages";

function formatPercentage(value: number | null): string | null {
  if (value === null || !Number.isFinite(value)) {
    return null;
  }
  if (value < 10) {
    return `${value.toFixed(1).replace(/\.0$/, "")}%`;
  }
  return `${Math.round(value)}%`;
}

function formatDuration(durationMs: number | null): string | null {
  if (durationMs === null || !Number.isFinite(durationMs) || durationMs < 0) return null;
  const totalSeconds = Math.floor(durationMs / 1_000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
}

export type ContextWindowQuotaSummary = {
  readonly label: string;
  readonly windows: ReadonlyArray<{
    readonly label: string;
    readonly usedPercent: number;
  }>;
};

export function ContextWindowMeter(props: {
  usage: ContextWindowSnapshot;
  modelDisplayName?: string | null;
  onCompact?: (() => void) | undefined;
  compactDisabled?: boolean | undefined;
  compactDisabledReason?: string | null | undefined;
  quota?: ContextWindowQuotaSummary | null | undefined;
}) {
  const { locale } = useI18n();
  const localize = (value: string) => translateWebSource(locale, value);
  const { usage, modelDisplayName, onCompact, compactDisabled, compactDisabledReason, quota } =
    props;
  const usedPercentage = formatPercentage(usage.usedPercentage);
  const normalizedPercentage = Math.max(0, Math.min(100, usage.usedPercentage ?? 0));
  const radius = 9.75;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - normalizedPercentage / 100);
  const totalProcessedTokens = usage.totalProcessedTokens ?? null;
  const showTotalProcessed = totalProcessedTokens !== null && totalProcessedTokens > 0;
  const isOverloaded = normalizedPercentage > 90;
  const hygiene = resolveContextHygieneState(usage.usedPercentage);
  const turnMetrics = [
    { label: localize("Input tokens"), value: usage.lastInputTokens },
    { label: localize("Output tokens"), value: usage.lastOutputTokens },
    { label: localize("Reasoning tokens"), value: usage.lastReasoningOutputTokens },
    { label: localize("Cache read tokens"), value: usage.lastCachedInputTokens },
  ].filter((metric): metric is { label: string; value: number } => metric.value != null);
  const turnDuration = formatDuration(usage.durationMs ?? null);
  const usageColor = isOverloaded
    ? "var(--color-error)"
    : "color-mix(in oklab, var(--color-muted-foreground) 72%, transparent)";

  return (
    <Popover>
      <PopoverTrigger
        openOnHover
        delay={150}
        closeDelay={onCompact ? 150 : 0}
        render={
          <Button
            size="xs"
            variant="ghost-muted"
            className="h-7 gap-1 rounded-full px-1.5 hover:text-muted-foreground data-pressed:text-muted-foreground"
            aria-label={
              usage.maxTokens !== null && usedPercentage
                ? `${localize("Context window")} ${usedPercentage} ${localize("used")}`
                : `${localize("Context window")} ${formatContextWindowTokens(usage.usedTokens)} ${localize("tokens used")}`
            }
          >
            <span className="relative flex size-5 items-center justify-center">
              <svg
                viewBox="0 0 24 24"
                className="-rotate-90 absolute inset-0 size-full transform-gpu mx-0!"
                aria-hidden="true"
              >
                <circle
                  cx="12"
                  cy="12"
                  r={radius}
                  fill="none"
                  stroke="color-mix(in oklab, var(--color-muted-foreground) 24%, transparent)"
                  strokeWidth="3"
                />
                <circle
                  cx="12"
                  cy="12"
                  r={radius}
                  fill="none"
                  stroke={usageColor}
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={dashOffset}
                  className="transition-[stroke-dashoffset,stroke] duration-500 ease-out motion-reduce:transition-none"
                />
              </svg>
            </span>
            {usedPercentage && usage.maxTokens !== null ? (
              <span className="font-mono text-[10px] tabular-nums text-muted-foreground">
                {usedPercentage} · {formatContextWindowTokens(usage.usedTokens)}/
                {formatContextWindowTokens(usage.maxTokens ?? null)}
              </span>
            ) : null}
          </Button>
        }
      />
      <PopoverPopup
        {...composerFloatingLayerProps}
        tooltipStyle
        side="top"
        align="end"
        viewportClassName="p-0"
        className="w-64 max-w-none text-left whitespace-normal"
      >
        <div className="flex flex-col gap-2.5 p-[var(--floating-content-inset)]">
          <div className="flex items-center justify-between gap-3">
            <div className="font-medium text-muted-foreground text-xs">
              {localize("Context Window")}
            </div>
            {usage.maxTokens !== null && usedPercentage ? (
              <div className="text-secondary-label text-[11px] tabular-nums">
                <span>{usedPercentage}</span>
                <span className="mx-1">·</span>
                <span>
                  {formatContextWindowTokens(usage.usedTokens)}/
                  {formatContextWindowTokens(usage.maxTokens ?? null)}
                </span>
              </div>
            ) : (
              <div className="text-secondary-label text-[11px] tabular-nums">
                {formatContextWindowTokens(usage.usedTokens)}
              </div>
            )}
          </div>
          {usage.maxTokens !== null ? (
            <div
              className="h-1.5 w-full overflow-hidden rounded-full bg-muted/60"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(normalizedPercentage)}
              aria-label={localize("Context window usage")}
            >
              <div
                className="h-full rounded-full transition-[width,background-color] duration-500 ease-out motion-reduce:transition-none"
                style={{ width: `${normalizedPercentage}%`, backgroundColor: usageColor }}
              />
            </div>
          ) : null}
          <div className="grid grid-cols-2 gap-x-3 gap-y-1 border-y border-border/60 py-2 text-[11px] leading-4">
            <span className="text-secondary-label">{localize("Current context")}</span>
            <span className="text-right font-medium tabular-nums text-secondary-label">
              {formatContextWindowTokens(usage.usedTokens)}
            </span>
            <span className="text-secondary-label">{localize("Context capacity")}</span>
            <span className="text-right font-medium tabular-nums text-secondary-label">
              {usage.maxTokens === null
                ? localize("Unknown")
                : formatContextWindowTokens(usage.maxTokens ?? null)}
            </span>
            {showTotalProcessed ? (
              <>
                <span className="text-secondary-label">{localize("Total processed")}</span>
                <span className="text-right font-medium tabular-nums text-secondary-label">
                  {formatContextWindowTokens(totalProcessedTokens ?? null)}
                </span>
              </>
            ) : null}
          </div>
          {turnMetrics.length > 0 || usage.toolUses != null || turnDuration !== null ? (
            <div className="flex flex-col gap-1 text-[11px] leading-4">
              <span className="font-medium text-muted-foreground">{localize("This turn")}</span>
              <div className="grid grid-cols-2 gap-x-3 gap-y-1">
                {turnMetrics.map((metric) => (
                  <>
                    <span key={`${metric.label}:label`} className="text-secondary-label">
                      {metric.label}
                    </span>
                    <span
                      key={`${metric.label}:value`}
                      className="text-right font-medium tabular-nums text-secondary-label"
                    >
                      {formatContextWindowTokens(metric.value)}
                    </span>
                  </>
                ))}
                {usage.toolUses != null ? (
                  <>
                    <span className="text-secondary-label">{localize("Tool calls")}</span>
                    <span className="text-right font-medium tabular-nums text-secondary-label">
                      {usage.toolUses}
                    </span>
                  </>
                ) : null}
                {turnDuration !== null ? (
                  <>
                    <span className="text-secondary-label">{localize("Duration")}</span>
                    <span className="text-right font-medium tabular-nums text-secondary-label">
                      {turnDuration}
                    </span>
                  </>
                ) : null}
              </div>
            </div>
          ) : null}
          {quota && quota.windows.length > 0 ? (
            <div className="flex flex-col gap-1 text-[11px] leading-4">
              <span className="font-medium text-muted-foreground">
                {localize(quota.label)} {localize("quota")}
              </span>
              {quota.windows.slice(0, 2).map((window) => (
                <div
                  key={window.label}
                  className="flex items-center justify-between gap-3 text-secondary-label"
                >
                  <span>{window.label}</span>
                  <span className="font-medium tabular-nums">
                    {Math.max(0, Math.min(100, Math.round(100 - window.usedPercent)))}%{" "}
                    {localize("left")}
                  </span>
                </div>
              ))}
            </div>
          ) : null}
          <div className="rounded-md bg-muted/45 px-2.5 py-2 text-[11px] leading-4">
            <div className="flex items-center justify-between gap-3">
              <span className="font-medium text-muted-foreground">
                {localize("Session health")}
              </span>
              <span className="font-medium text-secondary-label">{localize(hygiene.label)}</span>
            </div>
            <p className="mt-0.5 text-secondary-label">{localize(hygiene.description)}</p>
            {hygiene.level !== "healthy" ? (
              <div className="mt-2 grid grid-cols-2 gap-2 border-t border-border/50 pt-2 text-[10px]">
                <div>
                  <div className="font-medium text-muted-foreground">{localize("Preserved")}</div>
                  <div className="text-secondary-label">
                    {localize("Task, decisions, changed files")}
                  </div>
                </div>
                <div>
                  <div className="font-medium text-muted-foreground">{localize("Discardable")}</div>
                  <div className="text-secondary-label">
                    {localize("Old tool output, repeated logs")}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
          {usage.compactsAutomatically ? (
            <div className="mt-1 text-pretty text-secondary-label text-[11px] font-medium">
              {usage.autoCompactThreshold && usage.autoCompactThreshold > 0
                ? localize("Compacts automatically at") +
                  " " +
                  usage.autoCompactThreshold.toLocaleString("en-US") +
                  " " +
                  localize("tokens") +
                  "."
                : modelDisplayName
                  ? localize("Context for") +
                    " " +
                    modelDisplayName +
                    " " +
                    localize("compacts automatically when needed.")
                  : localize("Context compacts automatically when needed.")}
            </div>
          ) : null}
          {onCompact ? (
            <div className="mt-0.5 flex gap-1.5">
              <Button
                size="xs"
                variant="outline"
                className="flex-1 justify-center"
                disabled={compactDisabled}
                onClick={onCompact}
              >
                <Minimize2Icon aria-hidden="true" />
                {localize("Compact context")}
              </Button>
            </div>
          ) : null}
          {compactDisabled && compactDisabledReason && onCompact ? (
            <div className="text-pretty text-secondary-label text-[11px]">
              {compactDisabledReason}
            </div>
          ) : null}
        </div>
      </PopoverPopup>
    </Popover>
  );
}

/** Holds the meter's footprint while a thread's activities are still loading. */
export function ContextWindowMeterPlaceholder() {
  return <span aria-hidden="true" className="size-7 shrink-0" />;
}
