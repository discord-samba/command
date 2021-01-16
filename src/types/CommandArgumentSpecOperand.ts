import { CommandArgumentKind } from '#type/CommandArgumentKind';

/**
 * Represents a defined operand within `CommandArgumentSpec`
 * @internal
 */
export interface CommandArgumentSpecOperand
{
	kind: CommandArgumentKind.Operand;
	ident: string;
	required: boolean;
	type: string;
	rest: boolean;
}
