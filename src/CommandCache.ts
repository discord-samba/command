import { Command } from '#root/Command';

/**
 * Cache for all Commands your client will use
 */
export class CommandCache
{
	private static _staticInstance: CommandCache;
	private readonly _cache: Map<string, Command>;

	private constructor()
	{
		if (typeof CommandCache._staticInstance !== 'undefined')
			throw new Error('Cannot create multiple instances of CommandCache');

		this._cache = new Map();
		CommandCache._staticInstance = this;
	}

	private static get _instance(): CommandCache
	{
		return CommandCache._staticInstance ?? new CommandCache();
	}

	/**
	 * Returns a Command from the cache using the given identifier. Can be the
	 * Command name or an alias
	 */
	public static get(ident: string): Command | undefined
	{
		return CommandCache._instance._cache.get(ident);
	}

	/**
	 * Adds a Command to the cache. Pass the Command child class itself and an
	 * instance will be created and cached
	 */
	public static add(commandClass: new () => Command): void
	{
		// eslint-disable-next-line new-cap
		const command: Command = new commandClass();

		if (CommandCache.has(command.name))
			throw new Error(`Command name '${command.name} conflicts with existing Command`);

		CommandCache._instance._cache.set(command.name, command);

		for (const alias of command.aliases)
		{
			if (CommandCache.has(alias))
				throw new Error(`Command name '${command.name}', alias '${alias}' conflicts with existing Command`);

			CommandCache._instance._cache.set(alias, command);
		}
	}

	/**
	 * Returns whether or not the cache has the given identifier. Can be command
	 * name or alias
	 */
	public static has(ident: string): boolean
	{
		return CommandCache._instance._cache.has(ident);
	}

	/**
	 * Returns a Set of all cached Commands.
	 */
	public static all(): Set<Command>
	{
		return new Set(Array.from(CommandCache._instance._cache.values()));
	}
}
