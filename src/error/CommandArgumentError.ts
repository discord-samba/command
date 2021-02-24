import { CommandArgumentErrorContext } from '#error/CommandArgumentErrorContext';
import { CommandArgumentErrorKind } from '#error/CommandArgumentErrorKind';

/**
 * Represents an error encountered while compiling Command arguments at call-time.
 * Holds an error kind, and a context object containing all the information available
 * that you can use to build an error message of some kind to send to Discord
 */
export class CommandArgumentError extends Error
{
	/**
	 * The kind of command argument error encountered
	 */
	public kind: CommandArgumentErrorKind;

	/**
	 * Context for the error
	 */
	public context: CommandArgumentErrorContext;

	public constructor(errorKind: CommandArgumentErrorKind, context: CommandArgumentErrorContext)
	{
		super();
		this.kind = errorKind;
		this.context = context;
	}
}
