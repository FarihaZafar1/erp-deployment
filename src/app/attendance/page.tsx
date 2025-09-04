"use client";

import { useState, useEffect } from "react";
import {
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Filter,
  Download,
  Eye,
  MapPin,
  Users,
  Building2,
  Calendar,
  Search,
  Plus,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import { formatDate, getInitials } from "@/lib/utils";

// Interface for attendance data
interface AttendanceRecord {
  id: number;
  employeeName: string;
  employeeId: string;
  department: string;
  date: string;
  checkIn: string;
  checkOut: string;
  workHours: string;
  status: string;
  location: string;
  overtime: string;
  notes?: string;
  _originalId?: string;
  _userId?: string;
  _originalDate?: Date;
}

// Interface for current user data
interface CurrentUser {
  id: string;
  name: string;
  email: string;
  role: string;
  employeeProfile?: {
    employeeId: string;
    department: {
      name: string;
    };
  };
}

// Interface for employee data
interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  employeeId: string;
  department: {
    name: string;
  };
  user: {
    id: string;
    name: string;
  };
}

const statusColors = {
  Present: "success",
  Late: "warning",
  Absent: "destructive",
  "Half Day": "secondary",
} as const;

const statusIcons = {
  Present: CheckCircle,
  Late: AlertTriangle,
  Absent: XCircle,
  "Half Day": Clock,
};

const locationColors = {
  Office: "default",
  Remote: "secondary",
  "--": "outline",
} as const;

