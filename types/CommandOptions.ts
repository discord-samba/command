/**
 * Represents the options passed to a Command constructor
 */
export interface CommandOptions
{
	name: string;
	aliases?: string[];
	regex?: RegExp;
	regexOnly?: boolean;
	triggerOnly?: boolean;
}
