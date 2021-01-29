import { ArgumentParseError } from '#parse/ArgumentParseError';
import { ArgumentParseErrorKind } from '#type/ArgumentParseErrorKind';
import { ArgumentParserOutput } from '#parse/ArgumentParserOutput';
import { ArgumentParserState } from '#parse/ArgumentParserState';
import { ArgumentStringChunkKind } from '#type/ArgumentStringChunkKind';
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

/** @internal */
export class ArgumentParser
{
	/**
	 * Parse the given input using the given command argument specification
	 */
	public static parse(input: string, spec: CommandArgumentSpec): ArgumentParserOutput
	{
		const out: ArgumentParserOutput = new ArgumentParserOutput();
		const state: ArgumentParserState = new ArgumentParserState(input, spec);

		if (state.spec.parsingStrategy === CommandArgumentParsingStrategy.Basic)
			ArgumentParser._parseBasic(state, out);

		else if (state.spec.parsingStrategy === CommandArgumentParsingStrategy.AllowQuoting)
			ArgumentParser._parseAllowQuoting(state, out);

		else if (state.spec.parsingStrategy === CommandArgumentParsingStrategy.Advanced)
			ArgumentParser._parseAdvanced(state, out);

		return out;
	}

	/**
	 * Handles parsing under the Basic parsing strategy
	 */
	private static _parseBasic(state: ArgumentParserState, out: ArgumentParserOutput): void
	{
		while (!state.reader.eoi())
		{
			const spec: CommandArgumentSpecOperand | undefined = state.spec.operands.shift();
			const value: string = ArgumentParser._consumeOperand(state, spec?.rest ?? false);
			const operand: CommandArgKindImplOperand =
				new CommandArgKindImplOperand(state.index++, spec?.type ?? 'String', value, spec?.ident);

			out.operands.push(operand);
			state.nodes.push(operand);

			ArgumentParser._discardWhitespace(state);
		}
	}

