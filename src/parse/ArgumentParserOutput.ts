import { CommandArgKindImplFlag } from '#parse/commandArgKindImpl/CommandArgKindImplFlag';
import { CommandArgKindImplOperand } from '#parse/commandArgKindImpl/CommandArgKindImplOperand';
import { CommandArgKindImplOption } from '#parse/commandArgKindImpl/CommandArgKindImplOption';
import { CommandArgumentSpec } from '#argument/CommandArgumentSpec';

/**
 * Container class for the argument values parsed from Command input
 * @internal
 */
export class ArgumentParserOutput
{
	public operands: CommandArgKindImplOperand[];
	public flags: CommandArgKindImplFlag[];
	public options: CommandArgKindImplOption[];
	public spec: CommandArgumentSpec;

	public constructor(spec: CommandArgumentSpec)
	{
		this.operands = [];
		this.flags = [];
		this.options = [];
		this.spec = spec;
	}
}
