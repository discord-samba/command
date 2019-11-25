import { CommandArgumentErrorContext } from './CommandArgumentErrorContext';
import { CommandArgumentErrorKind } from './types/CommandArgumentErrorKind';

/**
 * Represents an error encountered while compiling Command arguments at call-time.
 * Holds an error kind, and a context object containing all the information available
 * that you can use to build an error message of some kind to send to Discord
 */
export class CommandArgumentError
{
	/**
	 * The kind of command argument error encountered
	 */
	public error: CommandArgumentErrorKind;

	/**
	 * Context for the error
	 */
	public ctx: CommandArgumentErrorContext;

	public constructor(errorKind: CommandArgumentErrorKind, ctx: CommandArgumentErrorContext)
	{
		this.error = errorKind;
		this.ctx = ctx;
	}
}
