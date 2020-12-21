/**
 * @internal
 */
export enum InputStringChunkKind
{
	Option,
	MultiOption,
	InvalidMultiOption,
	OptionArgument,
	LongOptionArgument,
	Operand,
	Delimiter,
	None
}
