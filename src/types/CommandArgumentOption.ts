import { CommandArgumentKind } from './CommandArgumentKind';

/**
 * Interface representing a given option Command argument at parse-time
 * @private
 */
export interface CommandArgumentOption
{
	kind: CommandArgumentKind;
	ident: string;
}
