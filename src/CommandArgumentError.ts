import { CommandArgumentErrorKind } from './types/CommandArgumentErrorKind';
import { CommandArgumentKind } from './types/CommandArgumentKind';

/**
 * Represents an error encountered while compiling Command arguments at call-time.
 * Holds an error kind, an argument kind, and the identifier of the argument that
 * triggered the error
 */
export class CommandArgumentError
{
	/**
	 * The kind of command argument error encountered
	 */
	public error: CommandArgumentErrorKind;

	/**
	 * The kind of argument that triggered the error
	 */
	public kind: CommandArgumentKind;

	/**
	 * The identifier of the argument that triggered the error
	 */
	public ident: string;

	public constructor(errorKind: CommandArgumentErrorKind, argKind: CommandArgumentKind, ident: string)
	{
		this.error = errorKind;
		this.kind = argKind;
		this.ident = ident;
	}
}
