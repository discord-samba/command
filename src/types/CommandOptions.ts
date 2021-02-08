import { MessageContext } from '#root/MessageContext';

/**
 * Represents the options passed to a Command constructor
 */
export interface CommandOptions
{
	name: string;
	aliases?: string[];
	regex?: RegExp;
	regexOnly?: boolean;
	trigger?: (ctx: MessageContext) => Promise<boolean> | boolean;
	triggerOnly?: boolean;
}
