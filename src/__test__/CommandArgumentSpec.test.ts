/* eslint-disable no-undefined */
import { CommandArgumentKind } from '#type/CommandArgumentKind';
import { CommandArgumentSpec } from '#root/CommandArgumentSpec';

describe('CommandArgumentSpec', () =>
{
	it('Should successfully define an operand', () =>
	{
		const spec: CommandArgumentSpec = new CommandArgumentSpec();
		expect(() => spec.defineOperand('foo', 'String')).not.toThrow();
	});

	it('Should successfully define a flag', () =>
	{
		const spec: CommandArgumentSpec = new CommandArgumentSpec();
		expect(() => spec.defineFlag('a')).not.toThrow();
		expect(() => spec.defineFlag('foo')).not.toThrow();
		expect(() => spec.defineFlag('foo_bar')).not.toThrow();
		expect(() => spec.defineFlag('foo-bar')).not.toThrow();
	});

	it('Should successfully define an option-argument', () =>
	{
		const spec: CommandArgumentSpec = new CommandArgumentSpec();
		expect(() => spec.defineOptionArgument('b', 'Number')).not.toThrow();
		expect(() => spec.defineOptionArgument('bar', 'Number')).not.toThrow();
		expect(() => spec.defineOptionArgument('bar_baz', 'Number')).not.toThrow();
		expect(() => spec.defineOptionArgument('bar-baz', 'Number')).not.toThrow();
	});

	it('Should return the expected operand', () =>
	{
		const spec: CommandArgumentSpec = new CommandArgumentSpec();
		const kind: CommandArgumentKind = CommandArgumentKind.Operand;
		spec.defineOperand('foo', 'Number', { optional: true });

		expect(spec.operands.shift()).toEqual({ kind, ident: 'foo', type: 'Number', optional: true, rest: false });
	});

	it('Should return the expected flag', () =>
	{
		const spec: CommandArgumentSpec = new CommandArgumentSpec();
		const kind: CommandArgumentKind = CommandArgumentKind.Flag;
		spec.defineFlag('f', { long: 'foo' });

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

		expect(() => spec.defineFlag('foo'))
			.toThrow('Flag identifier conflicts with existing operand');

		expect(() => spec.defineFlag('f', { long: 'foo' }))
			.toThrow('Flag identifier conflicts with existing operand');

		expect(() => spec.defineOptionArgument('foo', 'String'))
			.toThrow('Option-argument identifier conflicts with existing operand');

		expect(() => spec.defineOptionArgument('f', 'String', { long: 'foo' }))
			.toThrow('Option-argument identifier conflicts with existing operand');

		spec = new CommandArgumentSpec();
		spec.defineFlag('foo');

		expect(() => spec.defineOperand('foo', 'string'))
			.toThrow('Operand identifier conflicts with existing flag');

		expect(() => spec.defineFlag('foo'))
			.toThrow('Flag identifier conflicts with existing flag');

		expect(() => spec.defineFlag('f', { long: 'foo' }))
			.toThrow('Flag identifier conflicts with existing flag');

		expect(() => spec.defineOptionArgument('foo', 'String'))
			.toThrow('Option-argument identifier conflicts with existing flag');

		expect(() => spec.defineOptionArgument('f', 'String', { long: 'foo' }))
			.toThrow('Option-argument identifier conflicts with existing flag');

		spec = new CommandArgumentSpec();
		spec.defineFlag('f', { long: 'foo' });

		expect(() => spec.defineOperand('foo', 'string'))
			.toThrow('Operand identifier conflicts with existing flag');

		expect(() => spec.defineFlag('foo'))
			.toThrow('Flag identifier conflicts with existing flag');

		expect(() => spec.defineFlag('f', { long: 'foo' }))
			.toThrow('Flag identifier conflicts with existing flag');

		expect(() => spec.defineOptionArgument('foo', 'String'))
			.toThrow('Option-argument identifier conflicts with existing flag');

		expect(() => spec.defineOptionArgument('f', 'String', { long: 'foo' }))
			.toThrow('Option-argument identifier conflicts with existing flag');

		spec = new CommandArgumentSpec();
		spec.defineOptionArgument('foo', 'String');

		expect(() => spec.defineOperand('foo', 'string'))
			.toThrow('Operand identifier conflicts with existing option-argument');

		expect(() => spec.defineFlag('foo'))
			.toThrow('Flag identifier conflicts with existing option-argument');

		expect(() => spec.defineFlag('f', { long: 'foo' }))
			.toThrow('Flag identifier conflicts with existing option-argument');

		expect(() => spec.defineOptionArgument('foo', 'String'))
			.toThrow('Option-argument identifier conflicts with existing option-argument');

		expect(() => spec.defineOptionArgument('f', 'String', { long: 'foo' }))
			.toThrow('Option-argument identifier conflicts with existing option-argument');

		spec = new CommandArgumentSpec();
		spec.defineOptionArgument('f', 'String', { long: 'foo' });

		expect(() => spec.defineOperand('foo', 'string'))
			.toThrow('Operand identifier conflicts with existing option-argument');

		expect(() => spec.defineFlag('foo'))
			.toThrow('Flag identifier conflicts with existing option-argument');

		expect(() => spec.defineFlag('f', { long: 'foo' }))
			.toThrow('Flag identifier conflicts with existing option-argument');

		expect(() => spec.defineOptionArgument('foo', 'String'))
			.toThrow('Option-argument identifier conflicts with existing option-argument');

		expect(() => spec.defineOptionArgument('f', 'String', { long: 'foo' }))
			.toThrow('Option-argument identifier conflicts with existing option-argument');
	});

	it('Should error on invalid identifiers', () =>
	{
		const spec: CommandArgumentSpec = new CommandArgumentSpec();
		const longIdentPattern: string = '/^(?=[a-zA-Z][\\w-]*[a-zA-Z0-9]$)[\\w-]+/';

		expect(() => spec.defineOperand('a', 'String'))
			.toThrow('Operand identifiers must be at least 2 characters');

		expect(() => spec.defineFlag('foo', { long: 'bar' }))
			.toThrow('Short flag identifiers must not exceed 1 character');

		expect(() => spec.defineFlag('a', { long: 'b' }))
			.toThrow('Long flag identifiers must be at least 2 characters');

		expect(() => spec.defineFlag('1'))
			.toThrow('Short flag identifiers must match pattern /[a-zA-Z]/');

		expect(() => spec.defineFlag('1a'))
			.toThrow(`Long flag identifiers must match pattern ${longIdentPattern}`);

		expect(() => spec.defineFlag('foo-'))
			.toThrow(`Long flag identifiers must match pattern ${longIdentPattern}`);

		expect(() => spec.defineFlag('foo_'))
			.toThrow(`Long flag identifiers must match pattern ${longIdentPattern}`);

		expect(() => spec.defineFlag('a', { long: '1a' }))
			.toThrow(`Long flag identifiers must match pattern ${longIdentPattern}`);

		expect(() => spec.defineOptionArgument('aa', 'String', { long: 'foo' }))
			.toThrow('Short option-argument identifiers must not exceed 1 character');

		expect(() => spec.defineOptionArgument('a', 'String', { long: 'b' }))
			.toThrow('Long option-argument identifiers must be at least 2 characters');

		expect(() => spec.defineOptionArgument('1', 'String'))
			.toThrow('Short option-argument identifiers must match pattern /[a-zA-Z]/');

		expect(() => spec.defineOptionArgument('1a', 'String'))
			.toThrow(`Long option-argument identifiers must match pattern ${longIdentPattern}`);

		expect(() => spec.defineOptionArgument('foo-', 'String'))
			.toThrow(`Long option-argument identifiers must match pattern ${longIdentPattern}`);

		expect(() => spec.defineOptionArgument('foo_', 'String'))
			.toThrow(`Long option-argument identifiers must match pattern ${longIdentPattern}`);

		expect(() => spec.defineOptionArgument('a', 'String', { long: '1a' }))
			.toThrow(`Long option-argument identifiers must match pattern ${longIdentPattern}`);
	});

	it('Should error on non-optional operands following optional operands', () =>
	{
		const spec: CommandArgumentSpec = new CommandArgumentSpec();
		spec.defineOperand('foo', 'String', { optional: true });

		expect(() => spec.defineOperand('bar', 'String', { optional: false }))
			.toThrow('Non-optional operands may not follow optional operands');
	});

	it('Should error on additional operands following a rest operand', () =>
	{
		const spec: CommandArgumentSpec = new CommandArgumentSpec();
		spec.defineOperand('foo', 'String', { rest: true });

		expect(() => spec.defineOperand('bar', 'String'))
			.toThrow('Additional operands may not follow rest operands');
	});
});
