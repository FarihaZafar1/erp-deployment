"use client";

import { useState, useEffect } from "react";
import {
  DollarSign,
  Plus,
  Search,
  Filter,
  Edit,
  Users,
  Calendar,
  TrendingUp,
  Loader2,
  AlertCircle,
  X,
  Save,
  Trash2,
  CheckCircle,
  Clock,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import { getInitials } from "@/lib/utils";
import { useAuth } from "@clerk/nextjs";

interface PayrollRecord {
  id: string;
  userId: string;
  month: number;
  year: number;
  basicSalary: number;
  allowances: number;
  deductions: number;
  netSalary: number;
  status: 'PENDING' | 'APPROVED' | 'PAID';
  createdAt: string;
  updatedAt: string;
  user: {
    name: string;
    email: string;
    employeeProfile?: {
      employeeId: string;
      department: {
        name: string;
      };
    };
  };
}

interface Employee {
  id: string;
  employeeId: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
  department: {
    name: string;
  };
}

interface PayrollFormData {
  userId: string;
  month: number;
  year: number;
  basicSalary: string;
  allowances: string;
  deductions: string;
  status: string;
}

const departments = ["All", "Engineering", "Marketing", "Sales", "HR", "Finance"];
const statuses = ["All", "PENDING", "APPROVED", "PAID"];
const payrollStatuses = ["PENDING", "APPROVED", "PAID"];

const getMonthName = (monthIndex: number): string => {
  const months = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  return months[monthIndex];
};

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR'
  }).format(amount);
};

