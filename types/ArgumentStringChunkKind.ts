/**
 * @internal
 */
export enum ArgumentStringChunkKind
{
	Flag,
	MultiFlag,
	InvalidMultiFlag,
	Option,
	LongFlagOrOption,
	Operand,
	Delimiter,
	Assignment,
	None
}
