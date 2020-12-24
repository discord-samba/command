import { CommandArgKindImplFlag } from '#parse/commandArgKindImpl/CommandArgKindImplFlag';
import { CommandArgKindImplOperand } from '#parse/commandArgKindImpl/CommandArgKindImplOperand';
import { CommandArgKindImplOptionArgument } from '#parse/commandArgKindImpl/CommandArgKindImplOptionArgument';
import { CommandArgumentKind } from '#type/CommandArgumentKind';
import { CommandArgumentParsingStrategy } from '#type/CommandArgumentParsingStrategy';
import { CommandArgumentSpec } from '#root/CommandArgumentSpec';
import { CommandArgumentSpecEntry } from '#type/CommandArgumentSpecEntry';
import { CommandArgumentSpecFlag } from '#type/CommandArgumentSpecFlag';
import { CommandArgumentSpecOperand } from '#type/CommandArgumentSpecOperand';
import { CommandArgumentSpecOptionArgument } from '#type/CommandArgumentSpecOptionArgument';
import { InputParseError } from '#parse/InputParseError';
import { InputParseErrorKind } from '#type/InputParseErrorKind';
import { InputStringChunkKind } from '#type/InputStringChunkKind';
import { ParserOutput } from '#parse/ParserOutput';
import { ParserState } from '#type/ParserState';
import { StringReader } from '#parse/StringReader';

/** @internal */
export class InputParser
{
	/**
	 * Parses the given input using the given command argument specification
	 */
	public static parse(input: string, spec: CommandArgumentSpec): ParserOutput
	{
		const result: ParserOutput = new ParserOutput();
		const state: ParserState = {
			reader: new StringReader(input.trim()),
			spec: spec.clone(),
			nodes: [],
			index: 0
		};

		if (state.spec.parsingStrategy === CommandArgumentParsingStrategy.Basic)
			InputParser._parseBasic(state, result);

		else if (state.spec.parsingStrategy === CommandArgumentParsingStrategy.AllowQuoting)
			InputParser._parseAllowQuoting(state, result);

		else if (state.spec.parsingStrategy === CommandArgumentParsingStrategy.Advanced)
			InputParser._parseAdvanced(state, result);

		return result;
	}

	/**
	 * Handles parsing under the Basic parsing strategy
	 */
	private static _parseBasic(state: ParserState, out: ParserOutput): void
	{
		while (!state.reader.eoi())
		{
			const spec: CommandArgumentSpecOperand | undefined = state.spec.operands.shift();
			const operand: string = InputParser._consumeOperand(state, spec?.rest ?? false);
			const argument: CommandArgKindImplOperand =
				new CommandArgKindImplOperand(spec?.type ?? 'String', operand, spec?.ident);

			out.operands.push(argument);
			state.nodes.push(argument);
			state.index++;

			InputParser._discardWhitespace(state);
		}
	}

