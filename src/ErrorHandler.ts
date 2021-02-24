import { CustomErrorConstructor } from '#type/CustomErrorConstructor';
import { Result } from './Result';

/**
 * Fluent builder class used for creating reusable error handlers for different
 * error kinds. Errors can be handled by the built error handler by calling
 * [[`handle`]]
 */
export class ErrorHandler
{
	private _handlers: [CustomErrorConstructor, Function][];

	public constructor()
	{
		this._handlers = [];
	}

	/**
	 * Creates a new error handler and tells it to use the given function to handle
	 * errors of the given Error kind. Expects a class that extends Error and a
	 * function that will handle errors of that kind. Returns the new error handler.
	 *
	 * ```ts
	 * ErrorHandler.use(RangeError, err => console.log(err));
	 * ```
	 *
	 * ***NOTE:*** *Because all error classes inherit from `Error`, and error kinds
	 * will be checked against in the order in which they were added, `Error` will
	 * act as a catch-all for error `instanceof` checks, so if you want to add a
	 * catch-all handler, be sure to add `Error` as the final handler*
	 */
	public static use<T extends Error>(
		errClass: new (...args: any[]) => T,
		handler: (err: T) => void | Promise<void>
	): ErrorHandler
	{
		const newHandler: ErrorHandler = new ErrorHandler();
		newHandler._handlers.push([errClass as CustomErrorConstructor, handler]);
		return newHandler;
	}

	/**
	 * Tells this error handler to use the given function for the given Error kind.
	 * Expects a class that extends Error and a function that will handle errors
	 * of that kind. Returns this error handler.
	 *
	 * ```ts
	 * ErrorHandler
	 *     .use(RangeError, err => console.log(err))
	 *     .use(Error, err => console.log(err));
	 * ```
	 *
	 * ***NOTE:*** *Because all error classes inherit from `Error`, and error kinds
	 * will be checked against in the order in which they were added, `Error` will
	 * act as a catch-all for error `instanceof` checks, so if you want to add a
	 * catch-all handler, be sure to add `Error` as the final handler*
	 */
	public use<T extends Error>(
		errClass: new (...args: any[]) => T,
		handler: (err: T) => void | Promise<void>
	): this
	{
		this._handlers.push([errClass as CustomErrorConstructor, handler]);
		return this;
	}

	/**
	 * Runs the given error through the matching handler function for its type.
	 * Returns [[`Result.ok | Result.ok()`]] if the error was successfully handled
	 * or [[`Result.err | Result.err()`]] if not or if there was an error handling
	 * the error (in which case the result value will be the error thrown)
	 */
	public async handle(err: Error): Promise<Result>
	{
		for (const handler of this._handlers)
		{
			if (err instanceof handler[0])
			{
				try { await handler[1](err); }
				catch (e) { return Result.err(e); }

				return Result.ok();
			}
		}

		return Result.err(new Error('Failed to handle error (no handler for given error)'));
	}
}
