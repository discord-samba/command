import { CommandArgumentKind } from '#type/CommandArgumentKind';
import { ICommandArgumentKindOption } from '#parse/interfaces/ICommandArgumentKindOption';

/**
 * Represents an uncompiled option argument as parsed from the input
 */
export class CommandArgKindImplOption implements ICommandArgumentKindOption
{
	public kind: CommandArgumentKind = CommandArgumentKind.Option;
	public index: number;
	public ident: string;
	public type: string;
	public value!: string;
	public long?: string;

	public constructor(index: number, ident: string, type: string, long?: string)
	{
		this.index = index;
		this.ident = ident;
		this.type = type;
		this.long = long;
	}
}
