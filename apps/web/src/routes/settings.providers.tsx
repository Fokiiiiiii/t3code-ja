import { createFileRoute } from "@tanstack/react-router";
import { EnvironmentId, ProviderInstanceId } from "@t3tools/contracts";

import { ProviderSettingsPanel } from "../components/settings/ProviderSettingsPanel";
import { useSettingsScope } from "../components/settings/SettingsScopeContext";
import { useI18n } from "../i18n/WebI18nProvider";
import { translateWebSource } from "../i18n/messages";

/**
 * Providers are machine state, so the page shows one environment at a time:
 * the chosen one, or the representative of the selection. A project crumb
 * narrows the candidates to the environments that project is registered on.
 */
function SettingsProvidersRoute() {
  const { locale } = useI18n();
  const localize = (value: string) => translateWebSource(locale, value);
  const target = Route.useSearch();
  const { environment, scope } = useSettingsScope();
  if (!environment) {
    return (
      <p className="p-8 text-sm text-muted-foreground">
        {scope.kind === "environment"
          ? `${localize("Reconnect")} ${scope.label} ${localize("to set up its providers.")}`
          : localize("Connect an environment to set up its providers.")}
      </p>
    );
  }
  return (
    <ProviderSettingsPanel
      environmentId={environment.environmentId}
      {...(target.instanceId ? { instanceId: target.instanceId } : {})}
      scoped
    />
  );
}

export const Route = createFileRoute("/settings/providers")({
  validateSearch: (raw: Record<string, unknown>) => ({
    ...(typeof raw.environmentId === "string" && raw.environmentId.trim()
      ? { environmentId: EnvironmentId.make(raw.environmentId) }
      : {}),
    ...(typeof raw.instanceId === "string" && raw.instanceId.trim()
      ? { instanceId: ProviderInstanceId.make(raw.instanceId) }
      : {}),
  }),
  component: SettingsProvidersRoute,
});
