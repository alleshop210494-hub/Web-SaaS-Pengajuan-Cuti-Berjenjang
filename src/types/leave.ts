// src/types/leave.ts

export type LeaveType = 'annual' | 'sick' | 'maternity' | 'paternity' | 'special' | 'hourly';

export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'revision' | 'cancelled';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'employee' | 'manager' | 'hr' | 'director';
  departmentId: string;
  managerId?: string;
  leaveBalances: Record<LeaveType, number>;
}

export interface ApprovalStep {
  level: number;
  approverId: string;
  approverRole: string;
  status: ApprovalStatus;
  comment?: string;
  updatedAt?: string;
}

export interface LeaveRequest {
  id: string;
  userId: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  handoverUserId?: string;
  attachmentUrl?: string;
  approvalFlow: ApprovalStep[];
  currentStepIndex: number;
  status: ApprovalStatus;
  createdAt: string;
}