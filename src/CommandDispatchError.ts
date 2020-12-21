import { Command } from '#root/Command';
import { CommandContext } from '#root/CommandContext';
import { CommandDispatchErrorKind } from '#type/CommandDispatchErrorKind';

/**
 * Represents an error encountered while dispatching a called Command.
 * Holds an error kind and the Command that triggered the error
 */
export class CommandDispatchError
{
	/**
	 * The kind of dispatch error encountered
	 */
	public kind: CommandDispatchErrorKind;

	/**
	 * The Command called that triggered the dispatch error
	 */
	public command: Command;

	/**
	 * The CommandContext that would have been given to the Command call that
	 * triggered the dispatch error
	 */
	public commandCtx: CommandContext;

	public constructor(kind: CommandDispatchErrorKind, command: Command, commandCtx: CommandContext)
	{
		this.kind = kind;
		this.command = command;
		this.commandCtx = commandCtx;

		// TODO: Include some sort of additional context for the error. For example,
		//       client permission errors will need to have the permissions that were
		//       expected or nothing meaningful can be reported. Same for user perms.
	}
}
