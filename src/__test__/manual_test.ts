/* eslint-disable no-console, capitalized-comments, lines-around-comment, sort-imports, no-mixed-operators */

import { CommandArgumentSpec } from '#root/argument/CommandArgumentSpec';
import { ArgumentParser } from '#parse/ArgumentParser';
import { ArgumentParserOutput } from '#parse/ArgumentParserOutput';
import { StringReader } from '#parse/StringReader';
import { CommandArguments } from '#root/argument/CommandArguments';
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
	spec.defineFlag('a');
	spec.defineFlag('b');
	spec.defineFlag('g');
	spec.defineOption('c', 'String');
	spec.defineOption('d', 'String', { long: 'dog', required: false });
	spec.defineOption('f', 'String', { long: 'fog', required: false });
	spec.defineOption('z', 'String', { long: 'boo' });

	console.log(spec.get('a'));
	console.log(spec.get('b'));
	console.log(spec.get('c'));
	console.log(spec.get('d'));
	console.log(spec.get('dog'));

	const start: number = now();
	const output: ArgumentParserOutput = ArgumentParser.parse(
		'-aaabf bar \n--boo \n1 -d foo "1" "foo \\"bar\\" baz" buh',
		spec
	);

	const args: CommandArguments = new CommandArguments(spec, output);
	const end: number = now();

	console.log(end - start);

	await args.resolveArguments(new CommandContext({} as any, {} as any, args));
	console.log('arguments resolved');

	console.log(output);
	console.log(args.operands);
	console.log(args.flags.values());
	console.log(args.options.values());

	const reader: StringReader = new StringReader('--');
	console.log(/^--$/.test(reader.peekSegment(5)));
}

main().catch(e => console.log(e));
