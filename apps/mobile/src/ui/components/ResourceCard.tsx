import type { Instant } from "@free/core";
import { useState } from "react";
import { Linking } from "react-native";
import { formatDay, spellDigits } from "../../i18n/format";
import { t } from "../../i18n/it";
import { AppText } from "./AppText";
import { Button } from "./Button";
import { Card } from "./Card";

export interface Resource {
  name: string;
  description: string;
  /** Human readable, e.g. "lun–ven 10:00–16:00". */
  hours?: string;
  phone?: string;
  url?: string;
  source: string;
  verifiedAt: Instant;
}

export interface ResourceCardProps {
  resource: Resource;
  /** Injected for tests; defaults to the platform opener. */
  openUrl?: (url: string) => Promise<unknown>;
}

const defaultOpenUrl = (url: string) => Linking.openURL(url);

export function ResourceCard({ resource, openUrl = defaultOpenUrl }: ResourceCardProps) {
  const [failed, setFailed] = useState(false);
  const { phone, url } = resource;

  const open = async (target: string) => {
    try {
      setFailed(false);
      await openUrl(target);
    } catch {
      setFailed(true);
    }
  };

  return (
    <Card>
      <AppText variant="heading" accessibilityRole="header">
        {resource.name}
      </AppText>
      <AppText>{resource.description}</AppText>
      {resource.hours !== undefined && <AppText color="muted">{resource.hours}</AppText>}
      {phone !== undefined && (
        <Button
          label={t("resource.call", { phone })}
          accessibilityHint={spellDigits(phone)}
          onPress={() => open(`tel:${phone.replace(/\s/g, "")}`)}
        />
      )}
      {url !== undefined && (
        <Button label={t("resource.open")} variant="secondary" onPress={() => open(url)} />
      )}
      {failed && (
        <AppText color="warning" accessibilityRole="alert" selectable>
          {t("resource.openFailed", { phone: phone ?? url ?? "" })}
        </AppText>
      )}
      <AppText variant="caption" color="muted">
        {t("resource.verified", { source: resource.source, date: formatDay(resource.verifiedAt) })}
      </AppText>
    </Card>
  );
}
