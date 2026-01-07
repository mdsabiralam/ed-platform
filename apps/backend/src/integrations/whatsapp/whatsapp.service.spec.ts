
import { Test, TestingModule } from '@nestjs/testing';
import { WhatsAppService } from './whatsapp.service';
import { PrismaService } from '../../prisma/prisma.service';
import { MetaWhatsAppProvider } from './providers/meta-whatsapp.provider';
import { EventEmitter2 } from '@nestjs/event-emitter';

describe('WhatsAppService', () => {
  let service: WhatsAppService;
  let provider: MetaWhatsAppProvider;
  let prisma: PrismaService;

  const mockProvider = {
    sendTemplateMessage: jest.fn(),
    sendTextMessage: jest.fn(),
    sendMediaMessage: jest.fn(),
    getTemplates: jest.fn(),
  };

  const mockPrisma = {
    whatsAppTemplate: {
      findUnique: jest.fn(),
      upsert: jest.fn(),
    },
    whatsAppUsageLog: {
      create: jest.fn(),
      updateMany: jest.fn(),
    },
    user: {
      findFirst: jest.fn(),
    },
    ticket: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
    ticketTimeline: {
      create: jest.fn(),
    },
  };

  const mockEventEmitter = {
    emit: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WhatsAppService,
        { provide: MetaWhatsAppProvider, useValue: mockProvider },
        { provide: PrismaService, useValue: mockPrisma },
        { provide: EventEmitter2, useValue: mockEventEmitter },
      ],
    }).compile();

    service = module.get<WhatsAppService>(WhatsAppService);
    provider = module.get<MetaWhatsAppProvider>(MetaWhatsAppProvider);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendTemplateMessage', () => {
    it('should send template message if template is approved', async () => {
      mockPrisma.whatsAppTemplate.findUnique.mockResolvedValue({ status: 'APPROVED' });
      mockProvider.sendTemplateMessage.mockResolvedValue({ messages: [{ id: 'msg_123' }] });

      await service.sendTemplateMessage('1234567890', 'hello_world', 'en_US');

      expect(mockPrisma.whatsAppTemplate.findUnique).toHaveBeenCalledWith({ where: { templateName: 'hello_world' } });
      expect(mockProvider.sendTemplateMessage).toHaveBeenCalled();
      expect(mockPrisma.whatsAppUsageLog.create).toHaveBeenCalledWith({
          data: expect.objectContaining({
              messageId: 'msg_123',
              status: 'SENT'
          })
      });
    });

    it('should throw error if template is not approved', async () => {
      mockPrisma.whatsAppTemplate.findUnique.mockResolvedValue({ status: 'REJECTED' });

      await expect(service.sendTemplateMessage('1234567890', 'bad_template', 'en_US'))
        .rejects
        .toThrow('Blocked attempt to send unapproved template');
    });
  });

  describe('handleIncomingMessage', () => {
      it('should ignore message from unknown user', async () => {
          mockPrisma.user.findFirst.mockResolvedValue(null);
          await service.handleIncomingMessage('12345', 'Hi');
          expect(mockPrisma.ticket.findFirst).not.toHaveBeenCalled();
      });

      it('should append to existing ticket if open', async () => {
          mockPrisma.user.findFirst.mockResolvedValue({
              student: { id: 's1' },
              guardian: null
          });
          mockPrisma.ticket.findFirst.mockResolvedValue({ id: 't1' });

          await service.handleIncomingMessage('12345', 'Reply');

          expect(mockPrisma.ticket.findFirst).toHaveBeenCalledWith({
              where: {
                  OR: [{ studentId: 's1' }],
                  status: 'OPEN'
              }
          });
          expect(mockPrisma.ticketTimeline.create).toHaveBeenCalledWith({
              data: { ticketId: 't1', message: 'Reply', source: 'USER' }
          });
      });

      it('should create new ticket if no open ticket', async () => {
          mockPrisma.user.findFirst.mockResolvedValue({
              student: { id: 's1' },
              guardian: null
          });
          mockPrisma.ticket.findFirst.mockResolvedValue(null);
          mockPrisma.ticket.create.mockResolvedValue({ id: 'new_t1' });

          await service.handleIncomingMessage('12345', 'New Issue');

          expect(mockPrisma.ticket.create).toHaveBeenCalled();
      });

      it('should warn and return if user has no student or guardian linked (Undefined ID Fix)', async () => {
         // Case where user exists but has no linked profiles (hypothetical edge case)
          mockPrisma.user.findFirst.mockResolvedValue({
              student: null,
              guardian: null
          });

          await service.handleIncomingMessage('12345', 'Ghost');

          // Should NOT call findFirst with empty OR
          expect(mockPrisma.ticket.findFirst).not.toHaveBeenCalled();
      });
  });

  describe('updateMessageStatus', () => {
      it('should update status', async () => {
          await service.updateMessageStatus('msg_123', 'read');
          expect(mockPrisma.whatsAppUsageLog.updateMany).toHaveBeenCalledWith({
              where: { messageId: 'msg_123' },
              data: { status: 'READ' }
          });
      });
  });
});
