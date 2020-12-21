/* eslint-disable no-console, capitalized-comments, lines-around-comment, sort-imports, no-mixed-operators */
import { CommandArgumentSpec } from '#root/CommandArgumentSpec';
import { InputParser } from '#parse/InputParser';
import { ParserOutput } from '#parse/ParserOutput';
import { StringReader } from '#parse/StringReader';
import { CommandArguments } from '#root/CommandArguments';
import { CommandContext } from '#root/CommandContext';

function now(): number
{
	type NSFunction = (hr?: [number, number]) => number;
	const ns: NSFunction = (hr = process.hrtime()) => hr[0] * 1e9 + hr[1];
	return (ns() - (ns() - process.uptime() * 1e9)) / 1e6;
}

async function main(): Promise<void>
{
	const spec: CommandArgumentSpec = new CommandArgumentSpec();

	spec.setParsingStrategy(2);

	spec.defineOperand('foo', 'Number');
	spec.defineOperand('bar', 'String');
	spec.defineOption('a');
	spec.defineOption('b');
	spec.defineOption('g');
	spec.defineOptionArgument('c', 'String');
	spec.defineOptionArgument('d', 'String', { long: 'dog', optional: false });
	spec.defineOptionArgument('f', 'String', { long: 'fog', optional: false });
	spec.defineOptionArgument('z', 'String', { long: 'boo' });

	console.log(spec.get('a'));
	console.log(spec.get('b'));
	console.log(spec.get('c'));
	console.log(spec.get('d'));
	console.log(spec.get('dog'));

	const start: number = now();
	const parsed: ParserOutput = InputParser.parse('-aaabf bar \n--boo \n1 -d foo "1" "foo \\"bar\\" baz" buh', spec);
	const args: CommandArguments = new CommandArguments(spec, parsed);
	const end: number = now();

	console.log(end - start);

	await args.resolveArguments(new CommandContext({} as any, {} as any, args));
	console.log('arguments resolved');

	console.log(parsed);
	console.log(args.operands);
	console.log(args.options.values());
	console.log(args.optionArguments.values());

	const reader: StringReader = new StringReader('--');
	console.log(/^--$/.test(reader.peekSegment(5)));
}

main().catch(e => console.log(e));
