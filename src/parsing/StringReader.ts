/**
 * @private
 */
export class StringReader
{
	private _input: string;
	private _index: number;

	public constructor(input: string)
	{
		this._input = input;
		this._index = 0;
	}

	/**
	 * Peeks at the next `n`th character. Defaults to 0, which represents the current
	 * index, which is the next character to be consumed.
	 */
	public peek(n: number = 0): string
	{
		return this._input[this._index + n];
	}

	/**
	 * Peeks the next segment of characters, `n` characters long. Can be offset
	 * to peek further ahead. Defaults to 0 characters of offset
	 */
	public peekSegment(n: number = 1, offset: number = 0): string
	{
		return this._input.substr(this._index + offset, n);
	}

	/**
	 * Peeks behind at the last `n`th character. Defaults to 1, which reperesents the
	 * current index - 1, which is the last character that was consumed
	 */
	public peekBehind(n: number = 1): string
	{
		return this._input[this._index - n];
	}

	/**
	 * Consume the next `n` characters in the string, returning them and
	 * advancing the reader position. Defaults to 1 character of consumption
	 */
	public consume(n: number = 1): string
	{
		if (n < 1)
			return '';

		const result: string = this._input.substr(this._index, n);
		this._index += n;

		return result;
	}

	/**
	 * Same as `StringReader#consume()` but the characters are discarded.
	 * This will eliminate any lint warnings for unused function returns
	 * rather than using `consume()` just to advance the reader
	 */
	public discard(n: number = 1): void
	{
		if (n < 1)
			return;

		this._index += n;
	}

	/**
	 * Returns whether or not the end of the input has been reached.
	 * Can be given a number to peek that many characters ahead for EOI.
	 * Defaults to 0 for peeking if the next character to be consumed is EOI
	 */
	public eoi(n: number = 0): boolean
	{
		return this._index + n >= this._input.length;
	}
}
