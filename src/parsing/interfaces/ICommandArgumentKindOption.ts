import { CommandArgumentKind } from '../../types/CommandArgumentKind';

/**
 * Interface representing a given option Command argument at parse-time
 * @private
 */
export interface ICommandArgumentKindOption
{
	kind: CommandArgumentKind;
	ident: string;
}
