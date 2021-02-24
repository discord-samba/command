import { ErrorHandler } from '#root/ErrorHandler';

describe('ErrorHandler tests', () =>
{
	it('Should call the appropriate handler for the given error kind', async () =>
	{
		const defaultErrFn: jest.Mock = jest.fn();
		const rangeErrFn: jest.Mock = jest.fn();
		const typeErrFn: jest.Mock = jest.fn();

		const errorHandler: ErrorHandler = ErrorHandler
			.use(RangeError, rangeErrFn)
			.use(TypeError, typeErrFn)
			.use(Error, defaultErrFn);

		await errorHandler.handle(new RangeError());
		expect(rangeErrFn).toBeCalledTimes(1);
		expect(typeErrFn).not.toBeCalled();
		expect(defaultErrFn).not.toBeCalled();

		await errorHandler.handle(new TypeError());
		expect(rangeErrFn).toBeCalledTimes(1);
		expect(typeErrFn).toBeCalledTimes(1);
		expect(defaultErrFn).not.toBeCalled();

		await errorHandler.handle(new SyntaxError());
		expect(rangeErrFn).toBeCalledTimes(1);
		expect(typeErrFn).toBeCalledTimes(1);
		expect(defaultErrFn).toBeCalledTimes(1);
	});
});