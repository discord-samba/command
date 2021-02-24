/**
 * Represents any custom error class that extends Error
 * @internal
 */
export type CustomErrorConstructor = new <T extends Error>(...args: any[]) => T;
