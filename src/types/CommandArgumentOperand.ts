import { CommandArgumentKind } from './CommandArgumentKind';

/**
 * Interface representing a given operand Command argument at parse-time
 * @private
 */
export interface CommandArgumentOperand
{
	kind: CommandArgumentKind;
	ident?: string;
	value: string;
}
