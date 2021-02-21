import { ArgumentParseNode } from '#type/ArgumentParseNode';

/**
 * Base Command argument class that all argument types (operand, flag, option)
 * inherit from
 */
export class Argument<T, U = string | undefined>
{
	/**
	 * The identifier for this argument. This will be the identifier specified
	 * in the Command's arguments specification within your custom commands.
	 *
	 * ***NOTE:*** *This is guaranteed to be a string for flags and options,
	 * but can be undefined for operands as extra, undeclared operands can be given
	 * and parsed*
	 */
	public ident: U;

	/**
	 * The value this argument holds. You can expect the type of the value to
	 * be whatever you specified when in the Command's arguments specification
	 * as long as there is a matching resolver for the specified type.
	 *
	 * In the case of `Flag` type arguments, the value will always be a boolean
	 *
	 * ***NOTE:*** *The value can be undefined in cases of non-required operands
	 * and options, so be sure to use `isSome()` to check if the value is present
	 * before trying to access the value in your Commands. It's safe to assume the
	 * value is present in required arguments, however, as an error will be thrown
	 * (and hopefully handled) for missing required arguments so they will never
	 * be accessed with an undefined value. Typescript users can consider using
	 * `Required<T>` when accessing required arguments to eliminate the need to
	 * use `isSome()` like so:*
	 * ```ts
	 * const foo: Required<Operand<User>> = context.args.get('foo');
	 * console.log(foo.value.id);
	 * // foo.value is known to not be undefined at compile-time so we can safely
	 * // access its fields without any errors
	 * ```
	 */
	public value?: T;

	/**
	 * The raw argument as returned from the argument parser for this argument.
	 * This will be undefined for non-required arguments that were unpassed.
	 *
	 * The fields you can expect if present depend on the argument type, but can
	 * consist of the following:
	 *
	 * ```ts
	 * {
	 *     kind: number;
	 *     index: number;
	 *     ident?: string;
	 *     type?: string;
	 *     value?: string;
	 *     long?: string;
	 * }
	 * ```
	 *
	 * ***NOTE:*** *This is exposed mostly for use in error handling as the info
	 * it contains may be useful for your error output*
	 */
	public raw?: ArgumentParseNode;

	public constructor(ident: U, value: any, raw?: ArgumentParseNode)
	{
		this.ident = ident;
		this.value = value;
		this.raw = raw;
	}

	/**
	 * Returns whether or not this argument holds a [[`value`]]
	 */
	public isSome(): this is Required<this>
	{
		return typeof this.value !== 'undefined';
	}
}
