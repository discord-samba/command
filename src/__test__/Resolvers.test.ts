import { CommandModule } from '../CommandModule';
import { NumberResolver } from '../resolving/resolvers/NumberResolver';
import { StringResolver } from '../resolving/resolvers/StringResolver';

describe('Resolvers', () =>
{
	describe('StringResolver', () =>
	{
		const resolver: StringResolver = CommandModule.resolvers.get<StringResolver>('String')!;
		it('Should parse strings', () =>
		{
			expect(resolver.safeResolve('foo')).toBe('foo');
			expect(resolver.safeResolve(1)).toBe('1');
			expect(resolver.safeResolve(true)).toBe('true');
			expect(resolver.safeResolve({ foo: 'bar' })).toBe('[object Object]');
		});
	});

	describe('NumberResolver', () =>
	{
		const resolver: NumberResolver = CommandModule.resolvers.get<NumberResolver>('Number')!;
		it('Should parse numbers', () =>
		{
			expect(resolver.safeResolve('1')).toBe(1);
			expect(resolver.safeResolve('100')).toBe(100);
			expect(resolver.safeResolve('1000')).toBe(1000);
			expect(resolver.safeResolve('1e4')).toBe(10000);
		});
	});
});
