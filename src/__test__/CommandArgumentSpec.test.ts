/* eslint-disable no-undefined */
import { CommandArgumentKind } from '../types/CommandArgumentKind';
import { CommandArgumentSpec } from '../CommandArgumentSpec';

describe('CommandArgumentSpec', () =>
{
	const spec: CommandArgumentSpec = new CommandArgumentSpec();

	it('Should successfully define an operand', () =>
	{
		expect(() => spec.defineOperand('foo', 'String')).not.toThrow();
	});

	it('Should successfully define an option', () =>
	{
		expect(() => spec.defineOption('a')).not.toThrow();
	});

	it('Should successfully define an option-argument', () =>
	{
		expect(() => spec.defineOptionArgument('b', 'Number')).not.toThrow();
	});

	it('Should return the expected operand', () =>
	{
		const localSpec: CommandArgumentSpec = new CommandArgumentSpec();
		const kind: CommandArgumentKind = CommandArgumentKind.Operand;
		localSpec.defineOperand('foo', 'Number', { optional: true });

		expect(localSpec.operands.shift()).toEqual({ kind, ident: 'foo', type: 'Number', optional: true });
	});

	it('Should return the expected option', () =>
	{
		const localSpec: CommandArgumentSpec = new CommandArgumentSpec();
		const kind: CommandArgumentKind = CommandArgumentKind.Option;
		localSpec.defineOption('f');

		expect(localSpec.get('f')).toEqual({ kind, ident: 'f' });
	});

	it('Should return the expected option-argument', () =>
	{
		const localSpec: CommandArgumentSpec = new CommandArgumentSpec();
		const kind: CommandArgumentKind = CommandArgumentKind.OptionArgument;
		localSpec.defineOptionArgument('f', 'String', { long: 'foo' });

		expect(localSpec.get('f')).toEqual({ kind, ident: 'f', long: 'foo', type: 'String', optional: true });
		expect(localSpec.get('foo')).toEqual({ kind, ident: 'f', long: 'foo', type: 'String', optional: true });

		localSpec.defineOptionArgument('b', 'Number', { optional: false });

		expect(localSpec.get('b')).toEqual({ kind, ident: 'b', long: undefined, type: 'Number', optional: false });
	});

	it('Should return nothing if no spec exists by the given identifier', () =>
	{
		const localSpec: CommandArgumentSpec = new CommandArgumentSpec();
		expect(localSpec.get('foo')).toBe(undefined);
	});

	it('Should error on duplicate identifiers', () =>
	{
		let localSpec: CommandArgumentSpec = new CommandArgumentSpec();
		localSpec.defineOperand('foo', 'String');
		localSpec.defineOption('b');

		expect(() => localSpec.defineOptionArgument('f', 'Number', { long: 'foo' }))
			.toThrow('Long option-argument conflicts with existing operand');

		expect(() => localSpec.defineOptionArgument('b', 'String'))
			.toThrow('Option-argument conflicts with existing option');

		localSpec = new CommandArgumentSpec();
		localSpec.defineOptionArgument('f', 'String', { long: 'foo' });

		expect(() => localSpec.defineOperand('foo', 'Number'))
			.toThrow('Operand conflicts with existing long option-argument');

		expect(() => localSpec.defineOption('f'))
			.toThrow('Option conflicts with existing option-argument');
	});

	it('Should error on invalid identifiers', () =>
	{
		const localSpec: CommandArgumentSpec = new CommandArgumentSpec();

		expect(() => localSpec.defineOperand('f', 'String'))
			.toThrow('Operands must be at least 2 characters');

		expect(() => localSpec.defineOption('foo'))
			.toThrow('Options must not exceed 1 character');

		expect(() => localSpec.defineOption('1'))
			.toThrow('Options must match pattern [a-zA-Z]');

		expect(() => localSpec.defineOptionArgument('1', 'String'))
			.toThrow('Option-arguments must match pattern [a-zA-Z]');

		expect(() => localSpec.defineOptionArgument('foo', 'String'))
			.toThrow('Option-arguments must not exceed 1 character');

		expect(() => localSpec.defineOptionArgument('f', 'String', { long: 'b' }))
			.toThrow('Long option-argument must be at least 2 characters');
	});

	it('Should error on non-optional operands following optional operands', () =>
	{
		const localSpec: CommandArgumentSpec = new CommandArgumentSpec();
		localSpec.defineOperand('foo', 'String', { optional: true });

		expect(() => localSpec.defineOperand('bar', 'String', { optional: false }))
			.toThrow('Non-optional operands may not follow optional operands');
	});
});
