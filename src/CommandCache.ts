import { Command } from './Command';

/**
 * @private
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
		return CommandCache._instance ?? new CommandCache();
	}

	public static get(key: string): Command | undefined
	{
		return CommandCache._instance._cache.get(key);
	}

	public static set(key: string, command: Command): void
	{
		CommandCache._instance._cache.set(key, command);
	}

	public static has(key: string): boolean
	{
		return CommandCache._instance._cache.has(key);
	}

	public static commands(): IterableIterator<Command>
	{
		return CommandCache._instance._cache.values();
	}
}
