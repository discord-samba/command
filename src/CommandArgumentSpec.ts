import { CommandArgumentKind } from './types/CommandArgumentKind';
import { CommandArgumentParsingStrategy } from './types/CommandArgumentParsingStrategy';
import { CommandArgumentSpecConflict } from './types/CommandArgumentSpecConflict';
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
	 * 	2 - Advanced. Includes basic and quoting, adds option flags and options
	 * 	    with arguments
	 */
	public setParsingStrategy(strategy: CommandArgumentParsingStrategy): void
	{
		this.parsingStrategy = strategy;
	}

	/**
	 * Returns whether or not the given identifier (or long identifier) conflicts
	 * with any existing identifiers.
	 */
	private _conflicts(ident: string, long: string = ''): CommandArgumentSpecConflict
	{
		if (this.operands.some(o => o.ident === ident || o.ident === long))
			return CommandArgumentSpecConflict.Operand;

		for (const option of this.options.values())
		{
			if (option.ident === ident
				|| option.long === ident
				|| option.ident === long
				|| option.long === long)
				return CommandArgumentSpecConflict.Option;
		}

		for (const optionArgument of this.optionArguments.values())
		{
			if (optionArgument.ident === ident
				|| optionArgument.long === ident
				|| optionArgument.ident === long
				|| optionArgument.long === long)
				return CommandArgumentSpecConflict.OptionArgument;
		}

		return CommandArgumentSpecConflict.None;
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

		const operand: CommandArgumentSpecOperand = {
			kind: CommandArgumentKind.Operand,
			ident,
			optional: options.optional ?? false,
			type
		};

		if (this.operands[this.operands.length - 1]?.optional && !operand.optional)
			throw new Error('Non-optional operands may not follow optional operands');

		switch (this._conflicts(ident))
		{
			case CommandArgumentSpecConflict.Operand:
				throw new Error('Operand identifier conflicts with existing operand');

			case CommandArgumentSpecConflict.Option:
				throw new Error('Operand identifier conflicts with existing option');

			case CommandArgumentSpecConflict.OptionArgument:
				throw new Error('Operand identifier conflicts with existing option-argument');

			case CommandArgumentSpecConflict.None:
				this.operands.push(operand);
		}
	}

	/**
	 * Defines an option flag (like `-o` or `--out`) for your Command's arguments
	 * specification.
	 *
	 * If given an identifier, it may be a single character or a long identifier.
	 * If given an optional long identifier in the options object parameter,
	 * in addition to the identifier as the first parameter, the first paramater
	 * may only be a single character.
	 *
	 * **NOTE:**, If an option is found and the parsing strategy is not set to
	 * `Advanced` (`2`) then it will be treated as an operand
	 */
	public defineOption(ident: string, options: { long?: string } = {}): void
	{
		if (typeof options.long === 'undefined')
		{
			if (ident.length === 1 && !/[a-zA-Z]/.test(ident))
				throw new Error('Short option identifiers must match pattern /[a-zA-Z]/');

			if (ident.length >= 2 && !/[a-zA-Z][\w-]+/.test(ident))
				throw new Error('Long option identifiers must match pattern /[a-zA-Z][\\w-]+/');
		}
		else
		{
			if (ident.length > 1)
				throw new RangeError('Short option identifiers must not exceed 1 character');

			if (options.long.length < 2)
				throw new RangeError('Long option identifiers must be at least 2 characters');

			if (!/[a-zA-Z][\w-]+/.test(options.long))
				throw new Error('Long option identifiers must match pattern /[a-zA-Z][\\w-]+/');
		}

		switch (this._conflicts(ident, options.long))
		{
			case CommandArgumentSpecConflict.Operand:
				throw new Error('Option identifier conflicts with existing operand');

			case CommandArgumentSpecConflict.Option:
				throw new Error('Option identifier conflicts with existing option');

			case CommandArgumentSpecConflict.OptionArgument:
				throw new Error('Option identifier conflicts with existing option-argument');

			case CommandArgumentSpecConflict.None:
				this.options.set(ident, {
					kind: CommandArgumentKind.Option,
					ident,
					long: options.long
				});
		}
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
	 * is not declared then it will be treated as a long option and the argument passed to
	 * it will be treated as an operand
	 */
	public defineOptionArgument(
		ident: string,
		type: string,
		options: { long?: string, optional?: boolean} = {}
	): void
	{
		if (typeof options.long === 'undefined')
		{
			if (ident.length === 1 && !/[a-zA-Z]/.test(ident))
				throw new Error('Short option-argument identifiers must match pattern /[a-zA-Z]/');

			if (ident.length >= 2 && !/[a-zA-Z][\w-]+/.test(ident))
				throw new Error('Long option-argument identifiers must match pattern /[a-zA-Z][\\w-]+/');
		}
		else
		{
			if (ident.length > 1)
				throw new RangeError('Short option-argument identifiers must not exceed 1 character');

			if (options.long.length < 2)
				throw new RangeError('Long option-argument identifiers must be at least 2 characters');

			if (!/[a-zA-Z][\w-]+/.test(options.long))
				throw new Error('Long option-argument identifiers must match pattern /[a-zA-Z][\\w-]+/');
		}

		switch (this._conflicts(ident, options.long))
		{
			case CommandArgumentSpecConflict.Operand:
				throw new Error('Option-argument identifier conflicts with existing operand');

			case CommandArgumentSpecConflict.Option:
				throw new Error('Option-argument identifier conflicts with existing option');

			case CommandArgumentSpecConflict.OptionArgument:
				throw new Error('Option-argument identifier conflicts with existing option-argument');

			case CommandArgumentSpecConflict.None:
				this.optionArguments.set(ident, {
					kind: CommandArgumentKind.OptionArgument,
					ident,
					long: options.long,
					type,
					optional: options.optional ?? true
				});
		}
	}

	/**
	 * Returns an option or option-argument spec for the given identifier.
	 *
	 * **NOTE:** Operand specs should be retrieved by shifting the operands
	 * array of a cloned spec.
	 *
	 * **WARNING:** Be sure to only operate on cloned specs. We do not want
	 * to shift the operand specs out of the original specification
	 */
	public get<T extends { kind: CommandArgumentKind }>(ident: string): T | undefined
	{
		let result: { kind: CommandArgumentKind } | undefined;

		// Check options for the identifier
		for (const option of this.options.values())
		{
			if (option.ident === ident || option.long === ident)
			{
				result = option;
				break;
			}
		}

		// Otherwise check option-arguments
		if (typeof result === 'undefined')
		{
			for (const optArg of this.optionArguments.values())
			{
				if (optArg.ident === ident || optArg.long === ident)
				{
					result = optArg;
					break;
				}
			}
		}

		return result as T;
	}
}
