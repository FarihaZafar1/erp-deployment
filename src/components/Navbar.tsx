"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { useUser, UserButton } from '@clerk/nextjs';
import {
  Bell,
  Search,
  Sun
} from 'lucide-react';

interface NavbarProps {
  sidebarCollapsed: boolean;
  onToggleSidebar: () => void;
}

export default function Navbar({ sidebarCollapsed, onToggleSidebar }: NavbarProps) {
  const { user, isLoaded } = useUser();

  return (
    <nav className={`fixed top-4 right-4 h-12 bg-white shadow-lg rounded-lg z-30 transition-all duration-300 ${
      sidebarCollapsed ? 'left-20' : 'left-56'
    }`} style={{boxShadow: '0 10px 25px -5px rgba(251, 146, 60, 0.3), 0 4px 6px -2px rgba(251, 146, 60, 0.1)'}}>
      <div className="flex items-center justify-between h-full px-4">
        {/* Left Section with Toggle */}
        <div className="flex items-center space-x-3">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onToggleSidebar}
            className="p-1 hover:bg-orange-50 rounded-lg transition-colors"
          >
            <div className="w-4 h-4 flex flex-col justify-center space-y-0.5">
              <div className="w-full h-0.5 bg-orange-600 rounded"></div>
              <div className="w-full h-0.5 bg-orange-600 rounded"></div>
              <div className="w-full h-0.5 bg-orange-600 rounded"></div>
            </div>
          </Button>
          
          <div className="flex items-center min-w-0">
            <div className="min-w-0">
              <h1 className="text-sm font-bold text-gray-900 whitespace-nowrap">Dashboard</h1>
              <p className="text-xs text-orange-500 whitespace-nowrap overflow-hidden text-ellipsis">Welcome back to <span className="font-semibold">Business Ventures ERP</span></p>
            </div>
          </div>
        </div>

        {/* Center Section - Search */}
        <div className="flex-1 max-w-md mx-4">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-8 pr-3 py-1.5 border border-orange-200 rounded-lg focus:ring-1 focus:ring-orange-500 focus:border-orange-500 text-xs bg-orange-50/50 transition-all"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="sm" className="relative p-1 hover:bg-orange-50 rounded-lg">
            <Bell className="h-3 w-3 text-gray-600" />
            <span className="absolute -top-1 -right-1 h-3 w-3 bg-orange-500 rounded-full text-xs text-white flex items-center justify-center font-medium shadow-sm">1</span>
          </Button>
          
          <Button variant="ghost" size="sm" className="p-1 hover:bg-orange-50 rounded-lg">
            <Sun className="h-3 w-3 text-gray-600" />
          </Button>

          {/* User Profile with Clerk - Single Icon */}
          <div className="flex items-center space-x-2 pl-2 border-l border-gray-200">
            {isLoaded && user ? (
              <div className="flex items-center space-x-2">
                <div className="hidden sm:block">
                  <p className="text-xs font-semibold text-gray-900">
                    {user.fullName || user.firstName || user.emailAddresses[0]?.emailAddress.split('@')[0]}
                  </p>
                  <p className="text-xs text-gray-500">User</p>
                </div>
                <UserButton 
                  appearance={{
                    elements: {
                      avatarBox: "h-7 w-7",
                      userButtonPopoverCard: "shadow-lg border border-orange-200",
                      userButtonPopoverActionButton: "hover:bg-orange-50"
                    }
                  }}
                  afterSignOutUrl="/sign-in"
                />
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <div className="hidden sm:block">
                  <p className="text-xs font-semibold text-gray-400">Loading...</p>
                  <p className="text-xs text-gray-400">User</p>
                </div>
                <div className="h-7 w-7 bg-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-gray-600 text-xs font-medium">?</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}