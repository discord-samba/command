import { Client } from 'discord.js';
import { CommandArgumentSpec } from '#root/argument/CommandArgumentSpec';
import { CommandContext } from '#root/CommandContext';
import { CommandOptions } from '#type/CommandOptions';
import { MessageContext } from '#root/MessageContext';
import { MiddlewareCache } from '#root/MiddlewareCache';

/**
 * The base Command class you will extend when creating Commands for your
 * Discord Client
 */
export abstract class Command<T extends Client = Client>
{
	/**
	 * The name this command can be called by. In the event that a command is marked
	 * as regex-only or trigger-only this will strictly be used as an identifier for
	 * the command in the cache
	 */
	public readonly name: string;

	/**
	 * Aliases this command can be called by
	 */
	public readonly aliases: string[];

	/**
	 * Regular expression that triggers this command. Command regular expressions
	 * are run against the unmodified message content so they are not subject to
	 * prefix restrictions. If a message uses a prefix and that message does not
	 * match the regex, the command will not be run (unless the message would
	 * otherwise call the command by name and the command is not set to regex-only)
	 *
	 * ***NOTE:*** *The first command with a regular expression that matches the input
	 * will be run. The order in which the command regex are checked should be the
	 * order in which the commands are added to the cache. If you use regex in multiple
	 * commands, you should ensure that they do not have overlapping logic such that
	 * no two regular expressions should match for the same message. Otherwise you
	 * will have a command that will never run from its regex.*
	 */
	public readonly regex?: RegExp;

	/**
	 * Whether or not this command will ignore messages that would otherwise call
	 * it by name/alias and thus rely solely on triggering by regular expression
	 */
	public readonly regexOnly: boolean;

	/**
	 * Whether or not this command will ignore messages that would otherwise call
	 * it by name/alias and thus rely solely on the result of the trigger function
	 * for whether or not this command will run
	 */
	public readonly triggerOnly: boolean;

	/**
	 * The specification for this command's arguments. This determines how arguments
	 * will be parsed when the command is triggered
	 */
	public readonly arguments: CommandArgumentSpec;

	/**
	 * Middleware cache for this command. To add a middleware function, see
	 * [[`MiddlewareCache.use | MiddlewareCache#use()`]]
	 */
	public readonly middleware: MiddlewareCache;

	public constructor({ name, aliases, regex, regexOnly, triggerOnly }: CommandOptions)
	{
		this.name = name;
		this.aliases = aliases ?? [];
		this.regex = regex;
		this.regexOnly = regexOnly ?? false;
		this.triggerOnly = triggerOnly ?? false;

		this.arguments = new CommandArgumentSpec();
		this.middleware = new MiddlewareCache();
	}

	/**
	 * Commands may implement a `trigger()` method that triggers this command if it
	 * returns true. This function should strip whatever triggers it from
	 * [[`MessageContext.content | MessageContext#content`]] so that the remainder
	 * can be used as arguments if arguments are desired, otherwise the entierty
	 * of the remaining content (after being potentially modified by rules) will
	 * be parsed as arguments.
	 *
	 * The `trigger` method will receive a [[`MessageContext`]] object when called.
	 *
	 * Commands triggered in this way are not subject to prefix restrictions from
	 * prefix related rules unless you specifically check [[`MessageContext.prefixUsed
	 * | MessageContext#prefixUsed`]] or check for other forms of prefixes in your
	 * trigger logic. Because you have access to both the [[`MessageContext.content
	 * | MessageContext#content`]] and the original (unmodified) `Message` content,
	 * you can choose to rely on prefix mechanics (like relying on the already modified
	 * context content and `prefixUsed`) or ignore them entirely (for example if you
	 * wanted to have a command triggered by natural language rather than traditional
	 * command names/aliases).
	 *
	 * ***NOTE:*** *The first command with a trigger that returns true will be run. The
	 * order in which the command triggers are checked should be the order in which
	 * the commands are added to the cache. If you use triggers in multiple commands,
	 * you should ensure that their trigger conditions do not have overlapping logic
	 * such that no two triggers should return true for the same message. Otherwise
	 * you will have a command that will never run from its trigger.*
	 */
	public trigger(_ctx: MessageContext): Promise<boolean> | boolean
	{
		return false;
	}

	/**
	 * Commands may implement an `init()` method that can be used to set up any
	 * resources the command may need to utilize at runtime. The init method will
	 * be called after the client is ready and will be passed the client instance
	 * for use if needed.
	 *
	 * ***NOTE:*** *All command init methods will be run simultaneously through
	 * `Promise.all()` so race conditions are possible if you have commands
	 * relying on similar resources*
	 */
	public init(_client: T): void | Promise<void> {}

	/**
	 * Commands must implement an action method which will be executed when the
	 * command is called via Discord. The action method will be given a
	 * [[`CommandContext`]] object when called
	 */
	public abstract action(ctx: CommandContext<T>): void | Promise<void>;
}
