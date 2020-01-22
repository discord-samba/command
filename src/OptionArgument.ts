import { Argument } from './Argument';
import { ArgumentContext } from './resolving/ArgumentContext';
import { CommandArgumentKind } from './types/CommandArgumentKind';
import { CommandContext } from './CommandContext';
import { CommandModule } from './CommandModule';
import { Resolver } from './resolving/Resolver';

/**
 * Represents an option-argument type argument. An option-argument is an option
 * that takes its own argument, like `-f foo` or `--bar baz`.
 */
export class OptionArgument<T> extends Argument<T, string>
{
	public type: string;

	public constructor(ident: string, value: T | undefined, type: string)
	{
		super(ident, value);
		this.type = type;
	}

	/**
	 * Runs the initial string value through the registered resolver for the
	 * declared type for this argument
	 * @internal
	 */
	public async _resolveType(ctx: CommandContext): Promise<void>
	{
		if (typeof this.value !== 'string')
			return;

		const resolver: Resolver = CommandModule.resolvers.get(this.type)!;

		const value: T = await resolver.resolve(
			new ArgumentContext(CommandArgumentKind.Operand, this.ident, this.value as any),
			ctx
		);

		this.value = value;
	}
}
