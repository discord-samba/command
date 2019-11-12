import { CommandArgumentKind } from './CommandArgumentKind';

/**
 * Interface representing an option-argument Command argument at parse-time
 * @private
 */
export interface CommandArgumentOptionArgument
{
	kind: CommandArgumentKind;
	ident: string;
	value: string;
}
