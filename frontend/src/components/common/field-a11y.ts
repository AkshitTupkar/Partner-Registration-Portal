// Id and aria conventions shared by FormField and the controls inside it.

/** Id of the error message a field shows; controls point `aria-describedby` at it. */
export const errorId = (id: string) => `${id}-error`;

/** Id of the help text a field shows when it has no error. */
export const helpId = (id: string) => `${id}-help`;

/** aria props for a control whose FormField may show an error (or, if `hasHelp`, help text). */
export function fieldAriaProps(id: string, error?: string, hasHelp = false) {
  if (error) return { "aria-invalid": true as const, "aria-describedby": errorId(id) };
  return hasHelp ? { "aria-describedby": helpId(id) } : {};
}
