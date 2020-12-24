import { CommandArgumentKind } from '#type/CommandArgumentKind';

/**
 * Represents a defined flag within `CommandArgumentSpec`
 * @internal
 */
export interface CommandArgumentSpecFlag
{
	kind: CommandArgumentKind.Flag;
	ident: string;
	long?: string;
}
