/**
 * Enum containing the different Command argument parsing strategies.
 *
 * 	1 - Basic: Every word is parsed as an individual operand
 * 	2 - Allow quoting: Same as basic, but multiple words can be grouped with quotes
 * 	3 - Advanced: 1 & 2, plus options and option-arguments (ex. `-f`, `-f foo`, `--foo bar`)
 */
export enum CommandArgumentParsingStrategy
{
	Basic,
	AllowQuoting,
	Advanced
}
