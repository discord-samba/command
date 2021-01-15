/**
 * @internal
 */
export enum InputStringChunkKind
{
	Flag,
	MultiFlag,
	InvalidMultiFlag,
	Option,
	LongFlagOrOption,
	Operand,
	Delimiter,
	None
}
