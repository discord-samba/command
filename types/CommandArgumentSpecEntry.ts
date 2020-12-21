import { CommandArgumentKind } from '#type/CommandArgumentKind';

/**
 * Represents any value retrieved from `CommandArgumentSpec`
 * @internal
 */
export type CommandArgumentSpecEntry = { kind: CommandArgumentKind } | undefined;
