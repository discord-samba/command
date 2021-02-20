import { ResultToken } from '#type/ResultToken';

/**
 * Represents the result of some operation. Can hold a value. Use [[`isSome | isSome()`]]
 * to check if the result holds a value.
 *
 * ***Typescript Note:*** *`isSome()` and `isError()` both assert that the [[value]]
 * field is not able to be `undefined` at run-time AND compile-time so you won't
 * need to make any additional checks.* 👍
 */
export class Result<T = any>
{
	/**
	 * The value this Result holds. Use [[`isSome | isSome()`]] or [[`isError | isError()`]]
	 * to check that the value is not undefined/null
	 */
	public value?: T;

	private _token: ResultToken;

	private constructor(token: ResultToken, value?: T)
	{
		this._token = token;
		this.value = value;
	}

	/**
	 * Create a Default Result. Default results are used to indicate that a method
	 * that returns a Result has not been overridden
	 * @internal
	 */
	public static default(): Result
	{
		return new Result(ResultToken.Default);
	}

	/**
	 * Creates an Ok Result. Can be given a value. Ok Results represent the result
	 * of a successful operation
	 */
	public static ok<U>(value?: U): Result<U>
	{
		return new Result(ResultToken.Ok, value);
	}

	/**
	 * Creates an Err Result. Must be given an Error. Err Results are used for passing
	 * errors from Rules, Middleware, and Argument resolvers so that they can more
	 * easily be passed around to error handlers
	 */
	public static err<U extends Error>(error: U): Result<U>
	{
		return new Result(ResultToken.Err, error ?? new Error('No error given'));
	}

	/**
	 * Creates a Cancellation Result. Cancellation Results are used to signal that
	 * an operation (Rule, Middleware, Argument prompting, etc) has been cancelled
	 * and should exit silently.
	 *
	 * ***NOTE:*** *Rules and Middleware can pass a Cancellation Result to the `next`
	 * function to exit silently, but they will also exit silently if the `next`
	 * function is never called, so the Cancellation Result is not really necessary
	 * for them. Cancellation Results are primarily used for Argument defaults to
	 * signal that a command should be canceled (Likely because the Argument default
	 * uses argument prompting and the prompt was canceled).*
	 */
	public static cancel(): Result
	{
		return new Result(ResultToken.Cancellation);
	}

	/**
	 * Whether or not this Result is a Default Result
	 * @internal
	 */
	public isDefault(): boolean
	{
		return this._token === ResultToken.Default;
	}

	/**
	 * Whether or not this Result holds a value
	 */
	public isSome(): this is Required<Result<T>>
	{
		return typeof this.value !== 'undefined'
			&& this.value !== null;
	}

	/**
	 * Whether or not this Result is an Ok Result. Does not indicate whether or
	 * not this Result holds a value. Use [[`isSome | isSome()`]] to check that
	 * `value` is not undefined/null
	 */
	public isOk(): boolean
	{
		return this._token === ResultToken.Ok;
	}

	/**
	 * Whether or not this Result is an Error Result. Error Results will always
	 * have a defined `value` field containing the error the Result holds
	 */
	public isError(): this is Required<Result<T>>
	{
		return this._token === ResultToken.Err;
	}

	/**
	 * Whether or not this Result is a Cancellation Result
	 */
	public isCancellation(): boolean
	{
		return this._token === ResultToken.Cancellation;
	}
}
