import { InputParseErrorKind } from '#type/InputParseErrorKind';
import { ParserState } from '#type/ParserState';

/**
 * Represents an error encountered while parsing Command arguments. Holds a kind
 * and an index. You may provide a handler for these errors that can report them
 * in any way you desire
 *
 * TODO: Write a way to provide error handlers which will be given the same
 *       command context given to the Command call that threw the error
 */
export class InputParseError
{
	/**
	 * The kind of parse error encountered
	 */
	public kind: InputParseErrorKind;

	/**
	 * The argument index at which the error was encountered
	 */
	public index: number;

	public constructor(kind: InputParseErrorKind, state: ParserState)
	{
		this.kind = kind;
		this.index = state.index;
	}
}
