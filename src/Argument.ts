/**
 * Base Command argument class that all argument types (operand, option, option-argument)
 * inherit from
 */
export class Argument<T>
{
	/**
	 * The identifier for this argument. This will be the identifier specified
	 * in the Command's arguments specification within your custom commands
	 */
	public ident: string;

	/**
	 * The value this argument holds. You can expect the type of the value to
	 * be whatever you specified when in the Command's arguments specification
	 * as long as there is a matching resolver for the specified type
	 */
	public value: T;

	public constructor(ident: string, value: any)
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
