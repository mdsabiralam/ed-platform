import { SubscriptionMiddleware } from './subscription.middleware';
import { Request, Response } from 'express';
import { ForbiddenException } from '@nestjs/common';

describe('SubscriptionMiddleware', () => {
  let middleware: SubscriptionMiddleware;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: jest.Mock;

  beforeEach(() => {
    middleware = new SubscriptionMiddleware();
    mockRequest = {
      originalUrl: '/api/some/resource',
      headers: {},
    };
    mockResponse = {};
    nextFunction = jest.fn();
  });

  it('should be defined', () => {
    expect(middleware).toBeDefined();
  });

  it('should pass if no subscription headers are present (for now)', () => {
    middleware.use(mockRequest as Request, mockResponse as Response, nextFunction);
    expect(nextFunction).toHaveBeenCalled();
  });

  it('should allow excluded routes', () => {
    mockRequest.originalUrl = '/api/subscription/renew';
    middleware.use(mockRequest as Request, mockResponse as Response, nextFunction);
    expect(nextFunction).toHaveBeenCalled();
  });

  it('should throw ForbiddenException if subscription is expired beyond grace period', () => {
    const expiredDate = Date.now() - (8 * 24 * 60 * 60 * 1000); // 8 days ago
    mockRequest.headers = {
      'x-subscription-expiry': expiredDate.toString(),
    };

    expect(() => {
      middleware.use(mockRequest as Request, mockResponse as Response, nextFunction);
    }).toThrow(ForbiddenException);
  });

  it('should pass if subscription is expired but within grace period', () => {
    const expiredDate = Date.now() - (2 * 24 * 60 * 60 * 1000); // 2 days ago
    mockRequest.headers = {
      'x-subscription-expiry': expiredDate.toString(),
    };

    middleware.use(mockRequest as Request, mockResponse as Response, nextFunction);
    expect(nextFunction).toHaveBeenCalled();
  });

  it('should throw ForbiddenException if x-subscription-status is expired', () => {
    mockRequest.headers = {
      'x-subscription-status': 'expired',
    };
    expect(() => {
      middleware.use(mockRequest as Request, mockResponse as Response, nextFunction);
    }).toThrow(ForbiddenException);
  });
});
