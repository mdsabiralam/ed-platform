import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FcmService implements OnModuleInit {
  private readonly logger = new Logger(FcmService.name);

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    const serviceAccountPath = this.configService.get<string>('GOOGLE_APPLICATION_CREDENTIALS');

    if (!serviceAccountPath && process.env.NODE_ENV !== 'test') {
      this.logger.warn('GOOGLE_APPLICATION_CREDENTIALS not set. FCM will not work.');
      return;
    }

    // Check if default app is already initialized to avoid "default app already exists" error
    if (admin.apps.length === 0) {
      try {
        admin.initializeApp({
          credential: admin.credential.applicationDefault(), // Uses GOOGLE_APPLICATION_CREDENTIALS env var
        });
        this.logger.log('Firebase Admin Initialized');
      } catch (error) {
        this.logger.error('Failed to initialize Firebase Admin', error);
      }
    }
  }

  async sendPush(token: string, title: string, body: string, data?: Record<string, string>, imageUrl?: string): Promise<string> {
    try {
      const message: admin.messaging.Message = {
        notification: {
          title,
          body,
          imageUrl: imageUrl, // Basic support
        },
        data: data || {},
        token: token,
        android: {
          notification: {
            sound: 'default',
            imageUrl: imageUrl, // Android specific
          },
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              'mutable-content': 1, // Needed for image attachments
            },
          },
          fcmOptions: imageUrl ? { image: imageUrl } : undefined, // APNS image
        },
      };

      const response = await admin.messaging().send(message);
      this.logger.log(`Successfully sent message: ${response}`);
      return response;
    } catch (error) {
      this.logger.error('Error sending message:', error);
      throw error;
    }
  }

  async subscribeToTopic(tokens: string[], topic: string): Promise<admin.messaging.MessagingTopicManagementResponse> {
    try {
      const response = await admin.messaging().subscribeToTopic(tokens, topic);
      this.logger.log(`Successfully subscribed to topic: ${response.successCount} tokens`);
      return response;
    } catch (error) {
      this.logger.error('Error subscribing to topic:', error);
      throw error;
    }
  }

  async sendPushToTopic(topic: string, title: string, body: string, data?: Record<string, string>, imageUrl?: string): Promise<string> {
    try {
      const message: admin.messaging.Message = {
        notification: {
          title,
          body,
          imageUrl: imageUrl,
        },
        data: data || {},
        topic: topic,
        android: {
          notification: {
            sound: 'default',
            imageUrl: imageUrl,
          },
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              'mutable-content': 1,
            },
          },
          fcmOptions: imageUrl ? { image: imageUrl } : undefined,
        },
      };

      const response = await admin.messaging().send(message);
      this.logger.log(`Successfully sent topic message: ${response}`);
      return response;
    } catch (error) {
      this.logger.error('Error sending topic message:', error);
      throw error;
    }
  }

  async sendSilentPush(token: string, data: Record<string, string>): Promise<string> {
    try {
      const message: admin.messaging.Message = {
        data: data, // No notification block
        token: token,
        android: {
          priority: 'high', // Important for data messages
        },
        apns: {
          payload: {
            aps: {
              contentAvailable: true, // Crucial for iOS silent push
            },
          },
        },
      };

      const response = await admin.messaging().send(message);
      this.logger.log(`Successfully sent silent push: ${response}`);
      return response;
    } catch (error) {
      this.logger.error('Error sending silent push:', error);
      throw error;
    }
  }
}
