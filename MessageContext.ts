import { Client, Message } from 'discord.js';

/**
 * Context for a sent Message. This context will be given to rules to help determine
 * if a command should be run
 */
export class MessageContext<T extends Client = Client>
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
	 * The content of the message that will be parsed for the command
	 * and arguments. This can be modified by rules to affect what will
	 * be parsed (to strip a prefix, for example)
	 */
	public content: string;

	/**
	 * Whether or not a prefix was used. Should be set by rules that check
	 * for prefixes (which would then strip the used prefix from
	 * [[`MessageContext.content | content`]])
	 */
	public prefixUsed: boolean;

	public constructor(client: T, message: Message)
	{
		this.client = client;
		this.message = message;
		this.content = message.content;
		this.prefixUsed = false;
	}
}
