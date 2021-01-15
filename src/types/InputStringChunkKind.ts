/**
 * @internal
 */
export enum InputStringChunkKind
{
	Flag,
	MultiFlag,
	InvalidMultiFlag,
	Option,
	LongOption,
	Operand,
	Delimiter,
	None
}
