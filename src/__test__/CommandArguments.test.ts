import { CommandArgumentSpec } from '../CommandArgumentSpec';
import { CommandArguments } from '../CommandArguments';
import { InputParser } from '../parsing/InputParser';
import { Operand } from '../Operand';
import { Option } from '../Option';
import { OptionArgument } from '../OptionArgument';
import { ParserOutput } from '../parsing/ParserOutput';

describe('CommandArguments', () =>
{
	it('Should compile passed declared operands', () =>
	{
		const spec: CommandArgumentSpec = new CommandArgumentSpec();

		spec.defineOperand('aa', 'String');

		const parserOutput: ParserOutput = InputParser.parse('foo', spec);
		const args: CommandArguments = new CommandArguments(spec, parserOutput);

		expect(args.get('aa')).toEqual({ ident: 'aa', value: 'foo' });
		expect(args.get(0)).toEqual({ ident: 'aa', value: 'foo' });
	});

	it('Should compile passed undeclared operands', () =>
	{
		const spec: CommandArgumentSpec = new CommandArgumentSpec();

		const parserOutput: ParserOutput = InputParser.parse('foo bar baz', spec);
		const args: CommandArguments = new CommandArguments(spec, parserOutput);

		expect(args.operands).toEqual([
			{ value: 'foo' },
			{ value: 'bar' },
			{ value: 'baz' }
		]);
	});

	it('Should compile missing declared optional operands', () =>
	{
		const spec: CommandArgumentSpec = new CommandArgumentSpec();
		spec.defineOperand('foo', 'String');
		spec.defineOperand('bar', 'String', { optional: true });
		spec.defineOperand('baz', 'String', { optional: true });

		const parserOutput: ParserOutput = InputParser.parse('foo bar', spec);
		const args: CommandArguments = new CommandArguments(spec, parserOutput);

		expect(args.operands).toEqual([
			{ ident: 'foo', value: 'foo' },
			{ ident: 'bar', value: 'bar' },
			{ ident: 'baz' }
		]);
	});

	// TODO: Write operand type tests after base resolvers are written
	//       or maybe just write a test suite for the resolvers themselves

	it('Should compile passed declared options', () =>
	{
		const spec: CommandArgumentSpec = new CommandArgumentSpec();

		spec.setParsingStrategy(2);
		spec.defineOption('a', { long: 'apple' });
		spec.defineOption('bar');

		const parserOutput: ParserOutput = InputParser.parse('-aa --apple --bar', spec);
		const args: CommandArguments = new CommandArguments(spec, parserOutput);

		expect(args.get('a')).toEqual({ ident: 'a', value: true, occurrences: 3 });
		expect(args.get('apple')).toEqual({ ident: 'a', value: true, occurrences: 3 });
		expect(args.get('bar')).toEqual({ ident: 'bar', value: true, occurrences: 1 });
	});

	it('Should compile passed undeclared options', () =>
	{
		const spec: CommandArgumentSpec = new CommandArgumentSpec();

		spec.setParsingStrategy(2);

		const parserOutput: ParserOutput = InputParser.parse('-aa --apple', spec);
		const args: CommandArguments = new CommandArguments(spec, parserOutput);

		expect(args.get('a')).toEqual({ ident: 'a', value: true, occurrences: 2 });
		expect(args.get('apple')).toEqual({ ident: 'apple', value: true, occurrences: 1 });
	});

	it('Should compile missing declared options', () =>
	{
		const spec: CommandArgumentSpec = new CommandArgumentSpec();

		spec.setParsingStrategy(2);
		spec.defineOption('a');

		const parserOutput: ParserOutput = InputParser.parse('', spec);
		const args: CommandArguments = new CommandArguments(spec, parserOutput);

		expect(args.get('a')).toEqual({ ident: 'a', value: false, occurrences: 0 });
	});

	it('Should compile passed option-arguments', () =>
	{
		const spec: CommandArgumentSpec = new CommandArgumentSpec();

		spec.setParsingStrategy(2);
		spec.defineOptionArgument('a', 'String', { long: 'apple' });

		const parserOutput: ParserOutput = InputParser.parse('-a foo', spec);
		const args: CommandArguments = new CommandArguments(spec, parserOutput);

		expect(args.get('a')).toEqual({ ident: 'a', value: 'foo' });
		expect(args.get('apple')).toEqual({ ident: 'a', value: 'foo' });
	});

	// TODO: Write option-argument type tests after base resolvers are written
	//       or maybe just write a test suite for the resolvers themselves

	it('Should compile a mix of argument types', () =>
	{
		const spec: CommandArgumentSpec = new CommandArgumentSpec();

		spec.setParsingStrategy(2);
		spec.defineOptionArgument('a', 'String', { long: 'apple' });
		spec.defineOption('b');
		spec.defineOption('c');
		spec.defineOperand('foo', 'String');

		const parserOutput: ParserOutput = InputParser.parse('-a foo -b bar', spec);
		const args: CommandArguments = new CommandArguments(spec, parserOutput);

		expect(args.get('a')).toEqual({ ident: 'a', value: 'foo' });
		expect(args.get('apple')).toEqual({ ident: 'a', value: 'foo' });
		expect(args.get('b')).toEqual({ ident: 'b', value: true, occurrences: 1 });
		expect(args.get('c')).toEqual({ ident: 'c', value: false, occurrences: 0 });
		expect(args.get('foo')).toEqual({ ident: 'foo', value: 'bar' });
		expect(args.get(0)).toEqual({ ident: 'foo', value: 'bar' });
	});

	function getErr(fn: Function): any
	{
		try { fn(); }
		catch (err) { return err; }
	}

	it('Should error on missing non-optional operands', () =>
	{
		const spec: CommandArgumentSpec = new CommandArgumentSpec();

		spec.defineOperand('aa', 'String');

		const parserOutput: ParserOutput = InputParser.parse('', spec);

		expect(getErr(() => new CommandArguments(spec, parserOutput)))
			.toEqual({ error: 0, kind: 2, ident: 'aa' });
	});

	it('Should error on missing non-optional option-arguments', () =>
	{
		const spec: CommandArgumentSpec = new CommandArgumentSpec();

		spec.setParsingStrategy(2);
		spec.defineOptionArgument('a', 'String', { optional: false });

		const parserOutput: ParserOutput = InputParser.parse('', spec);

		expect(getErr(() => new CommandArguments(spec, parserOutput)))
			.toEqual({ error: 0, kind: 1, ident: 'a' });
	});

	it('Should return correct values for isSome()', () =>
	{
		const spec: CommandArgumentSpec = new CommandArgumentSpec();

		spec.setParsingStrategy(2);
		spec.defineOperand('foo', 'String');
		spec.defineOperand('bar', 'String', { optional: true });
		spec.defineOption('baz');
		spec.defineOption('boo');
		spec.defineOptionArgument('far', 'Number', { optional: false });
		spec.defineOptionArgument('faz', 'Number');

		const parserOutput: ParserOutput = InputParser.parse('foo --baz --far 1', spec);
		const args: CommandArguments = new CommandArguments(spec, parserOutput);

		expect(args.get<Operand<string>>('foo')?.isSome()).toBe(true);
		expect(args.get<Operand<string>>('bar')?.isSome()).toBe(false);
		expect(args.get<Option>('baz')?.isSome()).toBe(true);

		// Should be true because unpassed options still hold `false`
		expect(args.get<Option>('boo')?.isSome()).toBe(true);

		expect(args.get<OptionArgument<number>>('far')?.isSome()).toBe(true);
		expect(args.get<OptionArgument<number>>('faz')?.isSome()).toBe(false);
	});

	it('Should get option by long or short identifier', () =>
	{
		const spec: CommandArgumentSpec = new CommandArgumentSpec();

		spec.setParsingStrategy(2);
		spec.defineOption('f', { long: 'foo' });

		const parserOutput: ParserOutput = InputParser.parse('--foo', spec);
		const args: CommandArguments = new CommandArguments(spec, parserOutput);

		expect(args.get<Option>('f')).toEqual({ ident: 'f', value: true, occurrences: 1 });
		expect(args.get<Option>('foo')).toEqual({ ident: 'f', value: true, occurrences: 1 });
	});

	it('Should get option-argument by long or short identifier', () =>
	{
		const spec: CommandArgumentSpec = new CommandArgumentSpec();

		spec.setParsingStrategy(2);
		spec.defineOptionArgument('f', 'String', { long: 'foo' });

		const parserOutput: ParserOutput = InputParser.parse('--foo bar', spec);
		const args: CommandArguments = new CommandArguments(spec, parserOutput);

		expect(args.get<OptionArgument<string>>('f')).toEqual({ ident: 'f', value: 'bar' });
		expect(args.get<OptionArgument<string>>('foo')).toEqual({ ident: 'f', value: 'bar' });
	});
});
