import { AppText } from "./AppText";
import { Card } from "./Card";
import { View } from "react-native";

export interface StatProps {
  label: string;
  value: string;
  caption?: string;
}

export function Stat({ label, value, caption }: StatProps) {
  return (
    <Card>
      <View accessible accessibilityLabel={[label, value, caption].filter(Boolean).join(", ")}>
        <AppText variant="caption" color="muted">
          {label}
        </AppText>
        <AppText variant="heading">{value}</AppText>
        {caption !== undefined && (
          <AppText variant="caption" color="muted">
            {caption}
          </AppText>
        )}
      </View>
    </Card>
  );
}
