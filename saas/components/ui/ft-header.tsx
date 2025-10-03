'use client';

import Link from 'next/link';
import { useState, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { Home, LogOut, Menu, Search, User } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { signOut } from '@/app/(login)/actions';
import { useRouter } from 'next/navigation';
import { User as UserType } from '@/lib/db/schema';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

function StatsData() {
  return (
    <div className="bg-gray-800 text-white text-xs py-2">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <span>Active Learners</span>
              <span className="text-green-400">65,000+</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>Qualification Programs</span>
              <span className="text-green-400">300+</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>University Partners</span>
              <span className="text-green-400">50+</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>Employment Rate</span>
              <span className="text-green-400">94%</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>Years of Excellence</span>
              <span className="text-green-400">48+</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>Global Locations</span>
              <span className="text-green-400">15+</span>
            </div>
          </div>
          <Link href="/pricing-b2c" className="text-white hover:text-gray-300">
            View All Programs
          </Link>
        </div>
      </div>
    </div>
  );
}

function UserMenu() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { data: user } = useSWR<UserType>('/api/user', fetcher);
  const router = useRouter();

  async function handleSignOut() {
    await signOut();
    router.refresh();
    router.push('/');
  }

  if (!user) {
    return (
      <>
        <div className="flex items-center space-x-2">
          <User className="h-4 w-4" />
          <span className="text-sm text-gray-600">My Account</span>
        </div>
      </>
    );
  }

  return (
    <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
      <DropdownMenuTrigger>
        <Avatar className="cursor-pointer size-9">
          <AvatarImage alt={user.name || ''} />
          <AvatarFallback>
            {user.email
              .split(' ')
              .map((n) => n[0])
              .join('')}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="flex flex-col gap-1">
        <DropdownMenuItem className="cursor-pointer">
          <Link href="/dashboard" className="flex w-full items-center">
            <Home className="mr-2 h-4 w-4" />
            <span>Dashboard</span>
          </Link>
        </DropdownMenuItem>
        <form action={handleSignOut} className="w-full">
          <button type="submit" className="flex w-full">
            <DropdownMenuItem className="w-full flex-1 cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sign out</span>
            </DropdownMenuItem>
          </button>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function FTHeader() {
  return (
    <>
      <StatsData />
      <header className="bg-[#f6f2e7] border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Menu className="h-6 w-6 text-gray-600" />
              <Search className="h-6 w-6 text-gray-600" />
            </div>
            
            <Link href="/" className="flex items-center">
              <span className="text-5xl ft-serif tracking-wider font-bold">BPP</span>
            </Link>
            
            <div className="flex items-center space-x-4">
              <Link href="/pricing-b2c">
                <Button className="bg-[#262a33] hover:bg-[#1a1d23] text-white font-medium px-4 py-2 text-sm">
                  Get Started
                </Button>
              </Link>
              <Suspense fallback={<div className="h-9" />}>
                <UserMenu />
              </Suspense>
            </div>
          </div>
        </div>
        
        {/* Navigation */}
        <div className="border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex items-center space-x-8 py-3">
              <Link href="/" className="text-sm font-medium text-gray-900 border-b-2 border-primary pb-3">HOME</Link>
              <Link href="#" className="text-sm font-medium text-gray-600 hover:text-gray-900 pb-3">COURSES</Link>
              <Link href="#" className="text-sm font-medium text-gray-600 hover:text-gray-900 pb-3">APPRENTICESHIPS</Link>
              <Link href="#" className="text-sm font-medium text-gray-600 hover:text-gray-900 pb-3">QUALIFICATIONS</Link>
              <Link href="#" className="text-sm font-medium text-gray-600 hover:text-gray-900 pb-3">DEGREES</Link>
              <Link href="#" className="text-sm font-medium text-gray-600 hover:text-gray-900 pb-3">PROFESSIONAL</Link>
              <Link href="#" className="text-sm font-medium text-gray-600 hover:text-gray-900 pb-3">CORPORATE</Link>
              <Link href="#" className="text-sm font-medium text-gray-600 hover:text-gray-900 pb-3">ABOUT</Link>
              <Link href="#" className="text-sm font-medium text-gray-600 hover:text-gray-900 pb-3">CAREERS</Link>
              <Link href="#" className="text-sm font-medium text-gray-600 hover:text-gray-900 pb-3">STUDY CENTRES</Link>
              <div className="ml-auto flex items-center space-x-4 text-sm">
                <Link href="/customer-journeys" className="text-gray-600 hover:text-gray-900">Customer Journeys</Link>
                <Link href="/pricing-b2c" className="text-gray-600 hover:text-gray-900">B2B Solutions</Link>
                <Link href="#" className="text-gray-600 hover:text-gray-900">Student Portal</Link>
                <Link href="#" className="text-gray-600 hover:text-gray-900">My Learning</Link>
              </div>
            </nav>
          </div>
        </div>
      </header>
      
      {/* Promotional Banner */}
      <div className="bg-gray-800 text-white py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">Transform your career with industry-leading education</h3>
              <p className="text-sm text-gray-300">Start your professional journey with BPP's expert-led courses and qualifications.</p>
            </div>
            <Button className="bg-secondary hover:bg-secondary/90 text-black font-medium px-6">
              EXPLORE COURSES
            </Button>
          </div>
        </div>
      </div>
    </>
  );
} 