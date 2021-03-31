import { CommandArgumentKind } from '#type/CommandArgumentKind';
import { CommandArgumentParsingStrategy } from '#type/CommandArgumentParsingStrategy';
import { CommandArgumentSpecConflict } from '#type/CommandArgumentSpecConflict';
import { CommandArgumentSpecEntry } from '#type/CommandArgumentSpecEntry';
import { CommandArgumentSpecFlag } from '#type/CommandArgumentSpecFlag';
import { CommandArgumentSpecOperand } from '#type/CommandArgumentSpecOperand';
import { CommandArgumentSpecOption } from '#type/CommandArgumentSpecOption';
import { CommandModule } from '#root/CommandModule';

/**
 * Used for defining the specification for what a Command's given arguments should
 * look like so the input parser can know how to parse the input given for a Command
 */
export class CommandArgumentSpec
{
	public operands: CommandArgumentSpecOperand[] = [];
	public flags: Map<string, CommandArgumentSpecFlag> = new Map();
	public options: Map<string, CommandArgumentSpecOption> = new Map();
	public bindings: Map<string, CommandArgumentSpecEntry> = new Map();
	public parsingStrategy: CommandArgumentParsingStrategy = CommandArgumentParsingStrategy.Basic;

	private _rawBindings: Map<string, string> = new Map();

	private static _longIdent: RegExp = /^(?=[a-zA-Z][\w-]*[a-zA-Z0-9]$)[\w-]+/;

	/**
	 * Returns a clone of this CommandArgumentSpec
	 */
	public clone(): CommandArgumentSpec
	{
		const clone: CommandArgumentSpec = new CommandArgumentSpec();
		clone.operands = Array.from(this.operands.values());
		clone.flags = new Map(this.flags.entries());
		clone.options = new Map(this.options.entries());
		clone.bindings = new Map(this.bindings.entries());
		clone.parsingStrategy = this.parsingStrategy;
		return clone;
	}

	/**
	 * Sets the argument parsing strategy. Can be set to one of the following:
	 *
	 * ```txt
	 * 0 -> Basic. All words are counted as separate operands
	 * 1 -> AllowQuoting. Same as basic, but multiple arguments can be quoted
	 *      to create a single operand
	 * 2 -> Advanced. Includes basic and quoting, adds flags and options
	 *      with arguments
	 * ```
	 *
	 * Examples:
	 * ```txt
	 *        Basic -> `foo bar baz`
	 * AllowQuoting -> `foo "bar baz" boo`
	 *     Advanced -> `foo -b --bar --baz="boo far faz"`
	 * ```
	 *
	 * ***NOTE:*** *The default strategy is `Basic` (`0`). This is set *per command*, so
	 * setting one command's argument spec parsing strategy to `AllowQuoting` or
	 * `Advanced` will not affect any other commands. This can also be changed at any
	 * time, so you can feasibly iterate over all commands at runtime and forcibly change
	 * their parsing strategy (for example, to allow quoted arguments on a loaded command
	 * from a plugin that you did not write). For example:*
	 *
	 * ```js
	 * CommandModule.commands.get('foo').arguments.setParsingStrategy(1);
	 * ```
	 */
	public setParsingStrategy(strategy: CommandArgumentParsingStrategy): void
	{
		this.parsingStrategy = strategy;
	}

	/**
	 * Matches arguments to their bindings, erroring if the bound argument does
	 * not exist
	 */
	public finalizeBindings(): void
	{
		for (const [ident, binding] of this._rawBindings.entries())
		{
			const arg: CommandArgumentSpecEntry = this.get(ident)!;
			const boundArg: CommandArgumentSpecEntry | undefined = this.get(binding);
			if (typeof boundArg === 'undefined')
				throw new ReferenceError(`Could not find argument '${binding}' to bind to argument '${ident}'`);

			if (boundArg.kind === CommandArgumentKind.Flag
				&& arg.kind !== CommandArgumentKind.Flag
				&& !['boolean', 'bool'].includes(arg.type.toLowerCase()))
				throw new TypeError(
					`Argument '${ident}' is bound to Flag '${binding}' but is not of type 'boolean'`
				);

			this.bindings.set(ident, boundArg);
		}
	}

	/**
	 * Returns whether or not the given identifier (or long identifier) conflicts
	 * with any existing identifiers.
	 */
	private _conflicts(ident: string, long: string = ''): CommandArgumentSpecConflict
	{
		if (this.operands.some(o => o.ident === ident || o.ident === long))
			return CommandArgumentSpecConflict.Operand;

		for (const flag of this.flags.values())
		{
			if (flag.ident === ident
				|| flag.long === ident
				|| flag.ident === long
				|| flag.long === long)
				return CommandArgumentSpecConflict.Flag;
		}

		for (const option of this.options.values())
		{
			if (option.ident === ident
				|| option.long === ident
				|| option.ident === long
				|| option.long === long)
				return CommandArgumentSpecConflict.Option;
		}

		return CommandArgumentSpecConflict.None;
	}

