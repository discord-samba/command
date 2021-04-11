import { Client, Message } from 'discord.js';
import { ArgumentParser } from '#parse/ArgumentParser';
import { Command } from '#root/Command';
import { CommandArguments } from '#argument/CommandArguments';
import { CommandContext } from '#root/CommandContext';
import { CommandModule } from '#root/CommandModule';
import { ErrorHandlerError } from '#error/ErrorHandlerError';
import { MessageContext } from '#root/MessageContext';
import { Meta } from '#root/Meta';
import { MiddlewareFunction } from '#type/MiddlewareFunction';
import { NextFunction } from '#type/NextFunction';
import { Result } from './Result';
import { RuleFunction } from '#type/RuleFunction';

/** @internal */
export class CommandDispatcher
{
	private static _staticInstance: CommandDispatcher;

	private _client!: Client;

	private constructor()
	{
		if (typeof CommandDispatcher._staticInstance !== 'undefined')
			throw new Error('Cannot create multiple instances of CommandDispatcher');

		CommandDispatcher._staticInstance = this;
	}

	private static get _instance(): CommandDispatcher
	{
		return CommandDispatcher._staticInstance ?? new CommandDispatcher();
	}

	/**
	 * Register the given Client with the command dispatcher
	 */
	public static registerClient(client: Client): void
	{
		CommandDispatcher._instance._client = client;

		client.on('message', async message => CommandDispatcher._instance._dispatch(message));
		client.on('messageUpdate', async (_, message) =>
			CommandDispatcher
				._instance
				._dispatch(await message.channel.messages.fetch(message.id)));
	}

	/**
	 * Determine if rules/dispatch should continue (and handle Error Results)
	 */
	private static async _shouldContinueRules(context: MessageContext, result: Result): Promise<boolean>
	{
		if (result.isCancellation())
			return false;

		if (result.isError())
		{
			// Run error through global error handler
			const errorHandle: Result = await CommandModule
				.getGlobalErrorHandler()
				.handle(result.value, context);

			// Error was handled by global error handler, silently exit dispatch
			if (!errorHandle.isError())
				return false;

			// If error was unhandled, emit the original unhandled error, otheriwse
			// emit whatever error was thrown during handling
			context.client.emit(
				'error',
				errorHandle.value instanceof ErrorHandlerError
					? errorHandle.value.original
					: errorHandle.value
			);

			// Silently exit dispatch
			return false;
		}

		return true;
	}

	/**
	 * Determine if middleware/dispatch should continue (and handle Error Results)
	 */
	private static async _shouldContinueMiddleware(context: CommandContext, result: Result): Promise<boolean>
	{
		if (result.isCancellation())
			return false;

		if (result.isError())
		{
			let errorHandle: Result = await context.command.onError(result.value, context) ?? Result.ok();

			// Error was handled by command error handler, silently exit dispatch
			if (!errorHandle.isDefault() && !errorHandle.isError())
				return false;

			// Run original error through global handler if no handler matched the
			// error in the command error handler or if command error handler defaulted
			errorHandle = await CommandModule
				.getGlobalErrorHandler()
				.handle(
					errorHandle.value instanceof ErrorHandlerError
						? errorHandle.value.original
						: errorHandle.isDefault()
							? result.value
							: errorHandle.value,
					context
				);

			// Error was handled by global error handler, silently exit dispatch
			if (!errorHandle.isError())
				return false;

			// If error was unhandled, emit the original unhandled error, otheriwse
			// emit whatever error was thrown during handling
			context.client.emit(
				'error',
				errorHandle.value instanceof ErrorHandlerError
					? errorHandle.value.original
					: errorHandle.value
			);

			// Silently exit dispatch
			return false;
		}

		return true;
	}

