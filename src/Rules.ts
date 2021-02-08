import { CommandModule } from '#root/CommandModule';
import { RuleFunction } from '#type/RuleFunction';

/**
 * Container class that holds rules for controlling command execution or
 * modifying command execution behavior. All rules in this class can also
 * be imported directly by name via `@discord-samba/command/rules`
 */
export class Rules
{
	/**
	 * This rule disallows bots
	 */
	public static disallowBots: RuleFunction = (ctx, next) =>
	{
		if (ctx.message.author.bot)
			return;

		next();
	};

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
}

/** @private */
export const disallowBots: RuleFunction = Rules.disallowBots;

/** @private */
export const checkMentionPrefix: RuleFunction = Rules.checkMentionPrefix;
