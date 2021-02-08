import { MiddlewareFunction } from '#type/MiddlewareFunction';

/**
 * A cache that holds the middleware to be used by a single command
 */
export class MiddlewareCache
{
	private readonly _cache: MiddlewareFunction[];

	public constructor()
	{
		this._cache = [];
	}

	/**
	 * Add middleware function(s) that the command module will use for command
	 * dispatching. Middleware will be executed in the order they are added
	 */
	public use(...fn: MiddlewareFunction[]): void
	{
		this._cache.push(...fn);
	}

	/**
	 * Returns a copy of the current registered rule functions
	 */
	public all(): MiddlewareFunction[]
	{
		return [...this._cache];
	}
}
