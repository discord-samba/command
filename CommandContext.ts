import { Client, DMChannel, Message, NewsChannel, TextChannel, User } from 'discord.js';
import { CommandArguments } from '#argument/CommandArguments';

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
	 * The user that triggered the Command
	 */
	public author: User;

	/**
	 * The parsed arguments that your Command received when called
	 */
	public args: CommandArguments;

	public constructor(client: T, message: Message, args: CommandArguments)
	{
		this.client = client;
		this.message = message;
		this.author = message.author;
		this.args = args;
	}

	/**
	 * Utility function to get the channel the context message was sent in while
	 * allowing the passing of a channel type parameter to clean up channel
	 * typecasting (which can be a bother and often looks bad).
	 *
	 * Consider the following:
	 * ```ts
	 * const authorPerms: Readonly<Permissions> = (ctx.message.channel as TextChannel)
	 *     .permissionsFor?.(ctx.message.author) ?? new Permissions();
	 * ```
	 * compared to:
	 * ```ts
	 * const authorPerms: Readonly<Permissions> = ctx
	 *     .channel<TextChannel>()
	 *     .permissionsFor?.(ctx.message.author) ?? new Permissions();
	 * ```
	 * Doesn't the second implementation look much cleaner? I sure think so! What?
	 * Function call overhead? Perf? What are those??
	 */
	public channel<U extends DMChannel | TextChannel | NewsChannel>(): U
	public channel(): DMChannel | TextChannel | NewsChannel
	{
		return this.message.channel;
	}
}
