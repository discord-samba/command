import { CommandArgumentKind } from '#type/CommandArgumentKind';
import { ICommandArgumentKindOperand } from '#parse/interfaces/ICommandArgumentKindOperand';

/**
 * Represents an uncompiled operand argument as parsed from the input.
 * Will have no identifier if not declared in the spec
 * @internal
 */
export class CommandArgKindImplOperand implements ICommandArgumentKindOperand
{
	public kind: CommandArgumentKind = CommandArgumentKind.Operand;
	public index: number;
	public type: string;
	public value: string;
	public ident?: string;

	public constructor(index: number, type: string, value: string, ident?: string)
	{
		this.index = index;
		this.type = type;
		this.value = value;
		this.ident = ident;
	}
}
