import { CommandArgumentKind } from '#type/CommandArgumentKind';
import { ICommandArgumentKindFlag } from '#parse/interfaces/ICommandArgumentKindFlag';

/**
 * Represents an uncompiled flag argument as parsed from the input
 * @internal
 */
export class CommandArgKindImplFlag implements ICommandArgumentKindFlag
{
	public kind: CommandArgumentKind = CommandArgumentKind.Flag;
	public ident: string;
	public long?: string;

	public constructor(ident: string, long?: string)
	{
		this.ident = ident;
		this.long = long;
	}
}
