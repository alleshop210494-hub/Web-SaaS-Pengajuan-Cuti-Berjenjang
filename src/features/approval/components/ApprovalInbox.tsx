// src/features/approval/components/ApprovalInbox.tsx

import React, { useState } from 'react';
import type { User, LeaveRequest } from '../../../types/leave';
import { formatDateID } from '../../../utils/dateHelper';
import { ApprovalTracker } from './ApprovalTracker';

interface ApprovalInboxProps {
  currentUser: User;
  requests: LeaveRequest[];
  users: User[];
  onUpdateApproval: (requestId: string, newStatus: 'approved' | 'rejected' | 'revision', comment?: string) => void;
}

export const ApprovalInbox: React.FC<ApprovalInboxProps> = ({
  currentUser,
  requests,
  users,
  onUpdateApproval,
}) => {
  const [commentInput, setCommentInput] = useState<Record<string, string>>({});
  const userMap = new Map(users.map((u) => [u.id, u.name]));

  const pendingRequestsForMe = requests.filter((req) => {
    if (req.status !== 'pending') return false;
    const currentStep = req.approvalFlow[req.currentStepIndex];
    return currentStep && currentStep.approverId === currentUser.id && currentStep.status === 'pending';
  });

  const handleCommentChange = (reqId: string, val: string) => {
    setCommentInput((prev) => ({ ...prev, [reqId]: val }));
  };

  return (
    <div className="space-y-6">
      <div className="border-b pb-4">
        <h1 className="text-2xl font-bold text-gray-900">Inbox Persetujuan (Approval)</h1>
        <p className="text-sm text-gray-500">
          Daftar pengajuan cuti dan izin bawahan yang memerlukan tindakan Anda sebagai <span className="font-semibold text-gray-700 capitalize">{currentUser.role}</span>.
        </p>
      </div>

      {pendingRequestsForMe.length === 0 ? (
        <div className="bg-white border rounded-lg p-8 text-center text-gray-500 text-sm shadow-sm">
          Tidak ada pengajuan cuti yang memerlukan persetujuan Anda saat ini.
        </div>
      ) : (
        <div className="space-y-4">
          {pendingRequestsForMe.map((req) => {
            const applicant = userMap.get(req.userId) || 'Karyawan';
            const handoverPerson = req.handoverUserId ? userMap.get(req.handoverUserId) : '-';
            const comment = commentInput[req.id] || '';

            return (
              <div key={req.id} className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm space-y-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 border-b pb-3">
                  <div>
                    <h3 className="text-base font-bold text-gray-900">{applicant}</h3>
                    <p className="text-xs text-gray-500">
                      Mengajukan <strong className="capitalize text-gray-700">{req.leaveType}</strong> selama <span className="font-semibold text-blue-600">{req.totalDays} Hari</span>
                    </p>
                  </div>
                  <div className="text-xs text-gray-500 bg-gray-50 px-3 py-1.5 rounded-md border">
                    Periode: <strong className="text-gray-800">{formatDateID(req.startDate)}</strong> s.d. <strong className="text-gray-800">{formatDateID(req.endDate)}</strong>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm bg-gray-50 p-3 rounded-md">
                  <div>
                    <span className="text-xs text-gray-400 block font-semibold uppercase">Alasan Pengajuan:</span>
                    <p className="text-gray-700 mt-0.5">{req.reason}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-400 block font-semibold uppercase">Pengganti Tugas (Handover):</span>
                    <p className="text-gray-700 mt-0.5 font-medium">{handoverPerson}</p>
                  </div>
                </div>

                <ApprovalTracker
                  approvalFlow={req.approvalFlow}
                  currentStepIndex={req.currentStepIndex}
                  userMap={userMap}
                />

                <div className="space-y-3 pt-2 border-t">
                  <input
                    type="text"
                    placeholder="Tulis catatan atau alasan revisi/penolakan (opsional)..."
                    value={comment}
                    onChange={(e) => handleCommentChange(req.id, e.target.value)}
                    className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />

                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => onUpdateApproval(req.id, 'revision', comment)}
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-md text-sm font-medium transition shadow-sm"
                    >
                      Minta Revisi
                    </button>
                    <button
                      onClick={() => onUpdateApproval(req.id, 'rejected', comment)}
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-md text-sm font-medium transition shadow-sm"
                    >
                      Tolak
                    </button>
                    <button
                      onClick={() => onUpdateApproval(req.id, 'approved', comment)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-sm font-medium transition shadow-sm"
                    >
                      Setujui (Approve)
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};