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
	 * Includes Basic and AllowQuoting, adds flags and options
	 * (ex. flags: `-f` or `--foo`, options: `-f bar` or `--foo bar`)
	 */
	Advanced
}
