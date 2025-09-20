/**
 * Simple utility function to conditionally join class names
 * Replacement for clsx with basic functionality
 */
export function cn(
  ...inputs: (
    | string
    | undefined
    | null
    | boolean
    | { [key: string]: boolean }
  )[]
): string {
  return inputs
    .filter(Boolean)
    .map((input) => {
      if (typeof input === "string") return input;
      if (typeof input === "object" && input !== null) {
        return Object.entries(input)
          .filter(([, value]) => value)
          .map(([key]) => key)
          .join(" ");
      }
      return "";
    })
    .join(" ")
    .trim();
}
