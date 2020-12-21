import { CommandArgumentKind } from '#type/CommandArgumentKind';
import { CommandArgumentSpec } from '#root/CommandArgumentSpec';
import { StringReader } from '#parse/StringReader';

/**
 * @internal
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
