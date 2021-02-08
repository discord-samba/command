import { BooleanResolver } from '#resolve/resolvers/BooleanResolver';
import { Client } from 'discord.js';
import { CommandCache } from '#root/CommandCache';
import { CommandDispatcher } from '#root/CommandDispatcher';
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
	 * prevent commands from running if some rule does not set
	 * [[`MessageContext.prefixUsed`]] to `true` (presumably because a prefix was
	 * used)
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
	 * Register your client instance with the command module. This will register
	 * it with the command dispatcher so that it may begin handling commands
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
}

CommandModule.meta.set(Meta.EnforcePrefixes, false);

CommandModule.resolvers.add(StringResolver);
CommandModule.resolvers.add(NumberResolver);
CommandModule.resolvers.add(BooleanResolver);
