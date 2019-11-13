import { CommandArgumentKind } from '../../types/CommandArgumentKind';
import { ICommandArgumentKindOption } from '../interfaces/ICommandArgumentKindOption';

/**
 * @private
 */
export class CommandArgKindImplOption implements ICommandArgumentKindOption
{
	public kind: CommandArgumentKind = CommandArgumentKind.Option;
	public ident: string;

	public constructor(ident: string)
	{
		this.ident = ident;
	}
}