	/**
	 * Defines a positional operand argument declaration for your Command's arguments specification.
	 * Must be given an identifier and a type, and can be declared required (`true` by default).
	 * Optional operands must be defined last and may not be followed by a non-optional operand.
	 *
	 * May also be declared as a rest operand (`false` by default), which will consume the remainder
	 * of the input as a single operand when parsing for that operand begins. Rest operands must be
	 * defined last and may not be followed by any additional operands.
	 *
	 * Operand identifiers must be at least 2 characters to avoid confusion and avoid conflict
	 * with flags and options
	 *
	 * Examples:
	 * ```js
	 * <Command>.arguments.defineOperand('foo', 'String');
	 * <Command>.arguments.defineOperand('bar', 'String', { required: false });
	 * ```
	 *
	 * ***NOTE:*** *If the parsing strategy is set to `AllowQuoting` (`1`) or higher and a quoted
	 * operand is going to be parsed but the spec says it should be a rest argument then the quotes
	 * will be preserved in the operand value.*
	 *
	 * ***NOTE:*** *Rest operands will supercede any other kind of argument when parsing for that operand
	 * begins. If the parsing strategy is `Advanced` (`2`) but the parser encounters something that
	 * would otherwise be parsed as a flag or option it will still be parsed as part
	 * of the rest operand. Note this is only the case when the parser is currently consuming a
	 * rest operand.*
	 *
	 * ***NOTE:*** *If the parsing strategy is not set to `Advanced` (`2`) then every argument
	 * encountered will be treated as an operand. If an argument follows a flag and that
	 * flag is not defined as an Option via `defineOption()` then the
	 * argument will be parsed as an operand and the flag will be parsed as a flag as expected*
	 */
	public defineOperand(
		ident: string,
		type: string,
		options: { required?: boolean, rest?: boolean, bindTo?: string } = {}
	): void
	{
		if (ident.length < 2)
			throw new Error('Operand identifiers must be at least 2 characters');

		if (!CommandModule.resolvers.has(type))
			throw new Error(`A resolver could not be found for type: ${type}`);

		const operand: CommandArgumentSpecOperand = {
			kind: CommandArgumentKind.Operand,
			ident,
			required: options.required ?? true,
			rest: options.rest ?? false,
			type
		};

		if (typeof this.operands[this.operands.length - 1] !== 'undefined'
			&& !this.operands[this.operands.length - 1].required
			&& operand.required)
			throw new Error('Required operands may not follow non-required operands');

		if (this.operands[this.operands.length - 1]?.rest)
			throw new Error('Additional operands may not follow rest operands');

		switch (this._conflicts(ident))
		{
			case CommandArgumentSpecConflict.Operand:
				throw new Error('Operand identifier conflicts with existing operand');

			case CommandArgumentSpecConflict.Flag:
				throw new Error('Operand identifier conflicts with existing flag');

			case CommandArgumentSpecConflict.Option:
				throw new Error('Operand identifier conflicts with existing option');

			case CommandArgumentSpecConflict.None:
				this.operands.push(operand);

				if (typeof options.bindTo !== 'undefined')
					this._rawBindings.set(ident, options.bindTo);
		}
	}

	/**
	 * Defines a flag (like `-h` or `--help`) for your Command's arguments
	 * specification.
	 *
	 * If given an identifier, it may be a single character or a long identifier.
	 * If given an optional long identifier in the options object parameter
	 * in addition to the identifier as the first parameter, the first paramater
	 * identifier may only be a single character. Example:
	 *
	 * ```js
	 * <Command>.arguments.defineFlag('f');
	 * <Command>.arguments.defineFlag('bar');
	 * <Command>.arguments.defineFlag('b', { long: 'baz' });
	 * ```
	 *
	 * ***NOTE:*** *If a flag is found and the parsing strategy is not set to
	 * `Advanced` (`2`) then it will be treated as an operand*
	 */
	public defineFlag(
		ident: string,
		options: { long?: string, bindTo?: string } = {}
	): void
	{
		if (typeof options.long === 'undefined')
		{
			if (ident.length === 1 && !/[a-zA-Z]/.test(ident))
				throw new Error('Short flag identifiers must match pattern /[a-zA-Z]/');

			if (ident.length >= 2 && !CommandArgumentSpec._longIdent.test(ident))
				throw new Error(`Long flag identifiers must match pattern ${CommandArgumentSpec._longIdent}`);
		}
		else
		{
			if (ident.length > 1)
				throw new RangeError('Short flag identifiers must not exceed 1 character');

			if (options.long.length < 2)
				throw new RangeError('Long flag identifiers must be at least 2 characters');

			if (!CommandArgumentSpec._longIdent.test(options.long))
				throw new Error(`Long flag identifiers must match pattern ${CommandArgumentSpec._longIdent}`);
		}

		switch (this._conflicts(ident, options.long))
		{
			case CommandArgumentSpecConflict.Operand:
				throw new Error('Flag identifier conflicts with existing operand');

			case CommandArgumentSpecConflict.Flag:
				throw new Error('Flag identifier conflicts with existing flag');

			case CommandArgumentSpecConflict.Option:
				throw new Error('Flag identifier conflicts with existing option');

			case CommandArgumentSpecConflict.None:
				const flag: CommandArgumentSpecFlag = {
					kind: CommandArgumentKind.Flag,
					ident,
					long: options.long
				};

				this.flags.set(ident, flag);
				if (typeof options.long !== 'undefined')
					this.flags.set(options.long, flag);

				if (typeof options.bindTo !== 'undefined')
					this._rawBindings.set(ident, options.bindTo);
		}
	}

