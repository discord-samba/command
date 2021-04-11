import { Argument } from '#argument/Argument';
import { ArgumentParserOutput } from '#parse/ArgumentParserOutput';
import { CommandArgumentError } from '#error/CommandArgumentError';
import { CommandArgumentErrorContext } from '#error/CommandArgumentErrorContext';
import { CommandArgumentErrorKind } from '#error/CommandArgumentErrorKind';
import { CommandArgumentKind } from '#type/CommandArgumentKind';
import { CommandArgumentSpec } from '#argument/CommandArgumentSpec';
import { CommandArgumentSpecOption } from '#type/CommandArgumentSpecOption';
import { CommandContext } from '#root/CommandContext';
import { CommandModule } from '#root/CommandModule';
import { Flag } from '#argument/Flag';
import { Operand } from '#argument/Operand';
import { Option } from '#argument/Option';

/**
 * Container for all compiled arguments passed to a Command at call-time
 */
export class CommandArguments
{
	/**
	 * Array containing every Operand passed to the Command
	 */
	public operands: Operand<any>[];

	/**
	 * Map of Flag identifiers to Flag instances
	 */
	public flags: Map<string, Flag>;

	/**
	 * Map of Option identifiers to Option instances
	 */
	public options: Map<string, Option<any>>;

	private constructor()
	{
		this.operands = [];
		this.flags = new Map();
		this.options = new Map();
	}

	/**
	 * Creates a CommandArguments object using the given argument parser output
	 */
	public static fromParse(parsedArgs: ArgumentParserOutput): CommandArguments
	{
		const result: CommandArguments = new CommandArguments();

		result._compileOperands(parsedArgs);
		result._compileFlags(parsedArgs);
		result._compileOptions(parsedArgs);

		result.runBindings(parsedArgs.spec);

		return result;
	}

	/**
	 * Returns an empty CommandArguments object to be used for manually creating
	 * a complete set of arguments. Be sure to call [[`compileMissingArgs | compileMissingArgs()`]]
	 * and [[`runBindings | runBindings()`]] if using a CommandArgumentSpec that
	 * leverages those things
	 */
	public static empty(): CommandArguments
	{
		return new CommandArguments();
	}

	/**
	 * Compile parsed operands and missing non-required operands from spec
	 */
	private _compileOperands(parsedArgs: ArgumentParserOutput): void
	{
		for (const operand of parsedArgs.operands)
			this.operands.push(new Operand(operand.value, operand.ident, operand.type, operand));

		this._compileMissingOperands(parsedArgs.spec);
	}

	/**
	 * Check for missing required operands and compile missing non-required operands from spec
	 */
	private _compileMissingOperands(spec: CommandArgumentSpec): void
	{
		for (const operand of spec.operands)
		{
			if (!this.operands.some(o => o.ident === operand.ident))
			{
				// Error if operand is required but missing
				if (operand.required)
					throw new CommandArgumentError(
						CommandArgumentErrorKind.MissingRequiredArgument,
						new CommandArgumentErrorContext(operand.kind, operand.ident, operand.type)
					);

				let value!: any;
				this.operands.push(new Operand(value, operand.ident, operand.type));
			}
		}
	}

	/**
	 * Compile parsed flags and missing flags from spec
	 */
	private _compileFlags(parsedArgs: ArgumentParserOutput): void
	{
		for (const parsedFlag of parsedArgs.flags.values())
		{
			const flag: Flag = this.flags.get(parsedFlag.ident)
				?? new Flag(parsedFlag.ident, parsedFlag);

			flag.increment();

			if (!this.flags.has(parsedFlag.ident))
				this.flags.set(parsedFlag.ident, flag);

			if (typeof parsedFlag.long !== 'undefined' && !this.flags.has(parsedFlag.long))
				this.flags.set(parsedFlag.long, flag);
		}

		this._compileMissingFlags(parsedArgs.spec);
	}

	/**
	 * Compile missing flags using the declared flags from spec
	 */
	private _compileMissingFlags(spec: CommandArgumentSpec): void
	{
		for (const flagSpec of spec.flags.values())
		{
			const flag: Flag = new Flag(flagSpec.ident);
			if (!this.flags.has(flagSpec.ident))
				this.flags.set(flagSpec.ident, flag);

			if (typeof flagSpec.long !== 'undefined' && !this.flags.has(flagSpec.long))
				this.flags.set(flagSpec.long, flag);
		}
	}

