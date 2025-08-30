export const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);

    return {
      success: true,
      text,
    };
  } catch (e) {
    return {
      success: false,
      error: e,
    };
  }
};
