import { CommandArgument } from './CommandArgument';

/**
 * Represents an operand type argument. These are the positional arguments in
 * a command's input. If you do not use the `Advanced` argument parsing strategy,
 * all of your command's arguments will be operands.
 *
 * Operands are not guaranteed to have an identifier because any remaining
 * undefined operands will still be parsed and can be accessed by index via
 * `<CommandContext>.args.get(index: number)`. An undeclared operand will
 * default to being parsed as a string
 */
export class CommandArgumentOperand extends CommandArgument
{
	public constructor(value: any, ident: string | undefined, _type: string)
	{
		super(ident!, value);

		// TODO: Run operand value through resolver for the specified type
	}
}
