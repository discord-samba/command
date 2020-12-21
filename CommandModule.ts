import { BooleanResolver } from '#resolve/resolvers/BooleanResolver';
import { CommandCache } from '#root/CommandCache';
import { NumberResolver } from '#resolve/resolvers/NumberResolver';
import { ResolverCache } from '#resolve/ResolverCache';
import { StringResolver } from '#resolve/resolvers/StringResolver';

export class CommandModule
{
	public static resolvers: typeof ResolverCache = ResolverCache;
	public static commands: typeof CommandCache = CommandCache;
}

CommandModule.resolvers.add(StringResolver);
CommandModule.resolvers.add(NumberResolver);
CommandModule.resolvers.add(BooleanResolver);
