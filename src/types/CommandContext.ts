import { Client, Message } from 'discord.js';

/**
 * Represents the context in which a Command is called. Contains the Client instance,
 * the Message that triggered the Command, and the arguments (`<CommandContext>.args`)
 * parsed from the Message content
 */
export interface CommandContext<T extends Client = Client>
{
	client: T;
	message: Message;

	// TODO: Use CommandArgument class here when it is completed
	args: any[];
}
