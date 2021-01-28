import { Argument } from '#root/Argument';
import { CommandArgKindImplFlag } from '#parse/commandArgKindImpl/CommandArgKindImplFlag';

/**
 * Represents a flag type command argument. The `value` field will be true
 * if the flag was passed in the command input
 */
export class Flag extends Argument<boolean, string>
{
	/**
	 * How many times this flag was passed
	 */
	public count: number;

	/**
	 * The value this flag holds. You can expect it to be false if the flag
	 * was not passed to the command when it was called
	 */
	public value!: boolean;

	public constructor(ident: string, raw?: CommandArgKindImplFlag)
	{
		super(ident, false, raw);
		this.count = 0;
	}

	public increment(): void
	{
		if (this.value === false)
			this.value = true;

		this.count++;
	}
}
