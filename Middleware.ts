import { PermissionResolvable, Permissions, TextChannel } from 'discord.js';
import { CommandModule } from '#root/CommandModule';
import { Meta } from './Meta';
import { MiddlewareFunction } from '#type/MiddlewareFunction';

/**
 * Container class that holds middleware for controlling command execution or
 * modifying command execution behavior. All middleware in this class can also
 * be imported directly by name from `@discord-samba/command/middleware`
 */
export class Middleware
{
	/**
	 * Prevent command from being called if it is called in a DM
	 */
	public static guildOnly: MiddlewareFunction = (ctx, next) =>
	{
		if (ctx.message.channel.type === 'dm')
			return;

		next();
	};

	/**
	 * Prevent command from being called if the caller is not registered as an owner.
	 * This middleware must be paired with the [[`Rules.allowOwner`]] rule to function
	 */
	public static ownerOnly: MiddlewareFunction = (ctx, next) =>
	{
		const owners: string[] = CommandModule.meta.get(Meta.Owner) ?? [];
		if (owners.includes(ctx.message.author.id))
			next();
	};

	/**
	 * Prevent command from being called if the caller does not have all of the
	 * given permissions for the channel in which the command was called.
	 *
	 * ***NOTE:*** *This middleware should only be used when you can guarantee the
	 * command will be called in a guild context. You can accomplish this by using
	 * the [[`Middleware.guildOnly | guildOnly`]] middleware first*
	 */
	public static callerPermissions(...permissions: PermissionResolvable[]): MiddlewareFunction
	{
		return (context, next) =>
		{
			const authorPerms: Readonly<Permissions> = context
				.channel<TextChannel>()
				.permissionsFor?.(context.message.author) ?? new Permissions();

			const missingPerms: PermissionResolvable = permissions.filter(p => !authorPerms.has(p));

			// TODO: return next(Result.err(...)) with some sort of to-be-implemented
			//       middleware error that includes context data (missing perms)
			if (missingPerms.length > 0)
				return;

			next();
		};
	}

	/**
	 * Prevent command from being called if the client does not have all of the
	 * given permissions for the channel in which the command was called
	 *
	 * ***NOTE:*** *This middleware should only be used when you can guarantee the
	 * command will be called in a guild context. You can accomplish this by using
	 * the [[`Middleware.guildOnly | guildOnly`]] middleware first*
	 */
	public static clientPermissions(...permissions: PermissionResolvable[]): MiddlewareFunction
	{
		return (context, next) =>
		{
			const clientPerms: Readonly<Permissions> = context
				.channel<TextChannel>()
				.permissionsFor?.(context.client.user!) ?? new Permissions();

			const missingPerms: PermissionResolvable = permissions.filter(p => !clientPerms.has(p));

			// TODO: return next(Result.err(...)) with some sort of to-be-implemented
			//       middleware error that includes context data (missing perms)
			if (missingPerms.length > 0)
				return;

			next();
		};
	}
}

/** @private */
export const guildOnly: MiddlewareFunction = Middleware.guildOnly;

/** @private */
export const ownerOnly: MiddlewareFunction = Middleware.ownerOnly;

/** @private */
export const callerPermissions: (...permissions: PermissionResolvable[]) => MiddlewareFunction =
	Middleware.callerPermissions;

/** @private */
export const clientPermissions: (...permissions: PermissionResolvable[]) => MiddlewareFunction =
	Middleware.clientPermissions;
