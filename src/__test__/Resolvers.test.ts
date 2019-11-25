import { CommandModule } from '../CommandModule';
import { StringResolver } from '../resolving/resolvers/StringResolver';

describe('Resolver tests', () =>
{
	describe('StringResolver', () =>
	{
		const resolver: StringResolver = CommandModule.resolvers.get('String') as StringResolver;
		it('Should parse strings', () =>
		{
			expect(resolver.safeResolve('foo')).toBe('foo');
			expect(resolver.safeResolve(1)).toBe('1');
			expect(resolver.safeResolve(true)).toBe('true');
			expect(resolver.safeResolve({ foo: 'bar' })).toBe('[object Object]');
		});
	});
});
