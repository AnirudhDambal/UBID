'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import {
  BarChart3,
  Database,
  Activity,
  FileText,
  Code2,
  Settings,
  ChevronDown,
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
    <div className="h-screen flex bg-transparent text-foreground">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-72' : 'w-20'
        } bg-white/85 dark:bg-slate-950/80 border-r border-slate-200/70 dark:border-slate-800/70 backdrop-blur flex flex-col transition-all duration-300 shadow-[0_20px_40px_rgba(15,23,42,0.08)]`}
      >
        {/* Logo */}
        <div className="p-4 border-b border-slate-200/70 dark:border-slate-800/70">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/90 dark:bg-slate-900/80 border border-slate-200/70 dark:border-slate-800/70 flex items-center justify-center shadow-sm">
              <Image src="/ubid.svg" alt="UBID" width={28} height={28} />
            </div>
            {sidebarOpen && (
              <div>
                <h1 className="font-semibold text-lg tracking-tight">UBID</h1>
                <p className="text-xs text-slate-600 dark:text-slate-400">Operations Console</p>
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
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                isActive(item.href)
                  ? 'bg-primary/10 text-primary ring-1 ring-primary/20 shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100/70 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-white'
              }`}
              title={!sidebarOpen ? item.label : undefined}
            >
              {item.icon}
              {sidebarOpen && <span className="tracking-tight">{item.label}</span>}
            </Link>
          ))}
        </nav>

        {/* Toggle Sidebar */}
        <div className="p-4 border-t border-slate-200/70 dark:border-slate-800/70">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full rounded-xl"
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
        <header className="bg-white/80 dark:bg-slate-950/70 border-b border-slate-200/70 dark:border-slate-800/70 backdrop-blur px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="h-2.5 w-2.5 rounded-full bg-primary" />
            <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              {navItems.find((item) => isActive(item.href))?.label || 'Dashboard'}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              Live
            </span>
            <span className="text-xs text-slate-600 dark:text-slate-400">admin@ubid.gov</span>
            <Button variant="ghost" size="sm" className="rounded-full">
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
