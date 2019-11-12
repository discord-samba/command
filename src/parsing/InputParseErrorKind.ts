/**
 * Enum containing the different Command argument parsing errors that can be
 * encountered.
 *
 * 	0 - A quoted operand was left unterminated (eg. `"foo bar baz`)
 * 	1 - Invalid multi-option. This means a multi-option (eg. `-abc` was given and
 * 	    it contains an option-argument but that option-argument appears somewhere
 * 	    other than the end of the multi-option
 * 	3 - Option-argument was given without an argument. This occurs when the last
 * 	    parseable argument given is an option-argument.
 */
export enum InputParseErrorKind
{
	UnterminatedQuotedOperand,
	InvalidMultiOption,
	OptionArgumentMissingArgument
}
