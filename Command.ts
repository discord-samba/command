import { Client } from 'discord.js';
import { CommandArgumentSpec } from '#root/CommandArgumentSpec';
import { CommandContext } from '#root/CommandContext';

/**
 * The base Command class you will extend when creating Commands for your
 * Discord Client
 */
export abstract class Command<T extends Client = Client>
{
	public readonly name: string;
	public readonly aliases: string[];
	public readonly arguments: CommandArgumentSpec;

	public constructor(name: string, ...aliases: string[])
	{
		this.name = name;
		this.aliases = aliases;
		this.arguments = new CommandArgumentSpec();
	}

	/**
	 * Commands may implement an init() method that can be used to set up
	 * any resources the command may need to utilize at runtime. The init
	 * method will be called after the client is ready and will be passed
	 * the client instance for use if needed.
	 */
	public init(_client: T): void | Promise<void> {}

	/**
	 * Commands must implement an action method which will be executed
	 * when the command is called via Discord. The action method will
	 * be given a [[CommandContext]] object when called
	 */
	public abstract action(ctx: CommandContext<T>): void | Promise<void>;
}
