// src/features/approval/components/ApprovalTracker.tsx

import React from 'react';
import type { ApprovalStep } from '../../../types/leave';

interface ApprovalTrackerProps {
  approvalFlow: ApprovalStep[];
  currentStepIndex: number;
  userMap: Map<string, string>;
}

export const ApprovalTracker: React.FC<ApprovalTrackerProps> = ({
  approvalFlow,
  currentStepIndex,
  userMap,
}) => {
  return (
    <div className="py-2">
      <h4 className="text-xs font-semibold uppercase text-gray-500 mb-3">Status Alur Persetujuan (Multi-Tier)</h4>
      <div className="flex items-center space-x-2">
        {approvalFlow.map((step, idx) => {
          const approverName = userMap.get(step.approverId) || step.approverRole;
          
          let statusColor = 'bg-gray-100 text-gray-400 border-gray-300';
          let dotColor = 'bg-gray-300';

          if (step.status === 'approved') {
            statusColor = 'bg-emerald-50 text-emerald-800 border-emerald-300';
            dotColor = 'bg-emerald-500';
          } else if (step.status === 'rejected') {
            statusColor = 'bg-rose-50 text-rose-800 border-rose-300';
            dotColor = 'bg-rose-500';
          } else if (idx === currentStepIndex && step.status === 'pending') {
            statusColor = 'bg-amber-50 text-amber-800 border-amber-300 ring-2 ring-amber-400';
            dotColor = 'bg-amber-500 animate-pulse';
          }

          return (
            <React.Fragment key={step.level}>
              {idx > 0 && <div className="h-0.5 w-8 bg-gray-300" />}
              <div className={`flex-1 p-3 rounded-lg border text-xs ${statusColor} space-y-1`}>
                <div className="flex items-center justify-between">
                  <span className="font-bold">Level {step.level}: {step.approverRole}</span>
                  <span className={`w-2 h-2 rounded-full ${dotColor}`} />
                </div>
                <div className="text-gray-600 truncate">{approverName}</div>
                <div className="capitalize font-semibold">
                  Status: {step.status === 'pending' ? (idx === currentStepIndex ? 'Menunggu Review' : 'Antrean') : step.status}
                </div>
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};