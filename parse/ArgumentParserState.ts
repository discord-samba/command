import { ArgumentParseNode } from '#type/ArgumentParseNode';
import { CommandArgumentSpec } from '#argument/CommandArgumentSpec';
import { StringReader } from '#parse/StringReader';

/**
 * Container class for ArgumentParser state
 * @internal
 */
export class ArgumentParserState
{
	public reader: StringReader;
	public spec: CommandArgumentSpec;

	/**
	 * Holds all currently parsed input nodes
	 */
	public nodes: ArgumentParseNode[];

	/**
	 * Represents the index of the current argument being parsed
	 */
	public index: number;

	/**
	 * Represents whether or not we have just seen `=` and should
	 * assign the next value to an option (or discard it if it
	 * was mistakenly passed to a flag)
	 */
	public assignmentMode: boolean;

	public constructor(input: string, spec: CommandArgumentSpec)
	{
		this.reader = new StringReader(input.trim());
		this.spec = spec.clone();
		this.nodes = [];
		this.index = 0;
		this.assignmentMode = false;
	}

	/**
	 * The last node that was parsed
	 */
	public get lastNode(): ArgumentParseNode | undefined
	{
		return this.nodes[this.nodes.length - 1];
	}
}
