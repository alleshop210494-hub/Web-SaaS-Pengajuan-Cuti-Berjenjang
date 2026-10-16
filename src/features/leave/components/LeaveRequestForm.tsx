// src/features/leave/components/LeaveRequestForm.tsx

import React, { useState, useMemo } from 'react';
import type { User, LeaveType, LeaveRequest, ApprovalStep } from '../../../types/leave';
import { calculateWorkingDays } from '../../../utils/dateHelper';

interface LeaveRequestFormProps {
  currentUser: User;
  users: User[];
  onSubmit: (request: LeaveRequest) => void;
  onCancel: () => void;
}

const LEAVE_TYPE_LABELS: Record<LeaveType, string> = {
  annual: 'Cuti Tahunan',
  sick: 'Cuti Sakit',
  maternity: 'Cuti Melahirkan',
  paternity: 'Cuti Ayah / Paternity',
  special: 'Izin Alasan Penting',
  hourly: 'Izin Harian / Jam-an',
};

export const LeaveRequestForm: React.FC<LeaveRequestFormProps> = ({
  currentUser,
  users,
  onSubmit,
  onCancel,
}) => {
  const [leaveType, setLeaveType] = useState<LeaveType>('annual');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [handoverUserId, setHandoverUserId] = useState('');
  const [attachmentName, setAttachmentName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const availableColleagues = useMemo(() => {
    return users.filter(
      (u) => u.id !== currentUser.id && u.departmentId === currentUser.departmentId
    );
  }, [users, currentUser]);

  const totalDays = useMemo(() => {
    return calculateWorkingDays(startDate, endDate);
  }, [startDate, endDate]);

  const currentBalance = currentUser.leaveBalances[leaveType] ?? 0;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachmentName(file.name);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (totalDays <= 0) {
      setErrorMsg('Rentang tanggal tidak valid. Pastikan tanggal selesai setelah tanggal mulai.');
      return;
    }

    if (leaveType === 'annual' && totalDays > currentBalance) {
      setErrorMsg(`Sisa cuti tahunan Anda tidak mencukupi (${currentBalance} hari tersisa).`);
      return;
    }

    if (!handoverUserId) {
      setErrorMsg('Harap pilih rekan kerja yang akan mengemban tugas sementara (Handover).');
      return;
    }

    const approvalFlow: ApprovalStep[] = [];
    
    if (currentUser.managerId) {
      approvalFlow.push({
        level: 1,
        approverId: currentUser.managerId,
        approverRole: 'Atasan Langsung',
        status: 'pending',
      });
    }

    const hrAdmin = users.find((u) => u.role === 'hr');
    if (hrAdmin) {
      approvalFlow.push({
        level: approvalFlow.length + 1,
        approverId: hrAdmin.id,
        approverRole: 'HRD Manager',
        status: 'pending',
      });
    }

    const newRequest: LeaveRequest = {
      id: `req-${Date.now()}`,
      userId: currentUser.id,
      leaveType,
      startDate,
      endDate,
      totalDays,
      reason,
      handoverUserId,
      attachmentUrl: attachmentName ? `/uploads/${attachmentName}` : undefined,
      approvalFlow,
      currentStepIndex: 0,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    onSubmit(newRequest);
  };

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm max-w-2xl mx-auto">
      <div className="border-b pb-4 mb-6">
        <h2 className="text-xl font-bold text-gray-900">Formulir Pengajuan Cuti & Izin</h2>
        <p className="text-sm text-gray-500 mt-1">
          Lengkapi formulir di bawah ini. Pengajuan akan diteruskan ke atasan Anda secara otomatis.
        </p>
      </div>

      {errorMsg && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-md">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Jenis Pengajuan <span className="text-red-500">*</span>
          </label>
          <select
            value={leaveType}
            onChange={(e) => setLeaveType(e.target.value as LeaveType)}
            className="w-full border border-gray-300 rounded-md p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            {Object.entries(LEAVE_TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label} (Sisa: {currentUser.leaveBalances[value as LeaveType] ?? 0} hari)
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tanggal Mulai <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-md p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tanggal Selesai <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-md p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </div>

        {startDate && endDate && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-md text-sm text-blue-800 flex justify-between items-center">
            <span>Total Hari Kerja (tidak termasuk akhir pekan):</span>
            <span className="font-bold text-base">{totalDays} Hari</span>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Pengganti Tugas / Handover <span className="text-red-500">*</span>
          </label>
          <select
            value={handoverUserId}
            onChange={(e) => setHandoverUserId(e.target.value)}
            required
            className="w-full border border-gray-300 rounded-md p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="">-- Pilih Rekan Kerja --</option>
            {availableColleagues.map((colleague) => (
              <option key={colleague.id} value={colleague.id}>
                {colleague.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Unggah Dokumen Pendukung <span className="text-gray-400 font-normal">(Opsional / Surat Sakit)</span>
          </label>
          <input
            type="file"
            onChange={handleFileChange}
            accept=".pdf,.png,.jpg,.jpeg"
            className="w-full text-sm text-gray-500 border border-gray-300 rounded-md file:mr-4 file:py-2.5 file:px-4 file:border-0 file:text-sm file:font-semibold file:bg-gray-100 hover:file:bg-gray-200 cursor-pointer"
          />
          {attachmentName && (
            <p className="text-xs text-green-600 mt-1">Terlampir: {attachmentName}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Alasan Pengajuan <span className="text-red-500">*</span>
          </label>
          <textarea
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
            placeholder="Jelaskan secara singkat keperluan cuti/izin Anda..."
            className="w-full border border-gray-300 rounded-md p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
          >
            Batal
          </button>
          <button
            type="submit"
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition shadow-sm"
          >
            Kirim Pengajuan
          </button>
        </div>
      </form>
    </div>
  );
};