"use client";

import { useState } from "react";
import {
  Mail,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Send,
  Reply,
  Forward,
  Archive,
  Star,
  Paperclip,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import { getInitials } from "@/lib/utils";

const messages = [
  {
    id: 1,
    subject: "Q1 Budget Review Meeting",
    sender: "Sarah Johnson",
    senderEmail: "sarah.johnson@company.com",
    preview: "Hi team, I'd like to schedule a meeting to review our Q1 budget allocations...",
    timestamp: "2024-01-15T10:30:00Z",
    read: false,
    starred: true,
    priority: "high",
    category: "Finance",
    hasAttachment: true,
    avatar: "/placeholder-avatar.jpg",
  },
  {
    id: 2,
    subject: "New Employee Orientation Schedule",
    sender: "Mike Chen",
    senderEmail: "mike.chen@company.com",
    preview: "Please find attached the orientation schedule for our new hires starting next week...",
    timestamp: "2024-01-14T14:20:00Z",
    read: true,
    starred: false,
    priority: "medium",
    category: "HR",
    hasAttachment: true,
    avatar: "/placeholder-avatar.jpg",
  },
  {
    id: 3,
    subject: "System Maintenance Notification",
    sender: "IT Department",
    senderEmail: "it@company.com",
    preview: "Scheduled maintenance will occur this weekend. Please save your work and log out...",
    timestamp: "2024-01-13T09:15:00Z",
    read: false,
    starred: false,
    priority: "high",
    category: "IT",
    hasAttachment: false,
    avatar: "/placeholder-avatar.jpg",
  },
  {
    id: 4,
    subject: "Project Milestone Update",
    sender: "Emily Davis",
    senderEmail: "emily.davis@company.com",
    preview: "Great news! We've successfully completed the first milestone of the project...",
    timestamp: "2024-01-12T16:45:00Z",
    read: true,
    starred: true,
    priority: "medium",
    category: "Projects",
    hasAttachment: false,
    avatar: "/placeholder-avatar.jpg",
  },
  {
    id: 5,
    subject: "Monthly Performance Report",
    sender: "David Wilson",
    senderEmail: "david.wilson@company.com",
    preview: "Please review the attached monthly performance report for your team...",
    timestamp: "2024-01-11T11:30:00Z",
    read: false,
    starred: false,
    priority: "low",
    category: "Reports",
    hasAttachment: true,
    avatar: "/placeholder-avatar.jpg",
  },
];

const categories = ["All", "Finance", "HR", "IT", "Projects", "Reports"];
const priorities = ["All", "High", "Medium", "Low"];

export default function MessagesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedPriority, setSelectedPriority] = useState("All");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const getMessageIcon = (hasAttachment: boolean, starred: boolean) => {
    if (starred) {
      return <Star className="h-3 w-3 text-orange-500 fill-current" />;
    }
    if (hasAttachment) {
      return <Paperclip className="h-3 w-3 text-orange-500" />;
    }
    return <Mail className="h-3 w-3 text-orange-500" />;
  };

  const getPriorityColor = (priority: string) => {
    return "bg-white text-orange-600 border border-orange-200 hover:bg-orange-50";
  };

  const getCategoryColor = (category: string) => {
    return "bg-white text-orange-600 border border-orange-200 hover:bg-orange-50";
  };

  const filteredMessages = messages.filter((message) => {
    const matchesSearch = message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         message.sender.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         message.preview.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || message.category === selectedCategory;
    const matchesPriority = selectedPriority === "All" || message.priority.toLowerCase() === selectedPriority.toLowerCase();
    
    return matchesSearch && matchesCategory && matchesPriority;
  });

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const messageTime = new Date(timestamp);
    const diffInHours = Math.floor((now.getTime() - messageTime.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar sidebarCollapsed={sidebarCollapsed} onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} />
      <Sidebar isCollapsed={sidebarCollapsed} />
      
      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-64'} p-4 mt-16`}>
        <div className="max-w-7xl mx-auto">
          <main className="space-y-4">
          {/* Dashboard Header - Made Smaller */}
          <div className="bg-white p-2 rounded-md shadow-sm border border-gray-100 mb-4 opacity-0 animate-fade-in" style={{ animationDelay: '0ms', animationFillMode: 'forwards' }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-1 bg-gradient-to-r from-orange-500 to-orange-600 rounded-md shadow-sm">
                  <Mail className="h-3 w-3 text-white" />
                </div>
                <div>
                  <h1 className="text-sm font-bold text-gray-900">Messages</h1>
                  <p className="text-xs text-gray-600">Manage your communications</p>
                </div>
              </div>
              <Button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium shadow-md hover:shadow-lg transition-all duration-200">
                <Plus className="h-3 w-3 mr-1" />
                Compose
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
                    placeholder="Search messages..."
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
                  <option value="All">All Categories</option>
                  {categories.filter(c => c !== "All").map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                <select
                  value={selectedPriority}
                  onChange={(e) => setSelectedPriority(e.target.value)}
                  className="px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-gray-50 hover:bg-white transition-all duration-200"
                >
                  <option value="All">All Priorities</option>
                  {priorities.filter(p => p !== "All").map(priority => (
                    <option key={priority} value={priority}>{priority}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Stats Cards - Only White and Orange */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-3 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 opacity-0 animate-fade-in" style={{ animationDelay: '400ms', animationFillMode: 'forwards' }}>
            <div className="flex items-center justify-between mb-2">
              <div className="p-1.5 rounded-lg bg-orange-50">
                <Mail className="h-4 w-4 text-orange-600" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-xl font-bold text-gray-900">{messages.length}</p>
              <p className="text-xs font-medium text-gray-600">Total</p>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-3 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 opacity-0 animate-fade-in" style={{ animationDelay: '100ms', animationFillMode: 'forwards' }}>
            <div className="flex items-center justify-between mb-2">
              <div className="p-1.5 rounded-lg bg-orange-50">
                <Mail className="h-4 w-4 text-orange-600" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-xl font-bold text-orange-600">{messages.filter(m => !m.read).length}</p>
              <p className="text-xs font-medium text-gray-600">Unread</p>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-3 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 opacity-0 animate-fade-in" style={{ animationDelay: '200ms', animationFillMode: 'forwards' }}>
            <div className="flex items-center justify-between mb-2">
              <div className="p-1.5 rounded-lg bg-orange-50">
                <Star className="h-4 w-4 text-orange-600" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-xl font-bold text-orange-600">{messages.filter(m => m.starred).length}</p>
              <p className="text-xs font-medium text-gray-600">Starred</p>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-3 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 opacity-0 animate-fade-in" style={{ animationDelay: '300ms', animationFillMode: 'forwards' }}>
            <div className="flex items-center justify-between mb-2">
              <div className="p-1.5 rounded-lg bg-orange-50">
                <Filter className="h-4 w-4 text-orange-600" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-xl font-bold text-orange-600">{filteredMessages.length}</p>
              <p className="text-xs font-medium text-gray-600">Results</p>
            </div>
          </div>
        </div>

        {/* Message Cards - White Background Only */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {filteredMessages.map((message, index) => (
            <div 
              key={message.id} 
              className="bg-white rounded-lg border border-gray-200 p-2 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 opacity-0 animate-fade-in"
              style={{
                animationDelay: `${500 + (index * 50)}ms`,
                animationFillMode: 'forwards'
              }}
            >
              <div className="flex flex-col items-center text-center">
                <div className="h-10 w-10 mb-2 rounded-full bg-gray-100 flex items-center justify-center relative">
                  {getMessageIcon(message.hasAttachment, message.starred)}
                  {!message.read && (
                    <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-orange-500 rounded-full"></div>
                  )}
                </div>
                
                <h3 className={`font-semibold text-gray-900 text-xs mb-1 text-center line-clamp-1 ${
                  !message.read ? 'font-bold' : ''
                }`}>
                  {message.subject}
                </h3>
                <p className="text-xs text-gray-600 mb-1 text-center line-clamp-1">{message.preview}</p>
                
                <div className="flex gap-0.5 mb-2">
                  <Badge className={`text-xs px-1 py-0 ${getPriorityColor(message.priority)}`}>
                    {message.priority.charAt(0).toUpperCase()}
                  </Badge>
                  <Badge className={`text-xs px-1 py-0 ${getCategoryColor(message.category)}`}>
                    {message.category.substring(0, 3)}
                  </Badge>
                </div>
                
                <div className="space-y-0.5 text-xs text-gray-600 w-full">
                  <div className="flex items-center justify-center space-x-1">
                    <Clock className="h-2.5 w-2.5" />
                    <span>{formatTimeAgo(message.timestamp)}</span>
                  </div>
                  <div className="flex items-center justify-center space-x-1">
                    <Mail className="h-2.5 w-2.5" />
                    <span className="truncate text-xs">{message.sender}</span>
                  </div>
                  <div className="flex items-center justify-center space-x-1">
                    <Filter className="h-2.5 w-2.5" />
                    <span className="text-xs">{message.category}</span>
                  </div>
                </div>
                
                <div className="mt-2 pt-2 border-t border-gray-100 w-full">
                  <div className="flex justify-center space-x-1">
                    <Button size="sm" variant="outline" className="h-5 w-5 p-0 hover:bg-orange-50 hover:text-orange-600">
                      <Reply className="h-2.5 w-2.5" />
                    </Button>
                    <Button size="sm" variant="outline" className="h-5 w-5 p-0 hover:bg-orange-50 hover:text-orange-600">
                      <Forward className="h-2.5 w-2.5" />
                    </Button>
                    <Button size="sm" variant="outline" className="h-5 w-5 p-0">
                      <MoreHorizontal className="h-2.5 w-2.5" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredMessages.length === 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
            <div className="p-2 bg-gray-100 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
              <Mail className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="text-base font-medium text-gray-900 mb-2">No messages found</h3>
            <p className="text-gray-600 text-sm">Try adjusting your search or filter criteria.</p>
          </div>
        )}
          </main>
        </div>
      </div>
    </div>
  );
}