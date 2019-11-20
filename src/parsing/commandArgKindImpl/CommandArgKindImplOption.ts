import { CommandArgumentKind } from '../../types/CommandArgumentKind';
import { ICommandArgumentKindOption } from '../interfaces/ICommandArgumentKindOption';

/**
 * @private
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
