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

	/**
	 * Represents whether or not we have just seen `=` and should
	 * assign the next value to an option (or discard it if it
	 * was mistakenly passed to a flag)
	 */
	assignmentMode: boolean;

	/**
	 * Should be a getter that returns the most recent node
	 */
	lastNode: { kind: CommandArgumentKind } | undefined;
}
