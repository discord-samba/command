/* eslint-disable @typescript-eslint/indent */

/**
 * Enum containing the different kinds of errors we can expect to encounter
 * when compiling command arguments at call-time
 */
export enum CommandArgumentErrorKind
{

	/**
	 * Missing required argument: An argument was declared non-optional but was
	 * not given when the command was called
	 */
	MissingRequiredArgument,

	/**
	 * Argument resolution error: An error occurred while attempting to resolve
	 * a specific type from an argument's value
	 */
	ArgumentResolutionError
}
