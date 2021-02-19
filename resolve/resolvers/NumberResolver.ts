import { ArgumentContext } from '#resolve/ArgumentContext';
import { CommandArgumentError } from '#error/CommandArgumentError';
import { CommandArgumentErrorContext } from '#error/CommandArgumentErrorContext';
import { CommandArgumentErrorKind } from '#error/CommandArgumentErrorKind';
import { Resolver } from '#resolve/Resolver';

/** @hidden */
export class NumberResolver extends Resolver
{
	public constructor()
	{
		super('Number', 'number');
	}

	public safeResolve(value: string): number
	{
		return parseFloat(value);
	}

	public async resolve(argument: ArgumentContext): Promise<number>
	{
		const value: number = this.safeResolve(argument.value);

		if (typeof value === 'number' && !isNaN(value) && isFinite(value))
			return value;

		// A number was unable to be resolved from the given value, etc.
		throw new CommandArgumentError(
			CommandArgumentErrorKind.ArgumentResolutionError,
			new CommandArgumentErrorContext(argument.kind, argument.ident, 'Number', argument.value)
		);
	}
}
