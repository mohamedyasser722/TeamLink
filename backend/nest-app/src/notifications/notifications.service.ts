import { Injectable, Logger } from '@nestjs/common';
import { NotificationsGateway } from './notifications.gateway';

export interface NotificationData {
  id: string;
  type: 'application_received' | 'application_accepted' | 'application_rejected';
  title: string;
  message: string;
  data?: any;
  timestamp: Date;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private readonly notificationsGateway: NotificationsGateway) {}

  // Notify project owner when someone applies
  async notifyApplicationReceived(
    projectOwnerId: string,
    applicantName: string,
    projectTitle: string,
    projectId: string,
    applicationId: string,
  ) {
    const notification: NotificationData = {
      id: `app_received_${applicationId}`,
      type: 'application_received',
      title: '🎯 New Application Received!',
      message: `${applicantName} has applied to your project "${projectTitle}"`,
      data: {
        projectId,
        projectTitle,
        applicantName,
        applicationId,
      },
      timestamp: new Date(),
    };

    this.logger.log(`Sending application received notification to ${projectOwnerId}`);
    this.notificationsGateway.sendNotificationToUser(projectOwnerId, notification);
  }

  // Notify freelancer when application is accepted
  async notifyApplicationAccepted(
    freelancerId: string,
    projectTitle: string,
    projectId: string,
    roleTitle: string,
  ) {
    const notification: NotificationData = {
      id: `app_accepted_${projectId}_${freelancerId}`,
      type: 'application_accepted',
      title: '🎉 Application Accepted!',
      message: `Congratulations! You've been accepted to join "${projectTitle}" as ${roleTitle}`,
      data: {
        projectId,
        projectTitle,
        roleTitle,
      },
      timestamp: new Date(),
    };

    this.logger.log(`Sending application accepted notification to ${freelancerId}`);
    this.notificationsGateway.sendNotificationToUser(freelancerId, notification);
  }

  // Notify freelancer when application is rejected
  async notifyApplicationRejected(
    freelancerId: string,
    projectTitle: string,
    projectId: string,
  ) {
    const notification: NotificationData = {
      id: `app_rejected_${projectId}_${freelancerId}`,
      type: 'application_rejected',
      title: '📋 Application Update',
      message: `Your application for "${projectTitle}" was not selected this time`,
      data: {
        projectId,
        projectTitle,
      },
      timestamp: new Date(),
    };

    this.logger.log(`Sending application rejected notification to ${freelancerId}`);
    this.notificationsGateway.sendNotificationToUser(freelancerId, notification);
  }
} 