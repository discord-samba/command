import { CommandArgKindImplOperand } from '#parse/commandArgKindImpl/CommandArgKindImplOperand';
import { CommandArgKindImplOption } from '#parse/commandArgKindImpl/CommandArgKindImplOption';
import { CommandArgKindImplOptionArgument } from '#parse/commandArgKindImpl/CommandArgKindImplOptionArgument';

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
