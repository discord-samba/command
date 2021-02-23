import { MessageContext } from '#root/MessageContext';
import { NextFunction } from './NextFunction';

/**
 * Represents a function that enforces a command dispatch rule
 * or modifies dispatch behavior
 */
export type RuleFunction = (messageContext: MessageContext, next: NextFunction) => void;
