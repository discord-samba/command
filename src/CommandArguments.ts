import { CommandArgument } from './CommandArgument';
import { CommandArgumentError } from './CommandArgumentError';
import { CommandArgumentErrorKind } from './types/CommandArgumentErrorKind';
import { CommandArgumentSpec } from './CommandArgumentSpec';
import { Operand } from './Operand';
import { Option } from './Option';
import { OptionArgument } from './OptionArgument';
import { ParserOutput } from './parsing/ParserOutput';

/**
 * Container for all compiled arguments passed to a Command at call-time
 */
export class CommandArguments
{
	/**
	 * Array containing every Operand passed to the Command
	 */
	public operands: Operand[];

	/**
	 * Map of Option identifiers to Option instances
	 */
	public options: Map<string, Option>;

	/**
	 * Map of OptionArgument identifiers to OptionArgument instances
	 */
	public optionArguments: Map<string, OptionArgument>;

	public constructor(spec: CommandArgumentSpec, parsedArgs: ParserOutput)
	{
		this.operands = [];
		this.options = new Map();
		this.optionArguments = new Map();

		// Compile operands
		for (const operand of parsedArgs.operands)
			this.operands.push(new Operand(operand.value, operand.ident, operand.type));

		// Check for missing non-optional operands
		for (const operand of spec.operands)
		{
			if (!this.operands.some(o => o.ident === operand.ident) && !operand.optional)
				throw new CommandArgumentError(
					CommandArgumentErrorKind.MissingRequiredArgument,
					operand.kind,
					operand.ident
				);
		}

		// Compile options
		for (const option of parsedArgs.options.values())
		{
			const optionArgument: Option = this.options.has(option.ident)
				? this.options.get(option.ident)!
				: new Option(option.ident);

			optionArgument.increment();

			if (!this.options.has(option.ident))
				this.options.set(option.ident, optionArgument);
		}

		// Compile missing options using the declared options from spec
		for (const option of spec.options.values())
			if (!this.options.has(option.ident))
				this.options.set(option.ident, new Option(option.ident));

		// Compile option-arguments
		for (const optionArg of parsedArgs.optionArguments.values())
			this.optionArguments.set(
				optionArg.ident,
				new OptionArgument(optionArg.ident, optionArg.value, optionArg.type)
			);

		// Check for missing non-optional option-arguments
		for (const optionArgument of spec.optionArguments.values())
			if (!this.optionArguments.has(optionArgument.ident) && !optionArgument.optional)
				throw new CommandArgumentError(
					CommandArgumentErrorKind.MissingRequiredArgument,
					optionArgument.kind,
					optionArgument.ident
				);
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
	 * Options and Option-arguments can also be accessed via the `options` and
	 * `optionArguments` fields, respectively
	 */
	public get<T extends CommandArgument>(ident: string | number): T | undefined
	{
		let result: CommandArgument | undefined;

		// Get operand by index
		if (typeof ident === 'number')
		{
			result = this.operands[ident];
			return result as T;
		}

		// Check for operand by ident
		const operand: CommandArgument = this.operands.find(o => o.ident === ident)!;
		if (typeof operand !== 'undefined')
			result = operand;

		// Check options for the identifier
		if (this.options.has(ident))
			result = this.options.get(ident);

		// Otherwise check option-arguments
		if (this.optionArguments.has(ident) && typeof result === 'undefined')
			result = this.optionArguments.get(ident);

		return result as T;
	}
}
