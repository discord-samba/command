/**
 * Represents any custom error class that extends Error
 * @internal
 */
export type CustomErrorConstructor<T extends Error> = new (...args: any[]) => T;
