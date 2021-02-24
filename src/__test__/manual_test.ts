/* eslint-disable max-classes-per-file */
/* eslint-disable no-console, capitalized-comments, lines-around-comment, sort-imports, no-mixed-operators */

import { disallowBots, checkMentionPrefix, allowOwner } from '#root/Rules';
import { clientPermissions, ownerOnly } from '#root/Middleware';
import { Client } from 'discord.js';
import { Command } from '#root/Command';
import { CommandContext } from '#root/CommandContext';
import { CommandModule } from '#root/CommandModule';
import { MessageContext } from '#root/MessageContext';
import { Option } from '#argument/Option';
import { Result } from '#root/Result';
import * as Path from 'path';
import * as Util from 'util';
import { ErrorHandler } from '#error/ErrorHandler';
import { CommandArgumentError } from '#error/CommandArgumentError';
import { ArgumentParseError } from '#error/ArgumentParseError';

// import { CommandArgumentSpec } from '#argument/CommandArgumentSpec';
// import { ArgumentParser } from '#parse/ArgumentParser';
// import { ArgumentParserOutput } from '#parse/ArgumentParserOutput';
// import { StringReader } from '#parse/StringReader';
// import { CommandArguments } from '#argument/CommandArguments';
// import { CommandContext } from '#root/CommandContext';

// function now(): number
// {
// 	type NSFunction = (hr?: [number, number]) => number;
// 	const ns: NSFunction = (hr = process.hrtime()) => hr[0] * 1e9 + hr[1];
// 	return (ns() - (ns() - process.uptime() * 1e9)) / 1e6;
// }

async function main(): Promise<void>
{
	// const spec: CommandArgumentSpec = new CommandArgumentSpec();

	// spec.setParsingStrategy(2);

	// spec.defineOperand('foo', 'Number');
	// spec.defineOperand('bar', 'String');
	// spec.defineFlag('a');
	// spec.defineFlag('b');
	// spec.defineFlag('g');
	// spec.defineOption('c', 'String');
	// spec.defineOption('d', 'String', { long: 'dog', required: false });
	// spec.defineOption('f', 'String', { long: 'fog', required: false });
	// spec.defineOption('z', 'String', { long: 'boo' });

	// console.log(spec.get('a'));
	// console.log(spec.get('b'));
	// console.log(spec.get('c'));
	// console.log(spec.get('d'));
	// console.log(spec.get('dog'));

	// const start: number = now();
	// const output: ArgumentParserOutput = ArgumentParser.parse(
	// 	'-aaabf bar \n--boo \n1 -d foo "1" "foo \\"bar\\" baz" buh',
	// 	spec
	// );

	// const args: CommandArguments = new CommandArguments(spec, output);
	// const end: number = now();

	// console.log(end - start);

	// await args.resolveArguments(new CommandContext({} as any, {} as any, args));
	// console.log('arguments resolved');

	// console.log(output);
	// console.log(args.operands);
	// console.log(args.flags.values());
	// console.log(args.options.values());

	// const reader: StringReader = new StringReader('--');
	// console.log(/^--$/.test(reader.peekSegment(5)));

	const client: Client = new Client();
	client.login(require(Path.join(__dirname, './config.json')).token);
	CommandModule.registerClient(client);

	CommandModule.rules.use(
		disallowBots,
		checkMentionPrefix,
		allowOwner('214628307201687552')
	);

	CommandModule.commands.add(class extends Command
	{
		public constructor()
		{
			super({ name: 'bar' });
			this.middleware.use(ownerOnly);
			this.middleware.use(clientPermissions('BAN_MEMBERS'));
		}

		public init(): void
		{
			console.log('bar init');
		}

		public action(ctx: CommandContext): void
		{
			ctx.message.channel.send('bar');
		}
	});

	CommandModule.commands.add(class extends Command
	{
		public constructor()
		{
			super({ name: 'foo' });

			this.middleware.use(
				// Uppercase all string operands
				(ctx, next) =>
				{
					for (const operand of ctx.args.operands)
					{
						if (operand.type === 'String')
							operand.value = (operand.value as string).toUpperCase();
					}
					next();
				},

				// Add an option
				(ctx, next) =>
				{
					ctx.args.options.set('test', new Option('test', 'added by middleware', 'String'));
					next();
				},

				// Cancel this command
				(_, next) => next(Result.cancel())
			);

			this.arguments.setParsingStrategy(2);
			this.arguments.defineOption('foo', 'String');
			this.arguments.defineOperand('bar', 'String', { required: false });
			this.arguments.defineOperand('baz', 'String', { required: false });
		}

		public trigger(ctx: MessageContext): boolean
		{
			const text: string = this.name
				.split('')
				.reverse()
				.join('');

			if (!ctx.message.content.startsWith(text))
				return false;

			ctx.content = ctx.message.content.replace(text, '').trim();
			return true;
		}

		public action(ctx: CommandContext): void
		{
			ctx.message.channel.send(Util.inspect(ctx.args, { depth: 2 }), { code: 'js' });
		}
	});

	const errorHandler: ErrorHandler = ErrorHandler
		.use(CommandArgumentError, err => console.log('CommandArgumentError: ', err))
		.use(ArgumentParseError, err => console.log('ArgumentParseError: ', err))
		.use(Error, err => console.log('Catch-all Error: ', err));

	console.log(
		await errorHandler.handle(new CommandArgumentError(0, { kind: 2, ident: 'foo', type: 'String' }))
	);
}

main().catch(e => console.log(e));
