import { CommandArgumentKind } from './CommandArgumentKind';

/**
 * Represents a defined option within `CommandArgumentSpec`
 * @internal
 */
export interface CommandArgumentSpecOption
{
	kind: CommandArgumentKind.Option;
	ident: string;
	long?: string;
}
