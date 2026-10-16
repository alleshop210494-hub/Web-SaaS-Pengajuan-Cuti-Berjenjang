// src/features/leave/components/LeaveDashboard.tsx

import React from 'react';
import type { User, LeaveRequest, ApprovalStatus } from '../../../types/leave';
import { formatDateID } from '../../../utils/dateHelper';

interface LeaveDashboardProps {
  currentUser: User;
  requests: LeaveRequest[];
  users: User[];
  onOpenForm: () => void;
}

const STATUS_BADGES: Record<ApprovalStatus, { label: string; className: string }> = {
  pending: { label: 'Menunggu Approval', className: 'bg-amber-100 text-amber-800 border-amber-300' },
  approved: { label: 'Disetujui', className: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
  rejected: { label: 'Ditolak', className: 'bg-rose-100 text-rose-800 border-rose-300' },
  revision: { label: 'Perlu Revisi', className: 'bg-blue-100 text-blue-800 border-blue-300' },
  cancelled: { label: 'Dibatalkan', className: 'bg-gray-100 text-gray-800 border-gray-300' },
};

export const LeaveDashboard: React.FC<LeaveDashboardProps> = ({
  currentUser,
  requests,
  users,
  onOpenForm,
}) => {
  const userMap = new Map(users.map((u) => [u.id, u.name]));
  const myRequests = requests.filter((r) => r.userId === currentUser.id);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Cuti & Izin</h1>
          <p className="text-sm text-gray-500">Selamat datang, {currentUser.name}</p>
        </div>
        <button
          onClick={onOpenForm}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-md shadow-sm text-sm transition"
        >
          + Buat Pengajuan Baru
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
          <span className="text-xs font-semibold uppercase text-gray-400">Cuti Tahunan</span>
          <div className="text-2xl font-bold text-blue-600 mt-1">
            {currentUser.leaveBalances.annual} <span className="text-xs text-gray-500 font-normal">Hari</span>
          </div>
        </div>

        <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
          <span className="text-xs font-semibold uppercase text-gray-400">Cuti Sakit</span>
          <div className="text-2xl font-bold text-emerald-600 mt-1">
            {currentUser.leaveBalances.sick} <span className="text-xs text-gray-500 font-normal">Hari</span>
          </div>
        </div>

        <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
          <span className="text-xs font-semibold uppercase text-gray-400">Izin Penting</span>
          <div className="text-2xl font-bold text-purple-600 mt-1">
            {currentUser.leaveBalances.special} <span className="text-xs text-gray-500 font-normal">Hari</span>
          </div>
        </div>

        <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
          <span className="text-xs font-semibold uppercase text-gray-400">Izin Harian/Jam</span>
          <div className="text-2xl font-bold text-amber-600 mt-1">
            {currentUser.leaveBalances.hourly} <span className="text-xs text-gray-500 font-normal">Jam</span>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <div className="p-4 border-b bg-gray-50">
          <h3 className="font-semibold text-gray-800">Riwayat Pengajuan Cuti Anda</h3>
        </div>

        {myRequests.length === 0 ? (
          <div className="p-8 text-center text-gray-500 text-sm">
            Belum ada pengajuan cuti yang dibuat.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-500 uppercase text-xs border-b">
                <tr>
                  <th className="px-4 py-3">Tanggal Pengajuan</th>
                  <th className="px-4 py-3">Jenis</th>
                  <th className="px-4 py-3">Periode</th>
                  <th className="px-4 py-3">Durasi</th>
                  <th className="px-4 py-3">Handover</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {myRequests.map((req) => {
                  const badge = STATUS_BADGES[req.status];
                  return (
                    <tr key={req.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-500">{formatDateID(req.createdAt)}</td>
                      <td className="px-4 py-3 font-medium text-gray-900 capitalize">{req.leaveType}</td>
                      <td className="px-4 py-3 text-gray-700">
                        {formatDateID(req.startDate)} - {formatDateID(req.endDate)}
                      </td>
                      <td className="px-4 py-3 text-gray-700">{req.totalDays} Hari</td>
                      <td className="px-4 py-3 text-gray-700">
                        {req.handoverUserId ? userMap.get(req.handoverUserId) || '-' : '-'}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block px-2.5 py-1 text-xs font-semibold rounded-full border ${badge.className}`}
                        >
                          {badge.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};