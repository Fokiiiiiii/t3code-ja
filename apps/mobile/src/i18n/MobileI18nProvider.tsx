import { useAtomSet, useAtomValue } from "@effect/atom-react";
import { AsyncResult } from "effect/unstable/reactivity";
import { AppState, I18nManager, NativeModules, Platform } from "react-native";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { resolveAppLocale, type ResolvedAppLocale } from "@t3tools/shared/appLocale";
import type { AppLocalePreference } from "@t3tools/contracts/settings";
import { mobilePreferencesAtom, updateMobilePreferencesAtom } from "../state/preferences";
import { translateMobileText, type MobileTranslate } from "./mobileMessages";

export interface MobileI18nContextValue {
  readonly appLocale: AppLocalePreference;
  readonly locale: ResolvedAppLocale;
  readonly setAppLocale: (locale: AppLocalePreference) => void;
  readonly t: MobileTranslate;
}

const defaultValue: MobileI18nContextValue = {
  appLocale: "system",
  locale: "en",
  setAppLocale: () => undefined,
  t: (text) => text,
};

const MobileI18nContext = createContext(defaultValue);

function nativeRuntimeLocales(): ReadonlyArray<string> {
  const locales: string[] = [];
  const reactNativeLocale = I18nManager.getConstants().localeIdentifier;
  if (reactNativeLocale) locales.push(reactNativeLocale);
  const platformConstants = Platform.constants as unknown as Record<string, unknown>;
  const platformLocale = platformConstants.localeIdentifier;
  if (typeof platformLocale === "string") locales.push(platformLocale);

  const settingsManager = NativeModules.SettingsManager as
    | { readonly settings?: Record<string, unknown> }
    | undefined;
  const settings = settingsManager?.settings;
  if (Platform.OS === "ios" && settings) {
    const locale = settings.AppleLocale;
    if (typeof locale === "string") locales.push(locale);
    const languages = settings.AppleLanguages;
    if (Array.isArray(languages)) {
      for (const language of languages) {
        if (typeof language === "string") locales.push(language);
      }
    }
  }

  try {
    const locale = Intl.DateTimeFormat().resolvedOptions().locale;
    if (locale) locales.push(locale);
  } catch {
    return locales;
  }
  return locales;
}

export function MobileI18nProvider(props: { readonly children: ReactNode }) {
  const preferencesResult = useAtomValue(mobilePreferencesAtom);
  const savePreferences = useAtomSet(updateMobilePreferencesAtom);
  const appLocale = AsyncResult.isSuccess(preferencesResult)
    ? (preferencesResult.value.appLocale ?? "system")
    : "system";
  const [runtimeLocales, setRuntimeLocales] = useState(nativeRuntimeLocales);

  useEffect(() => {
    const refresh = () => setRuntimeLocales(nativeRuntimeLocales());
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") refresh();
    });
    return () => subscription.remove();
  }, []);

  const locale = resolveAppLocale(appLocale, runtimeLocales);
  const setAppLocale = useCallback(
    (nextLocale: AppLocalePreference) => savePreferences({ appLocale: nextLocale }),
    [savePreferences],
  );
  const t = useCallback<MobileTranslate>((text) => translateMobileText(locale, text), [locale]);
  const value = useMemo(
    () => ({ appLocale, locale, setAppLocale, t }),
    [appLocale, locale, setAppLocale, t],
  );

  return <MobileI18nContext.Provider value={value}>{props.children}</MobileI18nContext.Provider>;
}

export function useMobileI18n(): MobileI18nContextValue {
  return useContext(MobileI18nContext);
}
