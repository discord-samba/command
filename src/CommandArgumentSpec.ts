import { CommandArgumentKind } from './types/CommandArgumentKind';
import { CommandArgumentParsingStrategy } from './types/CommandArgumentParsingStrategy';
import { CommandArgumentSpecOperand } from './types/CommandArgumentSpecOperand';
import { CommandArgumentSpecOption } from './types/CommandArgumentSpecOption';
import { CommandArgumentSpecOptionArgument } from './types/CommandArgumentSpecOptionArgument';

/**
 * Used for defining the specification for what a Command's given arguments should
 * look like so the input parser can know how to parse the input given for a Command
 */
export class CommandArgumentSpec
{
	public operands: CommandArgumentSpecOperand[] = [];
	public options: Map<string, CommandArgumentSpecOption> = new Map();
	public optionArguments: Map<string, CommandArgumentSpecOptionArgument> = new Map();
	public parsingStrategy: CommandArgumentParsingStrategy = CommandArgumentParsingStrategy.Basic;

	/**
	 * Returns a clone of this CommandArgumentSpec
	 */
	public clone(): CommandArgumentSpec
	{
		const clone: CommandArgumentSpec = new CommandArgumentSpec();
		clone.operands = Array.from(this.operands.values());
		clone.options = new Map(this.options.entries());
		clone.optionArguments = new Map(this.optionArguments.entries());
		clone.parsingStrategy = this.parsingStrategy;
		return clone;
	}

	/**
	 * Sets the argument parsing strategy. Can be set to one of the following:
	 *
	 * 	0 - Basic. All words are counted as separate operands
	 * 	1 - Allow Quoting. Same as basic, but multiple arguments can be quoted
	 * 	    to create a single operand
	 * 	3 - Advanced. Includes basic and quoting, adds option flags and options
	 * 	    with arguments
	 */
	public setParsingStrategy(strategy: CommandArgumentParsingStrategy): void
	{
		this.parsingStrategy = strategy;
	}

	/**
	 * Defines a positional operand argument declaration for your Command's arguments specification.
	 * Must be given an identifier and a type, and can be declared optional (`false` by default).
	 * Optional operands must be added last and may not be followed by a non-optional operand.
	 *
	 * Operand identifiers should be at least 2 characters to avoid confusion
	 * and avoid conflict with options and option-arguments
	 *
	 * **NOTE:** If the parsing strategy is not set to `Advanced` (`2`) then every argument
	 * encountered will be treated as an operand. If an argument follows an option and that
	 * option is not defined as an OptionArgument via `defineOptionArgument()` then the
	 * argument will be parsed as an operand and the option will be ignored (or treated like
	 * an option if it was defined as an option, of course)
	 */
	public defineOperand(ident: string, type: string, options: { optional?: boolean} = {}): void
	{
		if (ident.length < 2)
			throw new Error('Operands must be at least 2 characters');

		if (this.optionArguments.has(ident))
			throw new Error('Operand conflicts with existing long option-argument');

		const operand: CommandArgumentSpecOperand = {
			kind: CommandArgumentKind.Operand,
			ident,
			optional: options.optional ?? false,
			type
		};

		if (this.operands[this.operands.length - 1]?.optional === true && operand.optional === false)
			throw new Error('Non-optional operands may not follow optional operands');

		this.operands.push(operand);
	}

	/**
	 * Defines an option flag (like `-o`) for your Command's arguments specification.
	 * Must be given a single letter identifier.
	 *
	 * **NOTE:**, If an option is found and the parsing strategy is not set to
	 * `Advanced` (`2`) then it will be treated as an operand. If an argument that
	 * can be parsed as an option is found in a command's input but the option
	 * is not declared then it will be ignored
	 */
	public defineOption(ident: string): void
	{
		if (ident.length > 1)
			throw new RangeError('Options must not exceed 1 character');

		if (!/[a-zA-Z]/.test(ident))
			throw new Error('Options must match pattern [a-zA-Z]');

		if (this.optionArguments.has(ident))
			throw new Error('Option conflicts with existing option-argument');

		this.options.set(ident, {
			kind: CommandArgumentKind.Option,
			ident,
		});
	}

	/**
	 * Defines an option that takes an argument (like `-f value`) for your Command's arguments
	 * specification. Must be given a 1-char identifier and a type for the argument to be
	 * parsed as, and can be declared optional (`true` by default), as well as given an
	 * optional longer identifier for use with `--` like `--foo value`
	 *
	 * **NOTE:** If an option-argument is found and the parsing strategy is not set to
	 * `Advanced` (`2`) then it will be treated as an operand. If an argument that can be
	 * parsed as an option-argument is found in a Command's input but the option-argument
	 * is not declared then it will be ignored and the argument passed to it will be treated
	 * as an operand
	 */
	public defineOptionArgument(
		ident: string,
		type: string,
		options: { long?: string, optional?: boolean} = {}
	): void
	{
		if (ident.length > 1)
			throw new RangeError('Option-arguments must not exceed 1 character');

		if (!/[a-zA-Z]/.test(ident))
			throw new Error('Option-arguments must match pattern [a-zA-Z]');

		if (this.options.has(ident))
			throw new Error('Option-argument conflicts with existing option');

		if (options.long?.length! < 2)
			throw new RangeError('Long option-argument must be at least 2 characters');

		if (typeof this.operands.find(o => o.ident === options.long) !== 'undefined')
			throw new Error('Long option-argument conflicts with existing operand');

		const optArg: CommandArgumentSpecOptionArgument = {
			kind: CommandArgumentKind.OptionArgument,
			ident,
			long: options.long,
			type,
			optional: options.optional ?? true
		};

		this.optionArguments.set(ident, optArg);
		if (typeof options.long !== 'undefined')
			this.optionArguments.set(options.long, optArg);
	}

	/**
	 * Returns an argument spec for the given identifier.
	 *
	 * **NOTE:** Operand specs should be retrieved by shifting operands array
	 * of a cloned spec.
	 *
	 * **WARNING:** Be sure to only operate on cloned specs. We do not want
	 * to shift the operand specs out of the original specification
	 */
	public get<T extends { kind: CommandArgumentKind }>(ident: string | number): T | undefined
	{
		let result: { kind: CommandArgumentKind } | undefined;

		// Get operand by index
		if (typeof ident === 'number')
		{
			result = this.operands[ident];
			return result as T;
		}

		// Check options for the identifier
		if (this.options.has(ident))
			result = this.options.get(ident);

		// Otherwise check option-arguments
		if (this.optionArguments.has(ident) && typeof result === 'undefined')
			result = this.optionArguments.get(ident);

		return result as T;
	}
}
