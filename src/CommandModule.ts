import { BooleanResolver } from './resolving/resolvers/BooleanResolver';
import { CommandCache } from './CommandCache';
import { NumberResolver } from './resolving/resolvers/NumberResolver';
import { ResolverCache } from './resolving/ResolverCache';
import { StringResolver } from './resolving/resolvers/StringResolver';

export class CommandModule
{
	public static resolvers: typeof ResolverCache = ResolverCache;
	public static commands: typeof CommandCache = CommandCache;
}

CommandModule.resolvers.add(StringResolver);
CommandModule.resolvers.add(NumberResolver);
CommandModule.resolvers.add(BooleanResolver);
