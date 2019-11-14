import { CommandArgumentSpec } from '../CommandArgumentSpec';
import { CommandArguments } from '../CommandArguments';
import { InputParser } from '../parsing/InputParser';
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

	// TODO: Write operand type tests after base resolvers are written
	//       or maybe just write a test suite for the resolvers themselves

	it('Should compile passed declared options', () =>
	{
		const spec: CommandArgumentSpec = new CommandArgumentSpec();

		spec.setParsingStrategy(2);
		spec.defineOption('a');

		const parserOutput: ParserOutput = InputParser.parse('-aa', spec);
		const args: CommandArguments = new CommandArguments(spec, parserOutput);

		expect(args.get('a')).toEqual({ ident: 'a', value: true, occurrences: 2 });
	});

	it('Should compile passed undeclared options', () =>
	{
		const spec: CommandArgumentSpec = new CommandArgumentSpec();

		spec.setParsingStrategy(2);

		const parserOutput: ParserOutput = InputParser.parse('-aa', spec);
		const args: CommandArguments = new CommandArguments(spec, parserOutput);

		expect(args.get('a')).toEqual({ ident: 'a', value: true, occurrences: 2 });
	});

	it('Should allow compile missing declared options', () =>
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
		expect(args.get('apple')).toEqual({ ident: 'apple', value: 'foo' });
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
		expect(args.get('apple')).toEqual({ ident: 'apple', value: 'foo' });
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
});
