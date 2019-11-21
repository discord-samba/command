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

		expect(() => spec.defineOperand('foo', 'String'))
			.toThrow('Operand identifier conflicts with existing operand');

		expect(() => spec.defineOption('foo'))
			.toThrow('Option identifier conflicts with existing operand');

		expect(() => spec.defineOption('f', { long: 'foo' }))
			.toThrow('Option identifier conflicts with existing operand');

		expect(() => spec.defineOptionArgument('foo', 'String'))
			.toThrow('Option-argument identifier conflicts with existing operand');

		expect(() => spec.defineOptionArgument('f', 'String', { long: 'foo' }))
			.toThrow('Option-argument identifier conflicts with existing operand');

		spec = new CommandArgumentSpec();
		spec.defineOption('foo');

		expect(() => spec.defineOperand('foo', 'string'))
			.toThrow('Operand identifier conflicts with existing option');

		expect(() => spec.defineOption('foo'))
			.toThrow('Option identifier conflicts with existing option');

		expect(() => spec.defineOption('f', { long: 'foo' }))
			.toThrow('Option identifier conflicts with existing option');

		expect(() => spec.defineOptionArgument('foo', 'String'))
			.toThrow('Option-argument identifier conflicts with existing option');

		expect(() => spec.defineOptionArgument('f', 'String', { long: 'foo' }))
			.toThrow('Option-argument identifier conflicts with existing option');

		spec = new CommandArgumentSpec();
		spec.defineOption('f', { long: 'foo' });

		expect(() => spec.defineOperand('foo', 'string'))
			.toThrow('Operand identifier conflicts with existing option');

		expect(() => spec.defineOption('foo'))
			.toThrow('Option identifier conflicts with existing option');

		expect(() => spec.defineOption('f', { long: 'foo' }))
			.toThrow('Option identifier conflicts with existing option');

		expect(() => spec.defineOptionArgument('foo', 'String'))
			.toThrow('Option-argument identifier conflicts with existing option');

		expect(() => spec.defineOptionArgument('f', 'String', { long: 'foo' }))
			.toThrow('Option-argument identifier conflicts with existing option');

		spec = new CommandArgumentSpec();
		spec.defineOptionArgument('foo', 'String');

		expect(() => spec.defineOperand('foo', 'string'))
			.toThrow('Operand identifier conflicts with existing option-argument');

		expect(() => spec.defineOption('foo'))
			.toThrow('Option identifier conflicts with existing option-argument');

		expect(() => spec.defineOption('f', { long: 'foo' }))
			.toThrow('Option identifier conflicts with existing option-argument');

		expect(() => spec.defineOptionArgument('foo', 'String'))
			.toThrow('Option-argument identifier conflicts with existing option-argument');

		expect(() => spec.defineOptionArgument('f', 'String', { long: 'foo' }))
			.toThrow('Option-argument identifier conflicts with existing option-argument');

		spec = new CommandArgumentSpec();
		spec.defineOptionArgument('f', 'String', { long: 'foo' });

		expect(() => spec.defineOperand('foo', 'string'))
			.toThrow('Operand identifier conflicts with existing option-argument');

		expect(() => spec.defineOption('foo'))
			.toThrow('Option identifier conflicts with existing option-argument');

		expect(() => spec.defineOption('f', { long: 'foo' }))
			.toThrow('Option identifier conflicts with existing option-argument');

		expect(() => spec.defineOptionArgument('foo', 'String'))
			.toThrow('Option-argument identifier conflicts with existing option-argument');

		expect(() => spec.defineOptionArgument('f', 'String', { long: 'foo' }))
			.toThrow('Option-argument identifier conflicts with existing option-argument');
	});

	it('Should error on invalid identifiers', () =>
	{
		const spec: CommandArgumentSpec = new CommandArgumentSpec();

		expect(() => spec.defineOperand('a', 'String'))
			.toThrow('Operands must be at least 2 characters');

		expect(() => spec.defineOption('foo', { long: 'bar' }))
			.toThrow('Short option identifiers must not exceed 1 character');

		expect(() => spec.defineOption('a', { long: 'b' }))
			.toThrow('Long option identifiers must be at least 2 characters');

		expect(() => spec.defineOption('1'))
			.toThrow('Short option identifiers must match pattern /[a-zA-Z]/');

		expect(() => spec.defineOption('1a'))
			.toThrow('Long option identifiers must match pattern /[a-zA-Z][\\w-]+/');

		expect(() => spec.defineOption('a', { long: '1a' }))
			.toThrow('Long option identifiers must match pattern /[a-zA-Z][\\w-]+/');

		expect(() => spec.defineOptionArgument('aa', 'String', { long: 'foo' }))
			.toThrow('Short option-argument identifiers must not exceed 1 character');

		expect(() => spec.defineOptionArgument('a', 'String', { long: 'b' }))
			.toThrow('Long option-argument identifiers must be at least 2 characters');

		expect(() => spec.defineOptionArgument('1', 'String'))
			.toThrow('Short option-argument identifiers must match pattern /[a-zA-Z]/');

		expect(() => spec.defineOptionArgument('1a', 'String'))
			.toThrow('Long option-argument identifiers must match pattern /[a-zA-Z][\\w-]+/');

		expect(() => spec.defineOptionArgument('a', 'String', { long: '1a' }))
			.toThrow('Long option-argument identifiers must match pattern /[a-zA-Z][\\w-]+/');
	});

	it('Should error on non-optional operands following optional operands', () =>
	{
		const spec: CommandArgumentSpec = new CommandArgumentSpec();
		spec.defineOperand('foo', 'String', { optional: true });

		expect(() => spec.defineOperand('bar', 'String', { optional: false }))
			.toThrow('Non-optional operands may not follow optional operands');
	});
});
