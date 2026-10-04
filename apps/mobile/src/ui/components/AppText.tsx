import { Text, type TextProps } from "react-native";
import { useTheme } from "../theme/ThemeProvider";
import { typography, type ColorTokens, type TypographyVariant } from "../theme/tokens";

export interface AppTextProps extends TextProps {
  variant?: TypographyVariant;
  color?: keyof ColorTokens;
}

/** Text that always follows the type scale, theme and the user's font size setting. */
export function AppText({ variant = "body", color = "text", style, ...rest }: AppTextProps) {
  const { colors } = useTheme();
  return (
    <Text
      allowFontScaling
      {...rest}
      style={[typography[variant], { color: colors[color] }, style]}
    />
  );
}
