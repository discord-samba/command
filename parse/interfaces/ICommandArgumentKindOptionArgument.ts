import { CommandArgumentKind } from '#type/CommandArgumentKind';

/**
 * Interface representing an option-argument Command argument at parse-time
 * @internal
 */
export interface ICommandArgumentKindOptionArgument
{
	kind: CommandArgumentKind;
	ident: string;
	type: string;
	value: string;
}
