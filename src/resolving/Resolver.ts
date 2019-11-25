import { ArgumentContext } from '../ArgumentContext';
import { CommandContext } from '../CommandContext';

/**
 * Abstract class you must extend to create custom argument type resolvers
 */
export abstract class Resolver
{
	public types: string[];

	public constructor(...types: string[])
	{
		this.types = types;

		// If no resolver types can be found, attempt to create one from the Resolver
		// class name by removing `Resolver` if it ends in `Resolver` (as it should!)
		if (this.types.length < 1 && /^\w+Resolver$/.test(this.constructor.name))
			this.types.push(this.constructor.name.match(/^(\w+)Resolver$/)![1]);

		if (types.length < 1)
			throw new Error('Failed to derive type name for Resolver');
	}

	/**
	 * Method your Resolver must implement to provide resolved types for the given input.
	 * Will receive [[ArgumentContext]] containing the raw input, and [[CommandContext]]
	 * to aid in value resolution.
	 *
	 * `resolve()` can be expected to throw errors for invalid input. These errors will
	 * silently halt execution of a Command (meaning no message will be sent to Discord)
	 * so that you may report this to Discord however you desire in your error handler.
	 *
	 * **NOTE:** For resolving values without side-effects, consider implementing `safeResolve()`.
	 * Of course, you could really implement any method name you want, as the method will not
	 * be called anywhere within the CommandModule so it'd only be used manually by you
	 */
	public abstract async resolve(argument: ArgumentContext, ctx: CommandContext): Promise<any>;

	/**
	 * You should override this method if you wish to provide a way for your resolver
	 * to be used to safely resolve a type without errors or side-effects. Should simply
	 * return `undefined` if a value was unable to be resolved.
	 *
	 * This method will not be called automatically anywhere within the CommandModule,
	 * so you can specify whatever arguments you desire, since you would be calling it
	 * manually
	 */
	public safeResolve(..._args: any[]): any {}
}
