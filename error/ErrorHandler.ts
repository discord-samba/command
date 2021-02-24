import { CustomErrorConstructor } from '#type/CustomErrorConstructor';
import { Result } from '#root/Result';

/**
 * Fluent builder class used for creating reusable error handlers for different
 * error kinds. Errors can be handled by the built error handler by calling
 * [[`handle`]]
 */
export class ErrorHandler
{
	private _matchers: [CustomErrorConstructor, Function][];

	public constructor()
	{
		this._matchers = [];
	}

	/**
	 * Creates a new ErrorHandler and assigns a matcher for the given error class
	 * that tells the ErrorHandler to use the given function to handle errors matching
	 * that error class. Returns the new ErrorHandler.
	 *
	 * ```ts
	 * ErrorHandler.match(RangeError, err => console.log(err));
	 * ```
	 *
	 * ***NOTE:*** *Because all error classes inherit from `Error`, and error matchers
	 * will be checked in the order in which they were added, `Error` should be added
	 * as the final matcher to match all other possible errors that don't match any
	 * other matchers*
	 */
	public static match<T extends Error>(
		errClass: new (...args: any[]) => T,
		handler: (err: T, ...args: any[]) => void | Promise<void>
	): ErrorHandler
	{
		const newHandler: ErrorHandler = new ErrorHandler();
		newHandler._matchers.push([errClass as CustomErrorConstructor, handler]);
		return newHandler;
	}

	/**
	 * Creates a matcher for this ErrorHandler for the given error class that tells
	 * the ErrorHandler to use the given function to handle errors matching that error
	 * class. Returns this ErrorHandler.
	 *
	 * ```ts
	 * ErrorHandler
	 *     .match(RangeError, err => console.log(err))
	 *     .match(Error, err => console.log(err));
	 * ```
	 *
	 * ***NOTE:*** *Because all error classes inherit from `Error`, and error matchers
	 * will be checked in the order in which they were added, `Error` should be added
	 * as the final matcher to match all other possible errors that don't match any
	 * other matchers*
	 */
	public match<T extends Error>(
		errClass: new (...args: any[]) => T,
		handler: (err: T, ...args: any[]) => void | Promise<void>
	): this
	{
		this._matchers.push([errClass as CustomErrorConstructor, handler]);
		return this;
	}

	/**
	 * Runs the given error through the matching handler function for its type.
	 * Returns [[`Result.ok | Result.ok()`]] if the error was successfully handled
	 * or [[`Result.err | Result.err()`]] if not, or if there was an error handling
	 * the error (in which case the result value will be the error thrown).
	 *
	 * Additional arguments can be passed which will be passed to the matching error
	 * handler function
	 */
	public async handle(err: Error, ...args: any[]): Promise<Result>
	{
		for (const [match, handler] of this._matchers)
		{
			if (err instanceof match)
			{
				try { await handler(err, ...args); }
				catch (e) { return Result.err(e); }

				return Result.ok();
			}
		}

		return Result.err(new Error('Failed to handle error (no handler for given error)'));
	}
}
