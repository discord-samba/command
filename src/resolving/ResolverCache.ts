import { Resolver } from './Resolver';

/**
 * Cache for argument type resolvers
 */
export class ResolverCache
{
	/** @internal */
	private static _staticInstance: ResolverCache;

	/** @internal */
	private readonly _cache: Map<string, Resolver>;

	private constructor()
	{
		if (typeof ResolverCache._staticInstance !== 'undefined')
			throw new Error('Cannot create multiple instances of ResolverCache');

		this._cache = new Map();
		ResolverCache._staticInstance = this;
	}

	/** @internal */
	private static get _instance(): ResolverCache
	{
		return ResolverCache._staticInstance ?? new ResolverCache();
	}

	/**
	 * Creates a new instance of the given Resolver child class and sets it
	 * in the `resolvers` collection for each of the types specified in
	 * the resolver class itself
	 */
	public static add(ResolverClass: new () => Resolver): void
	{
		const resolver: Resolver = new ResolverClass();
		for (const type of resolver.types)
		{
			if (ResolverCache.has(type))
				throw new Error(`Resolver type '${type}' conflicts with existing resolver`);

			ResolverCache._instance._cache.set(type, resolver);
		}
	}

	/**
	 * Returns the Resolver for the given type name. Can be given any of the type
	 * names specified in the Resolver's `super()` call
	 */
	public static get<T extends Resolver>(type: string): T | undefined
	{
		return ResolverCache._instance._cache.get(type) as T;
	}

	/**
	 * Returns whether or not the cache has a Resolver for the given type name.
	 * Can be given any of the type names specified in the Resolver's `super()` call
	 */
	public static has(type: string): boolean
	{
		return ResolverCache._instance._cache.has(type);
	}
}
