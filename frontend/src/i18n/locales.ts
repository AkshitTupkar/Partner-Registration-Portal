import { en, type Messages } from "./en";

/** Registered languages. Add an entry per translation file. */
export const LOCALES = {
  en: { label: "English", messages: en },
} satisfies Record<string, { label: string; messages: Messages }>;

export type Locale = keyof typeof LOCALES;
