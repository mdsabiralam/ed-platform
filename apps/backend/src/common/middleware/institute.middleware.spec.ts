import { Test, TestingModule } from '@nestjs/testing';
import { InstituteMiddleware } from './institute.middleware';
import { ClsService } from 'nestjs-cls';
import { Request, Response, NextFunction } from 'express';
import { BadRequestException } from '@nestjs/common';

describe('InstituteMiddleware', () => {
  let middleware: InstituteMiddleware;
  let clsService: ClsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InstituteMiddleware,
        {
          provide: ClsService,
          useValue: {
            set: jest.fn(),
          },
        },
      ],
    }).compile();

    middleware = module.get<InstituteMiddleware>(InstituteMiddleware);
    clsService = module.get<ClsService>(ClsService);
  });

  it('should be defined', () => {
    expect(middleware).toBeDefined();
  });

  it('should process request with x-institute-id header', () => {
    const req = {
      headers: {
        'x-institute-id': 'inst-123',
      },
      originalUrl: '/api/protected/resource',
    } as unknown as Request;
    const res = {} as Response;
    const next = jest.fn();

    middleware.use(req, res, next);

    expect(clsService.set).toHaveBeenCalledWith('instituteId', 'inst-123');
    expect(req['instituteId']).toBe('inst-123');
    expect(next).toHaveBeenCalled();
  });

  it('should throw BadRequestException if header is missing for protected route', () => {
    const req = {
      headers: {},
      originalUrl: '/api/protected/resource',
    } as unknown as Request;
    const res = {} as Response;
    const next = jest.fn();

    expect(() => middleware.use(req, res, next)).toThrow(BadRequestException);
  });

  it('should allow public routes without header', () => {
    const req = {
      headers: {},
      originalUrl: '/health',
    } as unknown as Request;
    const res = {} as Response;
    const next = jest.fn();

    middleware.use(req, res, next);

    expect(next).toHaveBeenCalled();
  });
});
