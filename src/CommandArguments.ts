import { Argument } from '#root/Argument';
import { ArgumentParserOutput } from '#parse/ArgumentParserOutput';
import { CommandArgumentError } from '#root/CommandArgumentError';
import { CommandArgumentErrorContext } from '#root/CommandArgumentErrorContext';
import { CommandArgumentErrorKind } from '#type/CommandArgumentErrorKind';
import { CommandArgumentKind } from '#type/CommandArgumentKind';
import { CommandArgumentSpec } from '#root/CommandArgumentSpec';
import { CommandArgumentSpecOption } from '#type/CommandArgumentSpecOption';
import { CommandContext } from '#root/CommandContext';
import { Flag } from '#root/Flag';
import { Operand } from '#root/Operand';
import { Option } from '#root/Option';

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

	public constructor(spec: CommandArgumentSpec, parsedArgs: ArgumentParserOutput)
	{
		this.operands = [];
		this.flags = new Map();
		this.options = new Map();

		this._compileOperands(spec, parsedArgs);
		this._compileFlags(spec, parsedArgs);
		this._compileOptions(spec, parsedArgs);
	}

	/**
	 * Compile parsed operands and missing non-required operands from spec
	 */
	private _compileOperands(spec: CommandArgumentSpec, parsedArgs: ArgumentParserOutput): void
	{
		for (const operand of parsedArgs.operands)
			this.operands.push(new Operand(operand.value, operand.ident, operand.type, operand));

		// Check for missing required operands and compile missing non-required operands from spec
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
	private _compileFlags(spec: CommandArgumentSpec, parsedArgs: ArgumentParserOutput): void
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

		// Compile missing flags using the declared flags from spec
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
	private _compileOptions(spec: CommandArgumentSpec, parsedArgs: ArgumentParserOutput): void
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
			if (spec.get<CommandArgumentSpecOption>(parsedOption.ident)?.required
				&& typeof parsedOption.value === 'undefined')
				throw new CommandArgumentError(
					CommandArgumentErrorKind.MissingRequiredArgument,
					new CommandArgumentErrorContext(CommandArgumentKind.Option, option.ident, option.type)
				);

			this.options.set(parsedOption.ident, option);

			if (typeof parsedOption.long !== 'undefined')
				this.options.set(parsedOption.long, option);
		}

		// Check for missing required options and compile missing non-required options from spec
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
	 * Gets a Command argument by identifier. Extra operands that were not
	 * declared in the spec can be retrieved by numerical index which will
	 * first contain the declared operands.
	 *
	 * So for example, if you have 2 declared operands and 1 undeclared operand
	 * passed to the Command at call-time, the declared operands will be at
	 * indices `0` and `1` and the undeclared operand will be at index `2`
	 *
	 * You can also just access the entire set of operands passed to the Command
	 * via the `operands` field
	 *
	 * Flags and Options can also be accessed via the `flags` and `options`
	 * fields, respectively
	 */
	public get<T extends Argument<any>>(ident: string | number): T | undefined
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

		return result as T;
	}
}
