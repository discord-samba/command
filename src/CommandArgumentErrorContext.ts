import { CommandArgumentKind } from './types/CommandArgumentKind';

/**
 * Represents the context for a [[CommandArgumentError]]
 */
export class CommandArgumentErrorContext
{
	/**
	 * The kind of argument that resulted in the error
	 */
	public kind: CommandArgumentKind;

	/**
	 * The identifier of the argument that resulted in the error
	 */
	public ident: string;

	/**
	 * The type that was attempted to be resolved
	 */
	public type: string;

	/**
	 * The value given that resulted in the error. In the case of MissingRequiredArgument
	 * errors, this will be undefined
	 */
	public value?: string;

	/**
	 * Extra data associated with the error. This will only be populated in the
	 * case of ArgumentResolutionError and will be populated with data specific
	 * to the kind of Resolver that was used
	 *
	 * - User, GuildMember, BannedUser, Role, Channel:
	 *   - If `data` length is 0, nothing was found
	 *   - If `data` length >= 1, multiple results were found and will be present as strings in the array
	 */
	public data?: any[];

	public constructor(kind: CommandArgumentKind, ident: string, type: string, value?: string, data?: any[])
	{
		this.kind = kind;
		this.ident = ident;
		this.type = type;
		this.value = value;
		this.data = data ?? [];
	}
}
