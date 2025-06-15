import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { LeaveType } from "@/services/types";
import { format } from "date-fns";

interface LeaveBalance {
  casual: { used: number; total: number };
  sick: { used: number; total: number };
}

interface LeaveHistory {
  date: string;
  type: LeaveType;
  status: string;
}

interface LeaveBalanceCardProps {
  balance: LeaveBalance;
  history?: LeaveHistory[];
  className?: string;
}

export function LeaveBalanceCard({ balance, history, className }: LeaveBalanceCardProps) {
  const [showHistory, setShowHistory] = useState(false);

  return (
    <>
      <Card 
        className={`${className} cursor-pointer transition-all hover:border-black`}
        onClick={() => setShowHistory(true)}
      >
        <CardHeader>
          <CardTitle className="text-lg">Leave Balance (2025-2026)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Casual Leave</h3>
              <p className="mt-1 text-2xl font-semibold">{balance.casual.total - balance.casual.used}/{balance.casual.total}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Sick Leave</h3>
              <p className="mt-1 text-2xl font-semibold">{balance.sick.total - balance.sick.used}/{balance.sick.total}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showHistory} onOpenChange={setShowHistory}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-[#111827]">Leave History</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {history && history.length > 0 ? (
              <div className="space-y-4">
                {history.map((item, index) => (
                  <div 
                    key={index} 
                    className="flex items-center justify-between border-b border-[#E5E7EB] pb-4 last:border-0 last:pb-0"
                  >
                    <div>
                      <p className="text-sm font-medium text-[#111827]">
                        {format(new Date(item.date), 'dd MMM yyyy')}
                      </p>
                      <p className="text-sm text-[#6B7280]">{item.type}</p>
                    </div>
                    <span className={`text-sm font-medium ${
                      item.status === 'Approved' ? 'text-green-600' :
                      item.status === 'Rejected' ? 'text-red-600' :
                      'text-yellow-600'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-sm text-[#6B7280]">No leave history found</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
} 