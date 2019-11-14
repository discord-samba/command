import { CommandArgument } from './CommandArgument';

/**
 * Represents an option-argument type argument. An option-argument is an option
 * that takes its own argument, like `-f foo` or `--bar baz`.
 */
export class OptionArgument extends CommandArgument
{
	public constructor(ident: string, value: any, _type: string)
	{
		// TODO: Run value through resolver for the specified type

		super(ident, value);
	}
}
