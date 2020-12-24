import { CommandArgumentKind } from '#type/CommandArgumentKind';

/**
 * Interface representing a given flag Command argument at parse-time
 * @internal
 */
export interface ICommandArgumentKindFlag
{
	kind: CommandArgumentKind;
	ident: string;
}
