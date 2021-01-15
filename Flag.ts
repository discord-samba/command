import { Argument } from '#root/Argument';

/**
 * Represents an flag type command argument. The `value` field will be true
 * if the flag was passed in the command input
 */
export class Flag extends Argument<boolean, string>
{
	/**
	 * How many times this flag was passed
	 */
	public occurrences: number;

	/**
	 * The value this flag holds. You can expect it to be false if the flag
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
