import { RuleFunction } from '#type/RuleFunction';

/**
 * The cache that holds the rules to be used by the command module
 */
export class RuleCache
{
	private static _staticInstance: RuleCache;
	private readonly _cache: RuleFunction[];

	private constructor()
	{
		if (typeof RuleCache._staticInstance !== 'undefined')
			throw new Error('Cannot create multiple instances of RuleCache');

		this._cache = [];
		RuleCache._staticInstance = this;
	}

	private static get _instance(): RuleCache
	{
		return RuleCache._staticInstance ?? new RuleCache();
	}

	/**
	 * Add command rule(s) that the command module will use for command dispatching.
	 * Rules will be executed in the order they are added
	 */
	public static use(...rules: RuleFunction[]): void
	{
		RuleCache._instance._cache.push(...rules);
	}

	/**
	 * Returns a copy of the current registered rule functions
	 */
	public static all(): RuleFunction[]
	{
		return [...RuleCache._instance._cache];
	}
}