export default function PayrollPage() {
  const { isLoaded, userId } = useAuth();
  const [payrollData, setPayrollData] = useState<PayrollRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [formData, setFormData] = useState<PayrollFormData>({
    userId: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    basicSalary: '',
    allowances: '',
    deductions: '',
    status: 'PENDING'
  });
  
  // Edit state variables
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingPayroll, setEditingPayroll] = useState<PayrollRecord | null>(null);
  const [editFormData, setEditFormData] = useState<PayrollFormData>({
    userId: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    basicSalary: '',
    allowances: '',
    deductions: '',
    status: 'PENDING'
  });

  // Delete state variables
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingPayroll, setDeletingPayroll] = useState<PayrollRecord | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Fetch payroll data from API
  const fetchPayrollData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (selectedDepartment !== 'All') params.append('department', selectedDepartment);
      if (selectedStatus !== 'All') params.append('status', selectedStatus);
      
      const response = await fetch(`/api/payroll?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch payroll data: ${response.statusText}`);
      }
      
      const result = await response.json();
      // Extract and transform the data array from the API response
      const payrollArray = Array.isArray(result.data) ? result.data.map((item: any) => ({
        id: item.id,
        userId: item.userId,
        month: item.month,
        year: item.year,
        basicSalary: Number(item.basicSalary) || 0,
        allowances: Number(item.allowances) || 0,
        deductions: Number(item.deductions) || 0,
        netSalary: Number(item.netSalary) || 0,
        status: item.status,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        user: {
          name: item.user?.name || '',
          email: item.user?.email || '',
          employeeProfile: item.user?.employeeProfile ? {
            employeeId: item.user.employeeProfile.employeeId || '',
            department: {
              name: item.user.employeeProfile.department?.name || 'No Department'
            }
          } : undefined
        }
      })) : [];
      
      setPayrollData(payrollArray);
    } catch (err) {
      console.error('Error fetching payroll data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch payroll data');
      // Ensure payrollData is always an array even on error
      setPayrollData([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch employees for dropdown
  const fetchEmployees = async () => {
    try {
      const response = await fetch('/api/employees');
      if (response.ok) {
        const data = await response.json();
        const formattedEmployees = data.employees.map((emp: any) => ({
          id: emp.user.id,
          employeeId: emp.employeeId,
          user: {
            firstName: emp.user.name?.split(' ')[0] || '',
            lastName: emp.user.name?.split(' ').slice(1).join(' ') || '',
            email: emp.user.email
          },
          department: {
            name: emp.department?.name || 'No Department'
          }
        }));
        setEmployees(formattedEmployees);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  // Handle form submission for creating new payroll
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError(null);

    try {
      // Check if payroll already exists before submitting
      const existingCheck = payrollData.find(payroll => {
        const payrollMonth = new Date(payroll.payPeriodStart).getMonth() + 1;
        const payrollYear = new Date(payroll.payPeriodStart).getFullYear();
        return payroll.userId === formData.userId && 
               payrollMonth === formData.month && 
               payrollYear === formData.year;
      });

      if (existingCheck) {
        setFormError(`Payroll for ${existingCheck.user.firstName} ${existingCheck.user.lastName} already exists for ${getMonthName(formData.month - 1)} ${formData.year}. Please select a different month/year or employee.`);
        setFormLoading(false);
        return;
      }

      // Ensure proper data types and handle empty values
      const payrollSubmissionData = {
        userId: formData.userId,
        month: formData.month,
        year: formData.year,
        basicSalary: formData.basicSalary ? parseFloat(formData.basicSalary) : 0,
        allowances: formData.allowances ? parseFloat(formData.allowances) : 0,
        deductions: formData.deductions ? parseFloat(formData.deductions) : 0,
        status: formData.status || 'PENDING'
      };

      // Validate that basicSalary is greater than 0
      if (payrollSubmissionData.basicSalary <= 0) {
        setFormError('Basic salary must be greater than 0');
        setFormLoading(false);
        return;
      }

      console.log('Submitting payroll data:', payrollSubmissionData);

      const response = await fetch('/api/payroll', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payrollSubmissionData),
      });

      if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      
      // Clone the response so we can try multiple parsing methods
      const responseClone = response.clone();
      
      try {
        const errorData = await response.json();
        console.error('API Error:', errorData);
        errorMessage = errorData.error || errorData.message || errorMessage;
      } catch (jsonError) {
        console.error('Failed to parse error response as JSON:', jsonError);
        // Use the cloned response to get text
        try {
          const errorText = await responseClone.text();
          if (errorText) {
            errorMessage = errorText;
          }
        } catch (textError) {
          console.error('Failed to get error response as text:', textError);
          // Keep the default HTTP error message
        }
      }
      
      throw new Error(errorMessage);
    }

      const result = await response.json();
      console.log('Payroll created successfully:', result);

      // Reset form and close modal
      setFormData({
        userId: '',
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        basicSalary: '',
        allowances: '',
        deductions: '',
        status: 'PENDING'
      });
      setShowAddForm(false);
      
      // Refresh payroll list
      await fetchPayrollData();
    } catch (err) {
      console.error('Error creating payroll:', err);
      setFormError(err instanceof Error ? err.message : 'Failed to create payroll');
    } finally {
      setFormLoading(false);
    }
  };

  // Handle edit form submission
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPayroll) return;
    
    setFormLoading(true);
    setFormError(null);

    try {
      // Check for duplicate only if userId, month, or year are changing
      const originalMonth = new Date(editingPayroll.payPeriodStart).getMonth() + 1;
      const originalYear = new Date(editingPayroll.payPeriodStart).getFullYear();
      
      const isUserIdChanging = editFormData.userId !== editingPayroll.userId;
      const isMonthChanging = editFormData.month !== originalMonth;
      const isYearChanging = editFormData.year !== originalYear;
      
      if (isUserIdChanging || isMonthChanging || isYearChanging) {
        const existingCheck = payrollData.find(payroll => {
          const payrollMonth = new Date(payroll.payPeriodStart).getMonth() + 1;
          const payrollYear = new Date(payroll.payPeriodStart).getFullYear();
          return payroll.id !== editingPayroll.id &&
                 payroll.userId === editFormData.userId && 
                 payrollMonth === editFormData.month && 
                 payrollYear === editFormData.year;
        });

        if (existingCheck) {
          setFormError(`Payroll for this employee already exists for ${getMonthName(editFormData.month - 1)} ${editFormData.year}. Please select a different month/year or employee.`);
          setFormLoading(false);
          return;
        }
      }

      // Only include fields that have actually changed
      const updateData: any = {};
      
      // Check if userId has changed
      if (editFormData.userId !== editingPayroll.userId) {
        updateData.userId = editFormData.userId;
      }
      
      // Check if month has changed
      if (editFormData.month !== originalMonth) {
        updateData.month = editFormData.month;
      }
      
      // Check if year has changed
      if (editFormData.year !== originalYear) {
        updateData.year = editFormData.year;
      }
      
      // Check if basicSalary has changed
      const originalBasicSalary = (editingPayroll.baseSalary || 0).toString();
      if (editFormData.basicSalary !== originalBasicSalary) {
        updateData.basicSalary = parseFloat(editFormData.basicSalary) || 0;
      }
      
      // Check if allowances have changed
      const originalAllowances = ((editingPayroll.overtime || 0) + (editingPayroll.bonus || 0)).toString();
      if (editFormData.allowances !== originalAllowances) {
        updateData.allowances = parseFloat(editFormData.allowances) || 0;
      }
      
      // Check if deductions have changed
      const originalDeductions = (editingPayroll.deductions || 0).toString();
      if (editFormData.deductions !== originalDeductions) {
        updateData.deductions = parseFloat(editFormData.deductions) || 0;
      }
      
      // Check if status has changed
      if (editFormData.status !== editingPayroll.status) {
        updateData.status = editFormData.status;
      }
      
      // If no fields have changed, just close the modal
      if (Object.keys(updateData).length === 0) {
        setShowEditForm(false);
        setEditingPayroll(null);
        setFormLoading(false);
        return;
      }

      const response = await fetch(`/api/payroll/${editingPayroll.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = typeof errorData.error === 'string' 
          ? errorData.error 
          : 'Failed to update payroll';
        throw new Error(errorMessage);
      }

      // Reset edit form and close modal
      setEditFormData({
        userId: '',
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        basicSalary: '',
        allowances: '',
        deductions: '',
        status: 'PENDING'
      });
      setShowEditForm(false);
      setEditingPayroll(null);
      
      // Refresh payroll data
      await fetchPayrollData();
    } catch (error: any) {
      console.error('Error updating payroll:', error);
      setFormError(error.message || 'Failed to update payroll');
    } finally {
      setFormLoading(false);
    }
  };

  // Handle edit button click
  const handleEditClick = (payroll: PayrollRecord) => {
    setEditingPayroll(payroll);
    const payPeriodStart = new Date(payroll.payPeriodStart);
    setEditFormData({
      userId: payroll.userId,
      month: payPeriodStart.getMonth() + 1,
      year: payPeriodStart.getFullYear(),
      basicSalary: (payroll.baseSalary || 0).toString(),
      allowances: ((payroll.overtime || 0) + (payroll.bonus || 0)).toString(),
      deductions: (payroll.deductions || 0).toString(),
      status: payroll.status
    });
    setShowEditForm(true);
    setFormError(null);
  };

  // Handle delete button click
  const handleDeleteClick = (payroll: PayrollRecord) => {
    setDeletingPayroll(payroll);
    setShowDeleteModal(true);
  };

  // Handle download button click
  const handleDownloadClick = (payroll: PayrollRecord) => {
    // Create payroll slip content
    const payrollSlipContent = `
===========================================
           PAYROLL SLIP
===========================================

Employee Details:
-----------------
Name: ${payroll.user.name}
Employee ID: ${payroll.user.employeeProfile?.employeeId || 'N/A'}
Email: ${payroll.user.email}
Department: ${payroll.user.employeeProfile?.department.name || 'No Department'}

Payroll Details:
----------------
Month/Year: ${getMonthName(payroll.month - 1)} ${payroll.year}
Status: ${payroll.status}

Salary Breakdown:
-----------------
Basic Salary: ${formatCurrency(payroll.basicSalary)}
Allowances: ${formatCurrency(payroll.allowances)}
Total Earnings: ${formatCurrency(payroll.basicSalary + payroll.allowances)}

Deductions: ${formatCurrency(payroll.deductions)}

Net Salary: ${formatCurrency(payroll.netSalary)}

===========================================
Generated on: ${new Date().toLocaleString()}
===========================================
    `;

    // Create and download the file
    const blob = new Blob([payrollSlipContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `payroll_slip_${payroll.user.employeeProfile?.employeeId || 'employee'}_${getMonthName(payroll.month - 1)}_${payroll.year}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (!deletingPayroll) return;
    
    try {
      setDeleteLoading(true);
      
      const response = await fetch(`/api/payroll/${deletingPayroll.id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete payroll');
      }
      
      // Close modal and reset state
      setShowDeleteModal(false);
      setDeletingPayroll(null);
      
      // Refresh payroll list
      await fetchPayrollData();
    } catch (err) {
      console.error('Error deleting payroll:', err);
      setFormError(err instanceof Error ? err.message : 'Failed to delete payroll');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle edit form input changes
  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Initial load and auth check
  useEffect(() => {
    if (isLoaded && userId) {
      fetchPayrollData();
      fetchEmployees();
    } else if (isLoaded && !userId) {
      setError('Please sign in to view payroll data');
      setLoading(false);
    }
  }, [isLoaded, userId]);

  // Refetch when filters change
  useEffect(() => {
    if (isLoaded && userId) {
      const debounceTimer = setTimeout(() => {
        fetchPayrollData();
      }, 300);
      
      return () => clearTimeout(debounceTimer);
    }
  }, [searchTerm, selectedDepartment, selectedStatus, isLoaded, userId]);

  // Filter payroll data with safety check
  const filteredPayroll = Array.isArray(payrollData) ? payrollData.filter(record => {
    const matchesSearch = searchTerm === "" || 
      (record.user?.firstName && record.user.firstName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (record.user?.lastName && record.user.lastName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (record.employee?.employeeId && record.employee.employeeId.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesDepartment = selectedDepartment === "All" || 
      (record.employee?.department?.name && record.employee.department.name === selectedDepartment);
    
    const matchesStatus = selectedStatus === "All" || 
      record.status === selectedStatus;
    
    return matchesSearch && matchesDepartment && matchesStatus;
  }) : [];

  const totalPayroll = filteredPayroll.reduce((sum, record) => sum + record.netSalary, 0);
  const averagePayroll = filteredPayroll.length > 0 ? totalPayroll / filteredPayroll.length : 0;
  const pendingPayrolls = filteredPayroll.filter(record => record.status === 'PENDING').length;

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar sidebarCollapsed={sidebarCollapsed} onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} />
        <Sidebar isCollapsed={sidebarCollapsed} />
        
        <div className={`transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-64'} p-4 mt-16`}>
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-orange-500" />
                <p className="text-gray-600">Loading payroll data...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar sidebarCollapsed={sidebarCollapsed} onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} />
        <Sidebar isCollapsed={sidebarCollapsed} />
        
        <div className={`transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-64'} p-4 mt-16`}>
          <div className="max-w-7xl mx-auto">
            <Alert className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {error}
                <Button 
                  onClick={fetchPayrollData} 
                  variant="outline" 
                  size="sm" 
                  className="ml-4"
                >
                  Retry
                </Button>
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar sidebarCollapsed={sidebarCollapsed} onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} />
      <Sidebar isCollapsed={sidebarCollapsed} />
      
      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-64'} p-4 mt-16`}>
        <div className="max-w-7xl mx-auto">
          <main className="space-y-6">
          {/* Dashboard Header */}
          <div className="bg-white p-3 rounded-md shadow-sm border border-gray-100 mb-6 opacity-0 animate-fade-in" style={{ animationDelay: '0ms', animationFillMode: 'forwards' }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 bg-gradient-to-r from-orange-500 to-orange-600 rounded-md shadow-sm">
                  <DollarSign className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h1 className="text-base font-bold text-gray-900">Payroll Management</h1>
                  <p className="text-xs text-gray-600">Manage employee payroll and compensation</p>
                </div>
              </div>
              <Button 
                onClick={() => setShowAddForm(true)}
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-md hover:shadow-lg transition-all duration-200"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Payroll
              </Button>
            </div>
          </div>

          {/* Search and Filter Bar */}
          <div className="bg-white p-2 rounded-lg shadow-sm border border-gray-100 opacity-0 animate-fade-in" style={{ animationDelay: '50ms', animationFillMode: 'forwards' }}>
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-3 w-3" />
                  <input
                    type="text"
                    placeholder="Search employees..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-7 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 bg-gray-50 hover:bg-white"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-3 w-3 text-gray-500" />
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-gray-50 hover:bg-white transition-all duration-200"
                >
                  <option value="All">All Departments</option>
                  {departments.filter(d => d !== "All").map(department => (
                    <option key={department} value={department}>{department}</option>
                  ))}
                </select>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-gray-50 hover:bg-white transition-all duration-200"
                >
                  <option value="All">All Status</option>
                  {statuses.filter(s => s !== "All").map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 opacity-0 animate-fade-in" style={{ animationDelay: '100ms', animationFillMode: 'forwards' }}>
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-lg bg-gradient-to-r from-orange-50 to-orange-100">
                <DollarSign className="h-5 w-5 text-orange-600" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalPayroll)}</p>
              <p className="text-xs font-medium text-gray-600">Total Payroll</p>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 opacity-0 animate-fade-in" style={{ animationDelay: '200ms', animationFillMode: 'forwards' }}>
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-lg bg-gradient-to-r from-green-50 to-green-100">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-green-600">{formatCurrency(averagePayroll)}</p>
              <p className="text-xs font-medium text-gray-600">Average Salary</p>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 opacity-0 animate-fade-in" style={{ animationDelay: '300ms', animationFillMode: 'forwards' }}>
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-lg bg-gradient-to-r from-blue-50 to-blue-100">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-blue-600">{filteredPayroll.length}</p>
              <p className="text-xs font-medium text-gray-600">Total Employees</p>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 opacity-0 animate-fade-in" style={{ animationDelay: '400ms', animationFillMode: 'forwards' }}>
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-lg bg-gradient-to-r from-purple-50 to-purple-100">
                <Clock className="h-5 w-5 text-purple-600" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-purple-600">{pendingPayrolls}</p>
              <p className="text-xs font-medium text-gray-600">Pending Approvals</p>
            </div>
          </div>
        </div>

        {/* Payroll Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredPayroll.map((payroll, index) => (
            <div 
              key={payroll.id} 
              className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 opacity-0 animate-fade-in"
              style={{
                animationDelay: `${500 + (index * 50)}ms`,
                animationFillMode: 'forwards'
              }}
            >
              <div className="flex flex-col items-center text-center">
                <Avatar className="h-16 w-16 mb-3">
                  <AvatarFallback className="bg-orange-100 text-orange-600 font-semibold text-lg">
                    {getInitials(payroll.user.name)}
                  </AvatarFallback>
                </Avatar>
                
                <h3 className="font-semibold text-gray-900 text-sm mb-1">
                  {payroll.user.name}
                </h3>
                <p className="text-xs text-gray-600 mb-2 text-center">{payroll.user.employeeProfile?.department.name || 'No Department'}</p>
                
                <Badge
                  className={`text-xs mb-3 ${
                    payroll.status === "PAID" 
                      ? "bg-green-100 text-green-800 hover:bg-green-100" 
                      : payroll.status === "APPROVED"
                      ? "bg-blue-100 text-blue-800 hover:bg-blue-100"
                      : "bg-orange-100 text-orange-800 hover:bg-orange-100"
                  }`}
                >
                  {payroll.status}
                </Badge>
                
                <div className="space-y-1 text-xs text-gray-600 w-full">
                  <div className="flex items-center justify-center space-x-1">
                    <span>{formatCurrency(payroll.netSalary)}</span>
                  </div>
                  <div className="flex items-center justify-center space-x-1">
                    <Calendar className="h-3 w-3" />
                    <span className="truncate">
                      {getMonthName(payroll.month - 1)} {payroll.year}
                    </span>
                  </div>
                </div>
                
                <div className="mt-3 pt-3 border-t border-gray-100 w-full">
                  <div className="flex justify-center space-x-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="h-7 w-7 p-0 hover:bg-blue-50 hover:border-blue-200"
                      onClick={() => handleDownloadClick(payroll)}
                      title="Download Payroll Slip"
                    >
                      <Download className="h-3 w-3 text-blue-600" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="h-7 w-7 p-0 hover:bg-orange-50 hover:border-orange-200"
                      onClick={() => handleEditClick(payroll)}
                      title="Edit Payroll"
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="h-7 w-7 p-0 hover:bg-red-50 hover:border-red-200"
                      onClick={() => handleDeleteClick(payroll)}
                      title="Delete Payroll"
                    >
                      <Trash2 className="h-3 w-3 text-red-500" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredPayroll.length === 0 && !loading && (
          <div className="text-center py-12">
            <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No payroll records found</h3>
            <p className="text-gray-600 mb-4">Get started by creating your first payroll record.</p>
            <Button 
              onClick={() => setShowAddForm(true)}
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Payroll
            </Button>
          </div>
        )}
          </main>
        </div>
      </div>

      {/* Add Payroll Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Add New Payroll</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowAddForm(false);
                  setFormError(null);
                  setFormData({
                    userId: '',
                    month: new Date().getMonth() + 1,
                    year: new Date().getFullYear(),
                    basicSalary: '',
                    allowances: '',
                    deductions: '',
                    status: 'PENDING'
                  });
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {formError && (
                <Alert className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{formError}</AlertDescription>
                </Alert>
              )}
              
              <div>
                <Label htmlFor="userId">Employee</Label>
                <select
                  id="userId"
                  name="userId"
                  value={formData.userId}
                  onChange={handleInputChange}
                  required
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="">Select Employee</option>
                  {employees.map((employee) => (
                    <option key={employee.id} value={employee.id}>
                      {employee.user.firstName} {employee.user.lastName} - {employee.employeeId}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="month">Month</Label>
                  <select
                    id="month"
                    name="month"
                    value={formData.month}
                    onChange={(e) => setFormData({ ...formData, month: parseInt(e.target.value) })}
                    required
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    {Array.from({ length: 12 }, (_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {getMonthName(i)}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <Label htmlFor="year">Year</Label>
                  <input
                    type="number"
                    id="year"
                    name="year"
                    value={formData.year}
                    onChange={handleInputChange}
                    required
                    min="2020"
                    max="2030"
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="basicSalary">Basic Salary</Label>
                <input
                  type="number"
                  id="basicSalary"
                  name="basicSalary"
                  value={formData.basicSalary}
                  onChange={handleInputChange}
                  required
                  step="0.01"
                  min="0"
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              
              <div>
                <Label htmlFor="allowances">Allowances</Label>
                <input
                  type="number"
                  id="allowances"
                  name="allowances"
                  value={formData.allowances}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              
              <div>
                <Label htmlFor="deductions">Deductions</Label>
                <input
                  type="number"
                  id="deductions"
                  name="deductions"
                  value={formData.deductions}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              
              <div>
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  required
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  {payrollStatuses.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
              
              {/* Net Salary Preview */}
              {formData.basicSalary && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-sm font-medium text-gray-700 mb-1">Net Salary Preview</div>
                  <div className="text-lg font-bold text-green-600">
                    {formatCurrency(
                      (parseFloat(formData.basicSalary) || 0) + 
                      (parseFloat(formData.allowances) || 0) - 
                      (parseFloat(formData.deductions) || 0)
                    )}
                  </div>
                </div>
              )}
              
              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowAddForm(false);
                    setFormError(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={formLoading}
                  className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
                >
                  {formLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Create Payroll
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Payroll Modal */}
      {showEditForm && editingPayroll && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Edit Payroll</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowEditForm(false);
                  setEditingPayroll(null);
                  setFormError(null);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              {formError && (
                <Alert className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{formError}</AlertDescription>
                </Alert>
              )}
              
              <div>
                <Label htmlFor="edit-userId">Employee</Label>
                <select
                  id="edit-userId"
                  name="userId"
                  value={editFormData.userId}
                  onChange={handleEditInputChange}
                  required
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="">Select Employee</option>
                  {employees.map((employee) => (
                    <option key={employee.id} value={employee.id}>
                      {employee.user.firstName} {employee.user.lastName} - {employee.employeeId}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-month">Month</Label>
                  <select
                    id="edit-month"
                    name="month"
                    value={editFormData.month}
                    onChange={(e) => setEditFormData({ ...editFormData, month: parseInt(e.target.value) })}
                    required
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    {Array.from({ length: 12 }, (_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {getMonthName(i)}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <Label htmlFor="edit-year">Year</Label>
                  <input
                    type="number"
                    id="edit-year"
                    name="year"
                    value={editFormData.year}
                    onChange={handleEditInputChange}
                    required
                    min="2020"
                    max="2030"
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="edit-basicSalary">Basic Salary</Label>
                <input
                  type="number"
                  id="edit-basicSalary"
                  name="basicSalary"
                  value={editFormData.basicSalary}
                  onChange={handleEditInputChange}
                  required
                  step="0.01"
                  min="0"
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              
              <div>
                <Label htmlFor="edit-allowances">Allowances</Label>
                <input
                  type="number"
                  id="edit-allowances"
                  name="allowances"
                  value={editFormData.allowances}
                  onChange={handleEditInputChange}
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              
              <div>
                <Label htmlFor="edit-deductions">Deductions</Label>
                <input
                  type="number"
                  id="edit-deductions"
                  name="deductions"
                  value={editFormData.deductions}
                  onChange={handleEditInputChange}
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              
              <div>
                <Label htmlFor="edit-status">Status</Label>
                <select
                  id="edit-status"
                  name="status"
                  value={editFormData.status}
                  onChange={handleEditInputChange}
                  required
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  {payrollStatuses.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
              
              {/* Net Salary Preview */}
              {editFormData.basicSalary && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-sm font-medium text-gray-700 mb-1">Net Salary Preview</div>
                  <div className="text-lg font-bold text-green-600">
                    {formatCurrency(
                      (parseFloat(editFormData.basicSalary) || 0) + 
                      (parseFloat(editFormData.allowances) || 0) - 
                      (parseFloat(editFormData.deductions) || 0)
                    )}
                  </div>
                </div>
              )}
              
              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowEditForm(false);
                    setEditingPayroll(null);
                    setFormError(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={formLoading}
                  className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
                >
                  {formLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Update Payroll
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && deletingPayroll && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="p-2 rounded-full bg-red-100 mr-3">
                  <AlertCircle className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Delete Payroll Record</h3>
              </div>
              
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete the payroll record for{' '}
                <span className="font-semibold">
                  {deletingPayroll.user.firstName} {deletingPayroll.user.lastName}
                </span>? This action cannot be undone.
              </p>
              
              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeletingPayroll(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleDeleteConfirm}
                  disabled={deleteLoading}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  {deleteLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}