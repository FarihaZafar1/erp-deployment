"use client";

import { useState } from "react";
import {
  BarChart3,
  PieChart,
  TrendingUp,
  Users,
  DollarSign,
  Clock,
  Download,
  Filter,
  Calendar,
  FileText,
  Eye,
  Share,
  Search,
  Plus,
  MoreHorizontal,
  Edit,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import { getInitials, formatDate } from "@/lib/utils";

const reports = [
  {
    id: 1,
    name: "Monthly Financial Summary",
    type: "Financial",
    generatedBy: "System",
    generatedAt: "2024-03-15",
    size: "2.4 MB",
    status: "Completed",
    downloads: 23,
    description: "Complete financial overview for March",
    category: "Finance",
  },
  {
    id: 2,
    name: "Employee Attendance Report",
    type: "HR",
    generatedBy: "Sarah Johnson",
    generatedAt: "2024-03-15",
    size: "1.8 MB",
    status: "Completed",
    downloads: 15,
    description: "Monthly attendance tracking",
    category: "Human Resources",
  },
  {
    id: 3,
    name: "Quarterly Performance Analysis",
    type: "Operational",
    generatedBy: "Mike Chen",
    generatedAt: "2024-03-14",
    size: "3.2 MB",
    status: "Completed",
    downloads: 8,
    description: "Q1 performance metrics",
    category: "Operations",
  },
  {
    id: 4,
    name: "Payroll Breakdown",
    type: "HR",
    generatedBy: "System",
    generatedAt: "2024-03-14",
    size: "1.5 MB",
    status: "Processing",
    downloads: 0,
    description: "Detailed payroll analysis",
    category: "Human Resources",
  },
  {
    id: 5,
    name: "Budget Variance Report",
    type: "Financial",
    generatedBy: "Emily Davis",
    generatedAt: "2024-03-13",
    size: "2.1 MB",
    status: "Completed",
    downloads: 31,
    description: "Budget vs actual comparison",
    category: "Finance",
  },
  {
    id: 6,
    name: "Sales Performance Report",
    type: "Operational",
    generatedBy: "David Brown",
    generatedAt: "2024-03-12",
    size: "1.9 MB",
    status: "Completed",
    downloads: 12,
    description: "Monthly sales analysis",
    category: "Sales",
  },
  {
    id: 7,
    name: "Inventory Analysis",
    type: "Operational",
    generatedBy: "Lisa Wang",
    generatedAt: "2024-03-11",
    size: "2.7 MB",
    status: "Completed",
    downloads: 18,
    description: "Stock levels and trends",
    category: "Operations",
  },
  {
    id: 8,
    name: "Training Effectiveness Report",
    type: "HR",
    generatedBy: "John Smith",
    generatedAt: "2024-03-10",
    size: "1.3 MB",
    status: "Completed",
    downloads: 7,
    description: "Employee training outcomes",
    category: "Human Resources",
  },
];

const categories = ["All", "HR", "Financial", "Operational"];
const statuses = ["All", "Completed", "Processing", "Failed"];

export default function ReportsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const filteredReports = reports.filter((report) => {
    const matchesSearch = report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.generatedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || report.type === selectedCategory;
    const matchesStatus = selectedStatus === "All" || report.status === selectedStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-800 hover:bg-green-100";
      case "Processing":
        return "bg-orange-100 text-orange-800 hover:bg-orange-100";
      case "Failed":
        return "bg-red-100 text-red-800 hover:bg-red-100";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "HR":
        return Users;
      case "Financial":
        return DollarSign;
      case "Operational":
        return BarChart3;
      default:
        return FileText;
    }
  };

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
                  <FileText className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h1 className="text-base font-bold text-gray-900">Reports & Analytics</h1>
                  <p className="text-xs text-gray-600">Generate insights and track performance across all modules</p>
                </div>
              </div>
              <Button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-md hover:shadow-lg transition-all duration-200">
                <Plus className="h-4 w-4 mr-2" />
                Create Report
              </Button>
            </div>
          </div>

          {/* Search and Filter Bar - Made Smaller */}
          <div className="bg-white p-2 rounded-lg shadow-sm border border-gray-100 opacity-0 animate-fade-in" style={{ animationDelay: '50ms', animationFillMode: 'forwards' }}>
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-3 w-3" />
                  <input
                    type="text"
                    placeholder="Search reports..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-7 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 bg-gray-50 hover:bg-white"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-3 w-3 text-gray-500" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-gray-50 hover:bg-white transition-all duration-200"
                >
                  <option value="All">All Types</option>
                  {categories.filter((t: string) => t !== "All").map((type: string) => (
                    <option key={type} value={type}>{type}</option>
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
                <FileText className="h-5 w-5 text-orange-600" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-gray-900">{reports.length}</p>
              <p className="text-xs font-medium text-gray-600">Total Reports</p>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 opacity-0 animate-fade-in" style={{ animationDelay: '200ms', animationFillMode: 'forwards' }}>
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-lg bg-gradient-to-r from-green-50 to-green-100">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-green-600">{reports.filter(r => r.status === "Completed").length}</p>
              <p className="text-xs font-medium text-gray-600">Completed</p>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 opacity-0 animate-fade-in" style={{ animationDelay: '300ms', animationFillMode: 'forwards' }}>
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-lg bg-gradient-to-r from-blue-50 to-blue-100">
                <BarChart3 className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-blue-600">{new Set(reports.map(r => r.type)).size}</p>
              <p className="text-xs font-medium text-gray-600">Categories</p>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 opacity-0 animate-fade-in" style={{ animationDelay: '400ms', animationFillMode: 'forwards' }}>
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-lg bg-gradient-to-r from-purple-50 to-purple-100">
                <Download className="h-5 w-5 text-purple-600" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-purple-600">{reports.reduce((sum, r) => sum + r.downloads, 0)}</p>
              <p className="text-xs font-medium text-gray-600">Total Downloads</p>
            </div>
          </div>
        </div>

        {/* Report Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredReports.map((report, index) => {
            const TypeIcon = getTypeIcon(report.type);
            return (
              <div 
                key={report.id} 
                className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 opacity-0 animate-fade-in"
                style={{
                  animationDelay: `${500 + (index * 50)}ms`,
                  animationFillMode: 'forwards'
                }}
              >
                <div className="flex flex-col items-center text-center">
                  <div className="h-16 w-16 mb-3 bg-orange-100 rounded-full flex items-center justify-center">
                    <TypeIcon className="h-8 w-8 text-orange-600" />
                  </div>
                  
                  <h3 className="font-semibold text-gray-900 text-sm mb-1">{report.name}</h3>
                  <p className="text-xs text-gray-600 mb-2">{report.description}</p>
                  
                  <Badge
                    className={`text-xs mb-3 ${getStatusColor(report.status)}`}
                  >
                    {report.status}
                  </Badge>
                  
                  <div className="space-y-1 text-xs text-gray-600 w-full">
                    <div className="flex items-center justify-center space-x-1">
                      <Users className="h-3 w-3" />
                      <span className="truncate">{report.generatedBy}</span>
                    </div>
                    <div className="flex items-center justify-center space-x-1">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDate(report.generatedAt)}</span>
                    </div>
                    <div className="flex items-center justify-center space-x-1">
                      <FileText className="h-3 w-3" />
                      <span>{report.size}</span>
                    </div>
                    <div className="flex items-center justify-center space-x-1">
                      <Download className="h-3 w-3" />
                      <span>{report.downloads} downloads</span>
                    </div>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-gray-100 w-full">
                    <div className="flex justify-center space-x-2">
                      <Button size="sm" variant="outline" className="h-7 w-7 p-0">
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="outline" className="h-7 w-7 p-0">
                        <Download className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="outline" className="h-7 w-7 p-0">
                        <Share className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
          </main>
        </div>
      </div>
    </div>
  );
}