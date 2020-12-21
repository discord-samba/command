import { Argument } from '#root/Argument';
import { ArgumentContext } from '#resolve/ArgumentContext';
import { CommandArgumentKind } from '#type/CommandArgumentKind';
import { CommandContext } from '#root/CommandContext';
import { CommandModule } from '#root/CommandModule';
import { Resolver } from '#resolve/Resolver';

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

	/**
	 * Runs the initial string value through the registered resolver for the
	 * declared type for this argument
	 * @internal
	 */
	public async resolveType(ctx: CommandContext): Promise<void>
	{
		if (typeof this.value !== 'string')
			return;

		const resolver: Resolver = CommandModule.resolvers.get(this.type)!;

		const value: T = await resolver.resolve(
			new ArgumentContext(CommandArgumentKind.Operand, this.ident!, this.value as any),
			ctx
		);

		this.value = value;
	}
}
