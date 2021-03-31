import { BooleanResolver } from '#resolve/resolvers/BooleanResolver';
import { Client } from 'discord.js';
import { CommandCache } from '#root/CommandCache';
import { CommandDispatcher } from '#root/CommandDispatcher';
import { ErrorHandler } from '#error/ErrorHandler';
import { Meta } from '#root/Meta';
import { NumberResolver } from '#resolve/resolvers/NumberResolver';
import { ResolverCache } from '#resolve/ResolverCache';
import { RuleCache } from '#root/RuleCache';
import { StringResolver } from '#resolve/resolvers/StringResolver';

export class CommandModule
{
	/**
	 * Holds all argument resolvers
	 */
	public static resolvers: typeof ResolverCache = ResolverCache;

	/**
	 * Holds all commands
	 */
	public static commands: typeof CommandCache = CommandCache;

	/**
	 * Holds all command module rules. Rules are run for all commands
	 */
	public static rules: typeof RuleCache = RuleCache;

	/**
	 * A metadata cache used by the command module for tracking internal things.
	 * Can be used for anything
	 */
	public static meta: Map<string, any> = new Map();

	/**
	 * Tells the command module to enforce usage of prefixes in commands. This will
	 * prevent commands from running if some rule does not set [[`MessageContext.prefixUsed`]]
	 * to `true` (presumably because a prefix was used)
	 *
	 * ***NOTE:*** *The `checkMentionPrefix` rule will call this automatically when
	 * it is run. If you write your own prefix rule, be sure to call this somewhere
	 * within the rule function*
	 */
	public static enforcePrefixes(): void
	{
		CommandModule.meta.set(Meta.EnforcePrefixes, true);
	}

	/**
	 * Finalize argument bindings for all loaded commands. Should be called at any
	 * point after all desired commands have been loaded but before commands are
	 * allowed to be run (e.g. before calling `<Client>#login()`)
	 */
	public static finalizeCommandArgBindings(): void
	{
		for (const command of CommandModule.commands.all())
			command.arguments.finalizeBindings();
	}

	/**
	 * Register your client instance with the command module. This will initialize
	 * all loaded commands and register the client with the Command dispatcher once
	 * the client emits the [`ready`](https://discord.js.org/#/docs/main/stable/class/Client?scrollTo=e-ready)
	 * event
	 */
	public static registerClient(client: Client): void
	{
		client.on('ready', async () =>
		{
			await Promise.all(
				Array.from(CommandModule.commands.all()).map(c => c.init(client))
			);

			CommandDispatcher.registerClient(client);
		});
	}

	/**
	 * Sets the global error handler that will be used for handling Rule errors
	 * and any middleware/command errors that are not handled by individual Command
	 * error handling methods.
	 *
	 * If called without an [[`ErrorHandler`]] argument, a blank error handler will
	 * be generated and cached. You can fetch it with [[`getGlobalErrorHandler`]]
	 * to append/override error matchers at a later time.
	 *
	 * Global error handlers will be given a [[`MessageContext`]] or [[`CommandContext`]]
	 * object if the error being given is from Rules or Middleware respectively.
	 * Additionally, a [[`CommandContext`]] object will be given if an error is
	 * thrown during argument parsing, resolving, or if there was an uncaught error
	 * in a command action. You can reasonably expect the context objects to be
	 * present for the following error types:
	 *
	 * - [[ArgumentParseError]]
	 * - [[CommandArgumentError]]
	 * - [[CommandDispatchError]]
	 */
	public static registerGlobalErrorHandler(handler?: ErrorHandler): void
	{
		CommandModule.meta.set(Meta.GlobalErrorHandler, handler ?? new ErrorHandler());
	}

	/**
	 * Returns the currently registered global [[`ErrorHandler`]]. Will create, cache,
	 * and return a new one if one does not already exist
	 */
	public static getGlobalErrorHandler(): ErrorHandler
	{
		if (!CommandModule.meta.has(Meta.GlobalErrorHandler))
			CommandModule.meta.set(Meta.GlobalErrorHandler, new ErrorHandler());

		return CommandModule.meta.get(Meta.GlobalErrorHandler);
	}
}

CommandModule.meta.set(Meta.EnforcePrefixes, false);

CommandModule.resolvers.add(StringResolver);
CommandModule.resolvers.add(NumberResolver);
CommandModule.resolvers.add(BooleanResolver);
