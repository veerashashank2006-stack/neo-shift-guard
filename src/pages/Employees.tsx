import { useState } from "react"
import { Plus, Search, MoreHorizontal, Trash2, Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const mockEmployees = [
  { id: 'EMP001', name: 'Sarah Johnson', email: 'sarah@example.com', role: 'Bartender', basePay: 18.50, status: 'Active' },
  { id: 'EMP002', name: 'Mike Chen', email: 'mike@example.com', role: 'Server', basePay: 15.00, status: 'Active' },
  { id: 'EMP003', name: 'Emily Davis', email: 'emily@example.com', role: 'Manager', basePay: 25.00, status: 'Active' },
  { id: 'EMP004', name: 'Alex Rodriguez', email: 'alex@example.com', role: 'Bartender', basePay: 17.75, status: 'Active' },
  { id: 'EMP005', name: 'Jessica Wilson', email: 'jessica@example.com', role: 'Host', basePay: 14.50, status: 'Inactive' },
]

export default function Employees() {
  const [searchQuery, setSearchQuery] = useState("")
  const [employees] = useState(mockEmployees)

  const filteredEmployees = employees.filter(employee =>
    employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    employee.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    employee.role.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Employee Management</h2>
          <p className="text-muted-foreground">Manage your bar staff members</p>
        </div>
        <Button className="glass-button neon-glow">
          <Plus className="h-4 w-4 mr-2" />
          Add Employee
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-card p-4 rounded-2xl">
          <div className="text-2xl font-bold text-primary">{employees.filter(e => e.status === 'Active').length}</div>
          <div className="text-sm text-muted-foreground">Active Employees</div>
        </div>
        <div className="glass-card p-4 rounded-2xl">
          <div className="text-2xl font-bold text-warning">{employees.filter(e => e.status === 'Inactive').length}</div>
          <div className="text-sm text-muted-foreground">Inactive</div>
        </div>
        <div className="glass-card p-4 rounded-2xl">
          <div className="text-2xl font-bold text-success">${employees.reduce((sum, e) => sum + e.basePay, 0).toFixed(2)}</div>
          <div className="text-sm text-muted-foreground">Total Hourly Rate</div>
        </div>
        <div className="glass-card p-4 rounded-2xl">
          <div className="text-2xl font-bold text-foreground">${(employees.reduce((sum, e) => sum + e.basePay, 0) / employees.length).toFixed(2)}</div>
          <div className="text-sm text-muted-foreground">Avg. Hourly Rate</div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="glass-card p-6 rounded-2xl">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search employees..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 glass-card border-white/10"
            />
          </div>
        </div>

        {/* Employee Table */}
        <div className="rounded-2xl border border-white/10 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-white/10 hover:bg-muted/20">
                <TableHead className="text-muted-foreground font-medium">Employee ID</TableHead>
                <TableHead className="text-muted-foreground font-medium">Name</TableHead>
                <TableHead className="text-muted-foreground font-medium">Role</TableHead>
                <TableHead className="text-muted-foreground font-medium">Base Pay</TableHead>
                <TableHead className="text-muted-foreground font-medium">Status</TableHead>
                <TableHead className="text-muted-foreground font-medium">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmployees.map((employee) => (
                <TableRow 
                  key={employee.id} 
                  className="border-white/10 hover:bg-muted/10 transition-colors"
                >
                  <TableCell className="font-mono text-sm text-primary">{employee.id}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium text-foreground">{employee.name}</div>
                      <div className="text-sm text-muted-foreground">{employee.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="px-2 py-1 rounded-lg text-xs font-medium bg-muted/30 text-muted-foreground border border-white/10">
                      {employee.role}
                    </span>
                  </TableCell>
                  <TableCell className="font-semibold text-success">${employee.basePay}/hr</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-lg text-xs font-medium border ${
                      employee.status === 'Active' 
                        ? 'bg-success/20 text-success border-success/30' 
                        : 'bg-muted/20 text-muted-foreground border-muted/30'
                    }`}>
                      {employee.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-muted/20">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="glass-card border-white/10">
                        <DropdownMenuItem className="hover:bg-muted/20">
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Employee
                        </DropdownMenuItem>
                        <DropdownMenuItem className="hover:bg-destructive/20 text-destructive">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Employee
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {filteredEmployees.length === 0 && (
          <div className="text-center py-12">
            <div className="text-muted-foreground">No employees found matching your search.</div>
          </div>
        )}
      </div>
    </div>
  )
}