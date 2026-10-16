// src/App.tsx

import React, { useState } from 'react';
import type { User, LeaveRequest, LeaveType } from './types/leave';
import { INITIAL_USERS, INITIAL_REQUESTS } from './data/mockData';
import { LeaveDashboard } from './features/leave/components/LeaveDashboard';
import { LeaveRequestForm } from './features/leave/components/LeaveRequestForm';
import { ApprovalInbox } from './features/approval/components/ApprovalInbox';

export function App() {
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [requests, setRequests] = useState<LeaveRequest[]>(INITIAL_REQUESTS);
  
  const [currentUserId, setCurrentUserId] = useState<string>('usr-1');
  const [currentView, setCurrentView] = useState<'dashboard' | 'form' | 'approval'>('dashboard');

  const currentUser = users.find((u) => u.id === currentUserId) || users[0];
  const userMap = new Map(users.map((u) => [u.id, u.name]));

  const pendingInboxCount = requests.filter((req) => {
    if (req.status !== 'pending') return false;
    const currentStep = req.approvalFlow[req.currentStepIndex];
    return currentStep && currentStep.approverId === currentUser.id && currentStep.status === 'pending';
  }).length;

  const handleCreateRequest = (newRequest: LeaveRequest) => {
    setRequests((prev) => [newRequest, ...prev]);
    setCurrentView('dashboard');
  };

  const handleUpdateApproval = (
    requestId: string,
    actionStatus: 'approved' | 'rejected' | 'revision',
    comment?: string
  ) => {
    setRequests((prevRequests) =>
      prevRequests.map((req) => {
        if (req.id !== requestId) return req;

        const updatedFlow = [...req.approvalFlow];
        const currentStep = updatedFlow[req.currentStepIndex];

        currentStep.status = actionStatus === 'approved' ? 'approved' : actionStatus === 'rejected' ? 'rejected' : 'revision';
        currentStep.comment = comment;
        currentStep.updatedAt = new Date().toISOString();

        let newOverallStatus = req.status;
        let nextStepIndex = req.currentStepIndex;

        if (actionStatus === 'approved') {
          if (req.currentStepIndex + 1 < updatedFlow.length) {
            nextStepIndex += 1;
          } else {
            newOverallStatus = 'approved';
            
            setUsers((prevUsers) =>
              prevUsers.map((u) => {
                if (u.id === req.userId) {
                  const currentBalance = u.leaveBalances[req.leaveType as LeaveType] ?? 0;
                  return {
                    ...u,
                    leaveBalances: {
                      ...u.leaveBalances,
                      [req.leaveType]: Math.max(0, currentBalance - req.totalDays),
                    },
                  };
                }
                return u;
              })
            );
          }
        } else if (actionStatus === 'rejected') {
          newOverallStatus = 'rejected';
        } else {
          newOverallStatus = 'revision';
        }

        return {
          ...req,
          approvalFlow: updatedFlow,
          currentStepIndex: nextStepIndex,
          status: newOverallStatus,
        };
      })
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col font-sans text-gray-900">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-sm">
              S
            </div>
            <div>
              <span className="font-bold text-gray-900 tracking-tight">SaaS Cuti & Izin</span>
              <span className="text-xs text-blue-600 font-semibold block">Multi-Tier Approval System</span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <span className="text-xs text-gray-500 hidden sm:inline">Simulasi Akun:</span>
            <select
              value={currentUserId}
              onChange={(e) => {
                setCurrentUserId(e.target.value);
                setCurrentView('dashboard');
              }}
              className="border border-gray-300 rounded-md py-1.5 px-3 text-xs font-medium bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.role.toUpperCase()})
                </option>
              ))}
            </select>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        <div className="flex border-b border-gray-200 mb-6 space-x-6">
          <button
            onClick={() => setCurrentView('dashboard')}
            className={`pb-3 text-sm font-medium border-b-2 transition ${
              currentView === 'dashboard' || currentView === 'form'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Dashboard Karyawan
          </button>
          
          <button
            onClick={() => setCurrentView('approval')}
            className={`pb-3 text-sm font-medium border-b-2 transition relative ${
              currentView === 'approval'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Inbox Approval
            {pendingInboxCount > 0 && (
              <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">
                {pendingInboxCount}
              </span>
            )}
          </button>
        </div>

        {currentView === 'dashboard' && (
          <LeaveDashboard
            currentUser={currentUser}
            requests={requests}
            users={users}
            onOpenForm={() => setCurrentView('form')}
          />
        )}

        {currentView === 'form' && (
          <LeaveRequestForm
            currentUser={currentUser}
            users={users}
            onSubmit={handleCreateRequest}
            onCancel={() => setCurrentView('dashboard')}
          />
        )}

        {currentView === 'approval' && (
          <ApprovalInbox
            currentUser={currentUser}
            requests={requests}
            users={users}
            onUpdateApproval={handleUpdateApproval}
          />
        )}
      </div>

      <footer className="bg-white border-t border-gray-200 py-4 text-center text-xs text-gray-400">
        &copy; 2026 SaaS Cuti & Izin Berjenjang Enterprise Edition. React + TypeScript.
      </footer>
    </div>
  );
}