import { ArgumentParseErrorKind } from '#type/ArgumentParseErrorKind';
import { ArgumentParserState } from '#parse/ArgumentParserState';

/**
 * Represents an error encountered while parsing Command arguments. Holds a kind
 * and an index. You may provide a handler for these errors that can report them
 * in any way you desire
 *
 * TODO: Write a way to provide error handlers which will be given the same
 *       command context given to the Command call that threw the error
 */
export class ArgumentParseError
{
	/**
	 * The kind of parse error encountered
	 */
	public kind: ArgumentParseErrorKind;

	/**
	 * The argument index at which the error was encountered
	 */
	public index: number;

	public constructor(kind: ArgumentParseErrorKind, state: ArgumentParserState)
	{
		this.kind = kind;
		this.index = state.index;
	}
}