	/**
	 * Handles parsing under the AllowQuoting parsing strategy
	 */
	private static _parseAllowQuoting(state: ArgumentParserState, out: ArgumentParserOutput): void
	{
		while (!state.reader.eoi())
		{
			const spec: CommandArgumentSpecOperand | undefined = state.spec.operands.shift();
			const operand: string = spec?.rest
				? ArgumentParser._consumeOperand(state, spec?.rest)
				: /['"`]/.test(state.reader.peek())
					? ArgumentParser._consumeQuotedOperand(state)
					: ArgumentParser._consumeOperand(state, false);

			const argument: CommandArgKindImplOperand =
				new CommandArgKindImplOperand(state.index++, spec?.type ?? 'String', operand, spec?.ident);

			out.operands.push(argument);
			state.nodes.push(argument);

			ArgumentParser._discardWhitespace(state);
		}
	}

	/**
	 * Handles parsing under the Advanced parsing strategy
	 */
	private static _parseAdvanced(state: ArgumentParserState, out: ArgumentParserOutput): void
	{
		const optKindSubset: ArgumentStringChunkKind[] = [
			ArgumentStringChunkKind.Flag,
			ArgumentStringChunkKind.MultiFlag,
			ArgumentStringChunkKind.InvalidMultiFlag,
			ArgumentStringChunkKind.Option,
			ArgumentStringChunkKind.LongFlagOrOption
		];

		while (true)
		{
			const kind: ArgumentStringChunkKind = ArgumentParser._peekChunkKind(state);

			// If we see a kind of none it means we've hit the end of input
			if (kind === ArgumentStringChunkKind.None)
			{
				break;
			}

			// Parse the remaining input as operands if we see `--`
			else if (kind === ArgumentStringChunkKind.Delimiter)
			{
				ArgumentParser._discardDelimiter(state);
				state.index++;
				ArgumentParser._parseAllowQuoting(state, out);
			}

			// Discard `=`, deactivate assignment mode if we see whitespace
			else if (kind === ArgumentStringChunkKind.Assignment)
			{
				state.reader.discard();
				state.assignmentMode = true;

				// Cancel assignment mode if `=` is followed by whitespace and the
				// last node was not an option node
				if (/\s/.test(state.reader.peek()))
				{
					if (!(state.lastNode?.kind === CommandArgumentKind.Option))
						state.assignmentMode = false;

					ArgumentParser._discardWhitespace(state);
				}

				// Deincrement the index so that option value is considered part
				// of the same argument index as the option itself if there is
				// no whitespace
				else
				{
					state.index--;
				}
			}

			// Parse operands
			else if (kind === ArgumentStringChunkKind.Operand)
			{
				ArgumentParser._parseOperandAdvanced(state, out);
			}

			// Parse option kinds
			else if (optKindSubset.includes(kind))
			{
				state.assignmentMode = false;

				// Error on invalid multi-flags
				if (kind === ArgumentStringChunkKind.InvalidMultiFlag)
				{
					throw new ArgumentParseError(ArgumentParseErrorKind.InvalidMultiFlag, state.index);
				}

				// Handle long flags and long options
				else if (kind === ArgumentStringChunkKind.LongFlagOrOption)
				{
					ArgumentParser._consumeAppendLongFlagOrOption(state, out);
					ArgumentParser._discardWhitespace(state);
				}

				// Handle single char flags, options, and multi-flags
				else
				{
					ArgumentParser._consumeAppendFlagGroup(state, out);
					ArgumentParser._discardWhitespace(state);
				}
			}
		}
	}

	/**
	 * Parse an operand under the advanced parsing strategy, appending it
	 * as an option value if appropriate
	 */
	private static _parseOperandAdvanced(state: ArgumentParserState, out: ArgumentParserOutput): void
	{
		// If we're following a flag but are in assignment mode (because of `=`),
		// consume and discard the value
		if (state.lastNode?.kind === CommandArgumentKind.Flag && state.assignmentMode)
		{
			if (/['"`]/.test(state.reader.peek()))
				ArgumentParser._consumeQuotedOperand(state);

			else
				ArgumentParser._consumeOperand(state, false);

			ArgumentParser._discardWhitespace(state);

			state.assignmentMode = false;
			state.index++;
		}

		// Assign operand as previous option value if in assignment mode
		else if (state.assignmentMode)
		{
			const value: string = /['"`]/.test(state.reader.peek())
				? ArgumentParser._consumeQuotedOperand(state)
				: ArgumentParser._consumeOperand(state, false);

			(state.lastNode as CommandArgKindImplOption).value = value;
			ArgumentParser._discardWhitespace(state);

			state.assignmentMode = false;
			state.index++;
		}

		// Otherwise parse as a general operand
		else
		{
			const spec: CommandArgumentSpecOperand | undefined = state.spec.operands.shift();
			const value: string = spec?.rest
				? ArgumentParser._consumeOperand(state, spec?.rest)
				: /['"`]/.test(state.reader.peek())
					? ArgumentParser._consumeQuotedOperand(state)
					: ArgumentParser._consumeOperand(state, false);

			const operand: CommandArgKindImplOperand =
				new CommandArgKindImplOperand(state.index++, spec?.type ?? 'String', value, spec?.ident);

			out.operands.push(operand);
			state.nodes.push(operand);

			ArgumentParser._discardWhitespace(state);
		}
	}

	/**
	 * Discards whitespace until hitting a non-whitespace character
	 */
	private static _discardWhitespace(state: ArgumentParserState): void
	{
		while (/\s/.test(state.reader.peek()))
			state.reader.discard();
	}

	/**
	 * Discard `--` and the following whitepsace
	 */
	private static _discardDelimiter(state: ArgumentParserState): void
	{
		state.reader.discard(2);
		ArgumentParser._discardWhitespace(state);
	}

	/**
	 * Consumes and returns an Operand string
	 */
	private static _consumeOperand(state: ArgumentParserState, rest: boolean): string
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
	private static _consumeQuotedOperand(state: ArgumentParserState): string
	{
		let operand: string = '';
		const quoteChar: string = state.reader.consume();

		while (true)
		{
			// Handle escaped quoteChar
			if (state.reader.peekSegment(2) === `\\${quoteChar}`)
			{
				// Discard escape character
				state.reader.discard();

				// Add quoteChar to operand
				operand += state.reader.consume();
				continue;
			}

			// Discard end quote and return when we find the end of the operand
			if (state.reader.peek() === quoteChar)
			{
				state.reader.discard();
				return operand;
			}

			// Throw a parse error if the operand is unterminated
			if (state.reader.eoi())
				throw new ArgumentParseError(ArgumentParseErrorKind.UnterminatedQuotedOperand, state.index);

			operand += state.reader.consume();
		}
	}

	/**
	 * Consumes a flag group, appending them to the parser output. A flag group
	 * can consist of any number of flags and may end in an option. An option
	 * anywhere but the end of the group renders the group invalid
	 */
	private static _consumeAppendFlagGroup(state: ArgumentParserState, out: ArgumentParserOutput): void
	{
		// Discard `-`
		state.reader.discard();

		while (!/[\s=]/.test(state.reader.peek()) && !state.reader.eoi())
		{
			const ident: string = state.reader.consume();
			const spec: CommandArgumentSpecFlag | CommandArgumentSpecOption | undefined = state.spec.get(ident);

			// Handle options
			if (spec?.kind === CommandArgumentKind.Option)
			{
				const option: CommandArgKindImplOption =
					new CommandArgKindImplOption(state.index, spec.ident, spec.type, spec.long);

				out.options.push(option);
				state.nodes.push(option);

				state.assignmentMode = true;
			}

			// Handle undeclared options (determined by the presence of `=`)
			else if (typeof spec === 'undefined' && state.reader.peek() === '=' && !/\s/.test(state.reader.peek(1)))
			{
				const option: CommandArgKindImplOption = new CommandArgKindImplOption(state.index, ident, 'String');
				out.options.push(option);
				state.nodes.push(option);

				// We don't need to set assignment mode here because it will be set
				// in the Assignment chunk kind handler

				// Terminate flag group to move on to option value
				break;
			}

			// Handle flags (declared or otherwise)
			else
			{
				const flag: CommandArgKindImplFlag = new CommandArgKindImplFlag(state.index, ident, spec?.long);
				out.flags.push(flag);
				state.nodes.push(flag);
			}
		}

		state.index++;
	}

	/**
	 * Consumes a long flag or long option, appending it to the parser output
	 */
	private static _consumeAppendLongFlagOrOption(state: ArgumentParserState, out: ArgumentParserOutput): void
	{
		// Discard the `--`
		state.reader.discard(2);

		let ident: string = '';
		while (/[a-zA-Z-]/.test(state.reader.peek()) && !state.reader.eoi())
			ident += state.reader.consume();

		const spec: CommandArgumentSpecOption | CommandArgumentSpecFlag | undefined =
			state.spec.get(ident);

		// Handle declared option
		if (spec?.kind === CommandArgumentKind.Option)
		{
			const option: CommandArgKindImplOption =
				new CommandArgKindImplOption(state.index++, spec.ident, spec.type, spec.long);

			out.options.push(option);
			state.nodes.push(option);

			state.assignmentMode = true;

			return;
		}

		// If there is no spec, treat the identifier as an undeclared option
		// if it is followed by `=`, otherwise treat it as an undeclared flag
		if (typeof spec === 'undefined')
		{
			// Handle undeclared option
			if (state.reader.peek() === '=' && !/\s/.test(state.reader.peek(1)))
			{
				const option: CommandArgKindImplOption = new CommandArgKindImplOption(state.index++, ident, 'String');
				out.options.push(option);
				state.nodes.push(option);

				// We don't need to set assignment mode here because it will be set
				// in the Assignment chunk kind handler

				return;
			}

			// Handle undeclared flag
			const flag: CommandArgKindImplFlag = new CommandArgKindImplFlag(state.index++, ident);
			out.flags.push(flag);
			state.nodes.push(flag);

			return;
		}

		// Handle declared flag
		const flag: CommandArgKindImplFlag = new CommandArgKindImplFlag(state.index++, spec.ident, ident);
		out.flags.push(flag);
		state.nodes.push(flag);
	}

	/**
	 * Peeks the kind of the next chunk of the input
	 */
	private static _peekChunkKind(state: ArgumentParserState): ArgumentStringChunkKind
	{
		// Acknowledge delimiter, determine if it should be parsed as an Option value
		if (/^--\s/.test(state.reader.peekSegment(3)) || /^--$/.test(state.reader.peekSegment(3)))
		{
			const followsOption: boolean = state.lastNode?.kind === CommandArgumentKind.Option;

			if (!followsOption)
				return ArgumentStringChunkKind.Delimiter;

			if (followsOption && typeof (state.lastNode as CommandArgKindImplOption).value !== 'undefined')
				return ArgumentStringChunkKind.Delimiter;

			return ArgumentStringChunkKind.Operand;
		}

		if (state.reader.peek() === '-')
			return ArgumentParser._peekOptionKind(state);

		if (state.reader.peek() === '=' && !/\s/.test(state.reader.peekBehind()))
			return ArgumentStringChunkKind.Assignment;

		if (state.reader.eoi())
			return ArgumentStringChunkKind.None;

		return ArgumentStringChunkKind.Operand;
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
	private static _peekOptionKind(state: ArgumentParserState): ArgumentStringChunkKind
	{
		// Set the index to 1 to peek past the `-`
		let index: number = 1;
		let ident: string = '';

		// If we see a second `-`, treat as long Flag or Option
		if (state.reader.peek(index) === '-')
			return ArgumentStringChunkKind.LongFlagOrOption;

		// Build the identifier
		while (!/[\s=]/.test(state.reader.peek(index)) && !state.reader.eoi(index))
			ident += state.reader.peek(index++);

		// Handle Flag and Option
		if (ident.length === 1)
		{
			const spec: CommandArgumentSpecEntry = state.spec.get(ident);

			// Assume that the kind is Flag if there is no spec for the given identifier,
			// Unless the flag is followed by `=`, then treat as undeclared Option
			if (typeof spec === 'undefined')
			{
				if (state.reader.peek() === '=' && !/\s/.test(state.reader.peek(1)))
					return ArgumentStringChunkKind.Option;

				return ArgumentStringChunkKind.Flag;
			}

			if (spec.kind === CommandArgumentKind.Flag)
				return ArgumentStringChunkKind.Flag;

			if (spec.kind === CommandArgumentKind.Option)
				return ArgumentStringChunkKind.Option;
		}

		// Handle multi-flags
		else if (/^[a-zA-Z]+$/.test(ident))
		{
			for (const [i, opt] of ident.split('').entries())
			{
				const spec: CommandArgumentSpecEntry = state.spec.get(opt);

				if (spec?.kind === CommandArgumentKind.Option && i !== ident.length - 1)
					return ArgumentStringChunkKind.InvalidMultiFlag;

				if (i === ident.length - 1)
					return ArgumentStringChunkKind.MultiFlag;
			}
		}

		// Could not determine a non-operand type
		return ArgumentStringChunkKind.Operand;
	}
}
