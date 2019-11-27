import { CommandArgumentKind } from '../../types/CommandArgumentKind';
import { ICommandArgumentKindOption } from '../interfaces/ICommandArgumentKindOption';

/**
 * Represents an uncompiled option argument as parsed from the input
 * @internal
 */
export class CommandArgKindImplOption implements ICommandArgumentKindOption
{
	public kind: CommandArgumentKind = CommandArgumentKind.Option;
	public ident: string;
	public long?: string;

	public constructor(ident: string, long?: string)
	{
		this.ident = ident;
		this.long = long;
	}
}
