import { CommandArgumentKind } from './CommandArgumentKind';

/**
 * Represents any value retrieved from `CommandArgumentSpec`
 * @private
 */
export type CommandArgumentSpecEntry = { kind: CommandArgumentKind } | undefined;
