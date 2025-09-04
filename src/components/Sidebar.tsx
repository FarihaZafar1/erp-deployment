"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Home,
  Users,
  User,
  DollarSign,
  Calendar,
  BarChart3,
  Settings,
  Activity,
  Bell,
  Mail,
  Building2,
  CheckSquare
} from 'lucide-react';

// Enhanced sidebar items with professional icons
const sidebarItems = [
  { icon: Home, label: 'Dashboard', href: '/' },
  { icon: Users, label: 'Employee Management', href: '/employees' },
  { icon: Building2, label: 'Departments', href: '/departments' },
  { icon: CheckSquare, label: 'Task Management', href: '/departments/tasks' },
  { icon: DollarSign, label: 'Payroll', href: '/payroll' },
  { icon: Calendar, label: 'Attendance', href: '/attendance' },
  { icon: BarChart3, label: 'Finance', href: '/finance' },
  { icon: Activity, label: 'Reports', href: '/reports' },
  { icon: Settings, label: 'Settings', href: '/settings' }
];

interface SidebarProps {
  isCollapsed: boolean;
}

export default function Sidebar({ isCollapsed }: SidebarProps) {
  const pathname = usePathname();
  return (
    <div className={`fixed left-4 top-4 h-[calc(100vh-2rem)] bg-white shadow-xl rounded-lg transition-all duration-300 z-40 ${
      isCollapsed ? 'w-12' : 'w-48'
    }`} style={{boxShadow: '0 10px 25px -5px rgba(251, 146, 60, 0.3), 0 4px 6px -2px rgba(251, 146, 60, 0.1)'}}>
      {/* Business Ventures ERP Header */}
      <div className="py-3 px-2 border-b border-orange-100">
        {!isCollapsed ? (
          <h1 className="text-xs font-bold text-orange-500 text-center" style={{ fontFamily: 'cursive' }}>
            Business Ventures ERP
          </h1>
        ) : (
          <div className="text-center">
            <span className="text-xs font-bold text-orange-500" style={{ fontFamily: 'cursive' }}>BV</span>
          </div>
        )}
      </div>


      
      {/* Navigation */}
      <nav className="flex-1 p-2 overflow-y-auto">
        <ul className="space-y-1">
          {sidebarItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <li key={index}>
                <a
                  href={item.href}
                  className={`flex items-center px-2 py-1.5 text-xs rounded-lg transition-all duration-200 group ${
                    isActive
                      ? 'bg-orange-50 text-orange-700 border border-orange-200 shadow-sm'
                      : 'text-gray-600 hover:bg-orange-50 hover:text-orange-600 hover:shadow-sm'
                  }`}
                >
                  <Icon className={`h-3 w-3 flex-shrink-0 transition-colors ${
                    isActive ? 'text-orange-600' : 'text-gray-500 group-hover:text-orange-500'
                  }`} />
                  {!isCollapsed && (
                    <span className="ml-2 truncate font-medium">{item.label}</span>
                  )}
                </a>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Quick Actions */}
      {!isCollapsed && (
        <div className="mt-6 px-4">
          <h3 className="text-xs font-medium text-gray-600 mb-2">Quick Actions</h3>
          <div className="space-y-1">
            <a href="/notifications" className="flex items-center px-2 py-1.5 text-xs text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all duration-200">
              <Bell className="h-3 w-3 mr-2" />
              <span>Notifications</span>
            </a>
            <a href="/messages" className="flex items-center px-2 py-1.5 text-xs text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all duration-200">
              <Mail className="h-3 w-3 mr-2" />
              <span>Messages</span>
            </a>
          </div>
        </div>
      )}


    </div>
  );
}