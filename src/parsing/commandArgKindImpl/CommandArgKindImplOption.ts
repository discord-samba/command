import { CommandArgumentKind } from '../../types/CommandArgumentKind';
import { CommandArgumentOption } from '../../types/CommandArgumentOption';

/**
 * @private
 */
export class CommandArgKindImplOption implements CommandArgumentOption
{
	public kind: CommandArgumentKind = CommandArgumentKind.Option;
	public ident: string;

	public constructor(ident: string)
	{
		this.ident = ident;
	}
}
