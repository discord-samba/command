import { CommandArgumentKind } from '#type/CommandArgumentKind';

/**
 * Container class for data to be used for argument resolution within [[Resolver]]s
 */
export class ArgumentContext
{
	/**
	 * The argument kind
	 */
	public kind: CommandArgumentKind;

	/**
	 * The identifier for the argument
	 */
	public ident: string;

	/**
	 * The value given to be resolved
	 */
	public value: string;

	public constructor(kind: CommandArgumentKind, ident: string, value: string)
	{
		this.kind = kind;
		this.ident = ident;
		this.value = value;
	}
}
