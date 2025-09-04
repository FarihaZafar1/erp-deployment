"use client";

import { useState } from "react";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Wallet,
  PieChart,
  BarChart3,
  Plus,
  Filter,
  Download,
  Eye,
  MoreHorizontal,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";

const financeData = {
  totalRevenue: "$2,847,392",
  totalExpenses: "$1,923,847",
  netProfit: "$923,545",
  cashFlow: "$1,234,567",
  revenueGrowth: "+12.5%",
  expenseGrowth: "+8.3%",
  profitGrowth: "+18.7%",
  cashFlowGrowth: "+15.2%"
};

const transactions = [
  {
    id: 1,
    type: "Income",
    description: "Client Payment - Project Alpha",
    amount: "+$45,000",
    date: "2024-01-15",
    category: "Revenue",
    status: "Completed"
  },
  {
    id: 2,
    type: "Expense",
    description: "Office Rent - January",
    amount: "-$8,500",
    date: "2024-01-14",
    category: "Operations",
    status: "Completed"
  },
  {
    id: 3,
    type: "Income",
    description: "Subscription Revenue",
    amount: "+$12,300",
    date: "2024-01-13",
    category: "Recurring",
    status: "Completed"
  },
  {
    id: 4,
    type: "Expense",
    description: "Marketing Campaign",
    amount: "-$15,000",
    date: "2024-01-12",
    category: "Marketing",
    status: "Pending"
  }
];

export default function FinancePage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar sidebarCollapsed={sidebarCollapsed} onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} />
      <Sidebar isCollapsed={sidebarCollapsed} />
      
      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-64'} p-4 mt-16`}>
        <div className="max-w-7xl mx-auto">
          <main className="space-y-6">
          {/* Header - Compact */}
          <div className="bg-white p-3 rounded-md shadow-sm border border-gray-100 mb-6 opacity-0 animate-fade-in" style={{ animationDelay: '0ms', animationFillMode: 'forwards' }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 bg-gradient-to-r from-orange-500 to-orange-600 rounded-md shadow-sm">
                  <DollarSign className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h1 className="text-base font-bold text-gray-900">Finance Management</h1>
                  <p className="text-xs text-gray-600">Track revenue, expenses and financial performance</p>
                </div>
              </div>
              <Button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-md hover:shadow-lg transition-all duration-200">
                <Plus className="h-4 w-4 mr-2" />
                Add Transaction
              </Button>
            </div>
          </div>

          {/* Stats Cards - Compact */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 opacity-0 animate-fade-in" style={{ animationDelay: '100ms', animationFillMode: 'forwards' }}>
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 rounded-lg bg-gradient-to-r from-green-50 to-green-100">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
                <div className="flex items-center space-x-1 text-green-600">
                  <TrendingUp className="h-3 w-3" />
                  <span className="text-xs font-semibold">{financeData.revenueGrowth}</span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold text-gray-900">{financeData.totalRevenue}</p>
                <p className="text-xs font-medium text-gray-600">Total Revenue</p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 opacity-0 animate-fade-in" style={{ animationDelay: '200ms', animationFillMode: 'forwards' }}>
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 rounded-lg bg-gradient-to-r from-red-50 to-red-100">
                  <TrendingDown className="h-5 w-5 text-red-600" />
                </div>
                <div className="flex items-center space-x-1 text-red-600">
                  <TrendingUp className="h-3 w-3" />
                  <span className="text-xs font-semibold">{financeData.expenseGrowth}</span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold text-gray-900">{financeData.totalExpenses}</p>
                <p className="text-xs font-medium text-gray-600">Total Expenses</p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 opacity-0 animate-fade-in" style={{ animationDelay: '300ms', animationFillMode: 'forwards' }}>
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 rounded-lg bg-gradient-to-r from-blue-50 to-blue-100">
                  <PieChart className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex items-center space-x-1 text-green-600">
                  <TrendingUp className="h-3 w-3" />
                  <span className="text-xs font-semibold">{financeData.profitGrowth}</span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold text-gray-900">{financeData.netProfit}</p>
                <p className="text-xs font-medium text-gray-600">Net Profit</p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 opacity-0 animate-fade-in" style={{ animationDelay: '400ms', animationFillMode: 'forwards' }}>
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 rounded-lg bg-gradient-to-r from-purple-50 to-purple-100">
                  <Wallet className="h-5 w-5 text-purple-600" />
                </div>
                <div className="flex items-center space-x-1 text-green-600">
                  <TrendingUp className="h-3 w-3" />
                  <span className="text-xs font-semibold">{financeData.cashFlowGrowth}</span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold text-gray-900">{financeData.cashFlow}</p>
                <p className="text-xs font-medium text-gray-600">Cash Flow</p>
              </div>
            </div>
          </div>

          {/* Transactions Table - Compact */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 opacity-0 animate-fade-in" style={{ animationDelay: '500ms', animationFillMode: 'forwards' }}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Recent Transactions</h3>
                <p className="text-xs text-gray-500 mt-1">Latest financial activities</p>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" className="text-xs">
                  <Filter className="h-3 w-3 mr-1" />
                  Filter
                </Button>
                <Button variant="outline" size="sm" className="text-xs">
                  <Download className="h-3 w-3 mr-1" />
                  Export
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              {transactions.map((transaction, index) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${
                      transaction.type === 'Income' 
                        ? 'bg-green-100 text-green-600' 
                        : 'bg-red-100 text-red-600'
                    }`}>
                      {transaction.type === 'Income' ? (
                        <TrendingUp className="h-4 w-4" />
                      ) : (
                        <TrendingDown className="h-4 w-4" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{transaction.description}</p>
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <span>{transaction.date}</span>
                        <Badge variant="outline" className="text-xs">
                          {transaction.category}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <p className={`text-sm font-bold ${
                        transaction.type === 'Income' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.amount}
                      </p>
                      <Badge 
                        className={`text-xs ${
                          transaction.status === 'Completed' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {transaction.status}
                      </Badge>
                    </div>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          </main>
        </div>
      </div>
    </div>
  );
}