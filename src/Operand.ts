import { Argument } from './Argument';
import { ArgumentContext } from './ArgumentContext';
import { CommandArgumentKind } from './types/CommandArgumentKind';
import { CommandContext } from './CommandContext';
import { CommandModule } from './CommandModule';
import { Resolver } from './resolving/Resolver';

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
export class Operand<T> extends Argument<T>
{
	public type: string;

	public constructor(value: string, ident: string | undefined, type: string)
	{
		super(ident, value);
		this.type = type;
	}

	public async resolveType(ctx: CommandContext): Promise<void>
	{
		const resolver: Resolver = CommandModule.resolvers.get(this.type)!;

		const value: T = await resolver.resolve(
			new ArgumentContext(CommandArgumentKind.Operand, this.ident!, this.value as any),
			ctx
		);

		this.value = value;
	}
}
