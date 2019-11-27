import { CommandArgKindImplOperand } from './commandArgKindImpl/CommandArgKindImplOperand';
import { CommandArgKindImplOption } from './commandArgKindImpl/CommandArgKindImplOption';
import { CommandArgKindImplOptionArgument } from './commandArgKindImpl/CommandArgKindImplOptionArgument';

/**
 * Container class for the argument values parsed from Command input
 * @internal
 */
export class ParserOutput
{
	public operands: CommandArgKindImplOperand[] = [];
	public options: CommandArgKindImplOption[] = [];
	public optionArguments: CommandArgKindImplOptionArgument[] = [];
}
