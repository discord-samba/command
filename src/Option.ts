import { Argument } from '#root/Argument';
import { ArgumentContext } from '#resolve/ArgumentContext';
import { CommandArgKindImplOption } from '#parse/commandArgKindImpl/CommandArgKindImplOption';
import { CommandArgumentKind } from '#type/CommandArgumentKind';
import { CommandContext } from '#root/CommandContext';
import { CommandModule } from '#root/CommandModule';
import { Resolver } from '#resolve/Resolver';

/**
 * Represents an option type command argument. An option is a flag that
 * takes a value, like `-f foo` or `--bar baz`
 */
export class Option<T> extends Argument<T, string>
{
	public type: string;

	public constructor(ident: string, value: T | undefined, type: string, raw?: CommandArgKindImplOption)
	{
		super(ident, value, raw);
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
			new ArgumentContext(CommandArgumentKind.Operand, this.ident, this.value as any),
			ctx
		);

		this.value = value;
	}
}
