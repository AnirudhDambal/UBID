'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  BarChart3,
  Database,
  Activity,
  FileText,
  Code2,
  Settings,
  ChevronDown,
  Menu,
  X,
  LogOut,
  Upload,
  Check,
} from 'lucide-react'

interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
  role?: 'admin' | 'reviewer' | 'auditor'
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: <BarChart3 className="w-5 h-5" /> },
  { label: 'Ingestion', href: '/dashboard/ingest', icon: <Upload className="w-5 h-5" />, role: 'admin' },
  { label: 'Review Queue', href: '/dashboard/review', icon: <Check className="w-5 h-5" />, role: 'reviewer' },
  { label: 'UBID Registry', href: '/dashboard/ubids', icon: <Database className="w-5 h-5" /> },
  { label: 'Activity', href: '/dashboard/activity', icon: <Activity className="w-5 h-5" /> },
  { label: 'Audit Log', href: '/dashboard/audit', icon: <FileText className="w-5 h-5" /> },
  { label: 'Query Console', href: '/dashboard/query', icon: <Code2 className="w-5 h-5" />, role: 'admin' },
  { label: 'Model Health', href: '/dashboard/model', icon: <Settings className="w-5 h-5" />, role: 'admin' },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [userRole] = useState<'admin' | 'reviewer' | 'auditor'>('admin') // Mock user role

  // Filter nav items based on role
  const visibleNavItems = navItems.filter((item) => !item.role || item.role === userRole)

  const isActive = (href: string) => {
    return pathname === `/dashboard${href}` || pathname.endsWith(href)
  }

  return (
    <div className="h-screen flex bg-slate-50 dark:bg-slate-950">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-all duration-300`}
      >
        {/* Logo */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-lg">
              U
            </div>
            {sidebarOpen && (
              <div>
                <h1 className="font-bold text-lg">UBID</h1>
                <p className="text-xs text-slate-600 dark:text-slate-400">Platform</p>
              </div>
            )}
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {visibleNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive(item.href)
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title={!sidebarOpen ? item.label : undefined}
            >
              {item.icon}
              {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
            </Link>
          ))}
        </nav>

        {/* Toggle Sidebar */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full"
          >
            {sidebarOpen ? (
              <ChevronDown className="w-4 h-4 rotate-90" />
            ) : (
              <ChevronDown className="w-4 h-4 -rotate-90" />
            )}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-8 py-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-600 dark:text-slate-400">
            {navItems.find((item) => isActive(item.href))?.label || 'Dashboard'}
          </h2>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 rounded-full bg-green-600" />
              <span className="text-slate-600 dark:text-slate-400">
                Logged in as <span className="font-medium text-slate-900 dark:text-white">admin@ubid.gov</span>
              </span>
            </div>
            <Button variant="ghost" size="sm">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-8">{children}</div>
        </main>
      </div>
    </div>
  )
}
