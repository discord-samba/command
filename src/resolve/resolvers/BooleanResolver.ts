import { ArgumentContext } from '#resolve/ArgumentContext';
import { CommandArgumentError } from '#error/CommandArgumentError';
import { CommandArgumentErrorContext } from '#error/CommandArgumentErrorContext';
import { CommandArgumentErrorKind } from '#error/CommandArgumentErrorKind';
import { Resolver } from '#resolve/Resolver';

/** @hidden */
export class BooleanResolver extends Resolver
{
	private static _truthyValues: Set<string> = new Set(['true', 'yes', 'on', 'enable', '1']);
	private static _falseyValues: Set<string> = new Set(['false', 'no', 'off', 'disable', '0']);

	public constructor()
	{
		super('Boolean', 'Bool', 'boolean', 'bool');
	}

	public safeResolve(value: string): boolean | undefined
	{
		if (BooleanResolver._truthyValues.has(value.toLowerCase()))
			return true;

		if (BooleanResolver._falseyValues.has(value.toLowerCase()))
			return false;
	}

	public async resolve(argument: ArgumentContext): Promise<boolean>
	{
		const value: boolean | undefined = this.safeResolve(argument.value);

		if (typeof value === 'boolean')
			return value;

		// A boolean was unable to be resolved from the given value, etc.
		throw new CommandArgumentError(
			CommandArgumentErrorKind.ArgumentResolutionError,
			new CommandArgumentErrorContext(argument.kind, argument.ident, 'Boolean', argument.value)
		);
	}
}
