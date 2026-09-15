import type { AppLocalePreference } from "@t3tools/contracts/settings";
import { resolveAppLocale, type ResolvedAppLocale } from "@t3tools/shared/appLocale";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useClientSettings, useUpdateClientSettings } from "../hooks/useSettings";
import {
  translateWebMessage,
  translateWebSource,
  type WebMessageKey,
  type WebMessageValues,
} from "./messages";

export type WebTranslate = (key: WebMessageKey, values?: WebMessageValues) => string;

export interface WebI18nContextValue {
  readonly locale: ResolvedAppLocale;
  readonly appLocale: AppLocalePreference;
  readonly setAppLocale: (locale: AppLocalePreference) => void;
  readonly t: WebTranslate;
}

const translateEnglish: WebTranslate = (key, values) => translateWebMessage("en", key, values);
const noopSetAppLocale = (_locale: AppLocalePreference) => undefined;

const WebI18nContext = createContext<WebI18nContextValue>({
  locale: "en",
  appLocale: "system",
  setAppLocale: noopSetAppLocale,
  t: translateEnglish,
});

const ORIGINAL_TEXT_BY_NODE = new WeakMap<Text, string>();
const ORIGINAL_ATTRIBUTE_BY_ELEMENT = new WeakMap<Element, Map<string, string>>();

function readRuntimeLocales(): ReadonlyArray<string> {
  const desktopLocale =
    typeof window === "undefined" ? null : (window.desktopBridge?.getSystemLocale?.() ?? null);
  const browserLocales =
    typeof navigator === "undefined"
      ? []
      : navigator.languages.length > 0
        ? [...navigator.languages]
        : navigator.language
          ? [navigator.language]
          : [];
  return desktopLocale ? [desktopLocale, ...browserLocales] : browserLocales;
}

function localizeDom(locale: ResolvedAppLocale): void {
  if (typeof document === "undefined") return;
  const body = document.body;
  if (
    !body ||
    typeof document.createTreeWalker !== "function" ||
    typeof body.querySelectorAll !== "function"
  ) {
    return;
  }

  const walker = document.createTreeWalker(
    body,
    typeof NodeFilter === "undefined" ? 4 : NodeFilter.SHOW_TEXT,
  );
  const textNodes: Text[] = [];
  let current = walker.nextNode();
  while (current !== null) {
    textNodes.push(current as Text);
    current = walker.nextNode();
  }

  for (const textNode of textNodes) {
    const parent = textNode.parentElement;
    if (!parent || /^(CODE|PRE|INPUT|TEXTAREA|SCRIPT|STYLE)$/u.test(parent.tagName)) continue;
    if (parent.isContentEditable) continue;
    const current = textNode.nodeValue ?? "";
    const source = ORIGINAL_TEXT_BY_NODE.get(textNode) ?? current.trim();
    if (!source) continue;
    ORIGINAL_TEXT_BY_NODE.set(textNode, source);
    const translated = locale === "en" ? source : translateWebSource(locale, source);
    const start = current.indexOf(locale === "en" ? (textNode.nodeValue?.trim() ?? "") : source);
    if (start >= 0) {
      const currentSource = current.slice(start, start + (textNode.nodeValue?.trim().length ?? 0));
      if (currentSource !== translated) {
        textNode.nodeValue = `${current.slice(0, start)}${translated}${current.slice(start + currentSource.length)}`;
      }
    }
  }

  for (const element of body.querySelectorAll<HTMLElement>(
    "[aria-label], [title], [placeholder]",
  )) {
    if (element.isContentEditable) continue;
    for (const attribute of ["aria-label", "title", "placeholder"] as const) {
      const current = element.getAttribute(attribute);
      if (!current) continue;
      const originals = ORIGINAL_ATTRIBUTE_BY_ELEMENT.get(element) ?? new Map<string, string>();
      const source = originals.get(attribute) ?? current;
      originals.set(attribute, source);
      ORIGINAL_ATTRIBUTE_BY_ELEMENT.set(element, originals);
      const translated = locale === "en" ? source : translateWebSource(locale, source);
      if (current !== translated) element.setAttribute(attribute, translated);
    }
  }
}

export function splitWebTranslation(
  t: WebTranslate,
  key: WebMessageKey,
  placeholder: string,
  values: WebMessageValues = {},
): readonly [before: string, after: string] {
  const marker = `\u0000t3-${placeholder}\u0000`;
  const message = t(key, { ...values, [placeholder]: marker });
  const markerIndex = message.indexOf(marker);
  return markerIndex === -1
    ? [message, ""]
    : [message.slice(0, markerIndex), message.slice(markerIndex + marker.length)];
}

export function WebI18nProvider({ children }: { readonly children: ReactNode }) {
  const appLocale = useClientSettings((settings) => settings.appLocale);
  const updateClientSettings = useUpdateClientSettings();
  const [runtimeLocales, setRuntimeLocales] = useState(readRuntimeLocales);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleLanguageChange = () => setRuntimeLocales(readRuntimeLocales());
    window.addEventListener("languagechange", handleLanguageChange);
    return () => window.removeEventListener("languagechange", handleLanguageChange);
  }, []);

  const locale = resolveAppLocale(appLocale, runtimeLocales);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.lang = locale;
    localizeDom(locale);
    if (locale === "en" || typeof MutationObserver === "undefined") return;
    const observer = new MutationObserver(() => localizeDom(locale));
    observer.observe(document.body, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: ["aria-label", "title", "placeholder"],
    });
    return () => observer.disconnect();
  }, [locale]);

  const setAppLocale = useCallback(
    (nextLocale: AppLocalePreference) => updateClientSettings({ appLocale: nextLocale }),
    [updateClientSettings],
  );
  const t = useCallback<WebTranslate>(
    (key, values) => translateWebMessage(locale, key, values),
    [locale],
  );
  const value = useMemo<WebI18nContextValue>(
    () => ({ appLocale, locale, setAppLocale, t }),
    [appLocale, locale, setAppLocale, t],
  );

  return <WebI18nContext value={value}>{children}</WebI18nContext>;
}

/** English remains available when a standalone component test omits the provider. */
export function useI18n(): WebI18nContextValue {
  return useContext(WebI18nContext);
}
