/**
 * Enum containing the different kinds of errors we can expect to encounter
 * when compiling command arguments at call-time
 *
 * 	0 - Missing required argument: An argument was declared non-optional but
 * 	    was not given when the command was called
 */
export enum CommandArgumentErrorKind
{
	MissingRequiredArgument
}
