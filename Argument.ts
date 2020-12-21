/**
 * Base Command argument class that all argument types (operand, option, option-argument)
 * inherit from
 */
export class Argument<T, U = string | undefined>
{
	/**
	 * The identifier for this argument. This will be the identifier specified
	 * in the Command's arguments specification within your custom commands.
	 *
	 * **NOTE:** This is guaranteed to be a string for options and option-arguments,
	 * but can be undefined for operands as extra, undeclared operands can be given
	 * and parsed
	 */
	public ident: U;

	/**
	 * The value this argument holds. You can expect the type of the value to
	 * be whatever you specified when in the Command's arguments specification
	 * as long as there is a matching resolver for the specified type.
	 *
	 * In the case of `Option` type arguments, the value will always be a boolean
	 *
	 * **NOTE:** The value can be undefined in cases of optional operands/option-arguments,
	 * so be sure to use `isSome()` to check if the value is present before trying
	 * to use the value in your Commands. It's safe to assume the value is present
	 * in non-optional arguments, however, as an error will be thrown and handled
	 * for missing required arguments so they will never be accessed with an undefined
	 * value
	 */
	public value: T;

	public constructor(ident: U, value: any)
	{
		this.ident = ident;
		this.value = value;
	}

	/**
	 * Returns whether or not this argument holds a `value`
	 */
	public isSome(): boolean
	{
		return typeof this.value !== 'undefined';
	}
}
