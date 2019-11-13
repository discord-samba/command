import { CommandArgumentKind } from '../../types/CommandArgumentKind';
import { ICommandArgumentKindOperand } from '../interfaces/ICommandArgumentKindOperand';

/**
 * Represents an operand as parsed from the input. If it has no identifier
 * then it was not declared
 * @private
 */
export class CommandArgKindImplOperand implements ICommandArgumentKindOperand
{
	public kind: CommandArgumentKind = CommandArgumentKind.Operand;
	public type: string;
	public value: string;
	public ident?: string;

	public constructor(type: string, value: string, ident?: string)
	{
		this.type = type;
		this.value = value;
		this.ident = ident;
	}
}
