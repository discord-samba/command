/* eslint-disable no-undefined */

import { CommandArgumentKind } from '#type/CommandArgumentKind';
import { CommandArgumentSpec } from '#root/argument/CommandArgumentSpec';

describe('CommandArgumentSpec tests', () =>
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

	it('Should successfully define an option', () =>
	{
		const spec: CommandArgumentSpec = new CommandArgumentSpec();
		expect(() => spec.defineOption('b', 'Number')).not.toThrow();
		expect(() => spec.defineOption('bar', 'Number')).not.toThrow();
		expect(() => spec.defineOption('bar_baz', 'Number')).not.toThrow();
		expect(() => spec.defineOption('bar-baz', 'Number')).not.toThrow();
	});

	it('Should return the expected operand', () =>
	{
		const spec: CommandArgumentSpec = new CommandArgumentSpec();
		const kind: CommandArgumentKind = CommandArgumentKind.Operand;
		spec.defineOperand('foo', 'Number', { required: true });

		expect(spec.operands.shift()).toEqual({ kind, ident: 'foo', type: 'Number', required: true, rest: false });
	});

	it('Should return the expected flag', () =>
	{
		const spec: CommandArgumentSpec = new CommandArgumentSpec();
		const kind: CommandArgumentKind = CommandArgumentKind.Flag;
		spec.defineFlag('f', { long: 'foo' });

		expect(spec.get('f')).toEqual({ kind, ident: 'f', long: 'foo' });
		expect(spec.get('foo')).toEqual({ kind, ident: 'f', long: 'foo' });
	});

	it('Should return the expected option', () =>
	{
		const spec: CommandArgumentSpec = new CommandArgumentSpec();
		const kind: CommandArgumentKind = CommandArgumentKind.Option;
		spec.defineOption('f', 'String', { long: 'foo' });

		expect(spec.get('f')).toEqual({ kind, ident: 'f', long: 'foo', type: 'String', required: false });
		expect(spec.get('foo')).toEqual({ kind, ident: 'f', long: 'foo', type: 'String', required: false });

		spec.defineOption('b', 'Number', { required: true });

		expect(spec.get('b')).toEqual({ kind, ident: 'b', long: undefined, type: 'Number', required: true });
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

		expect(() => spec.defineOption('foo', 'String'))
			.toThrow('Option identifier conflicts with existing operand');

		expect(() => spec.defineOption('f', 'String', { long: 'foo' }))
			.toThrow('Option identifier conflicts with existing operand');

		spec = new CommandArgumentSpec();
		spec.defineFlag('foo');

		expect(() => spec.defineOperand('foo', 'string'))
			.toThrow('Operand identifier conflicts with existing flag');

		expect(() => spec.defineFlag('foo'))
			.toThrow('Flag identifier conflicts with existing flag');

		expect(() => spec.defineFlag('f', { long: 'foo' }))
			.toThrow('Flag identifier conflicts with existing flag');

		expect(() => spec.defineOption('foo', 'String'))
			.toThrow('Option identifier conflicts with existing flag');

		expect(() => spec.defineOption('f', 'String', { long: 'foo' }))
			.toThrow('Option identifier conflicts with existing flag');

		spec = new CommandArgumentSpec();
		spec.defineFlag('f', { long: 'foo' });

		expect(() => spec.defineOperand('foo', 'string'))
			.toThrow('Operand identifier conflicts with existing flag');

		expect(() => spec.defineFlag('foo'))
			.toThrow('Flag identifier conflicts with existing flag');

		expect(() => spec.defineFlag('f', { long: 'foo' }))
			.toThrow('Flag identifier conflicts with existing flag');

		expect(() => spec.defineOption('foo', 'String'))
			.toThrow('Option identifier conflicts with existing flag');

		expect(() => spec.defineOption('f', 'String', { long: 'foo' }))
			.toThrow('Option identifier conflicts with existing flag');

		spec = new CommandArgumentSpec();
		spec.defineOption('foo', 'String');

		expect(() => spec.defineOperand('foo', 'string'))
			.toThrow('Operand identifier conflicts with existing option');

		expect(() => spec.defineFlag('foo'))
			.toThrow('Flag identifier conflicts with existing option');

		expect(() => spec.defineFlag('f', { long: 'foo' }))
			.toThrow('Flag identifier conflicts with existing option');

		expect(() => spec.defineOption('foo', 'String'))
			.toThrow('Option identifier conflicts with existing option');

		expect(() => spec.defineOption('f', 'String', { long: 'foo' }))
			.toThrow('Option identifier conflicts with existing option');

		spec = new CommandArgumentSpec();
		spec.defineOption('f', 'String', { long: 'foo' });

		expect(() => spec.defineOperand('foo', 'string'))
			.toThrow('Operand identifier conflicts with existing option');

		expect(() => spec.defineFlag('foo'))
			.toThrow('Flag identifier conflicts with existing option');

		expect(() => spec.defineFlag('f', { long: 'foo' }))
			.toThrow('Flag identifier conflicts with existing option');

		expect(() => spec.defineOption('foo', 'String'))
			.toThrow('Option identifier conflicts with existing option');

		expect(() => spec.defineOption('f', 'String', { long: 'foo' }))
			.toThrow('Option identifier conflicts with existing option');
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

		expect(() => spec.defineOption('aa', 'String', { long: 'foo' }))
			.toThrow('Short option identifiers must not exceed 1 character');

		expect(() => spec.defineOption('a', 'String', { long: 'b' }))
			.toThrow('Long option identifiers must be at least 2 characters');

		expect(() => spec.defineOption('1', 'String'))
			.toThrow('Short option identifiers must match pattern /[a-zA-Z]/');

		expect(() => spec.defineOption('1a', 'String'))
			.toThrow(`Long option identifiers must match pattern ${longIdentPattern}`);

		expect(() => spec.defineOption('foo-', 'String'))
			.toThrow(`Long option identifiers must match pattern ${longIdentPattern}`);

		expect(() => spec.defineOption('foo_', 'String'))
			.toThrow(`Long option identifiers must match pattern ${longIdentPattern}`);

		expect(() => spec.defineOption('a', 'String', { long: '1a' }))
			.toThrow(`Long option identifiers must match pattern ${longIdentPattern}`);
	});

	it('Should error on required operands following non-required operands', () =>
	{
		const spec: CommandArgumentSpec = new CommandArgumentSpec();
		spec.defineOperand('foo', 'String', { required: false });

		expect(() => spec.defineOperand('bar', 'String', { required: true }))
			.toThrow('Required operands may not follow non-required operands');
	});

	it('Should error on additional operands following a rest operand', () =>
	{
		const spec: CommandArgumentSpec = new CommandArgumentSpec();
		spec.defineOperand('foo', 'String', { rest: true });

		expect(() => spec.defineOperand('bar', 'String'))
			.toThrow('Additional operands may not follow rest operands');
	});
});