	/**
	 * Defines an option that takes an argument (like `-f value`) for your Command's arguments
	 * specification.
	 *
	 * If given an identifier, it may be a single character or a long identifier.
	 * If given an optional long identifier in the options object parameter
	 * in addition to the identifier as the first parameter, the first paramater
	 * may only be a single character. Examples:
	 *
	 * ```js
	 * <Command>.spec.defineOption('f', 'String');
	 * <Command>.spec.defineOption('bar', 'String');
	 * <Command>.spec.defineOption('b', 'String', { long: 'baz' });
	 * ```
	 *
	 * ***NOTE:*** *If an option is found and the parsing strategy is not set to `Advanced` (`2`)
	 * then it will be treated as an operand. If an argument that can be parsed as an option
	 * is found in a Command's input but the option is not declared then it will be treated
	 * as a long flag and the argument passed to it will be treated as an operand*
	 */
	public defineOption(
		ident: string,
		type: string,
		options: { long?: string, required?: boolean, bindTo?: string } = {}
	): void
	{
		if (typeof options.long === 'undefined')
		{
			if (ident.length === 1 && !/[a-zA-Z]/.test(ident))
				throw new Error('Short option identifiers must match pattern /[a-zA-Z]/');

			if (ident.length >= 2 && !CommandArgumentSpec._longIdent.test(ident))
				throw new Error(
					`Long option identifiers must match pattern ${CommandArgumentSpec._longIdent}`
				);
		}
		else
		{
			if (ident.length > 1)
				throw new RangeError('Short option identifiers must not exceed 1 character');

			if (options.long.length < 2)
				throw new RangeError('Long option identifiers must be at least 2 characters');

			if (!CommandArgumentSpec._longIdent.test(options.long))
				throw new Error(
					`Long option identifiers must match pattern ${CommandArgumentSpec._longIdent}`
				);
		}

		if (!CommandModule.resolvers.has(type))
			throw new Error(`A resolver could not be found for type: ${type}`);

		switch (this._conflicts(ident, options.long))
		{
			case CommandArgumentSpecConflict.Operand:
				throw new Error('Option identifier conflicts with existing operand');

			case CommandArgumentSpecConflict.Flag:
				throw new Error('Option identifier conflicts with existing flag');

			case CommandArgumentSpecConflict.Option:
				throw new Error('Option identifier conflicts with existing option');

			case CommandArgumentSpecConflict.None:
				const option: CommandArgumentSpecOption = {
					kind: CommandArgumentKind.Option,
					ident,
					long: options.long,
					type,
					required: options.required ?? false
				};

				this.options.set(ident, option);
				if (typeof options.long !== 'undefined')
					this.options.set(options.long, option);

				if (typeof options.bindTo !== 'undefined')
					this._rawBindings.set(ident, options.bindTo);
		}
	}

	/**
	 * Returns a flag or option spec for the given identifier.
	 *
	 * ***NOTE:*** *Operand specs should be retrieved by shifting the operands
	 * array of a cloned spec.*
	 *
	 * ***WARNING:*** *Be sure to only operate on cloned specs. We do not want
	 * to shift the operand specs out of the original specification*
	 */
	public get<T extends CommandArgumentSpecEntry>(ident: string): T | undefined
	{
		let result: CommandArgumentSpecEntry | undefined;

		// Check flags for the identifier
		if (this.flags.has(ident))
			result = this.flags.get(ident);

		// Otherwise check options
		if (typeof result === 'undefined' && this.options.has(ident))
			result = this.options.get(ident);

		return result as T;
	}
}
