import { CommandArgumentKind } from './CommandArgumentKind';
import { CommandArgumentSpec } from '../CommandArgumentSpec';
import { StringReader } from '../parsing/StringReader';

/**
 * @private
 */
export interface ParserState
{
	reader: StringReader;
	spec: CommandArgumentSpec;
	nodes: ({ kind: CommandArgumentKind })[];

	/**
	 * Represents the index of the argument we're looking at next
	 */
	index: number;
}
