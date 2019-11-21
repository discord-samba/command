import { Client, Message } from 'discord.js';
import { CommandArguments } from './CommandArguments';

/**
 * Represents the context in which a Command is called
 */
export class CommandContext<T extends Client = Client>
{
	/**
	 * The Client instance your Command is registered with
	 */
	public client: T;

	/**
	 * The Discord.js Message that triggered the Command
	 */
	public message: Message;

	/**
	 * The parsed arguments that your Command received when called
	 */
	public args: CommandArguments;

	public constructor(client: T, message: Message, args: CommandArguments)
	{
		this.client = client;
		this.message = message;
		this.args = args;
	}
}