	/**
	 * Compile parsed options and missing non-required operands from spec
	 */
	private _compileOptions(parsedArgs: ArgumentParserOutput): void
	{
		// Compile options
		for (const parsedOption of parsedArgs.options.values())
		{
			const option: Option<unknown> = new Option(
				parsedOption.ident,
				parsedOption.value,
				parsedOption.type,
				parsedOption
			);

			// Error on missing required option value (option was passed but failed to receive a value)
			if (parsedArgs.spec.get<CommandArgumentSpecOption>(parsedOption.ident)?.required
				&& typeof parsedOption.value === 'undefined')
				throw new CommandArgumentError(
					CommandArgumentErrorKind.MissingRequiredArgument,
					new CommandArgumentErrorContext(CommandArgumentKind.Option, option.ident, option.type)
				);

			this.options.set(parsedOption.ident, option);

			if (typeof parsedOption.long !== 'undefined')
				this.options.set(parsedOption.long, option);
		}

		this._compileMissingOptions(parsedArgs.spec);
	}

	/**
	 * Check for missing required options and compile missing non-required options from spec
	 */
	private _compileMissingOptions(spec: CommandArgumentSpec): void
	{
		for (const optionSpec of spec.options.values())
		{
			let value!: any;

			const option: Option<unknown> = new Option(
				optionSpec.ident,
				value,
				optionSpec.type
			);

			if (!this.options.has(optionSpec.ident))
			{
				// Error if option is required but missing
				if (optionSpec.required)
					throw new CommandArgumentError(
						CommandArgumentErrorKind.MissingRequiredArgument,
						new CommandArgumentErrorContext(CommandArgumentKind.Option, optionSpec.ident, optionSpec.type)
					);

				this.options.set(optionSpec.ident, option);
			}

			if (typeof optionSpec.long !== 'undefined' && !this.options.has(optionSpec.long))
				this.options.set(optionSpec.long, option);
		}
	}

	/**
	 * Compile all missing arguments using the given spec
	 */
	public compileMissingArgs(spec: CommandArgumentSpec): void
	{
		this._compileMissingOperands(spec);
		this._compileMissingFlags(spec);
		this._compileMissingOptions(spec);
	}

	/**
	 * Map argument values to their bound counterparts based on the given spec
	 */
	public runBindings(spec: CommandArgumentSpec): void
	{
		for (const [ident, binding] of spec.bindings.entries())
		{
			const arg: Argument<any> = this.get(ident);
			const boundArg: Argument<any> = this.get(binding.ident);

			if (typeof arg.value === 'undefined')
				continue;

			if (typeof boundArg.value === 'undefined')
				boundArg.value = arg.value;

			if (boundArg instanceof Flag)
			{
				if (CommandModule.resolvers.get('Boolean')?.safeResolve(arg.value))
					boundArg.increment();
			}
		}
	}

	/**
	 * Runs all operand and option type resolvers for their values
	 * @internal
	 */
	public async resolveArguments(ctx: CommandContext): Promise<void>
	{
		const resolutions: Promise<void>[] = [
			...this.operands.map(async o => o.resolveType(ctx)),
			...Array.from(this.options.values()).map(async o => o.resolveType(ctx))
		];

		await Promise.all(resolutions);
	}

	/**
	 * Gets a Command argument by identifier (or an Operand by numerical index).
	 * Will error if given an argument was not found for the given ident/index.
	 * This means that for error-safety you should only use this method to get
	 * arguments that were defined in your Command's argument specification.
	 *
	 * If for whatever reason you want to (relatively) safely access undeclared
	 * arguments you can use the [[`operands`]] array, the [[`options`]] map, and
	 * the [[`flags`]] map, just be sure to check that they exist before using them
	 */
	public get<T extends Argument<any>>(ident: string | number): T
	{
		let result: Argument<any> | undefined;

		// Get operand by index
		if (typeof ident === 'number')
		{
			result = this.operands[ident];
			return result as T;
		}

		// Check for operand by ident
		const operand: Argument<any> = this.operands.find(o => o.ident === ident)!;
		if (typeof operand !== 'undefined')
			result = operand;

		// Check flags for the identifier
		if (typeof result === 'undefined' && this.flags.has(ident))
			result = this.flags.get(ident);

		// Otherwise check option
		if (typeof result === 'undefined' && this.options.has(ident))
			result = this.options.get(ident);

		// Error if we don't find any argument for the given ident/index
		if (typeof result === 'undefined')
			throw new RangeError('Attempted to access undeclared/unpassed argument');

		return result as T;
	}
}