	/**
	 * Run global module rules and continue if they are all successful
	 */
	private async _dispatch(message: Message): Promise<void>
	{
		const messageContext: MessageContext = new MessageContext(this._client, message);

		const rules: RuleFunction[] = CommandModule.rules.all();
		let nextFn: NextFunction = async (result: Result = Result.ok()) =>
		{
			if (!await CommandDispatcher._shouldContinueRules(messageContext, result))
				return;

			const rule: RuleFunction = rules.shift() ?? ((_, next) => next());

			if (rules.length < 1)
				nextFn = async (finalResult: Result = Result.ok()) =>
				{
					if (await CommandDispatcher._shouldContinueRules(messageContext, finalResult))
						this._postRules(messageContext);
				};

			rule(messageContext, nextFn);
		};

		nextFn();
	}

	/**
	 * To be run after rules have been run
	 */
	private async _postRules(context: MessageContext): Promise<void>
	{
		let command!: Command;
		let regexMatch: boolean = false;
		let triggerMatch: boolean = false;

		const commandRegexes: Command[] = Array.from(CommandModule.commands.all().values())
			.filter(c => typeof c.regex !== 'undefined');

		// Test against command regular expressions
		for (const cmd of commandRegexes)
		{
			if (cmd.regex?.test(context.message.content))
			{
				command = cmd;
				regexMatch = true;
				break;
			}
		}

		// Test against command triggers
		for (const cmd of CommandModule.commands.all())
		{
			if (cmd.trigger(context))
			{
				command = cmd;
				triggerMatch = true;
				break;
			}
		}

		// Abort command execution if we do not match a command regex or trigger,
		// prefixes are enforced, and a prefix was not found
		if (typeof command === 'undefined'
			&& CommandModule.meta.get(Meta.EnforcePrefixes)
			&& !context.prefixUsed)
			return;

		// If a command regex matches, remove the match from the original
		// message content and reset context content
		if (regexMatch)
		{
			context.content = context.message.content
				.replace(command.regex!, '')
				.trim();
		}

		// Find command by name/alias and strip it from the context content if
		// we don't have a command from triggers
		else if (!triggerMatch)
		{
			const commandName: string = context.content.trim().split(/\s/)[0];
			command = CommandModule.commands.get(commandName)!;

			// Cancel dispatch if we don't find a command
			// TODO: Implement shortcuts support and check shortcuts here
			if (typeof command === 'undefined')
				return;

			// Cancel dispatch if command is regex-only
			if (command.regexOnly)
				return;

			// Cancel dispatch if command is trigger-only
			if (command.triggerOnly)
				return;

			context.content = context.content.slice(commandName.length).trim();
		}

		// TODO: Route argument parsing errors to appropriate error handlers,
		//       or emit if no handler exists
		const commandArguments: CommandArguments = CommandArguments.fromParse(
			ArgumentParser.parse(context.content, command.arguments)
		);

		const commandContext: CommandContext = new CommandContext(
			context.client,
			command,
			context.message,
			commandArguments
		);

		// TODO: Route argument resolution errors to appropriate error handlers,
		//       or emit if no handler exists
		await commandArguments.resolveArguments(commandContext);

		// Run command middleware
		const middleware: MiddlewareFunction[] = command.middleware.all();
		let nextFn: NextFunction = async (result: Result = Result.ok()) =>
		{
			if (!await CommandDispatcher._shouldContinueMiddleware(commandContext, result))
				return;

			const fn: MiddlewareFunction = middleware.shift() ?? ((_, next) => next());

			if (middleware.length < 1)
				nextFn = async (finalResult: Result = Result.ok()) =>
				{
					if (await CommandDispatcher._shouldContinueMiddleware(commandContext, finalResult))
						this._postMiddleware(command, commandContext);
				};

			fn(commandContext, nextFn);
		};

		nextFn();
	}

	/**
	 * To be run after middleware has been run
	 */
	private async _postMiddleware(command: Command, context: CommandContext): Promise<void>
	{
		// TODO: Capture command action errors and run through command error handler
		await command.action(context);
	}
}
