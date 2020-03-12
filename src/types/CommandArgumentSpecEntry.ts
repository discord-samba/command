import { CommandArgumentKind } from './CommandArgumentKind';

/**
 * Represents any value retrieved from `CommandArgumentSpec`
 * @internal
 */
export type CommandArgumentSpecEntry = { kind: CommandArgumentKind } | undefined;
