import { CommandArgumentKind } from '#type/CommandArgumentKind';
import { ICommandArgumentKindOption } from '#parse/interfaces/ICommandArgumentKindOption';

/**
 * Represents an uncompiled option as parsed from the input
 * @internal
 */
export class CommandArgKindImplOption implements ICommandArgumentKindOption
{
	public kind: CommandArgumentKind = CommandArgumentKind.Option;
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
