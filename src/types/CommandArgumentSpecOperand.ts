import { CommandArgumentKind } from './CommandArgumentKind';

/**
 * Represents a defined operand within `CommandArgumentSpec`
 * @private
 */
export interface CommandArgumentSpecOperand
{
	kind: CommandArgumentKind.Operand;
	ident: string;
	optional: boolean;
	type: string;
}
