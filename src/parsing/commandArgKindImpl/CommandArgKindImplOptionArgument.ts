import { CommandArgumentKind } from '../../types/CommandArgumentKind';
import { ICommandArgumentKindOptionArgument } from '../interfaces/ICommandArgumentKindOptionArgument';

/**
 * @private
 */
export class CommandArgKindImplOptionArgument implements ICommandArgumentKindOptionArgument
{
	public kind: CommandArgumentKind = CommandArgumentKind.OptionArgument;
	public ident: string;
	public type: string;
	public value!: string;

	public constructor(ident: string, type: string)
	{
		this.ident = ident;
		this.type = type;
	}
}
