export type RecognitionEventType = "BIRTHDAY" | "WORK_ANNIVERSARY";

export type RecognitionTemplateInput = {
  template_name: string;
  event_type: RecognitionEventType;
  content: string;
};

export type RecognitionTemplateUpdateInput = Partial<RecognitionTemplateInput>;

export type RecognitionTemplateRecord = {
  templateId: number;
  templateName: string | null;
  eventType: RecognitionEventType | null;
  content: string | null;
  version: number | null;
  isActive: boolean | null;
  createdBy: number | null;
  approvedStatus: string | null;
  createdAt: string;
};

export type RecognitionDeliveryRecord = {
  id: number;
  eventId: number | null;
  channel: string | null;
  deliveryStatus: string | null;
  retryCount: number | null;
  deliveredAt: string | null;
};

export type RecognitionEventRecord = {
  eventId: number;
  employeeId: number | null;
  employeeName?: string | null;
  employeeEmail?: string | null;
  eventType: RecognitionEventType | null;
  triggerDate: string | null;
  templateId: number | null;
  deliveryStatus: string | null;
  createdAt: string;
  template?: RecognitionTemplateRecord | null;
  deliveryLogs?: RecognitionDeliveryRecord[];
};

export type RecognitionApprovalRecord = {
  approvalId: number;
  status: string | null;
  comments: string | null;
  createdAt: string;
  template: RecognitionTemplateRecord | null;
};

export type RecognitionNotificationRecord = {
  notificationId: number;
  employeeId: number | null;
  title: string | null;
  message: string | null;
  notificationType: string | null;
  relatedId: number | null;
  relatedType: string | null;
  channel: string | null;
  status: string | null;
  retryCount: number | null;
  sentAt: string | null;
  readAt: string | null;
  createdAt: string;
  delivery?: RecognitionDeliveryRecord | null;
};