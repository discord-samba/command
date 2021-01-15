import { CommandArgKindImplFlag } from '#parse/commandArgKindImpl/CommandArgKindImplFlag';
import { CommandArgKindImplOperand } from '#parse/commandArgKindImpl/CommandArgKindImplOperand';
import { CommandArgKindImplOption } from '#parse/commandArgKindImpl/CommandArgKindImplOption';
import { CommandArgumentKind } from '#type/CommandArgumentKind';
import { CommandArgumentParsingStrategy } from '#type/CommandArgumentParsingStrategy';
import { CommandArgumentSpec } from '#root/CommandArgumentSpec';
import { CommandArgumentSpecEntry } from '#type/CommandArgumentSpecEntry';
import { CommandArgumentSpecFlag } from '#type/CommandArgumentSpecFlag';
import { CommandArgumentSpecOperand } from '#type/CommandArgumentSpecOperand';
import { CommandArgumentSpecOption } from '#type/CommandArgumentSpecOption';
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
		const out: ParserOutput = new ParserOutput();
		const state: ParserState = {
			reader: new StringReader(input.trim()),
			spec: spec.clone(),
			nodes: [],
			index: 0
		};

		if (state.spec.parsingStrategy === CommandArgumentParsingStrategy.Basic)
			InputParser._parseBasic(state, out);

		else if (state.spec.parsingStrategy === CommandArgumentParsingStrategy.AllowQuoting)
			InputParser._parseAllowQuoting(state, out);

		else if (state.spec.parsingStrategy === CommandArgumentParsingStrategy.Advanced)
			InputParser._parseAdvanced(state, out);

		return out;
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
			InputStringChunkKind.MultiFlag,
			InputStringChunkKind.InvalidMultiFlag,
			InputStringChunkKind.Option,
			InputStringChunkKind.LongFlagOrOption
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
				const followsOption: boolean = lastNode?.kind === CommandArgumentKind.Option;
				const optionValUndef: boolean = followsOption
					&& typeof (lastNode as CommandArgKindImplOption).value === 'undefined';

				// Assign operand as previous option value if following an option
				if (optionValUndef)
				{
					const value: string = /['"`]/.test(state.reader.peek())
						? InputParser._consumeQuotedOperand(state)
						: InputParser._consumeOperand(state, false);

					(lastNode as CommandArgKindImplOption).value = value;
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
				// Error on invalid multi-flags
				if (kind === InputStringChunkKind.InvalidMultiFlag)
				{
					throw new InputParseError(InputParseErrorKind.InvalidMultiFlag, state);
				}

				// Handle long options (which includes long flags)
				else if (kind === InputStringChunkKind.LongFlagOrOption)
				{
					InputParser._consumeAppendLongFlagOrOption(state, out);
					InputParser._discardWhitespace(state);
				}

				// Handle flags and multi-flags
				else
				{
					InputParser._consumeAppendFlagGroup(state, out);
					InputParser._discardWhitespace(state);
				}

				// Check if the last node was an option and error if we see EOI
				const lastNode: CommandArgumentSpecEntry = state.nodes[state.nodes.length - 1];
				const followsOption: boolean = lastNode?.kind === CommandArgumentKind.Option;
				const optionValUndef: boolean = followsOption
					&& typeof (lastNode as CommandArgKindImplOption).value === 'undefined';

				if (optionValUndef && state.reader.eoi())
					throw new InputParseError(InputParseErrorKind.OptionMissingArgument, state);

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
	 * Consumes a flag group, appending them to the parser output. A flag group
	 * can consist of any number of flags and may end in an option. An option
	 * anywhere but the end of the group renders the group invalid
	 */
	private static _consumeAppendFlagGroup(state: ParserState, out: ParserOutput): void
	{
		// Discard `-`
		state.reader.discard();

		while (!/\s/.test(state.reader.peek()) && !state.reader.eoi())
		{
			const ident: string = state.reader.consume();
			const spec: CommandArgumentSpecFlag | CommandArgumentSpecOption | undefined =
				state.spec.get(ident);

			// Handle options
			if (spec?.kind === CommandArgumentKind.Option)
			{
				const option: CommandArgKindImplOption =
					new CommandArgKindImplOption(spec.ident, spec.type, spec.long);

				out.options.push(option);
				state.nodes.push(option);
			}

			// Handle flags
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
	 * Consumes a long flag or long option, appending it to the parser output
	 */
	private static _consumeAppendLongFlagOrOption(state: ParserState, out: ParserOutput): void
	{
		// Discard the `--`
		state.reader.discard(2);

		let ident: string = '';
		while (!/\s/.test(state.reader.peek()) && !state.reader.eoi())
			ident += state.reader.consume();

		const spec: CommandArgumentSpecOption | CommandArgumentSpecFlag | undefined =
			state.spec.get(ident);

		// Treat the long identifier as a flag if it hasn't been defined
		// in the spec. The following argument will be treated as an operand
		// by nature of not being preceded by an actual option
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

		const option: CommandArgKindImplOption =
			new CommandArgKindImplOption(spec.ident, spec.type, spec.long);

		out.options.push(option);
		state.nodes.push(option);
	}

	/**
	 * Peeks the kind of the next chunk of the input
	 */
	private static _peekChunkKind(state: ParserState): InputStringChunkKind
	{
		// Acknowledge delimiter if it shouldn't be parsed as Option input
		if (/^--\s/.test(state.reader.peekSegment(3)) || /^--$/.test(state.reader.peekSegment(3)))
		{
			const lastNode: CommandArgumentSpecEntry = state.nodes[state.nodes.length - 1];
			const followsOption: boolean = typeof lastNode !== 'undefined'
				&& lastNode.kind === CommandArgumentKind.Option;

			if (!followsOption)
				return InputStringChunkKind.Delimiter;

			if (followsOption && typeof (lastNode as CommandArgKindImplOption).value !== 'undefined')
				return InputStringChunkKind.Delimiter;

			return InputStringChunkKind.Operand;
		}

		if (state.reader.peek() === '-')
			return InputParser._peekOptionKind(state);

		if (state.reader.eoi())
			return InputStringChunkKind.None;

		return InputStringChunkKind.Operand;
	}

	/**
	 * Peeks if we are looking at a flag, option, multi-flag, or
	 * a multi-flag ending in an option. Returns any of the following:
	 *
	 * 	InputStringChunkKind.Flag
	 * 	InputStringChunkKind.MultiFlag
	 * 	InputStringChunkKind.InvalidMultiFlag
	 * 	InputStringChunkKind.Option
	 * 	InputStringChunkKind.LongFlagOrOption
	 * 	InputStringChunkKind.Operand
	 *
	 * Uses the given argument spec to determine the kind in ambiguous cases.
	 * If Operand is returned that means a multi-flag with invalid chars
	 * was encountered and it should be treated as an operand
	 */
	private static _peekOptionKind(state: ParserState): InputStringChunkKind
	{
		// Set the index to 1 to peek past the `-`
		let index: number = 1;
		let ident: string = '';

		// If we see a second `-`, treat as long Flag or Option
		if (state.reader.peek(index) === '-')
			return InputStringChunkKind.LongFlagOrOption;

		// Build the identifier
		while (!/\s/.test(state.reader.peek(index)) && !state.reader.eoi(index))
			ident += state.reader.peek(index++);

		// Handle Flag and Option
		if (ident.length === 1)
		{
			const spec: CommandArgumentSpecEntry = state.spec.get(ident);

			// Assume that the kind is Flag if there is no spec for the given identifier
			if (typeof spec === 'undefined')
				return InputStringChunkKind.Flag;

			if (spec.kind === CommandArgumentKind.Flag)
				return InputStringChunkKind.Flag;

			if (spec.kind === CommandArgumentKind.Option)
				return InputStringChunkKind.Option;
		}

		// Handle multi-flags
		else if (/^[a-zA-Z]+$/.test(ident))
		{
			for (const [i, opt] of ident.split('').entries())
			{
				const spec: CommandArgumentSpecEntry = state.spec.get(opt);

				if (spec?.kind === CommandArgumentKind.Option && i !== ident.length - 1)
					return InputStringChunkKind.InvalidMultiFlag;

				if (i === ident.length - 1)
					return InputStringChunkKind.MultiFlag;
			}
		}

		// Could not determine a non-operand type
		return InputStringChunkKind.Operand;
	}
}
