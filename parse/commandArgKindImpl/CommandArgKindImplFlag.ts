import { CommandArgumentKind } from '#type/CommandArgumentKind';
import { ICommandArgumentKindFlag } from '#parse/interfaces/ICommandArgumentKindFlag';

/**
 * Represents an uncompiled flag argument as parsed from the input
 */
export class CommandArgKindImplFlag implements ICommandArgumentKindFlag
{
	public kind: CommandArgumentKind = CommandArgumentKind.Flag;
	public index: number;
	public ident: string;
	public long?: string;

	public constructor(index: number, ident: string, long?: string)
	{
		this.index = index;
		this.ident = ident;
		this.long = long;
	}
}
