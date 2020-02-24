import { CommandArgumentKind } from './CommandArgumentKind';

/**
 * Represents a defined operand within `CommandArgumentSpec`
 * @internal
 */
export interface CommandArgumentSpecOperand
{
	kind: CommandArgumentKind.Operand;
	ident: string;
	optional: boolean;
	type: string;
	rest: boolean;
}
