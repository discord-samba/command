import { MessageContext } from '#root/MessageContext';

/**
 * Represents a function that enforces a command dispatch rule
 * or modifies dispatch behavior
 */
export type RuleFunction = (messageContext: MessageContext, next: Function) => void;
