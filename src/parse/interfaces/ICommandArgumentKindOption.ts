import { CommandArgumentKind } from '#type/CommandArgumentKind';

/**
 * Interface representing an option Command argument at parse-time
 * @internal
 */
export interface ICommandArgumentKindOption
{
	kind: CommandArgumentKind;
	ident: string;
	type: string;
	value: string;
}
