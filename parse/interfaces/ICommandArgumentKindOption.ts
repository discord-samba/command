import { CommandArgumentKind } from '#type/CommandArgumentKind';

/**
 * Interface representing a given option Command argument at parse-time
 * @internal
 */
export interface ICommandArgumentKindOption
{
	kind: CommandArgumentKind;
	ident: string;
}
