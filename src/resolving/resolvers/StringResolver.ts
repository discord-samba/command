import { ArgumentContext } from '../../ArgumentContext';
import { Resolver } from '../Resolver';

/** @hidden */
export class StringResolver extends Resolver
{
	public constructor()
	{
		super('String', 'string');
	}

	public safeResolve(value: any): string
	{
		return value.toString?.();
	}

	public async resolve(argument: ArgumentContext): Promise<string>
	{
		return this.safeResolve(argument.value);
	}
}
