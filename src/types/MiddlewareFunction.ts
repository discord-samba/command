import { CommandContext } from '#root/CommandContext';
import { NextFunction } from './NextFunction';

/**
 * Represents a middleware function for a specific command that can modify command
 * dispatch behavior, enforce an execution rule, transform or add arguments, etc.
 * Will be run after arguments have been parsed.
 *
 * A middleware function must call `next()` in order for command execution to progress.
 * If `next()` is not called, execution of the command will halt silently
 */
export type MiddlewareFunction = (commandContext: CommandContext, next: NextFunction) => void;
