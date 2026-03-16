// Text formatting utilities

/**
 * Capitalizes the first letter of each word in a string
 * @param text - The input text
 * @returns Text with first letter of each word capitalized
 */
export const capitalizeWords = (text: string): string => {
  return text
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Capitalizes only the first letter of the entire string
 * @param text - The input text
 * @returns Text with only the first letter capitalized
 */
export const capitalizeFirst = (text: string): string => {
  if (!text) return text;
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

/**
 * Formats a name properly (capitalizes each word)
 * @param name - The input name
 * @returns Properly formatted name
 */
export const formatName = (name: string): string => {
  return capitalizeWords(name.trim());
};

/**
 * Handles input change with automatic name formatting
 * @param value - The input value
 * @param setter - The state setter function
 */
export const handleNameInput = (value: string, setter: (value: string) => void): void => {
  const formatted = formatName(value);
  setter(formatted);
};