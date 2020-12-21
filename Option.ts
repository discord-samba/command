import { Argument } from '#root/Argument';

/**
 * Represents an option type argument. The `value` field will be true if the option
 * was passed in the command input
 */
export class Option extends Argument<boolean, string>
{
	/**
	 * How many times this option was passed
	 */
	public occurrences: number;

	/**
	 * The value this option holds. You can expect it to be false if the option
	 * was not passed to the command when it was called
	 */
	public value!: boolean;

	public constructor(ident: string)
	{
		super(ident, false);
		this.occurrences = 0;
	}

	public increment(): void
	{
		if (this.value === false)
			this.value = true;

		this.occurrences++;
	}
}
