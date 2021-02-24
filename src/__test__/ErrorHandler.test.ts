import { ErrorHandler } from '#error/ErrorHandler';

describe('ErrorHandler tests', () =>
{
	it('Should match the correct error class', async () =>
	{
		const defaultErrFn: jest.Mock = jest.fn();
		const rangeErrFn: jest.Mock = jest.fn();
		const typeErrFn: jest.Mock = jest.fn();

		const errorHandler: ErrorHandler = ErrorHandler
			.match(RangeError, rangeErrFn)
			.match(TypeError, typeErrFn)
			.match(Error, defaultErrFn);

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

	it('Should override existing matchers', async () =>
	{
		const firstErrFn: jest.Mock = jest.fn();
		const secondErrFn: jest.Mock = jest.fn();

		const errorHandler: ErrorHandler = ErrorHandler
			.match(TypeError, firstErrFn)
			.match(TypeError, secondErrFn);

		await errorHandler.handle(new TypeError());
		expect(firstErrFn).not.toBeCalled();
		expect(secondErrFn).toBeCalledTimes(1);
	});
});
