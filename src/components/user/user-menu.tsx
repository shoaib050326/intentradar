'use client'

import { useState } from 'react'
import { UserButton, useUser, SignOutButton, useClerk } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { 
  User, 
  Settings, 
  LogOut,
  ChevronDown
} from 'lucide-react'
import Link from 'next/link'

export function UserMenu() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const { signOut } = useClerk()

  const handleSignOut = () => {
    signOut(() => router.push('/'))
  }

  if (!isLoaded) {
    return <div className="w-8 h-8 bg-gray-700 rounded-full animate-pulse" />
  }

  if (!user) {
    return (
      <Link href="/sign-in">
        <Button variant="outline" size="sm" className="border-gray-700 text-gray-300">
          Sign In
        </Button>
      </Link>
    )
  }

  return (
    <div className="flex items-center gap-3">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="flex items-center gap-2 text-gray-300 hover:text-white">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
              {user.firstName?.[0] || user.username?.[0] || 'U'}
            </div>
            <span className="hidden md:inline">{user.firstName || user.username}</span>
            <ChevronDown className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 bg-gray-900 border-gray-800">
          <DropdownMenuLabel className="text-gray-300">
            <div>
              <p className="font-medium">{user.fullName || 'User'}</p>
              <p className="text-xs text-gray-500">{user.primaryEmailAddress?.emailAddress}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-gray-800" />
          <DropdownMenuItem asChild className="cursor-pointer">
            <Link href="/profile" className="flex items-center gap-2 text-gray-300">
              <User className="w-4 h-4" />
              Profile
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild className="cursor-pointer">
            <Link href="/settings" className="flex items-center gap-2 text-gray-300">
              <Settings className="w-4 h-4" />
              Settings
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-gray-800" />
          <DropdownMenuItem className="cursor-pointer" onClick={handleSignOut}>
            <div className="flex items-center gap-2 text-red-400 w-full">
              <LogOut className="w-4 h-4" />
              Sign Out
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
