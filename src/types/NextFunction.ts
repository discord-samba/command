import { Result } from '#root/Result';

/**
 * Represents a the `next` function that is given to Command Rules and Middleware
 * that will call the next Rule/Middleware in sequence to continue execution. Will
 * cancel execution if given [[`Result.cancel | Result.cancel()`]] or [[`Result.err
 * | Result.err()`]]. [[`Result.ok | Result.ok()`]] will allow Rules/Middleware/dispatch
 * to continue. Defaults to `Result.ok()` if no `Result` is passed
 */
export type NextFunction = (result?: Result) => void;
