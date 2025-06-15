import { Salary } from '@/services/salary.service';
import { Button } from '@/components/ui/button';

interface SalaryTableProps {
  salaries: Salary[];
  canEdit?: boolean;
  onEdit?: (salary: Salary) => void;
  onDelete?: (salary: Salary) => void;
}

export function SalaryTable({ salaries, canEdit, onEdit, onDelete }: SalaryTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          <tr>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">User</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Effective Date</th>
            {canEdit && <th className="px-4 py-2"></th>}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {salaries.map((salary) => (
            <tr key={salary.id}>
              <td className="px-4 py-2 whitespace-nowrap">{salary.user.fullName}</td>
              <td className="px-4 py-2 whitespace-nowrap">₹{salary.amount.toLocaleString()}</td>
              <td className="px-4 py-2 whitespace-nowrap">{new Date(salary.effectiveDate).toLocaleDateString()}</td>
              {canEdit && (
                <td className="px-4 py-2 whitespace-nowrap flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => onEdit?.(salary)}>Edit</Button>
                  <Button size="sm" variant="destructive" onClick={() => onDelete?.(salary)}>Delete</Button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      {salaries.length === 0 && (
        <div className="text-center text-muted-foreground py-8">No salary records found.</div>
      )}
    </div>
  );
}

