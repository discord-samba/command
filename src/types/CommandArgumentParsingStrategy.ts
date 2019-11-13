/**
 * Enum containing the different Command argument parsing strategies.
 *
 * 	0 - Basic: Every word is parsed as an individual operand
 * 	1 - Allow quoting: Same as basic, but multiple words can be grouped with quotes
 * 	2 - Advanced: 0 & 1, plus options and option-arguments (ex. `-f`, `-f foo`, `--foo bar`)
 */
export enum CommandArgumentParsingStrategy
{
	Basic,
	AllowQuoting,
	Advanced
}
