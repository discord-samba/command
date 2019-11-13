import { CommandArgumentOperand } from './CommandArgumentOperand';
import { CommandArgumentOption } from './CommandArgumentOption';
import { CommandArgumentOptionArgument } from './CommandArgumentOptionArgument';
import { ParserOutput } from './parsing/ParserOutput';

// TODO: Write class that takes ParserOutput and a command argument spec and assembles usable runtime arguments.
//
//       - Parsed arguments that do not match a defined spec can be discarded, excluding operands
//         which will always be made available by index if an identifier does not exist
//
//       - Kept arguments should have their values run through resolvers to resolve their runtime
//         type based on the type declared in the spec for that argument.
//
//       - Valid (defined) option types should have their occurrences summed.

export class CommandArguments
{
	private _operands: CommandArgumentOperand[];
	private _options: Map<string, CommandArgumentOption>;
	private _optionArgs: Map<string, CommandArgumentOptionArgument>;

	public constructor(parsedArgs: ParserOutput)
	{
		this._operands = [];
		this._options = new Map();
		this._optionArgs = new Map();

		for (const operand of parsedArgs.operands)
			this._operands.push(new CommandArgumentOperand(operand.value, operand.ident, operand.type));

		for (const option of parsedArgs.options.values())
		{
			const optionArgument: CommandArgumentOption = this._options.has(option.ident)
				? this._options.get(option.ident)!
				: new CommandArgumentOption(option.ident);

			optionArgument.increment();

			if (!this._options.has(option.ident))
				this._options.set(option.ident, optionArgument);
		}

		for (const optionArg of parsedArgs.optionArguments.values())
			this._optionArgs.set(
				optionArg.ident,
				new CommandArgumentOptionArgument(optionArg.ident, optionArg.value, optionArg.type)
			);

		// TODO: Take command spec in constructor params so we can check for
		//       args declared as not optional that were not received, and so
		//       we can add args for options that were not received so they
		//       will have a `false` value at command call-time
	}

	// TODO: Write method for fetching arguments by identifier. Must also be
	//       able to take index for fetching operands
}
