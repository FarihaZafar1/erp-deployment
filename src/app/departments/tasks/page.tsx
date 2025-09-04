"use client";

import { useState, useEffect } from "react";
import {
  CheckSquare,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  Calendar,
  Clock,
  AlertCircle,
  X,
  User,
  Building2,
  Users,
  Loader2,
  Save,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import { getInitials } from "@/lib/utils";
import { useAuth } from "@clerk/nextjs";

interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  assignedTo?: string;
  departmentId: string;
  dueDate?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
  department: {
    id: string;
    name: string;
  };
}

interface Department {
  id: string;
  name: string;
}

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  position: string;
  departmentId: string;
}

interface TaskFormData {
  title: string;
  description: string;
  status: string;
  priority: string;
  assignedTo: string;
  departmentId: string;
  dueDate: string;
}

const statusOptions = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' }
];

const priorityOptions = [
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
  { value: 'URGENT', label: 'Urgent' }
];

const priorities = ["All", "LOW", "MEDIUM", "HIGH", "URGENT"];
const statuses = ["All", "PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"];
const taskStatuses = ["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"];

export default function TaskManagementPage() {
  console.log('🚀 TaskManagementPage component mounted/re-rendered');
  
  const { isLoaded, userId } = useAuth();
  console.log('🔐 Current auth state:', { isLoaded, userId });
  const [tasks, setTasks] = useState<Task[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPriority, setSelectedPriority] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formData, setFormData] = useState<TaskFormData>({
    title: "",
    description: "",
    status: "PENDING",
    priority: "MEDIUM",
    assignedTo: "",
    departmentId: "",
    dueDate: ""
  });
  
  // Edit state variables
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editFormData, setEditFormData] = useState<TaskFormData>({
    title: "",
    description: "",
    status: "PENDING",
    priority: "MEDIUM",
    assignedTo: "",
    departmentId: "",
    dueDate: ""
  });

  // Delete state variables
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // View state variables
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Fetch tasks from API
  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔍 Fetching tasks...');
      const response = await fetch('/api/tasks');
      console.log('📡 Response status:', response.status);
      if (!response.ok) {
        throw new Error('Failed to fetch tasks');
      }
      const data = await response.json();
      console.log('📊 Tasks received:', data.length, data);
      setTasks(data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setError('Failed to load tasks. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch departments
  const fetchDepartments = async () => {
    try {
      const response = await fetch('/api/departments');
      if (response.ok) {
        const data = await response.json();
        setDepartments(data);
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  // Fetch employees
  const fetchEmployees = async () => {
    try {
      const response = await fetch('/api/employees');
      if (response.ok) {
        const data = await response.json();
        // Extract employees array from the response object
        const employeesArray = data.employees || [];
        setEmployees(Array.isArray(employeesArray) ? employeesArray : []);
      } else {
        console.error('Failed to fetch employees:', response.statusText);
        setEmployees([]);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
      setEmployees([]);
    }
  };

  // Create sample data function
  const createSampleData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/debug', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'create_sample_data' }),
      });

      if (!response.ok) {
        throw new Error('Failed to create sample data');
      }

      const result = await response.json();
      console.log('Sample data created:', result);
      
      // Refresh all data
      await fetchTasks();
      await fetchDepartments();
      await fetchEmployees();
    } catch (error) {
      console.error('Error creating sample data:', error);
      setError('Failed to create sample data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('🔄 useEffect triggered');
    console.log('📊 Auth state - isLoaded:', isLoaded, 'userId:', userId);
    
    if (isLoaded && userId) {
      console.log('✅ Auth conditions met, fetching data...');
      fetchTasks();
      fetchDepartments();
      fetchEmployees();
    } else {
      console.log('❌ Auth conditions not met');
      if (!isLoaded) console.log('  - Clerk not loaded yet');
      if (!userId) console.log('  - No user ID available');
    }
  }, [isLoaded, userId]);

  // Filter tasks based on search term, priority, and status
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (task.department?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = selectedPriority === "All" || task.priority === selectedPriority;
    const matchesStatus = selectedStatus === "All" || task.status === selectedStatus;
    
    return matchesSearch && matchesPriority && matchesStatus;
  });

  console.log('📋 Current tasks state:', tasks.length, tasks);
  console.log('🔍 Filtered tasks:', filteredTasks.length, filteredTasks);

  // Calculate stats
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.status === 'COMPLETED').length;
  const inProgressTasks = tasks.filter(task => task.status === 'IN_PROGRESS').length;
  const pendingTasks = tasks.filter(task => task.status === 'PENDING').length;

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError(null);

    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create task');
      }

      await fetchTasks();
      setShowAddForm(false);
      setFormData({
        title: "",
        description: "",
        status: "PENDING",
        priority: "MEDIUM",
        assignedTo: "",
        departmentId: "",
        dueDate: ""
      });
    } catch (error) {
      console.error('Error creating task:', error);
      setFormError(error instanceof Error ? error.message : 'Failed to create task');
    } finally {
      setFormLoading(false);
    }
  };

  // Handle view click
  const handleViewClick = (task: Task) => {
    setSelectedTask(task);
    setShowViewModal(true);
  };

  // Handle edit click
  const handleEditClick = (task: Task) => {
    setEditingTask(task);
    setEditFormData({
      title: task.title,
      description: task.description || "",
      status: task.status,
      priority: task.priority,
      assignedTo: task.assignedTo || "",
      departmentId: task.departmentId,
      dueDate: task.dueDate ? task.dueDate.split('T')[0] : ""
    });
    setShowEditForm(true);
  };

  // Handle edit form submission
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask) return;

    setFormLoading(true);
    setFormError(null);

    try {
      const response = await fetch(`/api/tasks/${editingTask.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editFormData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update task');
      }

      await fetchTasks();
      setShowEditForm(false);
      setEditingTask(null);
    } catch (error) {
      console.error('Error updating task:', error);
      setFormError(error instanceof Error ? error.message : 'Failed to update task');
    } finally {
      setFormLoading(false);
    }
  };

  // Handle delete click
  const handleDeleteClick = (task: Task) => {
    setDeletingTask(task);
    setShowDeleteModal(true);
  };

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (!deletingTask) return;

    setDeleteLoading(true);

    try {
      const response = await fetch(`/api/tasks/${deletingTask.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete task');
      }

      await fetchTasks();
      setShowDeleteModal(false);
      setDeletingTask(null);
    } catch (error) {
      console.error('Error deleting task:', error);
      setError('Failed to delete task. Please try again.');
    } finally {
      setDeleteLoading(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar sidebarCollapsed={sidebarCollapsed} onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} />
        <Sidebar isCollapsed={sidebarCollapsed} />
        
        <div className={`transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-64'} p-4 mt-16`}>
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && tasks.length === 0) {
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
                  onClick={fetchTasks} 
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
                  <CheckSquare className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h1 className="text-base font-bold text-gray-900">Task Management</h1>
                  <p className="text-xs text-gray-600">Manage organizational tasks and their operations</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {tasks.length === 0 && (
                  <Button 
                    onClick={createSampleData}
                    disabled={loading}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-md hover:shadow-lg transition-all duration-200"
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Plus className="h-4 w-4 mr-2" />
                    )}
                    Create Sample Data
                  </Button>
                )}
                <Button 
                  onClick={() => setShowAddForm(true)}
                  className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-md hover:shadow-lg transition-all duration-200"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Task
                </Button>
              </div>
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
                    placeholder="Search tasks..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-7 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 bg-gray-50 hover:bg-white"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-3 w-3 text-gray-500" />
                <select
                  value={selectedPriority}
                  onChange={(e) => setSelectedPriority(e.target.value)}
                  className="px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-gray-50 hover:bg-white transition-all duration-200"
                >
                  <option value="All">All Priority</option>
                  {priorities.filter(p => p !== "All").map(priority => (
                    <option key={priority} value={priority}>{priority}</option>
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
                <CheckSquare className="h-5 w-5 text-orange-600" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-gray-900">{totalTasks}</p>
              <p className="text-xs font-medium text-gray-600">Total Tasks</p>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 opacity-0 animate-fade-in" style={{ animationDelay: '100ms', animationFillMode: 'forwards' }}>
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-lg bg-gradient-to-r from-green-50 to-green-100">
                <CheckSquare className="h-5 w-5 text-green-600" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-green-600">{completedTasks}</p>
              <p className="text-xs font-medium text-gray-600">Completed</p>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 opacity-0 animate-fade-in" style={{ animationDelay: '200ms', animationFillMode: 'forwards' }}>
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-lg bg-gradient-to-r from-blue-50 to-blue-100">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-blue-600">{inProgressTasks}</p>
              <p className="text-xs font-medium text-gray-600">In Progress</p>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 opacity-0 animate-fade-in" style={{ animationDelay: '300ms', animationFillMode: 'forwards' }}>
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-lg bg-gradient-to-r from-purple-50 to-purple-100">
                <AlertCircle className="h-5 w-5 text-purple-600" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-purple-600">{pendingTasks}</p>
              <p className="text-xs font-medium text-gray-600">Pending</p>
            </div>
          </div>
        </div>

        {/* Task Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTasks.map((task, index) => {
            // Debug log to see task data
            console.log('Rendering task:', task);
            return (
            <div
              key={task.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200 opacity-0 animate-fade-in-up"
              style={{
                animationDelay: `${500 + (index * 50)}ms`,
                animationFillMode: 'forwards'
              }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${
                    task.priority === "URGENT" 
                      ? "bg-red-100 text-red-600" 
                      : task.priority === "HIGH"
                      ? "bg-orange-100 text-orange-600"
                      : task.priority === "MEDIUM"
                      ? "bg-blue-100 text-blue-600"
                      : "bg-gray-100 text-gray-600"
                  }`}>
                    <CheckSquare className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-base mb-1">{task.title}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2">{task.description || "No description provided"}</p>
                  </div>
                </div>
                <div className="flex space-x-1">
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="h-8 w-8 p-0 hover:bg-blue-50"
                    onClick={() => handleViewClick(task)}
                    title="View Task"
                  >
                    <Eye className="h-4 w-4 text-gray-500" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="h-8 w-8 p-0 hover:bg-orange-50"
                    onClick={() => handleEditClick(task)}
                    title="Edit Task"
                  >
                    <Edit className="h-4 w-4 text-gray-500" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="h-8 w-8 p-0 hover:bg-red-50"
                    onClick={() => handleDeleteClick(task)}
                    title="Delete Task"
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center justify-between mb-4">
                <div className="flex gap-2">
                  <Badge
                    className={`text-xs font-medium ${
                      task.status === "COMPLETED" 
                        ? "bg-green-100 text-green-700 hover:bg-green-100" 
                        : task.status === "IN_PROGRESS"
                        ? "bg-blue-100 text-blue-700 hover:bg-blue-100"
                        : task.status === "PENDING"
                        ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-100"
                        : "bg-red-100 text-red-700 hover:bg-red-100"
                    }`}
                  >
                    {task.status.replace('_', ' ')}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={`text-xs font-medium border ${
                      task.priority === "URGENT" 
                        ? "border-red-200 text-red-700 bg-red-50" 
                        : task.priority === "HIGH"
                        ? "border-orange-200 text-orange-700 bg-orange-50"
                        : task.priority === "MEDIUM"
                        ? "border-blue-200 text-blue-700 bg-blue-50"
                        : "border-gray-200 text-gray-700 bg-gray-50"
                    }`}
                  >
                    {task.priority} Priority
                  </Badge>
                </div>
              </div>
              
              <div className="space-y-2 mb-4">
                {task.assignedTo && (
                  <div className="flex items-center text-sm text-gray-600">
                    <User className="h-4 w-4 mr-2 text-gray-400" />
                    <span className="font-medium">Assigned to:</span>
                    <span className="ml-1">{task.assignedTo}</span>
                  </div>
                )}
                <div className="flex items-center text-sm text-gray-600">
                  <Building2 className="h-4 w-4 mr-2 text-gray-400" />
                  <span className="font-medium">Department:</span>
                  <span className="ml-1">{task.department?.name || 'No Department'}</span>
                </div>
                {task.dueDate && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                    <span className="font-medium">Due Date:</span>
                    <span className={`ml-1 ${
                      new Date(task.dueDate) < new Date() && task.status !== 'COMPLETED'
                        ? 'text-red-600 font-medium'
                        : ''
                    }`}>
                      {new Date(task.dueDate).toLocaleDateString()}
                    </span>
                    {new Date(task.dueDate) < new Date() && task.status !== 'COMPLETED' && (
                      <span className="ml-1 text-red-600 text-xs font-medium">(Overdue)</span>
                    )}
                  </div>
                )}
              </div>
              
              <div className="pt-3 border-t border-gray-100">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    <span>Created {new Date(task.createdAt).toLocaleDateString()}</span>
                  </div>
                  {task.completedAt && (
                    <div className="flex items-center text-green-600">
                      <CheckSquare className="h-3 w-3 mr-1" />
                      <span>Completed {new Date(task.completedAt).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            );
          })}
        </div>

        {filteredTasks.length === 0 && !loading && (
          <div className="text-center py-12">
            <CheckSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
            <p className="text-gray-600 mb-4">{tasks.length === 0 ? "Get started by creating your first task." : "No tasks match your current filters."}</p>
            <Button 
              onClick={() => setShowAddForm(true)}
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Task
            </Button>
          </div>
        )}
          </main>
        </div>
      </div>

      {/* Add Task Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Add New Task</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowAddForm(false);
                  setFormError(null);
                  setFormData({
                    title: "",
                    description: "",
                    status: "PENDING",
                    priority: "MEDIUM",
                    assignedTo: "",
                    departmentId: "",
                    dueDate: ""
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Task Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Enter task title"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Enter task description"
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status *
                  </label>
                  <select
                    required
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    {statusOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority *
                  </label>
                  <select
                    required
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    {priorityOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department *
                </label>
                <select
                  required
                  value={formData.departmentId}
                  onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="">Select Department</option>
                  {departments.map(dept => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assigned To
                </label>
                <select
                  value={formData.assignedTo}
                  onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="">Select Employee</option>
                  {Array.isArray(employees) && employees.map(emp => (
                    <option key={emp.id} value={`${emp.firstName} ${emp.lastName}`}>
                      {emp.firstName} {emp.lastName} - {emp.position}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
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
                      Create Task
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Task Modal */}
      {showEditForm && editingTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Edit Task</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowEditForm(false);
                  setEditingTask(null);
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Task Title *
                </label>
                <input
                  type="text"
                  required
                  value={editFormData.title}
                  onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Enter task title"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Enter task description"
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status *
                  </label>
                  <select
                    required
                    value={editFormData.status}
                    onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    {statusOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority *
                  </label>
                  <select
                    required
                    value={editFormData.priority}
                    onChange={(e) => setEditFormData({ ...editFormData, priority: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    {priorityOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department *
                </label>
                <select
                  required
                  value={editFormData.departmentId}
                  onChange={(e) => setEditFormData({ ...editFormData, departmentId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="">Select Department</option>
                  {departments.map(dept => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assigned To
                </label>
                <select
                  value={editFormData.assignedTo}
                  onChange={(e) => setEditFormData({ ...editFormData, assignedTo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="">Select Employee</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={`${emp.firstName} ${emp.lastName}`}>
                      {emp.firstName} {emp.lastName} - {emp.position}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  value={editFormData.dueDate}
                  onChange={(e) => setEditFormData({ ...editFormData, dueDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowEditForm(false);
                    setEditingTask(null);
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
                      Update Task
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Task Modal */}
      {showViewModal && selectedTask && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md mx-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Task Details</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowViewModal(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-3">
              <div>
                <strong className="text-gray-700">Title:</strong>
                <p className="text-gray-900">{selectedTask.title}</p>
              </div>
              <div>
                <strong className="text-gray-700">Description:</strong>
                <p className="text-gray-900">{selectedTask.description || "No description provided"}</p>
              </div>
              <div>
                <strong className="text-gray-700">Status:</strong>
                <Badge
                  className={`ml-2 text-xs font-medium ${
                    selectedTask.status === "COMPLETED" 
                      ? "bg-green-100 text-green-700 hover:bg-green-100" 
                      : selectedTask.status === "IN_PROGRESS"
                      ? "bg-blue-100 text-blue-700 hover:bg-blue-100"
                      : selectedTask.status === "PENDING"
                      ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-100"
                      : "bg-red-100 text-red-700 hover:bg-red-100"
                  }`}
                >
                  {selectedTask.status.replace('_', ' ')}
                </Badge>
              </div>
              <div>
                <strong className="text-gray-700">Priority:</strong>
                <Badge
                  variant="outline"
                  className={`ml-2 text-xs font-medium border ${
                    selectedTask.priority === "URGENT" 
                      ? "border-red-200 text-red-700 bg-red-50" 
                      : selectedTask.priority === "HIGH"
                      ? "border-orange-200 text-orange-700 bg-orange-50"
                      : selectedTask.priority === "MEDIUM"
                      ? "border-blue-200 text-blue-700 bg-blue-50"
                      : "border-gray-200 text-gray-700 bg-gray-50"
                  }`}
                >
                  {selectedTask.priority} Priority
                </Badge>
              </div>
              {selectedTask.assignedTo && (
                <div>
                  <strong className="text-gray-700">Assigned to:</strong>
                  <p className="text-gray-900">{selectedTask.assignedTo}</p>
                </div>
              )}
              <div>
                <strong className="text-gray-700">Department:</strong>
                <p className="text-gray-900">{selectedTask.department?.name || 'No Department'}</p>
              </div>
              {selectedTask.dueDate && (
                <div>
                  <strong className="text-gray-700">Due Date:</strong>
                  <p className={`text-gray-900 ${
                    new Date(selectedTask.dueDate) < new Date() && selectedTask.status !== 'COMPLETED'
                      ? 'text-red-600 font-medium'
                      : ''
                  }`}>
                    {new Date(selectedTask.dueDate).toLocaleDateString()}
                    {new Date(selectedTask.dueDate) < new Date() && selectedTask.status !== 'COMPLETED' && (
                      <span className="ml-1 text-red-600 text-xs font-medium">(Overdue)</span>
                    )}
                  </p>
                </div>
              )}
              <div>
                <strong className="text-gray-700">Created:</strong>
                <p className="text-gray-900">{new Date(selectedTask.createdAt).toLocaleDateString()}</p>
              </div>
              {selectedTask.completedAt && (
                <div>
                  <strong className="text-gray-700">Completed:</strong>
                  <p className="text-green-600">{new Date(selectedTask.completedAt).toLocaleDateString()}</p>
                </div>
              )}
            </div>
            <div className="mt-6 flex justify-end">
              <Button
                onClick={() => setShowViewModal(false)}
                className="bg-blue-500 text-white hover:bg-blue-600"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && deletingTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-red-100 rounded-full mr-3">
                  <AlertCircle className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Delete Task</h3>
              </div>
              
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete the task "{deletingTask.title}"? This action cannot be undone.
              </p>
              
              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeletingTask(null);
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