jest.mock('razorpay', () => {
  return jest.fn().mockImplementation(() => ({
    orders: {
      create: jest.fn().mockResolvedValue({ id: 'order_test_123' }),
    },
  }));
});

import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { RegistrationService } from './registration.service';
import { ChildRegistration } from './schemas/child-registration.schema';
import { NotificationsService } from '../notifications/notifications.service';
import { IndianState } from '@wombto18/shared';

describe('RegistrationService', () => {
  let service: RegistrationService;

  const mockModel = {
    findOne: jest.fn().mockReturnValue({
      sort: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(null),
          }),
        }),
      }),
    }),
    create: jest.fn(),
    find: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn((key: string) => {
      const config: Record<string, string> = {
        PAYMENT_TEST_MODE: 'true',
        OTP_TEST_MODE: 'true',
        OTP_TEST_CODE: '123456',
        NOTIFICATION_TEST_MODE: 'true',
      };
      return config[key];
    }),
    getOrThrow: jest.fn((key: string) => {
      const config: Record<string, string> = {
        RAZORPAY_KEY_ID: 'rzp_test_123',
        RAZORPAY_KEY_SECRET: 'test_secret',
        RAZORPAY_WEBHOOK_SECRET: 'webhook_secret',
      };
      return config[key] ?? '';
    }),
  };

  const mockNotificationsService = {
    sendPaymentConfirmation: jest.fn().mockResolvedValue(undefined),
    sendWelcomeMessage: jest.fn().mockResolvedValue(undefined),
    sendGoGreenCertificate: jest.fn().mockResolvedValue(undefined),
    sendVaccinationReminder: jest.fn().mockResolvedValue(undefined),
    notifyPartnerOfRegistration: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    // Reset the default mock for findOne chain
    mockModel.findOne.mockReturnValue({
      sort: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(null),
          }),
        }),
      }),
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegistrationService,
        { provide: getModelToken(ChildRegistration.name), useValue: mockModel },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: NotificationsService, useValue: mockNotificationsService },
      ],
    }).compile();

    service = module.get<RegistrationService>(RegistrationService);
  });

  describe('generateRegistrationId', () => {
    it('should generate an ID in format CHD-{STATE}-{DOB_YYYYMMDD}-{6_DIGIT_NUMBER}', async () => {
      const dob = new Date('2003-04-06');
      const id = await service.generateRegistrationId(IndianState.KA, dob);
      expect(id).toMatch(/^CHD-KA-20030406-\d{6}$/);
    });

    it('should start sequence at 000001 when no prior registrations exist', async () => {
      const dob = new Date('2003-04-06');
      const id = await service.generateRegistrationId(IndianState.MH, dob);
      expect(id).toMatch(/-000001$/);
    });

    it('should increment sequence when prior registrations exist', async () => {
      const dob = new Date('2003-04-06');
      const dateStr = '20030406';

      mockModel.findOne.mockReturnValueOnce({
        sort: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            lean: jest.fn().mockReturnValue({
              exec: jest
                .fn()
                .mockResolvedValue({ registrationId: `CHD-DL-${dateStr}-000010` }),
            }),
          }),
        }),
      });

      const id = await service.generateRegistrationId(IndianState.DL, dob);
      expect(id).toBe(`CHD-DL-${dateStr}-000011`);
    });
  });
});
