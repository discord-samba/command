/**
 * Enum containing the different Command argument parsing strategies
 */
export enum CommandArgumentParsingStrategy
{

	/**
	 * Every word is parsed as an individual operand
	 */
	Basic,

	/**
	 * Same as basic, but multiple words can be grouped with quotes, like
	 * `foo "bar baz"` will produce operands of `"foo"`, and `"bar baz"`
	 */
	AllowQuoting,

	/**
	 * Includes Basic and AllowQuoting, adds options and option-arguments
	 * (ex. options: `-f` or `--foo`, option-arguments: `-f bar` or `--foo bar`)
	 */
	Advanced
}
