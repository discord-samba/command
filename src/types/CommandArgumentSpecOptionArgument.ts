import { CommandArgumentKind } from '#type/CommandArgumentKind';

/**
 * Represents a defined option-argument within `CommandArgumentSpec`
 * @internal
 */
export interface CommandArgumentSpecOptionArgument
{
	kind: CommandArgumentKind.OptionArgument;
	ident: string;
	long?: string;
	optional: boolean;
	type: string;
}
