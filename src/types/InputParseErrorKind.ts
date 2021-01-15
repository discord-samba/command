/**
 * Enum containing the different Command argument parsing errors that can be
 * encountered.
 *
 * 	0 - A quoted operand was left unterminated (eg. `"foo bar baz`)
 * 	1 - Invalid multi-flag. This means a multi-flag (eg. `-abc` was given and
 * 	    it contains an option but that option appears somewhere
 * 	    other than the end of the multi-flag
 * 	2 - Option was given without an argument. This occurs when the last
 * 	    parseable argument given is an option.
 */
export enum InputParseErrorKind
{
	UnterminatedQuotedOperand,
	InvalidMultiFlag,
	OptionMissingArgument
}
