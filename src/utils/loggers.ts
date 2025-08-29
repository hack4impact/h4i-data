export const logger = {
  info: (message: string) => console.log(`Info: ${message}`),
  error: (message: string) => console.error(`Error: ${message}`),
  warn: (message: string) => console.warn(`Warn:  ${message}`),
  success: (message: string) => console.log(`Log: ${message}`),
};
