// src/types/admin.ts
// Comprehensive TypeScript definitions for BOOKAM Admin Dashboard

export type AdminRole = 
  | 'SUPER_ADMIN' 
  | 'OPERATIONS_ADMIN' 
  | 'FINANCE_ADMIN' 
  | 'MARKETING_ADMIN' 
  | 'CONTENT_ADMIN' 
  | 'SUPPORT_ADMIN';

export type EventLifecycleStatus = 
  | 'DRAFT'
  | 'PENDING_REVIEW'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'LIVE'
  | 'COMPLETED'
  | 'SUSPENDED'
  | 'REJECTED';

export type TicketTierStatus = 'ACTIVE' | 'SOLD_OUT' | 'INACTIVE' | 'SCHEDULED';

export type PaymentStatus = 'Pending Approval' | 'Approved' | 'Rejected' | 'Refunded';

export type RefundStatus = 'Pending Review' | 'Approved & Processed' | 'Declined';

export interface AdminUserSession {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  avatar?: string;
  twoFactorEnabled?: boolean;
}

export interface PermissionMatrix {
  dashboard: boolean;
  events: boolean;
  transactions: boolean;
  refunds: boolean;
  influencers: boolean;
  content: boolean;
  auditLogs: boolean;
  permissionChanges: boolean;
  settings: boolean;
}

export const ROLE_PERMISSIONS: Record<AdminRole, PermissionMatrix> = {
  SUPER_ADMIN: {
    dashboard: true,
    events: true,
    transactions: true,
    refunds: true,
    influencers: true,
    content: true,
    auditLogs: true,
    permissionChanges: true,
    settings: true,
  },
  OPERATIONS_ADMIN: {
    dashboard: true,
    events: true,
    transactions: false,
    refunds: false,
    influencers: true,
    content: true,
    auditLogs: false,
    permissionChanges: false,
    settings: false,
  },
  FINANCE_ADMIN: {
    dashboard: true,
    events: false,
    transactions: true,
    refunds: true,
    influencers: false,
    content: false,
    auditLogs: true,
    permissionChanges: false,
    settings: false,
  },
  MARKETING_ADMIN: {
    dashboard: true,
    events: false,
    transactions: false,
    refunds: false,
    influencers: true,
    content: true,
    auditLogs: false,
    permissionChanges: false,
    settings: false,
  },
  CONTENT_ADMIN: {
    dashboard: true,
    events: true,
    transactions: false,
    refunds: false,
    influencers: false,
    content: true,
    auditLogs: false,
    permissionChanges: false,
    settings: false,
  },
  SUPPORT_ADMIN: {
    dashboard: true,
    events: true,
    transactions: false,
    refunds: false,
    influencers: false,
    content: false,
    auditLogs: false,
    permissionChanges: false,
    settings: false,
  },
};

export interface KPICardsData {
  totalEvents: { value: number; change: string; display: string };
  totalOrganisers: { value: number; change: string; display: string };
  totalAttendees: { value: number; change: string; display: string };
  ticketsSold: { value: number; change: string; display: string };
  grossRevenue: { value: number; change: string; display: string };
  activeEvents: { value: number; display: string };
  upcomingEvents: { value: number; display: string };
  pendingApprovals: { value: number; display: string };
}
