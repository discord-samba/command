import { CustomErrorConstructor } from './CustomErrorConstructor';

/** @internal */
export type ErrorMatcher = [CustomErrorConstructor<any>, Function];
