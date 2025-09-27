import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Users, Search, Plus, MoreHorizontal, Edit, Trash2, DollarSign, UserCheck, UserX, Clock, LogIn, LogOut } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"

interface Employee {
  id: string
  employee_id: string
  full_name: string
  email: string
  role: string
  department?: string
  position?: string
  phone?: string
  is_active: boolean
  created_at: string
  // Attendance fields
  attendance_status?: 'checked_in' | 'checked_out' | 'not_marked'
  check_in_time?: string
  check_out_time?: string
  last_attendance_date?: string
}

export default function Employees() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [employees, setEmployees] = useState<Employee[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newEmployee, setNewEmployee] = useState({
    full_name: "",
    email: "",
    role: "employee",
    department: "",
    position: "",
    phone: ""
  })

  useEffect(() => {
    if (user) {
      fetchEmployees()
    }
  }, [user])

  const fetchEmployees = async () => {
    try {
      const today = new Date().toISOString().split('T')[0]
      
      // Fetch employees with their today's attendance status
      const { data, error } = await supabase
        .from('user_profiles')
        .select(`
          *,
          attendance_records!left(
            check_in_time,
            check_out_time,
            date,
            status
          )
        `)
        .order('full_name')

      if (error) throw error

      // Process the data to include attendance status
      const employeesWithAttendance = (data || []).map((employee: any) => {
        const todayAttendance = employee.attendance_records?.find(
          (record: any) => record.date === today
        )
        
        let attendance_status: 'checked_in' | 'checked_out' | 'not_marked' = 'not_marked'
        
        if (todayAttendance) {
          if (todayAttendance.check_out_time) {
            attendance_status = 'checked_out'
          } else if (todayAttendance.check_in_time) {
            attendance_status = 'checked_in'
          }
        }

        return {
          ...employee,
          attendance_status,
          check_in_time: todayAttendance?.check_in_time,
          check_out_time: todayAttendance?.check_out_time,
          last_attendance_date: todayAttendance?.date,
          attendance_records: undefined // Remove the nested records
        }
      })

      setEmployees(employeesWithAttendance)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching employees:', error)
      toast({
        title: "Error",
        description: "Failed to fetch employees",
        variant: "destructive"
      })
      setLoading(false)
    }
  }

  const addEmployee = async () => {
    try {
      // Generate employee ID
      const employeeId = 'EMP' + Date.now().toString().slice(-6)
      
      // First, sign up the user in Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: newEmployee.email,
        password: 'TempPassword123!', // Temporary password - should be changed on first login
        options: {
          data: {
            full_name: newEmployee.full_name,
            employee_id: employeeId,
            role: newEmployee.role
          }
        }
      })

      if (authError) throw authError

      // The trigger will create the profile automatically
      
      toast({
        title: "Success",
        description: "Employee added successfully. They will receive an email to set up their account."
      })
      
      setIsAddDialogOpen(false)
      setNewEmployee({
        full_name: "",
        email: "",
        role: "employee",
        department: "",
        position: "",
        phone: ""
      })
      
      fetchEmployees()
    } catch (error: any) {
      console.error('Error adding employee:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to add employee",
        variant: "destructive"
      })
    }
  }

  const toggleEmployeeStatus = async (employeeId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ is_active: !currentStatus })
        .eq('id', employeeId)

      if (error) throw error

      toast({
        title: "Success",
        description: `Employee ${!currentStatus ? 'activated' : 'deactivated'} successfully`
      })
      
      fetchEmployees()
    } catch (error: any) {
      console.error('Error updating employee status:', error)
      toast({
        title: "Error",
        description: "Failed to update employee status",
        variant: "destructive"
      })
    }
  }

  const deleteEmployee = async (employeeId: string, employeeName: string) => {
    if (!confirm(`Are you sure you want to permanently delete ${employeeName}? This action cannot be undone.`)) {
      return
    }

    try {
      // Delete from user_profiles
      const { error } = await supabase
        .from('user_profiles')
        .delete()
        .eq('id', employeeId)

      if (error) throw error

      // Update local state
      setEmployees(employees.filter(emp => emp.id !== employeeId))

      toast({
        title: "Success",
        description: `Employee ${employeeName} deleted successfully`,
      })
    } catch (error) {
      console.error('Error deleting employee:', error)
      toast({
        title: "Error",
        description: "Failed to delete employee",
        variant: "destructive"
      })
    }
  }

  const editEmployeeField = async (employee: Employee, field: string, newValue: string) => {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ [field]: newValue })
        .eq('id', employee.id)

      if (error) throw error

      // Update local state
      setEmployees(employees.map(emp => 
        emp.id === employee.id ? { ...emp, [field]: newValue } : emp
      ))

      toast({
        title: "Success",
        description: "Employee updated successfully",
      })
    } catch (error) {
      console.error('Error editing employee:', error)
      toast({
        title: "Error",
        description: "Failed to update employee",
        variant: "destructive"
      })
    }
  }

  const filteredEmployees = employees.filter(employee =>
    employee.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    employee.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    employee.employee_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    employee.role.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const activeEmployees = employees.filter(emp => emp.is_active).length
  const inactiveEmployees = employees.filter(emp => !emp.is_active).length

  if (loading) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading employees...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Employee Management</h2>
          <p className="text-muted-foreground">Manage staff profiles and access permissions</p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Employee
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Employee</DialogTitle>
              <DialogDescription>
                Create a new employee profile. They will receive an email to set up their account.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  value={newEmployee.full_name}
                  onChange={(e) => setNewEmployee(prev => ({ ...prev, full_name: e.target.value }))}
                  placeholder="Enter full name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newEmployee.email}
                  onChange={(e) => setNewEmployee(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter email address"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select value={newEmployee.role} onValueChange={(value) => setNewEmployee(prev => ({ ...prev, role: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="employee">Employee</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="department">Department (Optional)</Label>
                <Input
                  id="department"
                  value={newEmployee.department}
                  onChange={(e) => setNewEmployee(prev => ({ ...prev, department: e.target.value }))}
                  placeholder="e.g., Operations, Management"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="position">Position (Optional)</Label>
                <Input
                  id="position"
                  value={newEmployee.position}
                  onChange={(e) => setNewEmployee(prev => ({ ...prev, position: e.target.value }))}
                  placeholder="e.g., Bartender, Server, Manager"
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={addEmployee} disabled={!newEmployee.full_name || !newEmployee.email}>
                Add Employee
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass-card neon-glow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{employees.length}</div>
            <p className="text-xs text-muted-foreground">
              All registered staff
            </p>
          </CardContent>
        </Card>
        
        <Card className="glass-card neon-glow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Employees</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{activeEmployees}</div>
            <p className="text-xs text-muted-foreground">
              Currently active staff
            </p>
          </CardContent>
        </Card>
        
        <Card className="glass-card neon-glow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive Employees</CardTitle>
            <UserX className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-muted-foreground">{inactiveEmployees}</div>
            <p className="text-xs text-muted-foreground">
              Deactivated accounts
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search employees..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {/* Employee Table */}
      <Card className="glass-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Attendance Status</TableHead>
              <TableHead>Check In/Out</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEmployees.length > 0 ? (
              filteredEmployees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell className="font-medium">{employee.employee_id}</TableCell>
                  <TableCell>{employee.full_name}</TableCell>
                  <TableCell>{employee.email}</TableCell>
                  <TableCell>
                    <Badge variant={
                      employee.role === 'admin' ? 'default' :
                      employee.role === 'manager' ? 'secondary' : 'outline'
                    }>
                      {employee.role}
                    </Badge>
                  </TableCell>
                  <TableCell>{employee.department || '-'}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {employee.attendance_status === 'checked_in' && (
                        <>
                          <LogIn className="h-4 w-4 text-success" />
                          <Badge variant="default" className="bg-success/10 text-success border-success/20">
                            Checked In
                          </Badge>
                        </>
                      )}
                      {employee.attendance_status === 'checked_out' && (
                        <>
                          <LogOut className="h-4 w-4 text-muted-foreground" />
                          <Badge variant="secondary">
                            Checked Out
                          </Badge>
                        </>
                      )}
                      {employee.attendance_status === 'not_marked' && (
                        <>
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <Badge variant="outline">
                            Not Marked
                          </Badge>
                        </>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {employee.check_in_time && (
                        <div className="text-success">
                          In: {new Date(employee.check_in_time).toLocaleTimeString('en-US', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </div>
                      )}
                      {employee.check_out_time && (
                        <div className="text-muted-foreground">
                          Out: {new Date(employee.check_out_time).toLocaleTimeString('en-US', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </div>
                      )}
                      {!employee.check_in_time && !employee.check_out_time && (
                        <div className="text-muted-foreground">-</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={employee.is_active ? 'default' : 'secondary'}>
                      {employee.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                       <DropdownMenuContent align="end">
                         <DropdownMenuItem
                           onClick={() => {
                             const newName = prompt('Enter new full name:', employee.full_name);
                             if (newName && newName !== employee.full_name) {
                               editEmployeeField(employee, 'full_name', newName);
                             }
                           }}
                         >
                           <Edit className="mr-2 h-4 w-4" />
                           Edit Name
                         </DropdownMenuItem>
                         <DropdownMenuItem
                           onClick={() => {
                             const newDept = prompt('Enter department:', employee.department || '');
                             if (newDept !== null) {
                               editEmployeeField(employee, 'department', newDept);
                             }
                           }}
                         >
                           <Edit className="mr-2 h-4 w-4" />
                           Edit Department
                         </DropdownMenuItem>
                         <DropdownMenuItem
                           onClick={() => toggleEmployeeStatus(employee.id, employee.is_active)}
                         >
                           {employee.is_active ? (
                             <>
                               <UserX className="mr-2 h-4 w-4" />
                               Deactivate
                             </>
                           ) : (
                             <>
                               <UserCheck className="mr-2 h-4 w-4" />
                               Activate
                             </>
                           )}
                         </DropdownMenuItem>
                         <DropdownMenuItem
                           onClick={() => deleteEmployee(employee.id, employee.full_name)}
                           className="text-destructive focus:text-destructive"
                         >
                           <Trash2 className="mr-2 h-4 w-4" />
                           Delete
                         </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8">
                  <div className="text-muted-foreground">
                    {searchQuery ? 'No employees found matching your search.' : 'No employees found.'}
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}