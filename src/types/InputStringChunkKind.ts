/**
 * @internal
 */
export enum InputStringChunkKind
{
	Flag,
	MultiOption,
	InvalidMultiOption,
	OptionArgument,
	LongOptionArgument,
	Operand,
	Delimiter,
	None
}
