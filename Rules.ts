import { CommandModule } from '#root/CommandModule';
import { Meta } from './Meta';
import { RuleFunction } from '#type/RuleFunction';

/**
 * Container class that holds rules for controlling command execution or modifying
 * command execution behavior. All rules in this class can also be imported directly
 * by name from `@discord-samba/command/rules`
 */
export class Rules
{
	/**
	 * This rule disallows bots from calling commands
	 */
	public static disallowBots: RuleFunction = (ctx, next) =>
	{
		if (ctx.message.author.bot)
			return;

		next();
	};

	/**
	 * This rule will check for a mention prefix on messages. Using this rule will
	 * enforce the usage of prefixes for all commands (except those triggered by
	 * regular expression or function trigger), but the check for whether a prefix
	 * was used does not occur until all rules have been run, so this rule will not
	 * interrupt command execution. This allows you to use additional rules to check
	 * for different kinds of prefixes as well. As long as at least one rule sets
	 * [[`MessageContext.prefixUsed | MessageContext#prefixUsed`]] to `true` then
	 * the command will succeed (provided all other rules have passed as well)
	 */
	public static checkMentionPrefix: RuleFunction = (ctx, next) =>
	{
		CommandModule.enforcePrefixes();

		if (!ctx.client.user)
			return;

		const prefixes: string[] = [
			`<@${ctx.client.user.id}>`,
			`<@!${ctx.client.user.id}>`
		];

		const prefix: string | undefined = prefixes.find(a => ctx.content.trim().startsWith(a));

		if (typeof prefix === 'undefined')
			return next();

		ctx.prefixUsed = true;
		ctx.content = ctx.content.slice(prefix.length).trim();
		next();
	};

	/**
	 * This rule sets the provided user IDs as owners that are allowed to call
	 * commands that are marked as owner-only. This rule must be paired with the
	 * command middleware [[`Middleware.ownerOnly`]] which will make use of the
	 * owner IDs set by this rule.
	 *
	 * ***NOTE:*** *This rule will only take effect the first time it is passed
	 * so be sure to include all owners you want to allow when setting this rule*
	 */
	public static allowOwner(...owners: string[]): RuleFunction
	{
		return (_, next) =>
		{
			if (!CommandModule.meta.has(Meta.Owner))
				CommandModule.meta.set(Meta.Owner, owners);

			next();
		};
	}
}

/** @private */
export const disallowBots: RuleFunction = Rules.disallowBots;

/** @private */
export const checkMentionPrefix: RuleFunction = Rules.checkMentionPrefix;

/** @private */
export const allowOwner: (...owners: string[]) => RuleFunction = Rules.allowOwner;
