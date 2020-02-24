import { CommandArgumentSpec } from '../CommandArgumentSpec';
import { InputParser } from '../parsing/InputParser';

describe('InputParser', () =>
{
	it('Should parse operands', () =>
	{
		const spec: CommandArgumentSpec = new CommandArgumentSpec();
		spec.defineOperand('foo', 'String');
		spec.defineOperand('bar', 'Boolean');
		spec.defineOperand('baz', 'Number');

		expect(InputParser.parse('foo true 1 bar', spec)).toEqual({
			options: [],
			optionArguments: [],
			operands: [
				{ kind: 2, type: 'String', value: 'foo', ident: 'foo' },
				{ kind: 2, type: 'Boolean', value: 'true', ident: 'bar' },
				{ kind: 2, type: 'Number', value: '1', ident: 'baz' },
				{ kind: 2, type: 'String', value: 'bar' }
			]
		});
	});

	it('Should parse quoted operands', () =>
	{
		const spec: CommandArgumentSpec = new CommandArgumentSpec();
		spec.setParsingStrategy(1);

		expect(InputParser.parse('foo "foo bar baz" baz', spec)).toEqual({
			options: [],
			optionArguments: [],
			operands: [
				{ kind: 2, type: 'String', value: 'foo' },
				{ kind: 2, type: 'String', value: 'foo bar baz' },
				{ kind: 2, type: 'String', value: 'baz' },
			]
		});

		expect(InputParser.parse('foo \'foo bar baz\' baz', spec)).toEqual({
			options: [],
			optionArguments: [],
			operands: [
				{ kind: 2, type: 'String', value: 'foo' },
				{ kind: 2, type: 'String', value: 'foo bar baz' },
				{ kind: 2, type: 'String', value: 'baz' },
			]
		});

		expect(InputParser.parse('foo `foo bar baz` baz', spec)).toEqual({
			options: [],
			optionArguments: [],
			operands: [
				{ kind: 2, type: 'String', value: 'foo' },
				{ kind: 2, type: 'String', value: 'foo bar baz' },
				{ kind: 2, type: 'String', value: 'baz' },
			]
		});
	});

	it('Should ignore quoted operands in Basic parsing mode', () =>
	{
		const spec: CommandArgumentSpec = new CommandArgumentSpec();

		expect(InputParser.parse('foo "foo bar baz" baz', spec)).toEqual({
			options: [],
			optionArguments: [],
			operands: [
				{ kind: 2, type: 'String', value: 'foo' },
				{ kind: 2, type: 'String', value: '"foo' },
				{ kind: 2, type: 'String', value: 'bar' },
				{ kind: 2, type: 'String', value: 'baz"' },
				{ kind: 2, type: 'String', value: 'baz' },
			]
		});
	});

	it('Should parse quoted operands containing escaped quote-chars', () =>
	{
		const spec: CommandArgumentSpec = new CommandArgumentSpec();
		spec.setParsingStrategy(1);

		expect(InputParser.parse('foo "foo \\"bar\\" baz" baz', spec)).toEqual({
			options: [],
			optionArguments: [],
			operands: [
				{ kind: 2, type: 'String', value: 'foo' },
				{ kind: 2, type: 'String', value: 'foo "bar" baz' },
				{ kind: 2, type: 'String', value: 'baz' },
			]
		});

		expect(InputParser.parse('foo \'foo \\\'bar\\\' baz\' baz', spec)).toEqual({
			options: [],
			optionArguments: [],
			operands: [
				{ kind: 2, type: 'String', value: 'foo' },
				{ kind: 2, type: 'String', value: 'foo \'bar\' baz' },
				{ kind: 2, type: 'String', value: 'baz' },
			]
		});

		expect(InputParser.parse('foo `foo \\`bar\\` baz` baz', spec)).toEqual({
			options: [],
			optionArguments: [],
			operands: [
				{ kind: 2, type: 'String', value: 'foo' },
				{ kind: 2, type: 'String', value: 'foo `bar` baz' },
				{ kind: 2, type: 'String', value: 'baz' },
			]
		});
	});

	it('Should allow other quote types within quoted arguments', () =>
	{
		const spec: CommandArgumentSpec = new CommandArgumentSpec();
		spec.setParsingStrategy(1);

		expect(InputParser.parse('foo "foo `bar` baz" baz', spec)).toEqual({
			options: [],
			optionArguments: [],
			operands: [
				{ kind: 2, type: 'String', value: 'foo' },
				{ kind: 2, type: 'String', value: 'foo `bar` baz' },
				{ kind: 2, type: 'String', value: 'baz' },
			]
		});

		expect(InputParser.parse('foo "foo \'bar\' baz" baz', spec)).toEqual({
			options: [],
			optionArguments: [],
			operands: [
				{ kind: 2, type: 'String', value: 'foo' },
				{ kind: 2, type: 'String', value: 'foo \'bar\' baz' },
				{ kind: 2, type: 'String', value: 'baz' },
			]
		});

		expect(InputParser.parse('foo `foo \'bar\' baz` baz', spec)).toEqual({
			options: [],
			optionArguments: [],
			operands: [
				{ kind: 2, type: 'String', value: 'foo' },
				{ kind: 2, type: 'String', value: 'foo \'bar\' baz' },
				{ kind: 2, type: 'String', value: 'baz' },
			]
		});

		expect(InputParser.parse('foo `foo "bar" baz` baz', spec)).toEqual({
			options: [],
			optionArguments: [],
			operands: [
				{ kind: 2, type: 'String', value: 'foo' },
				{ kind: 2, type: 'String', value: 'foo "bar" baz' },
				{ kind: 2, type: 'String', value: 'baz' },
			]
		});

		expect(InputParser.parse('foo \'foo `bar` baz\' baz', spec)).toEqual({
			options: [],
			optionArguments: [],
			operands: [
				{ kind: 2, type: 'String', value: 'foo' },
				{ kind: 2, type: 'String', value: 'foo `bar` baz' },
				{ kind: 2, type: 'String', value: 'baz' },
			]
		});

		expect(InputParser.parse('foo \'foo "bar" baz\' baz', spec)).toEqual({
			options: [],
			optionArguments: [],
			operands: [
				{ kind: 2, type: 'String', value: 'foo' },
				{ kind: 2, type: 'String', value: 'foo "bar" baz' },
				{ kind: 2, type: 'String', value: 'baz' },
			]
		});
	});

	it('Should predictably handle unintentionally unescaped quotes in quoted operands', () =>
	{
		const spec: CommandArgumentSpec = new CommandArgumentSpec();
		spec.setParsingStrategy(1);

		expect(InputParser.parse('foo "foo "bar\\" baz" baz', spec)).toEqual({
			options: [],
			optionArguments: [],
			operands: [
				{ kind: 2, type: 'String', value: 'foo' },
				{ kind: 2, type: 'String', value: 'foo ' },
				{ kind: 2, type: 'String', value: 'bar\\"' },
				{ kind: 2, type: 'String', value: 'baz"' },
				{ kind: 2, type: 'String', value: 'baz' }
			]
		});

		expect(InputParser.parse('foo "foo \\"bar" baz" baz', spec)).toEqual({
			options: [],
			optionArguments: [],
			operands: [
				{ kind: 2, type: 'String', value: 'foo' },
				{ kind: 2, type: 'String', value: 'foo "bar' },
				{ kind: 2, type: 'String', value: 'baz"' },
				{ kind: 2, type: 'String', value: 'baz' }
			]
		});

		expect(InputParser.parse('foo "foo "bar" baz" baz', spec)).toEqual({
			options: [],
			optionArguments: [],
			operands: [
				{ kind: 2, type: 'String', value: 'foo' },
				{ kind: 2, type: 'String', value: 'foo ' },
				{ kind: 2, type: 'String', value: 'bar"' },
				{ kind: 2, type: 'String', value: 'baz"' },
				{ kind: 2, type: 'String', value: 'baz' }
			]
		});
	});

	it('Should predictably parse rest arguments', () =>
	{
		let spec: CommandArgumentSpec = new CommandArgumentSpec();
		spec.setParsingStrategy(2);
		spec.defineOperand('foo', 'String');
		spec.defineOperand('bar', 'String', { rest: true });

		expect(InputParser.parse('foo bar baz', spec)).toEqual({
			options: [],
			optionArguments: [],
			operands: [
				{ kind: 2, ident: 'foo', type: 'String', value: 'foo' },
				{ kind: 2, ident: 'bar', type: 'String', value: 'bar baz' }
			]
		});

		expect(InputParser.parse('foo "bar baz" boo', spec)).toEqual({
			options: [],
			optionArguments: [],
			operands: [
				{ kind: 2, ident: 'foo', type: 'String', value: 'foo' },
				{ kind: 2, ident: 'bar', type: 'String', value: '"bar baz" boo' }
			]
		});

		expect(InputParser.parse('"foo bar" baz boo', spec)).toEqual({
			options: [],
			optionArguments: [],
			operands: [
				{ kind: 2, ident: 'foo', type: 'String', value: 'foo bar' },
				{ kind: 2, ident: 'bar', type: 'String', value: 'baz boo' }
			]
		});

		expect(InputParser.parse('"foo bar" "baz boo"', spec)).toEqual({
			options: [],
			optionArguments: [],
			operands: [
				{ kind: 2, ident: 'foo', type: 'String', value: 'foo bar' },
				{ kind: 2, ident: 'bar', type: 'String', value: '"baz boo"' }
			]
		});

		expect(InputParser.parse('foo bar --baz', spec)).toEqual({
			options: [],
			optionArguments: [],
			operands: [
				{ kind: 2, ident: 'foo', type: 'String', value: 'foo' },
				{ kind: 2, ident: 'bar', type: 'String', value: 'bar --baz' }
			]
		});

		spec.defineOptionArgument('baz', 'String');

		expect(InputParser.parse('foo --baz "baz boo" far faz', spec)).toEqual({
			options: [],
			optionArguments: [
				{ kind: 1, ident: 'baz', type: 'String', value: 'baz boo' }
			],
			operands: [
				{ kind: 2, ident: 'foo', type: 'String', value: 'foo' },
				{ kind: 2, ident: 'bar', type: 'String', value: 'far faz' }
			]
		});

		expect(InputParser.parse('foo --baz baz boo far faz', spec)).toEqual({
			options: [],
			optionArguments: [
				{ kind: 1, ident: 'baz', type: 'String', value: 'baz' }
			],
			operands: [
				{ kind: 2, ident: 'foo', type: 'String', value: 'foo' },
				{ kind: 2, ident: 'bar', type: 'String', value: 'boo far faz' }
			]
		});

		spec = new CommandArgumentSpec();
		spec.setParsingStrategy(0);
		spec.defineOperand('foo', 'String');
		spec.defineOperand('bar', 'String', { rest: true });

		expect(InputParser.parse('foo "bar baz" boo', spec)).toEqual({
			options: [],
			optionArguments: [],
			operands: [
				{ kind: 2, ident: 'foo', type: 'String', value: 'foo' },
				{ kind: 2, ident: 'bar', type: 'String', value: '"bar baz" boo' }
			]
		});

		expect(InputParser.parse('"foo bar" baz boo', spec)).toEqual({
			options: [],
			optionArguments: [],
			operands: [
				{ kind: 2, ident: 'foo', type: 'String', value: '"foo' },
				{ kind: 2, ident: 'bar', type: 'String', value: 'bar" baz boo' }
			]
		});
	});

	it('Should treat options and option-arguments as operands in Basic parsing mode', () =>
	{
		const spec: CommandArgumentSpec = new CommandArgumentSpec();

		expect(InputParser.parse('foo -b --bar baz', spec)).toEqual({
			options: [],
			optionArguments: [],
			operands: [
				{ kind: 2, type: 'String', value: 'foo' },
				{ kind: 2, type: 'String', value: '-b' },
				{ kind: 2, type: 'String', value: '--bar' },
				{ kind: 2, type: 'String', value: 'baz' },
			]
		});
	});

	it('Should parse quoted option/option-argument-like items as operands', () =>
	{
		const spec: CommandArgumentSpec = new CommandArgumentSpec();
		spec.setParsingStrategy(2);

		expect(InputParser.parse('"--foo" "-abc" "-f" `-a` \'-b\'', spec)).toEqual({
			options: [],
			optionArguments: [],
			operands: [
				{ kind: 2, type: 'String', value: '--foo' },
				{ kind: 2, type: 'String', value: '-abc' },
				{ kind: 2, type: 'String', value: '-f' },
				{ kind: 2, type: 'String', value: '-a' },
				{ kind: 2, type: 'String', value: '-b' },
			]
		});
	});

	it('Should parse options', () =>
	{
		const spec: CommandArgumentSpec = new CommandArgumentSpec();
		spec.setParsingStrategy(2);

		expect(InputParser.parse('-a -b -c -def', spec)).toEqual({
			operands: [],
			optionArguments: [],
			options: [
				{ kind: 0, ident: 'a' },
				{ kind: 0, ident: 'b' },
				{ kind: 0, ident: 'c' },
				{ kind: 0, ident: 'd' },
				{ kind: 0, ident: 'e' },
				{ kind: 0, ident: 'f' }
			]
		});
	});

	it('Should allow options to be repeated', () =>
	{
		const spec: CommandArgumentSpec = new CommandArgumentSpec();
		spec.setParsingStrategy(2);

		expect(InputParser.parse('-a -a -aaa', spec)).toEqual({
			operands: [],
			optionArguments: [],
			options: [
				{ kind: 0, ident: 'a' },
				{ kind: 0, ident: 'a' },
				{ kind: 0, ident: 'a' },
				{ kind: 0, ident: 'a' },
				{ kind: 0, ident: 'a' }
			]
		});
	});

	it('Should parse multi-options as operands if they contain invalid chars', () =>
	{
		const spec: CommandArgumentSpec = new CommandArgumentSpec();
		spec.setParsingStrategy(2);

		expect(InputParser.parse('-fo1o', spec)).toEqual({
			options: [],
			optionArguments: [],
			operands: [
				{ kind: 2, type: 'String', value: '-fo1o' }
			]
		});
	});

	it('Should treat undeclared long option-arguments as long options', () =>
	{
		const spec: CommandArgumentSpec = new CommandArgumentSpec();
		spec.setParsingStrategy(2);

		expect(InputParser.parse('foo --bar baz', spec)).toEqual({
			options: [
				{ kind: 0, ident: 'bar' }
			],
			optionArguments: [],
			operands: [
				{ kind: 2, type: 'String', value: 'foo' },
				{ kind: 2, type: 'String', value: 'baz' }
			]
		});

		expect(InputParser.parse('--bar', spec)).toEqual({
			options: [
				{ kind: 0, ident: 'bar' }
			],
			optionArguments: [],
			operands: []
		});
	});

	it('Should parse declared option-arguments', () =>
	{
		const spec: CommandArgumentSpec = new CommandArgumentSpec();
		spec.setParsingStrategy(2);
		spec.defineOptionArgument('b', 'Number', { long: 'bar' });

		expect(InputParser.parse('-b 1', spec)).toEqual({
			options: [],
			operands: [],
			optionArguments: [
				{ kind: 1, type: 'Number', value: '1', ident: 'b', long: 'bar' }
			]
		});

		expect(InputParser.parse('--bar 1', spec)).toEqual({
			options: [],
			operands: [],
			optionArguments: [
				{ kind: 1, type: 'Number', value: '1', ident: 'b', long: 'bar' }
			]
		});
	});

	it('Should parse a mix of operands, options, and option-arguments', () =>
	{
		const spec: CommandArgumentSpec = new CommandArgumentSpec();
		spec.setParsingStrategy(2);
		spec.defineOptionArgument('f', 'Number');
		spec.defineOption('b');
		spec.defineOperand('foo', 'String');

		expect(InputParser.parse('-f 1 -b bar', spec)).toEqual({
			options: [
				{ kind: 0, ident: 'b' }
			],
			optionArguments: [
				{ kind: 1, type: 'Number', value: '1', ident: 'f' }
			],
			operands: [
				{ kind: 2, type: 'String', value: 'bar', ident: 'foo' }
			]
		});
	});

	it('Should allow an option-argument at the end of an option group', () =>
	{
		const spec: CommandArgumentSpec = new CommandArgumentSpec();
		spec.setParsingStrategy(2);
		spec.defineOptionArgument('f', 'Number');
		spec.defineOption('b');

		expect(InputParser.parse('-bf 1', spec)).toEqual({
			operands: [],
			options: [
				{ kind: 0, ident: 'b' }
			],
			optionArguments: [
				{ kind: 1, type: 'Number', value: '1', ident: 'f' }
			]
		});
	});

	it('Should parse everything following delimiter as operands', () =>
	{
		const spec: CommandArgumentSpec = new CommandArgumentSpec();
		spec.setParsingStrategy(2);

		expect(InputParser.parse('-abc -- -d -e -f', spec)).toEqual({
			optionArguments: [],
			options: [
				{ kind: 0, ident: 'a' },
				{ kind: 0, ident: 'b' },
				{ kind: 0, ident: 'c' },
			],
			operands: [
				{ kind: 2, type: 'String', value: '-d' },
				{ kind: 2, type: 'String', value: '-e' },
				{ kind: 2, type: 'String', value: '-f' },
			]
		});
	});

	// "If possible" here means it follows a defined option-argument
	it('Should parse delimiter as option-argument value if possible', () =>
	{
		const spec: CommandArgumentSpec = new CommandArgumentSpec();
		spec.setParsingStrategy(2);
		spec.defineOptionArgument('a', 'String');

		expect(InputParser.parse('-a -- foo', spec)).toEqual({
			options: [],
			optionArguments: [
				{ kind: 1, type: 'String', value: '--', ident: 'a' }
			],
			operands: [
				{ kind: 2, type: 'String', value: 'foo' }
			]
		});
	});

	function getErr(fn: Function): any
	{
		try { fn(); }
		catch (err) { return err; }
	}

	it('Should error on invalid option groups', () =>
	{
		const spec: CommandArgumentSpec = new CommandArgumentSpec();
		spec.setParsingStrategy(2);
		spec.defineOptionArgument('f', 'Number');
		spec.defineOption('b');

		expect(getErr(() => InputParser.parse('-fb', spec))).toEqual({ kind: 1, index: 0 });
		expect(getErr(() => InputParser.parse('foo -fb', spec))).toEqual({ kind: 1, index: 1 });
		expect(getErr(() => InputParser.parse('foo bar -fb', spec))).toEqual({ kind: 1, index: 2 });
	});

	it('Should error on unterminated quoted operands', () =>
	{
		const spec: CommandArgumentSpec = new CommandArgumentSpec();
		spec.setParsingStrategy(2);

		expect(getErr(() => InputParser.parse('"foo bar baz', spec))).toEqual({ kind: 0, index: 0 });
		expect(getErr(() => InputParser.parse('foo --foo "foo bar baz', spec))).toEqual({ kind: 0, index: 2 });
		expect(getErr(() => InputParser.parse('foo -f --bar "foo bar baz', spec))).toEqual({ kind: 0, index: 3 });

		spec.defineOptionArgument('b', 'String', { long: 'bar' });
		expect(getErr(() => InputParser.parse('-f --bar "foo bar baz', spec))).toEqual({ kind: 0, index: 2 });
	});

	it('Should error when option-arguments do not receive an argument', () =>
	{
		const spec: CommandArgumentSpec = new CommandArgumentSpec();
		spec.setParsingStrategy(2);
		spec.defineOptionArgument('a', 'String', { long: 'foo' });

		expect(getErr(() => InputParser.parse('-a', spec))).toEqual({ kind: 2, index: 0 });
		expect(getErr(() => InputParser.parse('--foo', spec))).toEqual({ kind: 2, index: 0 });
	});
});
