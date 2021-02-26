/**
 * An error that will be returned by an [[`ErrorHandler`]] that fails to match the
 * error it was instructed to [[ErrorHandler.handle | handle]]
 */
export class ErrorHandlerError extends Error
{
	/**
	 * The original error that was unhandled by the [[`ErrorHandler`]] that returned
	 * this error
	 */
	public original: Error;

	public constructor(error: Error)
	{
		super('Failed to handle error (no handler for given error type)');
		this.original = error;
	}
}
