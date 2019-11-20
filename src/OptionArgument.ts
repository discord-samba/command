import { CommandArgument } from './CommandArgument';

/**
 * Represents an option-argument type argument. An option-argument is an option
 * that takes its own argument, like `-f foo` or `--bar baz`.
 */
export class OptionArgument<T> extends CommandArgument<T>
{
	public constructor(ident: string, value: T | undefined, _type: string)
	{
		// TODO: Run value through resolver for the specified type

		super(ident, value);
	}
}