export default function AttendancePage() {
  const [selectedDate, setSelectedDate] = useState("2024-03-15");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedDepartment, setSelectedDepartment] = useState("All");
  const [selectedLocation, setSelectedLocation] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);
  const statuses = ["All", "Present", "Late", "Absent", "Half Day"];
  const departments = ["All", "Engineering", "Marketing", "HR", "Finance", "Sales"];
  const locations = ["All", "Office", "Remote"];

  // Fetch current user data
  const fetchCurrentUser = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const userData = await response.json();
        setCurrentUser(userData);
      }
    } catch (err) {
      console.error('Error fetching current user:', err);
    }
  };

  // Fetch employees data
  const fetchEmployees = async () => {
    try {
      const response = await fetch('/api/employees');
      if (response.ok) {
        const data = await response.json();
        setEmployees(data.employees || []);
      }
    } catch (err) {
      console.error('Error fetching employees:', err);
    }
  };

  // Fetch attendance data from API
  const fetchAttendanceData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      if (selectedDate !== "All") params.append('date', selectedDate);
      if (selectedDepartment !== "All") params.append('department', selectedDepartment);
      if (selectedStatus !== "All") params.append('status', selectedStatus);
      if (selectedLocation !== "All") params.append('location', selectedLocation);
      
      const response = await fetch(`/api/attendance?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch attendance data');
      }
      
      const data = await response.json();
      setAttendanceData(data);
    } catch (err) {
      console.error('Error fetching attendance:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch attendance data');
    } finally {
      setLoading(false);
    }
  };

  // Mark attendance function
  const markAttendance = async (attendanceData: any) => {
    try {
      const response = await fetch('/api/attendance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(attendanceData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to mark attendance');
      }
      
      // Refresh data after successful submission
      await fetchAttendanceData();
      setShowAddForm(false);
      setSelectedEmployeeId("");
    } catch (err) {
      console.error('Error marking attendance:', err);
      setError(err instanceof Error ? err.message : 'Failed to mark attendance');
    }
  };

  // Export attendance data
  const exportAttendance = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedDate !== "All") params.append('date', selectedDate);
      if (selectedDepartment !== "All") params.append('department', selectedDepartment);
      
      const response = await fetch(`/api/attendance?${params.toString()}`);
      const data = await response.json();
      
      // Convert to CSV
      const csvContent = [
        ['Employee Name', 'Employee ID', 'Department', 'Date', 'Check In', 'Check Out', 'Work Hours', 'Status', 'Location', 'Overtime'].join(','),
        ...data.map((record: AttendanceRecord) => [
          record.employeeName,
          record.employeeId,
          record.department,
          record.date,
          record.checkIn,
          record.checkOut,
          record.workHours,
          record.status,
          record.location,
          record.overtime
        ].join(','))
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `attendance-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error exporting attendance:', err);
      setError('Failed to export attendance data');
    }
  };

  // Fetch data on component mount and when filters change
  useEffect(() => {
    fetchCurrentUser();
    fetchEmployees();
  }, []);

  useEffect(() => {
    fetchAttendanceData();
  }, [selectedDate, selectedDepartment, selectedStatus, selectedLocation]);

  const filteredAttendance = attendanceData.filter((record) => {
    const matchesSearch = record.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.department.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Clock className="h-12 w-12 text-orange-500 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Loading attendance data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={fetchAttendanceData} className="bg-orange-500 hover:bg-orange-600">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar sidebarCollapsed={sidebarCollapsed} onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} />
      <Sidebar isCollapsed={sidebarCollapsed} />
      
      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-64'} p-2 mt-16`}>
        <div className="max-w-7xl mx-auto">
          <main className="space-y-3">
            {/* Dashboard Header */}
            <div className="bg-white p-3 rounded-lg border border-gray-200 mb-3 opacity-0 animate-fade-in" style={{ animationDelay: '0ms', animationFillMode: 'forwards' }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 bg-orange-500 rounded-lg">
                    <Clock className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h1 className="text-lg font-bold text-gray-900">Attendance Management</h1>
                    <p className="text-xs text-gray-600">Track employee attendance & work hours efficiently</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button 
                    onClick={() => setShowAddForm(true)}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium shadow-md hover:shadow-lg transition-all duration-200"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Mark Attendance
                  </Button>
                </div>
              </div>
            </div>

            {/* Search and Filter Bar */}
            <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 opacity-0 animate-fade-in" style={{ animationDelay: '50ms', animationFillMode: 'forwards' }}>
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1 max-w-md">
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-3 w-3" />
                    <input
                      type="text"
                      placeholder="Search attendance records..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-7 pr-3 py-1.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 bg-gray-50 hover:bg-white text-sm"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="h-3 w-3 text-gray-500" />
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="px-2 py-1.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-gray-50 hover:bg-white transition-all duration-200 text-sm"
                  >
                    {statuses.map(status => (
                      <option key={status} value={status}>{status === "All" ? "All Status" : status}</option>
                    ))}
                  </select>
                  <select
                    value={selectedDepartment}
                    onChange={(e) => setSelectedDepartment(e.target.value)}
                    className="px-2 py-1.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-gray-50 hover:bg-white transition-all duration-200 text-sm"
                  >
                    {departments.map(dept => (
                      <option key={dept} value={dept}>{dept === "All" ? "All Departments" : dept}</option>
                    ))}
                  </select>
                  <select
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="px-2 py-1.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-gray-50 hover:bg-white transition-all duration-200 text-sm"
                  >
                    {locations.map(location => (
                      <option key={location} value={location}>{location === "All" ? "All Locations" : location}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="bg-white rounded-lg border border-gray-200 p-3 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 opacity-0 animate-fade-in" style={{ animationDelay: '100ms', animationFillMode: 'forwards' }}>
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 rounded-lg bg-orange-50">
                    <CheckCircle className="h-4 w-4 text-orange-600" />
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-bold text-gray-900">{attendanceData.filter(emp => emp.status === "Present").length}</p>
                  <p className="text-xs font-medium text-gray-600">Present Today</p>
                </div>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-3 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 opacity-0 animate-fade-in" style={{ animationDelay: '200ms', animationFillMode: 'forwards' }}>
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 rounded-lg bg-orange-50">
                    <AlertTriangle className="h-4 w-4 text-orange-600" />
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-bold text-gray-900">{attendanceData.filter(emp => emp.status === "Late").length}</p>
                  <p className="text-xs font-medium text-gray-600">Late Today</p>
                </div>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-3 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 opacity-0 animate-fade-in" style={{ animationDelay: '300ms', animationFillMode: 'forwards' }}>
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 rounded-lg bg-orange-50">
                    <XCircle className="h-4 w-4 text-orange-600" />
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-bold text-gray-900">{attendanceData.filter(emp => emp.status === "Absent").length}</p>
                  <p className="text-xs font-medium text-gray-600">Absent Today</p>
                </div>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-3 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 opacity-0 animate-fade-in" style={{ animationDelay: '400ms', animationFillMode: 'forwards' }}>
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 rounded-lg bg-orange-50">
                    <Users className="h-4 w-4 text-orange-600" />
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-bold text-gray-900">{attendanceData.length}</p>
                  <p className="text-xs font-medium text-gray-600">Total Records</p>
                </div>
              </div>
            </div>

            {/* Department Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              <div className="bg-white rounded-lg border border-gray-200 p-3 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 opacity-0 animate-fade-in" style={{ animationDelay: '500ms', animationFillMode: 'forwards' }}>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">Department Summary</h3>
                    <p className="text-xs text-gray-500 mt-0.5">Attendance by department</p>
                  </div>
                  <div className="p-1.5 bg-orange-50 rounded-lg">
                    <Building2 className="h-4 w-4 text-orange-600" />
                  </div>
                </div>
                <div className="space-y-2">
                  {departments.filter(dept => dept !== "All").map((dept, index) => {
                    const deptData = attendanceData.filter(emp => emp.department === dept);
                    const presentCount = deptData.filter(emp => emp.status === "Present").length;
                    const percentage = deptData.length > 0 ? Math.round((presentCount / deptData.length) * 100) : 0;
                    
                    if (deptData.length === 0) return null;
                    
                    return (
                      <div key={dept} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 bg-orange-500 rounded-lg flex items-center justify-center text-white font-bold text-xs">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 text-xs">{dept}</p>
                            <p className="text-xs text-gray-600">{presentCount}/{deptData.length} present</p>
                          </div>
                        </div>
                        <Badge className={`text-xs px-1.5 py-0.5 ${
                          percentage >= 80 ? "bg-orange-100 text-orange-700" : 
                          percentage >= 60 ? "bg-gray-100 text-gray-700" : 
                          "bg-red-100 text-red-700"
                        }`}>
                          {percentage}%
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Location Summary */}
              <div className="bg-white rounded-lg border border-gray-200 p-3 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 opacity-0 animate-fade-in" style={{ animationDelay: '600ms', animationFillMode: 'forwards' }}>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">Location Summary</h3>
                    <p className="text-xs text-gray-500 mt-0.5">Work location distribution</p>
                  </div>
                  <div className="p-1.5 bg-orange-50 rounded-lg">
                    <MapPin className="h-4 w-4 text-orange-600" />
                  </div>
                </div>
                <div className="space-y-2">
                  {["Office", "Remote"].map((location, index) => {
                    const locationData = attendanceData.filter(emp => emp.location === location);
                    const count = locationData.length;
                    const percentage = attendanceData.length > 0 ? Math.round((count / attendanceData.length) * 100) : 0;
                    
                    return (
                      <div key={location} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 bg-orange-500 rounded-lg flex items-center justify-center text-white font-bold text-xs">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 text-xs">{location}</p>
                            <p className="text-xs text-gray-600">{count} employees</p>
                          </div>
                        </div>
                        <Badge className="text-xs px-1.5 py-0.5 bg-orange-100 text-orange-700">
                          {percentage}%
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Attendance Records */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {filteredAttendance.map((record, index) => {
                const StatusIcon = statusIcons[record.status as keyof typeof statusIcons];
                return (
                  <div
                    key={record.id}
                    className="bg-white rounded-lg border border-gray-200 p-3 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 opacity-0 animate-fade-in"
                    style={{
                      animationDelay: `${(index + 7) * 50}ms`,
                      animationFillMode: 'forwards'
                    }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-orange-50 text-orange-700 font-semibold text-xs">
                            {getInitials(record.employeeName)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold text-gray-900 text-sm">{record.employeeName}</h3>
                          <p className="text-xs text-gray-500">{record.employeeId} • {record.department}</p>
                        </div>
                      </div>
                      <Badge 
                        className={`text-xs ${
                          record.status === "Present" 
                            ? "bg-orange-100 text-orange-800 hover:bg-orange-100" 
                            : record.status === "Late"
                            ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                            : record.status === "Absent"
                            ? "bg-red-100 text-red-800 hover:bg-red-100"
                            : "bg-gray-100 text-gray-800 hover:bg-gray-100"
                        }`}
                      >
                        <StatusIcon className="h-2 w-2 mr-1" />
                        {record.status}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">Check In:</span>
                        <span className="text-xs font-medium text-gray-900">{record.checkIn}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">Check Out:</span>
                        <span className="text-xs font-medium text-gray-900">{record.checkOut}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">Work Hours:</span>
                        <span className="text-sm font-bold text-orange-600">{record.workHours}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">Location:</span>
                        <Badge className="text-xs bg-orange-100 text-orange-700">
                          <MapPin className="h-2 w-2 mr-1" />
                          {record.location}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">Overtime:</span>
                        <span className="text-xs font-medium text-gray-900">{record.overtime}</span>
                      </div>
                    </div>
                    
                    <div className="mt-3 pt-2 border-t border-gray-100 flex justify-between items-center">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-xs hover:bg-orange-50 hover:border-orange-200 px-2 py-1"
                        onClick={() => {
                          setSelectedRecord(record);
                          setShowViewModal(true);
                        }}
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-xs hover:bg-orange-50 hover:border-orange-200 px-2 py-1"
                        onClick={() => {
                          // Export individual record with improved format
                          const attendanceSlipContent = `
===========================================
           ATTENDANCE SLIP
===========================================

Employee Details:
-----------------
Name: ${record.employeeName}
Employee ID: ${record.employeeId}
Department: ${record.department}

Attendance Details:
-------------------
Date: ${record.date}
Status: ${record.status}
Location: ${record.location}

Time Details:
-------------
Check In: ${record.checkIn}
Check Out: ${record.checkOut}
Work Hours: ${record.workHours}
Overtime: ${record.overtime}

${record.notes ? `Notes:\n-------\n${record.notes}\n\n` : ''}
===========================================
Generated on: ${new Date().toLocaleString()}
===========================================
                          `;
                          
                          const blob = new Blob([attendanceSlipContent], { type: 'text/plain' });
                          const url = window.URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `attendance_slip_${record.employeeId}_${record.date}.txt`;
                          a.click();
                          window.URL.revokeObjectURL(url);
                        }}
                      >
                        <Download className="h-3 w-3 mr-1" />
                        Export
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* No records found */}
            {filteredAttendance.length === 0 && !loading && (
              <div className="text-center py-12">
                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No attendance records found</h3>
                <p className="text-gray-600 mb-4">No records match your current filters.</p>
                <Button 
                  onClick={() => {
                    setSelectedStatus("All");
                    setSelectedDepartment("All");
                    setSelectedLocation("All");
                    setSearchTerm("");
                  }}
                  className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Add Attendance Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] flex flex-col">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold">Mark Attendance</h2>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                
                const selectedEmployee = employees.find(emp => emp.id === selectedEmployeeId);
                
                const attendanceData = {
                  userId: selectedEmployeeId || currentUser?.id,
                  employeeName: selectedEmployee ? `${selectedEmployee.firstName} ${selectedEmployee.lastName}` : currentUser?.name,
                  employeeId: selectedEmployee?.employeeId || currentUser?.employeeProfile?.employeeId,
                  department: selectedEmployee?.department?.name || currentUser?.employeeProfile?.department?.name,
                  date: formData.get('date') || new Date().toISOString().split('T')[0],
                  checkIn: formData.get('checkIn'),
                  checkOut: formData.get('checkOut'),
                  status: formData.get('status'),
                  location: formData.get('location') || 'Office',
                  notes: formData.get('notes'),
                };
                
                markAttendance(attendanceData);
              }} id="attendance-form">
                <div className="space-y-4">
                  {/* Employee Selection */}
                  {currentUser?.role === 'ADMIN' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Employee *</label>
                      <select
                        value={selectedEmployeeId}
                        onChange={(e) => setSelectedEmployeeId(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        required
                      >
                        <option value="">Select Employee</option>
                        {employees.map((employee) => (
                          <option key={employee.id} value={employee.id}>
                            {employee.firstName} {employee.lastName} - {employee.department.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  
                  {/* Show current user info for non-admin users */}
                  {currentUser?.role !== 'ADMIN' && currentUser && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm font-medium text-gray-700">Employee: {currentUser.name}</p>
                      <p className="text-sm text-gray-600">Department: {currentUser.employeeProfile?.department?.name || 'N/A'}</p>
                      <p className="text-sm text-gray-600">Employee ID: {currentUser.employeeProfile?.employeeId || 'N/A'}</p>
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                    <input
                      type="date"
                      name="date"
                      defaultValue={new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Check In Time</label>
                    <input
                      type="time"
                      name="checkIn"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Check Out Time</label>
                    <input
                      type="time"
                      name="checkOut"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
                    <select
                      name="status"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      required
                    >
                      <option value="PRESENT">Present</option>
                      <option value="LATE">Late</option>
                      <option value="ABSENT">Absent</option>
                      <option value="HALF_DAY">Half Day</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                    <select
                      name="location"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    >
                      <option value="Office">Office</option>
                      <option value="Remote">Remote</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
                    <textarea
                      name="notes"
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="Add any notes about the attendance..."
                    />
                  </div>
                </div>
              </form>
            </div>
            <div className="p-6 border-t bg-gray-50">
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                  onClick={() => {
                    setShowAddForm(false);
                    setSelectedEmployeeId("");
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="attendance-form"
                  className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                >
                  Mark Attendance
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Record Modal */}
      {showViewModal && selectedRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold">Attendance Details</h2>
            </div>
            <div className="p-6 space-y-4">
              <div><strong>Employee:</strong> {selectedRecord.employeeName}</div>
              <div><strong>ID:</strong> {selectedRecord.employeeId}</div>
              <div><strong>Department:</strong> {selectedRecord.department}</div>
              <div><strong>Date:</strong> {selectedRecord.date}</div>
              <div><strong>Check In:</strong> {selectedRecord.checkIn}</div>
              <div><strong>Check Out:</strong> {selectedRecord.checkOut}</div>
              <div><strong>Work Hours:</strong> {selectedRecord.workHours}</div>
              <div><strong>Status:</strong> {selectedRecord.status}</div>
              <div><strong>Location:</strong> {selectedRecord.location}</div>
              <div><strong>Overtime:</strong> {selectedRecord.overtime}</div>
              {selectedRecord.notes && <div><strong>Notes:</strong> {selectedRecord.notes}</div>}
            </div>
            <div className="p-6 border-t flex justify-end">
              <Button onClick={() => setShowViewModal(false)}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}