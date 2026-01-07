import { Test, TestingModule } from '@nestjs/testing';
import { DebugController } from './debug.controller';
import { SentryInterceptor } from '../common/interceptors/sentry.interceptor';
import * as Sentry from '@sentry/node';
import { CallHandler } from '@nestjs/common';
import { throwError } from 'rxjs';

jest.mock('@sentry/node');

describe('DebugController & SentryInterceptor', () => {
  let controller: DebugController;
  let interceptor: SentryInterceptor;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DebugController],
      providers: [SentryInterceptor],
    }).compile();

    controller = module.get<DebugController>(DebugController);
    interceptor = module.get<SentryInterceptor>(SentryInterceptor);
  });

  it('should throw an error', () => {
    expect(() => controller.crash()).toThrow('Test Crash 123');
  });

  it('should capture exception in interceptor', (done) => {
    const error = new Error('Test Crash 123');
    const callHandler: CallHandler = {
        handle: () => throwError(() => error),
    };

    interceptor.intercept({} as any, callHandler).subscribe({
        error: (err) => {
            expect(Sentry.captureException).toHaveBeenCalledWith(error);
            done();
        }
    });
  });
});
