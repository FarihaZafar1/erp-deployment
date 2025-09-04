"use client";

import { useState } from "react";
import {
  Settings,
  User,
  Shield,
  Bell,
  Palette,
  Database,
  Mail,
  Globe,
  Lock,
  Users,
  Save,
  RefreshCw,
  Eye,
  EyeOff,
  Check,
  X,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import { getInitials, formatDate } from "@/lib/utils";

const settingsCategories = [
  {
    id: "profile",
    title: "Profile Settings",
    description: "Manage your personal information",
    icon: User,
    color: "bg-orange-50 text-orange-600",
  },
  {
    id: "security",
    title: "Security & Privacy",
    description: "Configure security settings",
    icon: Shield,
    color: "bg-orange-50 text-orange-600",
  },
  {
    id: "notifications",
    title: "Notifications",
    description: "Customize notification preferences",
    icon: Bell,
    color: "bg-orange-50 text-orange-600",
  },
  {
    id: "appearance",
    title: "Appearance",
    description: "Customize workspace look",
    icon: Palette,
    color: "bg-orange-50 text-orange-600",
  },
  {
    id: "system",
    title: "System Settings",
    description: "Configure system settings",
    icon: Database,
    color: "bg-orange-50 text-orange-600",
  },
  {
    id: "users",
    title: "User Management",
    description: "Manage users and permissions",
    icon: Users,
    color: "bg-orange-50 text-orange-600",
  },
];

const systemUsers = [
  {
    id: 1,
    name: "Sarah Johnson",
    email: "sarah.johnson@company.com",
    role: "Administrator",
    status: "Active",
    lastLogin: "2024-03-15T10:30:00",
    department: "Engineering",
  },
  {
    id: 2,
    name: "Mike Chen",
    email: "mike.chen@company.com",
    role: "HR Manager",
    status: "Active",
    lastLogin: "2024-03-15T09:15:00",
    department: "Human Resources",
  },
  {
    id: 3,
    name: "Emily Davis",
    email: "emily.davis@company.com",
    role: "Finance Manager",
    status: "Active",
    lastLogin: "2024-03-14T16:45:00",
    department: "Finance",
  },
  {
    id: 4,
    name: "John Smith",
    email: "john.smith@company.com",
    role: "Employee",
    status: "Inactive",
    lastLogin: "2024-03-10T14:20:00",
    department: "Marketing",
  },
];

const roleColors = {
  Administrator: "bg-red-100 text-red-800 hover:bg-red-100",
  "HR Manager": "bg-blue-100 text-blue-800 hover:bg-blue-100",
  "Finance Manager": "bg-green-100 text-green-800 hover:bg-green-100",
  Employee: "bg-gray-100 text-gray-800 hover:bg-gray-100",
} as const;

const statusColors = {
  Active: "bg-green-100 text-green-800 hover:bg-green-100",
  Inactive: "bg-gray-100 text-gray-800 hover:bg-gray-100",
} as const;

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [showPassword, setShowPassword] = useState(false);
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
    desktop: true,
  });
  const [theme, setTheme] = useState("light");
  const [language, setLanguage] = useState("en");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUser, setNewUser] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: 'Employee',
    department: ''
  });

  const handleAddUser = () => {
    setShowAddUserModal(true);
  };

  const handleSaveUser = async () => {
    try {
      const response = await fetch('/api/settings/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newUser),
      });
      
      if (response.ok) {
        setShowAddUserModal(false);
        setNewUser({ firstName: '', lastName: '', email: '', role: 'Employee', department: '' });
        // Refresh users list or show success message
        alert('User added successfully!');
      } else {
        alert('Failed to add user');
      }
    } catch (error) {
      console.error('Error adding user:', error);
      alert('Error adding user');
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "profile":
        return (
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-3">
              <div className="mb-3">
                <h3 className="text-sm font-semibold text-gray-900">Personal Information</h3>
                <p className="text-xs text-gray-600">Update your personal details</p>
              </div>
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">First Name</label>
                    <input
                      type="text"
                      className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                      defaultValue="John"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Last Name</label>
                    <input
                      type="text"
                      className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                      defaultValue="Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                      defaultValue="john.doe@company.com"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Phone</label>
                    <input
                      type="tel"
                      className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                      defaultValue="+1 (555) 123-4567"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Department</label>
                    <select className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500">
                      <option>Engineering</option>
                      <option>Human Resources</option>
                      <option>Finance</option>
                      <option>Marketing</option>
                      <option>Sales</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Job Title</label>
                    <input
                      type="text"
                      className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                      defaultValue="Senior Developer"
                    />
                  </div>
                </div>
                <div className="flex justify-end pt-2">
                  <Button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-3 py-1.5 text-xs h-7">
                    <Save className="h-3 w-3 mr-1" />
                    Save Changes
                  </Button>
                </div>
              </div>
            </div>
          </div>
        );

      case "security":
        return (
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-3">
              <div className="mb-3">
                <h3 className="text-sm font-semibold text-gray-900">Password Settings</h3>
                <p className="text-xs text-gray-600">Update your password and security</p>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Current Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      className="w-full px-2 py-1.5 pr-8 text-xs border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="Enter current password"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-2 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-3 w-3 text-gray-400" /> : <Eye className="h-3 w-3 text-gray-400" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">New Password</label>
                  <input
                    type="password"
                    className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Enter new password"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Confirm new password"
                  />
                </div>
                <div className="flex justify-end pt-2">
                  <Button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-3 py-1.5 text-xs h-7">
                    <Lock className="h-3 w-3 mr-1" />
                    Update Password
                  </Button>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-3">
              <div className="mb-3">
                <h3 className="text-sm font-semibold text-gray-900">Two-Factor Authentication</h3>
                <p className="text-xs text-gray-600">Add extra security to your account</p>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium">Enable 2FA</p>
                  <p className="text-xs text-gray-600">Secure your account with 2FA</p>
                </div>
                <Button variant="outline" className="text-xs h-7 px-3 hover:bg-orange-50 hover:border-orange-300">
                  Enable 2FA
                </Button>
              </div>
            </div>
            
            {/* Add User Modal */}
            {showAddUserModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 w-full max-w-md">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Add New User</h3>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setShowAddUserModal(false)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">First Name</label>
                        <input
                          type="text"
                          value={newUser.firstName}
                          onChange={(e) => setNewUser({...newUser, firstName: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Last Name</label>
                        <input
                          type="text"
                          value={newUser.lastName}
                          onChange={(e) => setNewUser({...newUser, lastName: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Email</label>
                      <input
                        type="email"
                        value={newUser.email}
                        onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Role</label>
                      <select
                        value={newUser.role}
                        onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      >
                        <option value="Employee">Employee</option>
                        <option value="HR Manager">HR Manager</option>
                        <option value="Finance Manager">Finance Manager</option>
                        <option value="Administrator">Administrator</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Department</label>
                      <input
                        type="text"
                        value={newUser.department}
                        onChange={(e) => setNewUser({...newUser, department: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="e.g., Engineering, HR, Finance"
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-3 mt-6">
                    <Button 
                      variant="outline" 
                      onClick={() => setShowAddUserModal(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleSaveUser}
                      className="bg-orange-500 hover:bg-orange-600 text-white"
                    >
                      Add User
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case "notifications":
        return (
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-3">
              <div className="mb-3">
                <h3 className="text-sm font-semibold text-gray-900">Notification Preferences</h3>
                <p className="text-xs text-gray-600">Choose how you receive notifications</p>
              </div>
              <div className="space-y-3">
                {Object.entries(notifications).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium capitalize">{key} Notifications</p>
                      <p className="text-xs text-gray-600">
                        Receive notifications via {key === 'push' ? 'push notifications' : key}
                      </p>
                    </div>
                    <button
                      onClick={() => setNotifications(prev => ({ ...prev, [key]: !value }))}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                        value ? 'bg-orange-500' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                          value ? 'translate-x-5' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                ))}
                <div className="flex justify-end pt-2">
                  <Button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-3 py-1.5 text-xs h-7">
                    <Save className="h-3 w-3 mr-1" />
                    Save Preferences
                  </Button>
                </div>
              </div>
            </div>
          </div>
        );

      case "appearance":
        return (
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-3">
              <div className="mb-3">
                <h3 className="text-sm font-semibold text-gray-900">Theme Settings</h3>
                <p className="text-xs text-gray-600">Customize workspace appearance</p>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">Theme</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['light', 'dark', 'system'].map((themeOption) => (
                      <button
                        key={themeOption}
                        onClick={() => setTheme(themeOption)}
                        className={`p-2 border rounded-md text-center capitalize text-xs ${
                          theme === themeOption
                            ? 'border-orange-500 bg-orange-50 text-orange-700'
                            : 'border-gray-200 hover:border-orange-300 hover:bg-orange-50'
                        }`}
                      >
                        {themeOption}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Language</label>
                  <select
                    className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                  </select>
                </div>
                <div className="flex justify-end pt-2">
                  <Button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-3 py-1.5 text-xs h-7">
                    <Save className="h-3 w-3 mr-1" />
                    Apply Changes
                  </Button>
                </div>
              </div>
            </div>
          </div>
        );

      case "system":
        return (
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-3">
              <div className="mb-3">
                <h3 className="text-sm font-semibold text-gray-900">System Configuration</h3>
                <p className="text-xs text-gray-600">Configure system-wide settings</p>
              </div>
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Company Name</label>
                    <input
                      type="text"
                      className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                      defaultValue="Acme Corporation"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Time Zone</label>
                    <select className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500">
                      <option>UTC-5 (Eastern Time)</option>
                      <option>UTC-6 (Central Time)</option>
                      <option>UTC-7 (Mountain Time)</option>
                      <option>UTC-8 (Pacific Time)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Currency</label>
                    <select className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500">
                      <option>USD ($)</option>
                      <option>EUR (€)</option>
                      <option>GBP (£)</option>
                      <option>CAD (C$)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Date Format</label>
                    <select className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500">
                      <option>MM/DD/YYYY</option>
                      <option>DD/MM/YYYY</option>
                      <option>YYYY-MM-DD</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end pt-2">
                  <Button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-3 py-1.5 text-xs h-7">
                    <Save className="h-3 w-3 mr-1" />
                    Save Configuration
                  </Button>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-3">
              <div className="mb-3">
                <h3 className="text-sm font-semibold text-gray-900">Data Management</h3>
                <p className="text-xs text-gray-600">Backup and restore system data</p>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium">System Backup</p>
                  <p className="text-xs text-gray-600">Last backup: March 15, 2024 at 2:00 AM</p>
                </div>
                <Button variant="outline" className="text-xs h-7 px-3 hover:bg-orange-50 hover:border-orange-300">
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Create Backup
                </Button>
              </div>
            </div>
          </div>
        );

      case "users":
        return (
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-100">
              <div className="p-3 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">User Management</h3>
                    <p className="text-xs text-gray-600">Manage system users and permissions</p>
                  </div>
                  <Button 
                    onClick={handleAddUser}
                    className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-3 py-1.5 text-xs h-7"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add User
                  </Button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-orange-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Department
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Last Login
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {systemUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-orange-50">
                        <td className="px-3 py-2 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="bg-orange-100 text-orange-600 text-xs">
                                {getInitials(user.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="text-xs font-medium text-gray-900">{user.name}</div>
                              <div className="text-xs text-gray-500">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          <Badge className={`text-xs px-1.5 py-0.5 ${roleColors[user.role as keyof typeof roleColors]}`}>
                            {user.role}
                          </Badge>
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                          {user.department}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          <Badge className={`text-xs px-1.5 py-0.5 ${statusColors[user.status as keyof typeof statusColors]}`}>
                            {user.status}
                          </Badge>
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                          {formatDate(user.lastLogin.split('T')[0])}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-xs font-medium">
                          <div className="flex space-x-1">
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-orange-100">
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-orange-100">
                              <Settings className="h-3 w-3" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      default:
        return null;
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
                    <Settings className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h1 className="text-base font-bold text-gray-900">Settings</h1>
                    <p className="text-xs text-gray-600">Manage your account and system preferences</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              {/* Settings Navigation */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-2 opacity-0 animate-fade-in" style={{ animationDelay: '100ms', animationFillMode: 'forwards' }}>
                  <nav className="space-y-1">
                    {settingsCategories.map((category, index) => {
                      const Icon = category.icon;
                      return (
                        <button
                          key={category.id}
                          onClick={() => setActiveTab(category.id)}
                          className={`w-full flex items-center space-x-2 px-2 py-2 text-left hover:bg-orange-50 rounded-md transition-all duration-200 opacity-0 animate-fade-in ${
                            activeTab === category.id
                              ? 'bg-orange-50 border border-orange-200 text-orange-700'
                              : 'text-gray-700'
                          }`}
                          style={{ animationDelay: `${150 + (index * 50)}ms`, animationFillMode: 'forwards' }}
                        >
                          <div className={`p-1 rounded ${category.color}`}>
                            <Icon className="h-3 w-3" />
                          </div>
                          <div>
                            <p className="text-xs font-medium">{category.title}</p>
                            <p className="text-xs text-gray-500 truncate">{category.description}</p>
                          </div>
                        </button>
                      );
                    })}
                  </nav>
                </div>
              </div>

              {/* Settings Content */}
              <div className="lg:col-span-3">
                <div className="opacity-0 animate-fade-in" style={{ animationDelay: '400ms', animationFillMode: 'forwards' }}>
                  {renderTabContent()}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}