	/**
	 * Handles parsing under the AllowQuoting parsing strategy
	 */
	private static _parseAllowQuoting(state: ParserState, out: ParserOutput): void
	{
		while (!state.reader.eoi())
		{
			const spec: CommandArgumentSpecOperand | undefined = state.spec.operands.shift();
			const operand: string = spec?.rest
				? InputParser._consumeOperand(state, spec?.rest)
				: /['"`]/.test(state.reader.peek())
					? InputParser._consumeQuotedOperand(state)
					: InputParser._consumeOperand(state, false);

			const argument: CommandArgKindImplOperand =
				new CommandArgKindImplOperand(spec?.type ?? 'String', operand, spec?.ident);

			out.operands.push(argument);
			state.nodes.push(argument);
			state.index++;

			InputParser._discardWhitespace(state);
		}
	}

	/**
	 * Handles parsing under the Advanced parsing strategy
	 */
	private static _parseAdvanced(state: ParserState, out: ParserOutput): void
	{
		const optKindSubset: InputStringChunkKind[] = [
			InputStringChunkKind.Flag,
			InputStringChunkKind.MultiOption,
			InputStringChunkKind.InvalidMultiOption,
			InputStringChunkKind.OptionArgument,
			InputStringChunkKind.LongOptionArgument
		];

		while (true)
		{
			const kind: InputStringChunkKind = InputParser._peekChunkKind(state);

			// If we see a kind of none it means we've hit the end of input
			if (kind === InputStringChunkKind.None)
			{
				break;
			}

			// Parse the remaining input as operands if we see `--`
			else if (kind === InputStringChunkKind.Delimiter)
			{
				InputParser._discardDelimiter(state);
				InputParser._parseAllowQuoting(state, out);
				state.index++;
			}

			// Parse operands
			else if (kind === InputStringChunkKind.Operand)
			{
				const lastNode: CommandArgumentSpecEntry = state.nodes[state.nodes.length - 1];
				const followsOptArg: boolean = lastNode?.kind === CommandArgumentKind.OptionArgument;
				const optArgValUndef: boolean = followsOptArg
					&& typeof (lastNode as CommandArgKindImplOptionArgument).value === 'undefined';

				// Assign operand as previous option-argument value if following an option-argument
				if (optArgValUndef)
				{
					const value: string = /['"`]/.test(state.reader.peek())
						? InputParser._consumeQuotedOperand(state)
						: InputParser._consumeOperand(state, false);

					(lastNode as CommandArgKindImplOptionArgument).value = value;
					InputParser._discardWhitespace(state);
				}

				// Otherwise parse as a general operand
				else
				{
					const spec: CommandArgumentSpecOperand | undefined = state.spec.operands.shift();
					const operand: string = spec?.rest
						? InputParser._consumeOperand(state, spec?.rest)
						: /['"`]/.test(state.reader.peek())
							? InputParser._consumeQuotedOperand(state)
							: InputParser._consumeOperand(state, false);

					const argument: CommandArgKindImplOperand =
						new CommandArgKindImplOperand(spec?.type ?? 'String', operand, spec?.ident);

					out.operands.push(argument);
					state.nodes.push(argument);

					InputParser._discardWhitespace(state);
				}

				state.index++;
			}

			// Parse option kinds
			else if (optKindSubset.includes(kind))
			{
				// Error on invalid multi-options
				if (kind === InputStringChunkKind.InvalidMultiOption)
				{
					throw new InputParseError(InputParseErrorKind.InvalidMultiOption, state);
				}

				// Handle long option-arguments
				else if (kind === InputStringChunkKind.LongOptionArgument)
				{
					InputParser._consumeAppendLongOptionArgument(state, out);
					InputParser._discardWhitespace(state);
				}

				// Handle options and multi-options
				else
				{
					InputParser._consumeAppendOptionGroup(state, out);
					InputParser._discardWhitespace(state);
				}

				// Check if the last node was an option-argument and error if we see EOI
				const lastNode: CommandArgumentSpecEntry = state.nodes[state.nodes.length - 1];
				const followsOptArg: boolean = lastNode?.kind === CommandArgumentKind.OptionArgument;
				const optArgValUndef: boolean = followsOptArg
					&& typeof (lastNode as CommandArgKindImplOptionArgument).value === 'undefined';

				if (optArgValUndef && state.reader.eoi())
					throw new InputParseError(InputParseErrorKind.OptionArgumentMissingArgument, state);

				state.index++;
			}
		}
	}

	/**
	 * Discards whitespace until hitting a non-whitespace character
	 */
	private static _discardWhitespace(state: ParserState): void
	{
		while (/\s/.test(state.reader.peek()))
			state.reader.discard();
	}

	/**
	 * Discard `--` and the following whitepsace
	 */
	private static _discardDelimiter(state: ParserState): void
	{
		state.reader.discard(2);
		InputParser._discardWhitespace(state);
	}

	/**
	 * Consumes and returns an Operand string
	 */
	private static _consumeOperand(state: ParserState, rest: boolean): string
	{
		let operand: string = '';

		if (rest)
			while (!state.reader.eoi())
				operand += state.reader.consume();

		else
			while (!/\s/.test(state.reader.peek()) && !state.reader.eoi())
				operand += state.reader.consume();

		return operand;
	}

	/**
	 * Consumes and returns a quoted operand
	 */
	private static _consumeQuotedOperand(state: ParserState): string
	{
		let operand: string = '';
		const quoteChar: string = state.reader.consume();

		while (true)
		{
			// Discard end quote and return when we find the end of the operand
			if (state.reader.peek() === quoteChar && state.reader.peekBehind() !== '\\')
			{
				state.reader.discard();
				return operand;
			}

			// Handle escaped quoteChar
			if (state.reader.peekSegment(2) === `\\${quoteChar}`)
			{
				// Discard escape character
				state.reader.discard();
				operand += state.reader.consume();
				continue;
			}

			// Throw a parse error if the operand is unterminated
			if (state.reader.eoi())
				throw new InputParseError(InputParseErrorKind.UnterminatedQuotedOperand, state);

			operand += state.reader.consume();
		}
	}

	/**
	 * Consumes an option group, appending them to the parser output. An option
	 * group can consist of any number of options and may end in an option-argument.
	 * An option-argument anywhere but the end of the group renders the group invalid
	 */
	private static _consumeAppendOptionGroup(state: ParserState, out: ParserOutput): void
	{
		// Discard `-`
		state.reader.discard();

		while (!/\s/.test(state.reader.peek()) && !state.reader.eoi())
		{
			const ident: string = state.reader.consume();
			const spec: CommandArgumentSpecFlag | CommandArgumentSpecOptionArgument | undefined =
				state.spec.get(ident);

			// Handle option arguments
			if (spec?.kind === CommandArgumentKind.OptionArgument)
			{
				const optionArgument: CommandArgKindImplOptionArgument =
					new CommandArgKindImplOptionArgument(spec.ident, spec.type, spec.long);

				out.optionArguments.push(optionArgument);
				state.nodes.push(optionArgument);
			}

			// Handle regular options
			else
			{
				const argument: CommandArgKindImplFlag =
					new CommandArgKindImplFlag(ident, spec?.long);

				out.flags.push(argument);
				state.nodes.push(argument);
			}
		}
	}

	/**
	 * Consumes a long option or long option-argument, appending it to the parser output
	 */
	private static _consumeAppendLongOptionArgument(state: ParserState, out: ParserOutput): void
	{
		// Discard the `--`
		state.reader.discard(2);

		let ident: string = '';
		while (!/\s/.test(state.reader.peek()) && !state.reader.eoi())
			ident += state.reader.consume();

		const spec: CommandArgumentSpecOptionArgument | CommandArgumentSpecFlag | undefined =
			state.spec.get(ident);

		// Treat the long identifier as an option if it hasn't been defined
		// in the spec. The following argument will be treated as an operand
		// by nature of not being preceded by an option-argument
		if (typeof spec === 'undefined')
		{
			const option: CommandArgKindImplFlag = new CommandArgKindImplFlag(ident);
			out.flags.push(option);
			state.nodes.push(option);
			return;
		}

		// Handle long flags
		if (spec.kind === CommandArgumentKind.Flag)
		{
			const flag: CommandArgKindImplFlag = new CommandArgKindImplFlag(spec.ident, ident);
			out.flags.push(flag);
			state.nodes.push(flag);
			return;
		}

		const optionArgument: CommandArgKindImplOptionArgument =
			new CommandArgKindImplOptionArgument(spec.ident, spec.type, spec.long);

		out.optionArguments.push(optionArgument);
		state.nodes.push(optionArgument);
	}

	/**
	 * Peeks the kind of the next chunk of the input
	 */
	private static _peekChunkKind(state: ParserState): InputStringChunkKind
	{
		// Acknowledge delimiter if it shouldn't be parsed as OptionArgument input
		if (/^--\s/.test(state.reader.peekSegment(3)) || /^--$/.test(state.reader.peekSegment(3)))
		{
			const lastNode: CommandArgumentSpecEntry = state.nodes[state.nodes.length - 1];
			const followsOptArg: boolean = typeof lastNode !== 'undefined'
				&& lastNode.kind === CommandArgumentKind.OptionArgument;

			if (!followsOptArg)
				return InputStringChunkKind.Delimiter;

			if (followsOptArg && typeof (lastNode as CommandArgKindImplOptionArgument).value !== 'undefined')
				return InputStringChunkKind.Delimiter;

			return InputStringChunkKind.Operand;
		}

		if (state.reader.peek() === '-')
			return InputParser._peekOptKind(state);

		if (state.reader.eoi())
			return InputStringChunkKind.None;

		return InputStringChunkKind.Operand;
	}

	/**
	 * Peeks if we are looking at a flag, option-argument, multi-option, or
	 * a multi-option ending in an option-argument. Returns any of the following:
	 *
	 * 	InputStringChunkKind.Flag
	 * 	InputStringChunkKind.MultiOption
	 * 	InputStringChunkKind.InvalidMultiOption
	 * 	InputStringChunkKind.OptionArgument
	 * 	InputStringChunkKind.LongOptionArgument
	 * 	InputStringChunkKind.Operand
	 *
	 * Uses the given argument spec to determine the kind in ambiguous cases.
	 * If Operand is returned that means a multi-option with invalid chars
	 * was encountered and it should be treated as an operand
	 */
	private static _peekOptKind(state: ParserState): InputStringChunkKind
	{
		// Set the index to 1 to peek past the `-`
		let index: number = 1;
		let ident: string = '';

		// If we see a second `-`, treat as long OptionArgument
		if (state.reader.peek(index) === '-')
			return InputStringChunkKind.LongOptionArgument;

		// Build the identifier
		while (!/\s/.test(state.reader.peek(index)) && !state.reader.eoi(index))
		{
			ident += state.reader.peek(index);
			index++;
		}

		// Handle Flag and OptionArgument
		if (ident.length === 1)
		{
			const spec: CommandArgumentSpecEntry = state.spec.get(ident);

			// Assume that the kind is Flag if there is no spec for the given identifier
			if (typeof spec === 'undefined')
				return InputStringChunkKind.Flag;

			if (spec.kind === CommandArgumentKind.Flag)
				return InputStringChunkKind.Flag;

			if (spec.kind === CommandArgumentKind.OptionArgument)
				return InputStringChunkKind.OptionArgument;
		}

		// Handle potentially valid multi-options
		else if (/^[a-zA-Z]+$/.test(ident))
		{
			for (const [i, opt] of ident.split('').entries())
			{
				const spec: CommandArgumentSpecEntry = state.spec.get(opt);

				if (spec?.kind === CommandArgumentKind.OptionArgument && i !== ident.length - 1)
					return InputStringChunkKind.InvalidMultiOption;

				if (i === ident.length - 1)
					return InputStringChunkKind.MultiOption;
			}
		}

		// Could not determine a non-operand type
		return InputStringChunkKind.Operand;
	}
}
