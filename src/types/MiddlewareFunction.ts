import { CommandContext } from '#root/CommandContext';

/**
 * Represents a middleware function for a specific command that can
 * modify command dispatch behavior, enforce an execution rule,
 * transform or add arguments, etc. Will be run after the arguments
 * have been parsed
 */
export type MiddlewareFunction = (commandContext: CommandContext, next: Function) => void;
