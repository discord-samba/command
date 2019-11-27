import { CommandArgumentKind } from '../../types/CommandArgumentKind';
import { ICommandArgumentKindOptionArgument } from '../interfaces/ICommandArgumentKindOptionArgument';

/**
 * Represents an uncompiled option-argument as parsed from the input
 * @internal
 */
export class CommandArgKindImplOptionArgument implements ICommandArgumentKindOptionArgument
{
	public kind: CommandArgumentKind = CommandArgumentKind.OptionArgument;
	public ident: string;
	public type: string;
	public value!: string;
	public long?: string;

	public constructor(ident: string, type: string, long?: string)
	{
		this.ident = ident;
		this.type = type;
		this.long = long;
	}
}
