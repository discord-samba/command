import { CommandArgKindImplFlag } from '#parse/commandArgKindImpl/CommandArgKindImplFlag';
import { CommandArgKindImplOperand } from '#parse/commandArgKindImpl/CommandArgKindImplOperand';
import { CommandArgKindImplOption } from '#parse/commandArgKindImpl/CommandArgKindImplOption';

/**
 * Represents a parsed argument node which will later be compiled into
 * an actual argument to be given to the command it's associated with
 */
export type ArgumentParseNode =
	| CommandArgKindImplOperand
	| CommandArgKindImplFlag
	| CommandArgKindImplOption;
