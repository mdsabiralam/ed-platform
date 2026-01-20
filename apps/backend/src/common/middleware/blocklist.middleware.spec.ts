import { BlocklistMiddleware } from './blocklist.middleware';
import { Request, Response } from 'express';
import { ForbiddenException } from '@nestjs/common';

describe('BlocklistMiddleware', () => {
  let middleware: BlocklistMiddleware;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: jest.Mock;

  beforeEach(() => {
    middleware = new BlocklistMiddleware();
    mockRequest = {
      ip: '127.0.0.1',
      connection: { remoteAddress: '127.0.0.1' } as any,
    };
    mockResponse = {};
    nextFunction = jest.fn();
  });

  it('should be defined', () => {
    expect(middleware).toBeDefined();
  });

  it('should pass for allowed IP', () => {
    middleware.use(mockRequest as Request, mockResponse as Response, nextFunction);
    expect(nextFunction).toHaveBeenCalled();
  });

  it('should throw ForbiddenException for blocked IP', () => {
    mockRequest.ip = '192.168.0.0';
    expect(() => {
      middleware.use(mockRequest as Request, mockResponse as Response, nextFunction);
    }).toThrow(ForbiddenException);
  });
});
