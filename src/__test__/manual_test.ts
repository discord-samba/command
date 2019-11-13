/* eslint-disable no-console, capitalized-comments, lines-around-comment, sort-imports */
import { CommandArgumentSpec } from '../CommandArgumentSpec';
import { InputParser } from '../parsing/InputParser';
import { ParserOutput } from '../parsing/ParserOutput';
import { StringReader } from '../parsing/StringReader';
import { CommandArguments } from '../CommandArguments';
// import { CommandArgumentSpecOperand } from '../types/CommandArgumentSpecOperand';

const spec: CommandArgumentSpec = new CommandArgumentSpec();

spec.setParsingStrategy(2);

spec.defineOperand('foo', 'Number');
spec.defineOperand('bar', 'String');
spec.defineOption('a');
spec.defineOption('b');
spec.defineOptionArgument('c', 'String');
spec.defineOptionArgument('d', 'String', { long: 'dog', optional: false });
spec.defineOptionArgument('f', 'String', { long: 'fog', optional: false });
spec.defineOptionArgument('z', 'String', { long: 'boo' });

console.log(spec.get('a'));
console.log(spec.get('b'));
console.log(spec.get('c'));
console.log(spec.get('d'));
console.log(spec.get('dog'));

const parsed: ParserOutput = InputParser.parse('-aaabf bar \n--boo \n1 -d foo "baz boo" "foo \\"bar\\" baz" buh', spec);
const args: CommandArguments = new CommandArguments(parsed);
console.log(parsed);
console.log((args as any)._operands);
console.log((args as any)._options.values());
console.log((args as any)._optionArgs.values());

const reader: StringReader = new StringReader('--');
console.log(/^--$/.test(reader.peekSegment(5)));
