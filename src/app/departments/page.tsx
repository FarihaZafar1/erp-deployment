"use client";

import { useState, useEffect } from "react";
import {
  Building2,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Users,
  MapPin,
  Phone,
  Loader2,
  AlertCircle,
  X,
  Save,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import { getInitials } from "@/lib/utils";
import { useAuth } from "@clerk/nextjs";

interface Department {
  id: string;
  name: string;
  description: string;
  manager: string;
  managerEmail: string;
  employeeCount: number;
  location: string;
  budget: number;
  status: string;
  establishedDate: string;
}

interface DepartmentFormData {
  name: string;
  description: string;
  managerEmail: string;
  budget: string;
  location: string;
  status: string;
  establishedDate: string;
}

const locations = ["All", "Building A", "Building B"];
const statuses = ["All", "ACTIVE", "EXPANDING", "RESTRUCTURING"];
const departmentStatuses = ["ACTIVE", "EXPANDING", "RESTRUCTURING"];

export default function DepartmentsPage() {
  const { isLoaded, userId } = useAuth();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formData, setFormData] = useState<DepartmentFormData>({
    name: "",
    description: "",
    managerEmail: "",
    budget: "",
    location: "",
    status: "ACTIVE",
    establishedDate: ""
  });
  
  // Edit state variables
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [editFormData, setEditFormData] = useState<DepartmentFormData>({
    name: "",
    description: "",
    managerEmail: "",
    budget: "",
    location: "",
    status: "ACTIVE",
    establishedDate: ""
  });

  // Delete state variables
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingDepartment, setDeletingDepartment] = useState<Department | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Fetch departments from API
  const fetchDepartments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (selectedLocation !== 'All') params.append('location', selectedLocation);
      if (selectedStatus !== 'All') params.append('status', selectedStatus);
      
      const response = await fetch(`/api/departments?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch departments: ${response.statusText}`);
      }
      
      const data = await response.json();
      setDepartments(data);
    } catch (err) {
      console.error('Error fetching departments:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch departments');
    } finally {
      setLoading(false);
    }
  };

  // Handle form submission for creating new department
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError(null);

    try {
      // Prepare data with proper types
      const departmentData = {
        name: formData.name,
        description: formData.description,
        managerEmail: formData.managerEmail || undefined,
        budget: parseFloat(formData.budget) || 0,
        location: formData.location,
        status: formData.status,
        establishedDate: formData.establishedDate ? new Date(formData.establishedDate).toISOString() : undefined
      };

      const response = await fetch('/api/departments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(departmentData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create department');
      }

      // Reset form and close modal
      setFormData({
        name: "",
        description: "",
        managerEmail: "",
        budget: "",
        location: "",
        status: "ACTIVE",
        establishedDate: ""
      });
      setShowAddForm(false);
      
      // Refresh departments list
      await fetchDepartments();
    } catch (err) {
      console.error('Error creating department:', err);
      setFormError(err instanceof Error ? err.message : 'Failed to create department');
    } finally {
      setFormLoading(false);
    }
  };

  // Handle edit form submission
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDepartment) return;
    
    setFormLoading(true);
    setFormError(null);

    try {
      // Prepare data with proper types - fix budget conversion
      const departmentData = {
        name: editFormData.name,
        description: editFormData.description,
        managerEmail: editFormData.managerEmail || undefined,
        budget: parseFloat(editFormData.budget) || 0,
        location: editFormData.location,
        status: editFormData.status,
        establishedDate: editFormData.establishedDate ? new Date(editFormData.establishedDate).toISOString() : undefined
      };

      const response = await fetch(`/api/departments/${editingDepartment.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(departmentData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update department');
      }

      // Reset edit form and close modal
      setEditFormData({
        name: "",
        description: "",
        managerEmail: "",
        budget: "",
        location: "",
        status: "ACTIVE",
        establishedDate: ""
      });
      setShowEditForm(false);
      setEditingDepartment(null);
      
      // Refresh departments list
      await fetchDepartments();
    } catch (err) {
      console.error('Error updating department:', err);
      setFormError(err instanceof Error ? err.message : 'Failed to update department');
    } finally {
      setFormLoading(false);
    }
  };

  // Handle edit button click
  const handleEditClick = (department: Department) => {
    setEditingDepartment(department);
    setEditFormData({
      name: department.name || '',
      description: department.description || '',
      managerEmail: department.managerEmail || '',
      budget: department.budget ? department.budget.toString() : '0',
      location: department.location || '',
      status: department.status || 'ACTIVE',
      establishedDate: department.establishedDate || ''
    });
    setShowEditForm(true);
    setFormError(null);
  };

  // Handle delete button click
  const handleDeleteClick = (department: Department) => {
    setDeletingDepartment(department);
    setShowDeleteModal(true);
  };

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (!deletingDepartment) return;
    
    try {
      setDeleteLoading(true);
      
      const response = await fetch(`/api/departments/${deletingDepartment.id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete department');
      }
      
      // Close modal and reset state
      setShowDeleteModal(false);
      setDeletingDepartment(null);
      
      // Refresh departments list
      await fetchDepartments();
    } catch (err) {
      console.error('Error deleting department:', err);
      setFormError(err instanceof Error ? err.message : 'Failed to delete department');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle edit form input changes
  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Initial load and auth check
  useEffect(() => {
    if (isLoaded && userId) {
      fetchDepartments();
    } else if (isLoaded && !userId) {
      setError('Please sign in to view departments');
      setLoading(false);
    }
  }, [isLoaded, userId]);

  // Refetch when filters change
  useEffect(() => {
    if (isLoaded && userId) {
      const debounceTimer = setTimeout(() => {
        fetchDepartments();
      }, 300);
      
      return () => clearTimeout(debounceTimer);
    }
  }, [searchTerm, selectedLocation, selectedStatus, isLoaded, userId]);

  const totalEmployees = departments.reduce((sum, dept) => sum + dept.employeeCount, 0);
  const totalBudget = departments.reduce((sum, dept) => sum + dept.budget, 0);

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
                <p className="text-gray-600">Loading departments...</p>
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
                  onClick={fetchDepartments} 
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
                  <Building2 className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h1 className="text-base font-bold text-gray-900">Department Management</h1>
                  <p className="text-xs text-gray-600">Manage organizational departments and their operations</p>
                </div>
              </div>
              <Button 
                onClick={() => setShowAddForm(true)}
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-md hover:shadow-lg transition-all duration-200"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Department
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
                    placeholder="Search departments..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-7 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 bg-gray-50 hover:bg-white"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-3 w-3 text-gray-500" />
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-gray-50 hover:bg-white transition-all duration-200"
                >
                  <option value="All">All Locations</option>
                  {locations.filter(l => l !== "All").map(location => (
                    <option key={location} value={location}>{location}</option>
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
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 opacity-0 animate-fade-in" style={{ animationDelay: '400ms', animationFillMode: 'forwards' }}>
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-lg bg-gradient-to-r from-orange-50 to-orange-100">
                <Building2 className="h-5 w-5 text-orange-600" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-gray-900">{departments.length}</p>
              <p className="text-xs font-medium text-gray-600">Total Departments</p>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 opacity-0 animate-fade-in" style={{ animationDelay: '100ms', animationFillMode: 'forwards' }}>
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-lg bg-gradient-to-r from-green-50 to-green-100">
                <Users className="h-5 w-5 text-green-600" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-green-600">{totalEmployees}</p>
              <p className="text-xs font-medium text-gray-600">Total Employees</p>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 opacity-0 animate-fade-in" style={{ animationDelay: '200ms', animationFillMode: 'forwards' }}>
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-lg bg-gradient-to-r from-blue-50 to-blue-100">
                <Building2 className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-blue-600">{departments.filter(d => d.status === "ACTIVE").length}</p>
              <p className="text-xs font-medium text-gray-600">Active Departments</p>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 opacity-0 animate-fade-in" style={{ animationDelay: '300ms', animationFillMode: 'forwards' }}>
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-lg bg-gradient-to-r from-purple-50 to-purple-100">
                <Building2 className="h-5 w-5 text-purple-600" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-purple-600">${totalBudget.toLocaleString()}</p>
              <p className="text-xs font-medium text-gray-600">Total Budget</p>
            </div>
          </div>
        </div>

        {/* Department Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {departments.map((department, index) => (
            <div 
              key={department.id} 
              className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 opacity-0 animate-fade-in"
              style={{
                animationDelay: `${500 + (index * 50)}ms`,
                animationFillMode: 'forwards'
              }}
            >
              <div className="flex flex-col items-center text-center">
                <Avatar className="h-16 w-16 mb-3">
                  <AvatarFallback className="bg-orange-100 text-orange-600 font-semibold text-lg">
                    {getInitials(department.name)}
                  </AvatarFallback>
                </Avatar>
                
                <h3 className="font-semibold text-gray-900 text-sm mb-1">{department.name}</h3>
                <p className="text-xs text-gray-600 mb-2 text-center">{department.description}</p>
                
                <Badge
                  className={`text-xs mb-3 ${
                    department.status === "ACTIVE" 
                      ? "bg-green-100 text-green-800 hover:bg-green-100" 
                      : department.status === "EXPANDING"
                      ? "bg-blue-100 text-blue-800 hover:bg-blue-100"
                      : "bg-orange-100 text-orange-800 hover:bg-orange-100"
                  }`}
                >
                  {department.status}
                </Badge>
                
                <div className="space-y-1 text-xs text-gray-600 w-full">
                  <div className="flex items-center justify-center space-x-1">
                    <Users className="h-3 w-3" />
                    <span>{department.manager}</span>
                  </div>
                  <div className="flex items-center justify-center space-x-1">
                    <MapPin className="h-3 w-3" />
                    <span className="truncate">{department.location}</span>
                  </div>
                  <div className="flex items-center justify-center space-x-1">
                    <Building2 className="h-3 w-3" />
                    <span>{department.employeeCount} employees</span>
                  </div>
                </div>
                
                <div className="mt-3 pt-3 border-t border-gray-100 w-full">
                  <div className="flex justify-center space-x-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="h-7 w-7 p-0 hover:bg-orange-50 hover:border-orange-200"
                      onClick={() => handleEditClick(department)}
                      title="Edit Department"
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="h-7 w-7 p-0 hover:bg-red-50 hover:border-red-200"
                      onClick={() => handleDeleteClick(department)}
                      title="Delete Department"
                    >
                      <Trash2 className="h-3 w-3 text-red-500" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {departments.length === 0 && !loading && (
          <div className="text-center py-12">
            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No departments found</h3>
            <p className="text-gray-600 mb-4">Get started by creating your first department.</p>
            <Button 
              onClick={() => setShowAddForm(true)}
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Department
            </Button>
          </div>
        )}
          </main>
        </div>
      </div>

      {/* Add Department Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Add New Department</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowAddForm(false);
                  setFormError(null);
                  setFormData({
                    name: "",
                    description: "",
                    managerEmail: "",
                    budget: "",
                    location: "",
                    status: "ACTIVE",
                    establishedDate: ""
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
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Department Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Enter department name"
                />
              </div>
              
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Enter department description"
                />
              </div>
              
              <div>
                <label htmlFor="managerEmail" className="block text-sm font-medium text-gray-700 mb-1">
                  Manager Email
                </label>
                <input
                  type="email"
                  id="managerEmail"
                  name="managerEmail"
                  value={formData.managerEmail}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="manager@company.com"
                />
              </div>
              
              <div>
                <label htmlFor="budget" className="block text-sm font-medium text-gray-700 mb-1">
                  Budget
                </label>
                <input
                  type="number"
                  id="budget"
                  name="budget"
                  value={formData.budget}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="0.00"
                />
              </div>
              
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Floor 1, Building A"
                />
              </div>
              
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  {departmentStatuses.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="establishedDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Established Date
                </label>
                <input
                  type="date"
                  id="establishedDate"
                  name="establishedDate"
                  value={formData.establishedDate}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowAddForm(false);
                    setFormError(null);
                    setFormData({
                      name: "",
                      description: "",
                      managerEmail: "",
                      budget: "",
                      location: "",
                      status: "ACTIVE",
                      establishedDate: ""
                    });
                  }}
                  disabled={formLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={formLoading || !formData.name.trim()}
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
                      Create Department
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Department Modal */}
      {showEditForm && editingDepartment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Edit Department</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowEditForm(false);
                  setEditingDepartment(null);
                  setFormError(null);
                  setEditFormData({
                    name: "",
                    description: "",
                    managerEmail: "",
                    budget: "",
                    location: "",
                    status: "ACTIVE",
                    establishedDate: ""
                  });
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
                <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700 mb-1">
                  Department Name *
                </label>
                <input
                  type="text"
                  id="edit-name"
                  name="name"
                  value={editFormData.name}
                  onChange={handleEditInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Enter department name"
                />
              </div>
              
              <div>
                <label htmlFor="edit-description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  id="edit-description"
                  name="description"
                  value={editFormData.description}
                  onChange={handleEditInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Enter department description"
                />
              </div>
              
              <div>
                <label htmlFor="edit-managerEmail" className="block text-sm font-medium text-gray-700 mb-1">
                  Manager Email
                </label>
                <input
                  type="email"
                  id="edit-managerEmail"
                  name="managerEmail"
                  value={editFormData.managerEmail}
                  onChange={handleEditInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="manager@company.com"
                />
              </div>
              
              <div>
                <label htmlFor="edit-budget" className="block text-sm font-medium text-gray-700 mb-1">
                  Budget
                </label>
                <input
                  type="number"
                  id="edit-budget"
                  name="budget"
                  value={editFormData.budget}
                  onChange={handleEditInputChange}
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="0.00"
                />
              </div>
              
              <div>
                <label htmlFor="edit-location" className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  id="edit-location"
                  name="location"
                  value={editFormData.location}
                  onChange={handleEditInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Floor 1, Building A"
                />
              </div>
              
              <div>
                <label htmlFor="edit-status" className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  id="edit-status"
                  name="status"
                  value={editFormData.status}
                  onChange={handleEditInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  {departmentStatuses.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="edit-establishedDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Established Date
                </label>
                <input
                  type="date"
                  id="edit-establishedDate"
                  name="establishedDate"
                  value={editFormData.establishedDate}
                  onChange={handleEditInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowEditForm(false);
                    setEditingDepartment(null);
                    setFormError(null);
                    setEditFormData({
                      name: "",
                      description: "",
                      managerEmail: "",
                      budget: "",
                      location: "",
                      status: "ACTIVE",
                      establishedDate: ""
                    });
                  }}
                  disabled={formLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={formLoading || !editFormData.name.trim()}
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
                      Update Department
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      {showDeleteModal && deletingDepartment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Delete Department</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeletingDepartment(null);
                  setFormError(null);
                }}
                disabled={deleteLoading}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="p-6">
              {formError && (
                <Alert className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{formError}</AlertDescription>
                </Alert>
              )}
              
              <p className="text-gray-600 mb-4">
                Are you sure you want to delete the <strong>{deletingDepartment.name}</strong> department? 
                This action cannot be undone.
              </p>
              
              {deletingDepartment.employeeCount > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-4">
                  <div className="flex">
                    <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 mr-2" />
                    <div className="text-sm text-yellow-800">
                      <p className="font-medium">Warning</p>
                      <p>This department has {deletingDepartment.employeeCount} employee(s). Consider reassigning them before deletion.</p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeletingDepartment(null);
                    setFormError(null);
                  }}
                  disabled={deleteLoading}
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
                      Delete Department
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