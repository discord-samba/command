import { Command } from './Command';
import { CommandDispatchErrorKind } from './types/CommandDispatchErrorKind';

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
	 * The Command that triggered the dispatch error
	 */
	public command: Command;

	public constructor(kind: CommandDispatchErrorKind, command: Command)
	{
		this.kind = kind;
		this.command = command;
	}
}
