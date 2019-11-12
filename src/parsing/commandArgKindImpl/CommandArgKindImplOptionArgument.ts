import { CommandArgumentKind } from '../../types/CommandArgumentKind';
import { CommandArgumentOptionArgument } from '../../types/CommandArgumentOptionArgument';

/**
 * @private
 */
export class CommandArgKindImplOptionArgument implements CommandArgumentOptionArgument
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
