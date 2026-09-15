import { EventId, TurnId } from "@t3tools/contracts";
import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vite-plus/test";

import { deriveLatestContextWindowSnapshot } from "~/lib/contextWindow";
import { ContextWindowMeter } from "./ContextWindowMeter";

vi.mock("../ui/popover", () => ({
  Popover: ({ children }: { children: ReactNode }) => children,
  PopoverPopup: ({ children }: { children: ReactNode }) => children,
  PopoverTrigger: ({ closeDelay, render }: { closeDelay: number; render: ReactNode }) => (
    <div data-close-delay={closeDelay}>{render}</div>
  ),
}));

const usage = deriveLatestContextWindowSnapshot([
  {
    id: EventId.make("activity-1"),
    tone: "info",
    kind: "context-window.updated",
    summary: "Context updated",
    payload: { usedTokens: 100_000, maxTokens: 1_000_000 },
    turnId: TurnId.make("turn-1"),
    createdAt: "2026-08-24T12:00:00.000Z",
  },
]);

if (!usage) {
  throw new Error("The context window test fixture did not produce a snapshot.");
}

describe("ContextWindowMeter", () => {
  it("keeps the hover popover open while the pointer moves to the compact button", () => {
    const markup = renderToStaticMarkup(<ContextWindowMeter usage={usage} onCompact={() => {}} />);

    expect(markup).toContain('data-close-delay="150"');
    expect(markup).toContain("Compact context");
  });

  it("closes an informational hover popover without delay", () => {
    const markup = renderToStaticMarkup(<ContextWindowMeter usage={usage} />);

    expect(markup).toContain('data-close-delay="0"');
    expect(markup).not.toContain("Compact context");
  });

  it("explains why the compact action is disabled", () => {
    const markup = renderToStaticMarkup(
      <ContextWindowMeter
        usage={usage}
        onCompact={() => {}}
        compactDisabled
        compactDisabledReason="Send or clear your draft before compacting"
      />,
    );

    expect(markup).toContain('disabled=""');
    expect(markup).toContain(">Send or clear your draft before compacting<");
    expect(markup).not.toContain('aria-label="Send or clear your draft before compacting"');
  });

  it("shows the compact session summary without turning the composer into a dashboard", () => {
    const markup = renderToStaticMarkup(
      <ContextWindowMeter
        usage={{
          ...usage,
          totalProcessedTokens: 748_126,
          lastInputTokens: 12_400,
          lastOutputTokens: 3_800,
          lastReasoningOutputTokens: 8_100,
          lastCachedInputTokens: 41_700,
          toolUses: 14,
          durationMs: 138_000,
        }}
        quota={{ label: "Codex", windows: [{ label: "5 hour", usedPercent: 32 }] }}
      />,
    );

    expect(markup).toContain("Session health");
    expect(markup).toContain("Current context");
    expect(markup).toContain("Context capacity");
    expect(markup).toContain("Total processed");
    expect(markup).toContain("This turn");
    expect(markup).toContain("Reasoning");
    expect(markup).toContain("Cache read");
    expect(markup).toContain("Tool calls");
    expect(markup).toContain("Codex quota");
    expect(markup).toContain("5 hour");
  });

  it("keeps the hygiene detail informational when the context is nearly full", () => {
    const markup = renderToStaticMarkup(
      <ContextWindowMeter
        usage={{ ...usage, usedTokens: 920_000, usedPercentage: 92 }}
        onCompact={() => {}}
      />,
    );

    expect(markup).toContain("Context is high");
    expect(markup).toContain("Preserved");
    expect(markup).toContain("Discardable");
    expect(markup).not.toContain("New chat");
  });
});
