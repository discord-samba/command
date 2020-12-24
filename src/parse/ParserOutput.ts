import { CommandArgKindImplFlag } from '#parse/commandArgKindImpl/CommandArgKindImplFlag';
import { CommandArgKindImplOperand } from '#parse/commandArgKindImpl/CommandArgKindImplOperand';
import { CommandArgKindImplOptionArgument } from '#parse/commandArgKindImpl/CommandArgKindImplOptionArgument';

/**
 * Container class for the argument values parsed from Command input
 * @internal
 */
export class ParserOutput
{
	public operands: CommandArgKindImplOperand[] = [];
	public flags: CommandArgKindImplFlag[] = [];
	public optionArguments: CommandArgKindImplOptionArgument[] = [];
}
