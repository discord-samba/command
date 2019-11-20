/* eslint-disable no-undefined */
import { CommandArgumentKind } from '../types/CommandArgumentKind';
import { CommandArgumentSpec } from '../CommandArgumentSpec';

describe('CommandArgumentSpec', () =>
{
	it('Should successfully define an operand', () =>
	{
		const spec: CommandArgumentSpec = new CommandArgumentSpec();
		expect(() => spec.defineOperand('foo', 'String')).not.toThrow();
	});

	it('Should successfully define an option', () =>
	{
		const spec: CommandArgumentSpec = new CommandArgumentSpec();
		expect(() => spec.defineOption('a')).not.toThrow();
	});

	it('Should successfully define an option-argument', () =>
	{
		const spec: CommandArgumentSpec = new CommandArgumentSpec();
		expect(() => spec.defineOptionArgument('b', 'Number')).not.toThrow();
	});

	it('Should return the expected operand', () =>
	{
		const spec: CommandArgumentSpec = new CommandArgumentSpec();
		const kind: CommandArgumentKind = CommandArgumentKind.Operand;
		spec.defineOperand('foo', 'Number', { optional: true });

		expect(spec.operands.shift()).toEqual({ kind, ident: 'foo', type: 'Number', optional: true });
	});

	it('Should return the expected option', () =>
	{
		const spec: CommandArgumentSpec = new CommandArgumentSpec();
		const kind: CommandArgumentKind = CommandArgumentKind.Option;
		spec.defineOption('f', { long: 'foo' });

		expect(spec.get('f')).toEqual({ kind, ident: 'f', long: 'foo' });
		expect(spec.get('foo')).toEqual({ kind, ident: 'f', long: 'foo' });
	});

	it('Should return the expected option-argument', () =>
	{
		const spec: CommandArgumentSpec = new CommandArgumentSpec();
		const kind: CommandArgumentKind = CommandArgumentKind.OptionArgument;
		spec.defineOptionArgument('f', 'String', { long: 'foo' });

		expect(spec.get('f')).toEqual({ kind, ident: 'f', long: 'foo', type: 'String', optional: true });
		expect(spec.get('foo')).toEqual({ kind, ident: 'f', long: 'foo', type: 'String', optional: true });

		spec.defineOptionArgument('b', 'Number', { optional: false });

		expect(spec.get('b')).toEqual({ kind, ident: 'b', long: undefined, type: 'Number', optional: false });
	});

	it('Should return nothing if no spec exists by the given identifier', () =>
	{
		const spec: CommandArgumentSpec = new CommandArgumentSpec();
		expect(spec.get('foo')).toBe(undefined);
	});

	it('Should error on duplicate identifiers', () =>
	{
		let spec: CommandArgumentSpec = new CommandArgumentSpec();
		spec.defineOperand('foo', 'String');
		spec.defineOption('b');

		expect(() => spec.defineOptionArgument('f', 'Number', { long: 'foo' }))
			.toThrow('Long option-argument conflicts with existing operand');

		expect(() => spec.defineOptionArgument('b', 'String'))
			.toThrow('Option-argument conflicts with existing option');

		spec = new CommandArgumentSpec();
		spec.defineOptionArgument('f', 'String', { long: 'foo' });

		expect(() => spec.defineOperand('foo', 'Number'))
			.toThrow('Operand conflicts with existing long option-argument');

		expect(() => spec.defineOption('f'))
			.toThrow('Option conflicts with existing option-argument');
	});

	it('Should error on invalid identifiers', () =>
	{
		const spec: CommandArgumentSpec = new CommandArgumentSpec();

		expect(() => spec.defineOperand('f', 'String'))
			.toThrow('Operands must be at least 2 characters');

		expect(() => spec.defineOption('foo', { long: 'bar' }))
			.toThrow('Short option identifiers must not exceed 1 character');

		expect(() => spec.defineOption('f', { long: 'b' }))
			.toThrow('Long option identifiers must be at least 2 characters');

		expect(() => spec.defineOption('1'))
			.toThrow('Short option identifiers must match pattern /[a-zA-Z]/');

		expect(() => spec.defineOption('1a'))
			.toThrow('Long option identifiers must match pattern /[a-zA-Z][\\w-]+/');

		expect(() => spec.defineOptionArgument('1', 'String'))
			.toThrow('Option-arguments must match pattern [a-zA-Z]');

		expect(() => spec.defineOptionArgument('foo', 'String'))
			.toThrow('Option-arguments must not exceed 1 character');

		expect(() => spec.defineOptionArgument('f', 'String', { long: 'b' }))
			.toThrow('Long option-argument must be at least 2 characters');
	});

	it('Should error on non-optional operands following optional operands', () =>
	{
		const spec: CommandArgumentSpec = new CommandArgumentSpec();
		spec.defineOperand('foo', 'String', { optional: true });

		expect(() => spec.defineOperand('bar', 'String', { optional: false }))
			.toThrow('Non-optional operands may not follow optional operands');
	});
});
