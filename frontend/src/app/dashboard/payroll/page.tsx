'use client';

import { useEffect, useState } from "react";
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { DollarSign, FileText, Plus, User as UserIcon, Banknote, ShieldCheck, Download } from 'lucide-react';
import { Salary, salaryService } from '@/services/salary.service';
import { userService, User } from '@/services/user.service';
import { useAuth } from '@/hooks/use-auth';
import { SalaryTable } from '@/components/payroll/SalaryTable';
import { SalaryFormModal } from '@/components/payroll/SalaryFormModal';

function formatINR(amount: number) {
  return `₹${amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
}

function getPayrollBreakdown(salary: number) {
  // India-specific breakdown
  const basic = Math.round(salary * 0.4);
  const hra = Math.round(salary * 0.2);
  const special = Math.round(salary - basic - hra);
  const pf = Math.round(basic * 0.12);
  const esi = salary < 21000 ? Math.round(salary * 0.0075) : 0;
  const pt = 200; // Professional Tax
  const tds = Math.round(salary * 0.10);
  const gross = salary;
  const deductions = pf + esi + pt + tds;
  const net = gross - deductions;
  return { basic, hra, special, pf, esi, pt, tds, gross, deductions, net };
}

export default function PayrollPage() {
  const { user } = useAuth();
  const [salaries, setSalaries] = useState<Salary[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editSalary, setEditSalary] = useState<Salary | null>(null);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState('payroll');

  // Fetch salaries
  const fetchSalaries = async () => {
    setLoading(true);
    try {
      if (user?.role === 'HR') {
        const res = await salaryService.getAll();
        setSalaries(res.data || res);
      } else if (user) {
        const res = await salaryService.getByUser(user.id);
        setSalaries(res.data || res);
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch users for HR
  const fetchUsers = async () => {
    if (user?.role === 'HR') {
      const res = await userService.getAll();
      setUsers(res);
    }
  };

  useEffect(() => {
    fetchSalaries();
    fetchUsers();
    // eslint-disable-next-line
  }, [user]);

  const handleAdd = () => {
    setEditSalary(null);
    setModalOpen(true);
  };

  const handleEdit = (salary: Salary) => {
    setEditSalary(salary);
    setModalOpen(true);
  };

  const handleDelete = async (salary: Salary) => {
    if (!window.confirm('Delete this salary record?')) return;
    await salaryService.remove(salary.id);
    fetchSalaries();
  };

  const handleSubmit = async (data: Partial<Salary>) => {
    if (editSalary) {
      await salaryService.update(editSalary.id, data);
    } else {
      await salaryService.create(data);
    }
    setModalOpen(false);
    fetchSalaries();
  };

  // Get all salary records for current user (for history)
  const mySalaryHistory = user && salaries
    ? salaries.filter(s => s.user.id === user.id)
      .sort((a, b) => new Date(b.effectiveDate).getTime() - new Date(a.effectiveDate).getTime())
    : [];

  // Get latest salary for user
  const mySalary = mySalaryHistory[0];
  const breakdown = mySalary ? getPayrollBreakdown(mySalary.amount) : undefined;

  return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Payroll</h2>
        </div>
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="payroll">My Payroll</TabsTrigger>
            {user?.role === 'HR' && <TabsTrigger value="manage">Manage Salaries</TabsTrigger>}
          </TabsList>

          {/* My Payroll Tab */}
          <TabsContent value="payroll">
            <div className="grid gap-6 md:grid-cols-2">
              {/* User Details Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><UserIcon className="h-5 w-5" /> My Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex flex-col gap-1">
                    <span><b>Name:</b> {user?.fullName}</span>
                    <span><b>Email:</b> {user?.email}</span>
                    <span><b>Role:</b> {user?.role}</span>
                    <span><b>Department:</b> {user?.department?.name || '-'}</span>
                    <span><b>Designation:</b> {user?.designation || '-'}</span>
                    <span><b>PAN:</b> {'ABCDE1234F'}</span>
                    <span><b>Bank Account:</b> {'XXXXXX1234'}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Payroll Details Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Banknote className="h-5 w-5" /> Payroll Details</CardTitle>
                </CardHeader>
                <CardContent>
                  {mySalary ? (
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Current CTC</span>
                        <span className="font-semibold">{formatINR(mySalary.amount * 12)} / year</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Monthly Gross</span>
                        <span>{formatINR(breakdown?.gross || 0)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Monthly Deductions</span>
                        <span>-{formatINR(breakdown?.deductions || 0)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Net Pay</span>
                        <span className="font-bold text-green-700">{formatINR(breakdown?.net || 0)}</span>
                      </div>
                      <div className="mt-4">
                        <table className="w-full text-sm border">
                          <thead>
                            <tr className="bg-gray-50">
                              <th className="p-2 text-left">Component</th>
                              <th className="p-2 text-right">Amount</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr><td>Basic</td><td className="text-right">{formatINR(breakdown?.basic || 0)}</td></tr>
                            <tr><td>HRA</td><td className="text-right">{formatINR(breakdown?.hra || 0)}</td></tr>
                            <tr><td>Special Allowance</td><td className="text-right">{formatINR(breakdown?.special || 0)}</td></tr>
                            <tr><td>PF (Employee)</td><td className="text-right">-{formatINR(breakdown?.pf || 0)}</td></tr>
                            <tr><td>ESI</td><td className="text-right">-{formatINR(breakdown?.esi || 0)}</td></tr>
                            <tr><td>Professional Tax</td><td className="text-right">-{formatINR(breakdown?.pt || 0)}</td></tr>
                            <tr><td>TDS</td><td className="text-right">-{formatINR(breakdown?.tds || 0)}</td></tr>
                          </tbody>
                        </table>
                      </div>
                      <div className="mt-4 flex gap-2">
                        <Button variant="outline" disabled><Download className="h-4 w-4 mr-2" /> Download Payslip</Button>
                        <Button variant="secondary" disabled>View Tax Documents</Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-red-600 font-medium py-8">
                      Payroll not set up. Please contact HR for your salary setup.
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Payroll History Table */}
            <div className="mt-8">
              <Card>
                <CardHeader>
                  <CardTitle>Payroll History</CardTitle>
                </CardHeader>
                <CardContent>
                  {mySalaryHistory.length > 0 ? (
                    <table className="w-full text-sm border">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="p-2 text-left">Effective Date</th>
                          <th className="p-2 text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {mySalaryHistory.map(sal => (
                          <tr key={sal.id}>
                            <td className="p-2">{new Date(sal.effectiveDate).toLocaleDateString()}</td>
                            <td className="p-2 text-right">{formatINR(sal.amount)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="text-center text-muted-foreground py-8">No payroll history found.</div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Statutory Compliance Card */}
            <div className="grid gap-6 md:grid-cols-2 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><ShieldCheck className="h-5 w-5" /> Statutory Compliance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div><b>PF UAN:</b> 100200300400</div>
                  <div><b>ESI Number:</b> 1234567890</div>
                  <div><b>Professional Tax:</b> ₹200/month</div>
                  <div><b>TDS:</b> 10% (for demo)</div>
                  <div><b>PAN:</b> {'ABCDE1234F'}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" /> Payroll Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div><b>Salary Effective From:</b> {mySalary ? new Date(mySalary.effectiveDate).toLocaleDateString() : '-'}</div>
                  <div><b>Last Updated:</b> {mySalary ? new Date(mySalary.updatedAt).toLocaleDateString() : '-'}</div>
                  <div><b>Bank Account:</b> {'XXXXXX1234'}</div>
                  <div><b>IFSC:</b> {'SBIN0001234'}</div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Manage Salaries Tab (HR only) */}
          {user?.role === 'HR' && (
            <TabsContent value="manage">
              <div className="flex justify-end mb-4">
                <Button onClick={handleAdd}><Plus className="mr-2 h-4 w-4" /> Add Salary</Button>
              </div>
              <Card>
                <CardHeader>
                  <CardTitle>All Salaries</CardTitle>
                </CardHeader>
                <CardContent>
                  <SalaryTable
                    salaries={salaries}
                    canEdit={user?.role === 'HR'}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                </CardContent>
              </Card>
              <SalaryFormModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onSubmit={handleSubmit}
                initialData={editSalary || undefined}
                users={users}
                isEdit={!!editSalary}
              />
            </TabsContent>
          )}
        </Tabs>
      </div>
  );
} 