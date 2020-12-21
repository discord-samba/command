import { CommandArgumentKind } from '#type/CommandArgumentKind';

/**
 * Interface representing a given operand Command argument at parse-time
 * @internal
 */
export interface ICommandArgumentKindOperand
{
	kind: CommandArgumentKind;
	ident?: string;
	type: string;
	value: string;
}
