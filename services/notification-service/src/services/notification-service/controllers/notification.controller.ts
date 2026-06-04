import { Request, Response } from 'express';
import { asyncHandler } from '../../../utils/async-handler';
import { listNotifications, sendEmail } from '../services/notification.service';
// Controller for handling notification-related endpoints, including sending emails and listing notifications.
export const sendEmailController = asyncHandler(async (req: Request, res: Response) => {
  const result = await sendEmail(req.body);
  res.status(202).json({ message: 'Notification processed.', data: result });
});
//  Endpoint to retrieve a list of notifications, which could include email notifications and other types of alerts.
export const getNotifications = asyncHandler(async (_req: Request, res: Response) => {
  const notifications = await listNotifications();
  res.status(200).json({ message: 'Notifications retrieved successfully.', data: notifications });
});
