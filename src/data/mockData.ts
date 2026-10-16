// src/data/mockData.ts
import type { User, LeaveRequest } from '../types/leave';

export const INITIAL_USERS: User[] = [
  {
    id: 'usr-1',
    name: 'Budi Santoso (Software Engineer)',
    email: 'budi@company.com',
    role: 'employee',
    departmentId: 'dept-eng',
    managerId: 'usr-2',
    leaveBalances: {
      annual: 12,
      sick: 10,
      maternity: 0,
      paternity: 3,
      special: 5,
      hourly: 10,
    },
  },
  {
    id: 'usr-2',
    name: 'Siti Rahma (Engineering Manager)',
    email: 'siti@company.com',
    role: 'manager',
    departmentId: 'dept-eng',
    managerId: 'usr-3',
    leaveBalances: {
      annual: 15,
      sick: 10,
      maternity: 90,
      paternity: 3,
      special: 5,
      hourly: 10,
    },
  },
  {
    id: 'usr-3',
    name: 'Dewi Lestari (HR Director)',
    email: 'dewi@company.com',
    role: 'hr',
    departmentId: 'dept-hr',
    leaveBalances: {
      annual: 18,
      sick: 10,
      maternity: 90,
      paternity: 3,
      special: 5,
      hourly: 10,
    },
  },
];

export const INITIAL_REQUESTS: LeaveRequest[] = [
  {
    id: 'req-101',
    userId: 'usr-1',
    leaveType: 'annual',
    startDate: '2026-06-10',
    endDate: '2026-06-12',
    totalDays: 3,
    reason: 'Acara keluarga di kampung halaman',
    handoverUserId: 'usr-2',
    approvalFlow: [
      { level: 1, approverId: 'usr-2', approverRole: 'Atasan Langsung', status: 'pending' },
      { level: 2, approverId: 'usr-3', approverRole: 'HRD / Direksi', status: 'pending' },
    ],
    currentStepIndex: 0,
    status: 'pending',
    createdAt: '2026-06-01T08:00:00Z',
  },
];