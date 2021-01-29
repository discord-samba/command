import { ArgumentParser } from '#parse/ArgumentParser';
import { ArgumentParserOutput } from '#parse/ArgumentParserOutput';
import { CommandArgumentSpec } from '#root/CommandArgumentSpec';
import { CommandArguments } from '#root/CommandArguments';
import { Flag } from '#root/Flag';
import { Operand } from '#root/Operand';
import { Option } from '#root/Option';

describe('CommandArguments tests', () =>
{
	// Avoid testing the raw argument node values since
	// those are already tested in the argument parser
	const raw: any = expect.anything();

	it('Should compile passed declared operands', () =>
	{
		const spec: CommandArgumentSpec = new CommandArgumentSpec();

		spec.defineOperand('aa', 'String');

		const parserOutput: ArgumentParserOutput = ArgumentParser.parse('foo', spec);
		const args: CommandArguments = new CommandArguments(spec, parserOutput);

		expect(args.get('aa')).toEqual({ raw, ident: 'aa', value: 'foo', type: 'String' });
		expect(args.get(0)).toEqual({ raw, ident: 'aa', value: 'foo', type: 'String' });
	});

	it('Should compile passed undeclared operands', () =>
	{
		const spec: CommandArgumentSpec = new CommandArgumentSpec();

		const parserOutput: ArgumentParserOutput = ArgumentParser.parse('foo bar baz', spec);
		const args: CommandArguments = new CommandArguments(spec, parserOutput);

		expect(args.operands).toEqual([
			{ raw, value: 'foo', type: 'String' },
			{ raw, value: 'bar', type: 'String' },
			{ raw, value: 'baz', type: 'String' }
		]);
	});

	it('Should compile missing declared optional operands', () =>
	{
		const spec: CommandArgumentSpec = new CommandArgumentSpec();
		spec.defineOperand('foo', 'String');
		spec.defineOperand('bar', 'String', { required: false });
		spec.defineOperand('baz', 'String', { required: false });

		const parserOutput: ArgumentParserOutput = ArgumentParser.parse('foo bar', spec);
		const args: CommandArguments = new CommandArguments(spec, parserOutput);

		expect(args.operands).toEqual([
			{ raw, ident: 'foo', value: 'foo', type: 'String' },
			{ raw, ident: 'bar', value: 'bar', type: 'String' },
			{ ident: 'baz', type: 'String' }
		]);
	});

	// TODO: Write operand type tests after base resolvers are written
	//       or maybe just write a test suite for the resolvers themselves

	it('Should compile passed declared flags', () =>
	{
		const spec: CommandArgumentSpec = new CommandArgumentSpec();

		spec.setParsingStrategy(2);
		spec.defineFlag('a', { long: 'apple' });
		spec.defineFlag('bar');

		const parserOutput: ArgumentParserOutput = ArgumentParser.parse('-aa --apple --bar', spec);
		const args: CommandArguments = new CommandArguments(spec, parserOutput);

		expect(args.get('a')).toEqual({ raw, ident: 'a', value: true, count: 3 });
		expect(args.get('apple')).toEqual({ raw, ident: 'a', value: true, count: 3 });
		expect(args.get('bar')).toEqual({ raw, ident: 'bar', value: true, count: 1 });
	});

	it('Should compile passed undeclared flags', () =>
	{
		const spec: CommandArgumentSpec = new CommandArgumentSpec();

		spec.setParsingStrategy(2);

		const parserOutput: ArgumentParserOutput = ArgumentParser.parse('-aa --apple', spec);
		const args: CommandArguments = new CommandArguments(spec, parserOutput);

		expect(args.get('a')).toEqual({ raw, ident: 'a', value: true, count: 2 });
		expect(args.get('apple')).toEqual({ raw, ident: 'apple', value: true, count: 1 });
	});

	it('Should compile missing declared flags', () =>
	{
		const spec: CommandArgumentSpec = new CommandArgumentSpec();

		spec.setParsingStrategy(2);
		spec.defineFlag('a');

		const parserOutput: ArgumentParserOutput = ArgumentParser.parse('', spec);
		const args: CommandArguments = new CommandArguments(spec, parserOutput);

		expect(args.get('a')).toEqual({ ident: 'a', value: false, count: 0 });
	});

	it('Should compile passed options', () =>
	{
		const spec: CommandArgumentSpec = new CommandArgumentSpec();

		spec.setParsingStrategy(2);
		spec.defineOption('a', 'String', { long: 'apple' });

		const parserOutput: ArgumentParserOutput = ArgumentParser.parse('-a foo', spec);
		const args: CommandArguments = new CommandArguments(spec, parserOutput);

		expect(args.get('a')).toEqual({ raw, ident: 'a', type: 'String', value: 'foo' });
		expect(args.get('apple')).toEqual({ raw, ident: 'a', type: 'String', value: 'foo' });
	});

	// TODO: Write option type tests after base resolvers are written
	//       or maybe just write a test suite for the resolvers themselves

	it('Should compile a mix of argument types', () =>
	{
		const spec: CommandArgumentSpec = new CommandArgumentSpec();

		spec.setParsingStrategy(2);
		spec.defineOption('a', 'String', { long: 'apple' });
		spec.defineFlag('b');
		spec.defineFlag('c');
		spec.defineOperand('foo', 'String');

		const parserOutput: ArgumentParserOutput = ArgumentParser.parse('-a foo -b bar', spec);
		const args: CommandArguments = new CommandArguments(spec, parserOutput);

		expect(args.get('a')).toEqual({ raw, ident: 'a', type: 'String', value: 'foo' });
		expect(args.get('apple')).toEqual({ raw, ident: 'a', type: 'String', value: 'foo' });
		expect(args.get('b')).toEqual({ raw, ident: 'b', value: true, count: 1 });
		expect(args.get('c')).toEqual({ ident: 'c', value: false, count: 0 });
		expect(args.get('foo')).toEqual({ raw, ident: 'foo', value: 'bar', type: 'String' });
		expect(args.get(0)).toEqual({ raw, ident: 'foo', value: 'bar', type: 'String' });
	});

	function getErr(fn: Function): any
	{
		try { fn(); }
		catch (err) { return err; }
	}

	it('Should error on missing required operands', () =>
	{
		const spec: CommandArgumentSpec = new CommandArgumentSpec();

		spec.defineOperand('aa', 'String');

		const parserOutput: ArgumentParserOutput = ArgumentParser.parse('', spec);

		expect(getErr(() => new CommandArguments(spec, parserOutput)))
			.toEqual({
				kind: 0,
				context: {
					kind: 2,
					ident: 'aa',
					type: 'String',
					data: []
				}
			});
	});

	it('Should error on missing required options', () =>
	{
		const spec: CommandArgumentSpec = new CommandArgumentSpec();

		spec.setParsingStrategy(2);
		spec.defineOption('a', 'String', { required: true });

		const parserOutput: ArgumentParserOutput = ArgumentParser.parse('', spec);

		expect(getErr(() => new CommandArguments(spec, parserOutput)))
			.toEqual({
				kind: 0,
				context: {
					kind: 1,
					ident: 'a',
					type: 'String',
					data: []
				}
			});
	});

	it('Should error when required options are passed but fail to receive a value', () =>
	{
		const spec: CommandArgumentSpec = new CommandArgumentSpec();
		spec.setParsingStrategy(2);
		spec.defineOption('a', 'String', { long: 'foo' });

		let parserOutput: ArgumentParserOutput = ArgumentParser.parse('-a', spec);

		expect(getErr(() => new CommandArguments(spec, parserOutput)))
			.toEqual({
				kind: 0,
				context: {
					kind: 1,
					ident: 'a',
					type: 'String',
					data: []
				}
			});

		parserOutput = ArgumentParser.parse('--foo', spec);

		expect(getErr(() => new CommandArguments(spec, parserOutput)))
			.toEqual({
				kind: 0,
				context: {
					kind: 1,
					ident: 'a',
					type: 'String',
					data: []
				}
			});
	});

	it('Should return correct values for isSome()', () =>
	{
		const spec: CommandArgumentSpec = new CommandArgumentSpec();

		spec.setParsingStrategy(2);
		spec.defineOperand('foo', 'String');
		spec.defineOperand('bar', 'String', { required: false });
		spec.defineFlag('baz');
		spec.defineFlag('boo');
		spec.defineOption('far', 'Number');
		spec.defineOption('faz', 'Number');

		const parserOutput: ArgumentParserOutput = ArgumentParser.parse('foo --baz --far 1', spec);
		const args: CommandArguments = new CommandArguments(spec, parserOutput);

		expect(args.get<Operand<string>>('foo')?.isSome()).toBe(true);
		expect(args.get<Operand<string>>('bar')?.isSome()).toBe(false);

		expect(args.get<Flag>('baz')?.isSome()).toBe(true);

		// Should be true because unpassed flags still hold a value of `false`,
		// while isSome() checks for the absence of a value
		expect(args.get<Flag>('boo')?.isSome()).toBe(true);

		expect(args.get<Option<number>>('far')?.isSome()).toBe(true);
		expect(args.get<Option<number>>('faz')?.isSome()).toBe(false);
	});

	it('Should get flag by long or short identifier', () =>
	{
		const spec: CommandArgumentSpec = new CommandArgumentSpec();

		spec.setParsingStrategy(2);
		spec.defineFlag('f', { long: 'foo' });

		const parserOutput: ArgumentParserOutput = ArgumentParser.parse('--foo', spec);
		const args: CommandArguments = new CommandArguments(spec, parserOutput);

		expect(args.get<Flag>('f')).toEqual({ raw, ident: 'f', value: true, count: 1 });
		expect(args.get<Flag>('foo')).toEqual({ raw, ident: 'f', value: true, count: 1 });
		expect(args.get<Flag>('f')).toEqual(args.get<Flag>('foo'));
	});

	it('Should get option by long or short identifier', () =>
	{
		const spec: CommandArgumentSpec = new CommandArgumentSpec();

		spec.setParsingStrategy(2);
		spec.defineOption('f', 'String', { long: 'foo' });

		const parserOutput: ArgumentParserOutput = ArgumentParser.parse('--foo bar', spec);
		const args: CommandArguments = new CommandArguments(spec, parserOutput);

		expect(args.get<Option<string>>('f')).toEqual({ raw, ident: 'f', type: 'String', value: 'bar' });
		expect(args.get<Option<string>>('foo')).toEqual({ raw, ident: 'f', type: 'String', value: 'bar' });
		expect(args.get<Option<string>>('f')).toEqual(args.get<Option<string>>('foo'));
	});
});
