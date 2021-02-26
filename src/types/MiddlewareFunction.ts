import { CommandContext } from '#root/CommandContext';
import { NextFunction } from './NextFunction';

/**
 * Represents a middleware function for a specific command that can modify command
 * dispatch behavior, enforce an execution rule, transform or add arguments, etc.
 * Will be run after arguments have been parsed.
 *
 * A middleware function must call `next()` in order for command execution to progress.
 * If `next()` is not called, execution of the command will halt silently. Middleware
 * functions can also pass [[`Result.cancel | Result.cancel()`]] to `next()` to
 * silently cancel execution.
 *
 * If the middleware is designed to inhibit execution (Like a middleware that dictates
 * what permissions the command caller should have in order to call the command),
 * [[`Result.error | Result.error()`]] should be returned with some type of error that
 * can then be handled by the Command's `onError()` method or the global error handler.
 *
 * ***NOTE:*** *The above is only really important if you are designing a middleware
 * to be used by others and you want others to choose how to handle the result of
 * the middleware. If it's just a middleware for a personal bot, you can just handle
 * the result in the middleware itself (like sending a response to discord, etc.)*
 */
export type MiddlewareFunction = (commandContext: CommandContext, next: NextFunction) => void;
