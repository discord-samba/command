import { CommandArgumentKind } from '#type/CommandArgumentKind';

/**
 * Represents a defined option within `CommandArgumentSpec`
 * @internal
 */
export interface CommandArgumentSpecOption
{
	kind: CommandArgumentKind.Option;
	ident: string;
	long?: string;
	optional: boolean;
	type: string;
}
