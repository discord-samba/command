import { CommandArgumentSpecFlag } from './CommandArgumentSpecFlag';
import { CommandArgumentSpecOperand } from './CommandArgumentSpecOperand';
import { CommandArgumentSpecOption } from './CommandArgumentSpecOption';

/**
 * Represents any value retrieved from `CommandArgumentSpec`
 * @internal
 */
export type CommandArgumentSpecEntry =
	| CommandArgumentSpecOperand
	| CommandArgumentSpecOption
	| CommandArgumentSpecFlag;
