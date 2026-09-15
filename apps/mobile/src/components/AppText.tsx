import {
  Text as RNText,
  TextInput as RNTextInput,
  type TextInputProps as RNTextInputProps,
  type TextProps as RNTextProps,
} from "react-native";

import { Children } from "react";

import { useMobileI18n } from "../i18n/MobileI18nProvider";
import { cn } from "../lib/cn";

export type AppTextProps = RNTextProps & { readonly className?: string };

/**
 * Thin wrapper around RN Text with default font-family and foreground color.
 * Uses Uniwind className — no manual style parsing.
 */
export function AppText({ className, ...props }: AppTextProps) {
  const { t } = useMobileI18n();
  const children = Children.map(props.children, (child) =>
    typeof child === "string" ? t(child) : child,
  );
  return (
    <RNText className={cn("font-sans text-foreground", className)} {...props}>
      {children}
    </RNText>
  );
}

export type AppTextInputProps = Omit<RNTextInputProps, "placeholderTextColor"> & {
  readonly className?: string;
  readonly ref?: React.Ref<RNTextInput>;
};

/**
 * Thin wrapper around RN TextInput with default input styling.
 * Uses Uniwind className — no manual style parsing.
 */
export function AppTextInput({ className, ref, ...props }: AppTextInputProps) {
  const { t } = useMobileI18n();
  return (
    <RNTextInput
      ref={ref}
      className={cn(
        "min-h-13.5 rounded-2xl border border-input-border bg-input px-3.5 py-3 font-sans text-base text-foreground",
        className,
      )}
      placeholderTextColorClassName="accent-placeholder"
      selectionColorClassName="accent-foreground-secondary"
      cursorColorClassName="accent-foreground-secondary"
      {...props}
      placeholder={props.placeholder ? t(props.placeholder) : props.placeholder}
    />
  );
}
