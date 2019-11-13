import { CommandArgumentKind } from '../../types/CommandArgumentKind';

/**
 * Interface representing an option-argument Command argument at parse-time
 * @private
 */
export interface ICommandArgumentKindOptionArgument
{
	kind: CommandArgumentKind;
	ident: string;
	type: string;
	value: string;
}
