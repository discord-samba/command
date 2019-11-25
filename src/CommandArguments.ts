import { Argument } from './Argument';
import { CommandArgumentError } from './CommandArgumentError';
import { CommandArgumentErrorContext } from './CommandArgumentErrorContext';
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
	public operands: Operand<any>[];

	/**
	 * Map of Option identifiers to Option instances
	 */
	public options: Map<string, Option>;

	/**
	 * Map of OptionArgument identifiers to OptionArgument instances
	 */
	public optionArguments: Map<string, OptionArgument<any>>;

	public constructor(spec: CommandArgumentSpec, parsedArgs: ParserOutput)
	{
		this.operands = [];
		this.options = new Map();
		this.optionArguments = new Map();

		// Compile operands
		for (const operand of parsedArgs.operands)
			this.operands.push(new Operand(operand.value, operand.ident, operand.type));

		// Check for missing non-optional operands and compile missing optional operands from spec
		for (const operand of spec.operands)
		{
			if (!this.operands.some(o => o.ident === operand.ident))
			{
				if (!operand.optional)
					throw new CommandArgumentError(
						CommandArgumentErrorKind.MissingRequiredArgument,
						new CommandArgumentErrorContext(operand.kind, operand.ident, operand.type)
					);

				let value!: any;
				this.operands.push(new Operand(value, operand.ident, operand.type));
			}
		}

		// Compile options
		for (const parsedOption of parsedArgs.options.values())
		{
			const option: Option = this.options.get(parsedOption.ident)
				?? new Option(parsedOption.ident);

			option.increment();

			if (!this.options.has(parsedOption.ident))
				this.options.set(parsedOption.ident, option);

			if (typeof parsedOption.long !== 'undefined' && !this.options.has(parsedOption.long))
				this.options.set(parsedOption.long, option);
		}

		// Compile missing options using the declared options from spec
		for (const option of spec.options.values())
			if (!this.options.has(option.ident))
				this.options.set(option.ident, new Option(option.ident));

		// Compile option-arguments
		for (const parsedOptionArg of parsedArgs.optionArguments.values())
		{
			const optionArgument: OptionArgument<any> =
				new OptionArgument(parsedOptionArg.ident, parsedOptionArg.value, parsedOptionArg.type);

			this.optionArguments.set(parsedOptionArg.ident, optionArgument);

			if (typeof parsedOptionArg.long !== 'undefined')
				this.optionArguments.set(parsedOptionArg.long, optionArgument);
		}

		// Check for missing non-optional option-arguments and compile missing option option-arguments from spec
		for (const optionArgument of spec.optionArguments.values())
		{
			if (!this.optionArguments.has(optionArgument.ident))
			{
				if (!optionArgument.optional)
					throw new CommandArgumentError(
						CommandArgumentErrorKind.MissingRequiredArgument,
						new CommandArgumentErrorContext(optionArgument.kind, optionArgument.ident, optionArgument.type)
					);

				let value!: any;
				this.optionArguments.set(
					optionArgument.ident,
					new OptionArgument(optionArgument.ident, value, optionArgument.type)
				);
			}
		}
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

		// Check options for the identifier
		if (this.options.has(ident))
			result = this.options.get(ident);

		// Otherwise check option-arguments
		if (this.optionArguments.has(ident) && typeof result === 'undefined')
			result = this.optionArguments.get(ident);

		return result as T;
	}
}
