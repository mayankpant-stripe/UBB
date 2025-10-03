'use client';

import Link from 'next/link';
import { useState, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { Phone, Search, User, Menu, ChevronDown } from 'lucide-react';
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

function TopBar() {
  return (
    <div className="bg-gray-900 text-white text-sm py-2">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span>Help</span>
            <span>Contact us</span>
            <span>Login</span>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Phone className="h-4 w-4" />
              <span>03300 603 100</span>
            </div>
            <span>Basket (0) £0</span>
          </div>
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
      <Link href="/sign-in">
        <Button variant="ghost" size="sm" className="text-gray-700">
          <User className="h-4 w-4 mr-2" />
          Sign In
        </Button>
      </Link>
    );
  }

  return (
    <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
      <DropdownMenuTrigger>
        <Avatar className="cursor-pointer size-8">
          <AvatarImage alt={user.name || ''} />
          <AvatarFallback>
            {user.email
              .split(' ')
              .map((n) => n[0])
              .join('')}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem>
          <Link href="/dashboard">Dashboard</Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleSignOut}>
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function BPPHeader() {
  return (
    <>
      <TopBar />
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left side */}
            <div className="flex items-center space-x-4">
              <Menu className="h-5 w-5 text-gray-600 cursor-pointer" />
              <Search className="h-5 w-5 text-gray-600 cursor-pointer" />
            </div>
            
            {/* Center - BPP Logo */}
            <Link href="/" className="flex items-center">
              <span className="text-3xl font-bold text-gray-900 tracking-wide">BPP</span>
            </Link>
            
            {/* Right side */}
            <div className="flex items-center space-x-4">
              <Link href="/pricing-b2c">
                <Button className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2">
                  Get Started
                </Button>
              </Link>
              <Suspense fallback={<div className="h-8 w-8" />}>
                <UserMenu />
              </Suspense>
            </div>
          </div>
        </div>
        
        {/* Main Navigation */}
        <div className="border-t border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex items-center justify-between py-4">
              <div className="flex items-center space-x-8">
                <DropdownMenu>
                  <DropdownMenuTrigger className="flex items-center space-x-1 text-sm font-medium text-gray-700 hover:text-gray-900">
                    <span>Accountancy & Tax</span>
                    <ChevronDown className="h-4 w-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem>ACCA</DropdownMenuItem>
                    <DropdownMenuItem>CIMA</DropdownMenuItem>
                    <DropdownMenuItem>ACA</DropdownMenuItem>
                    <DropdownMenuItem>AAT</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                
                <DropdownMenu>
                  <DropdownMenuTrigger className="flex items-center space-x-1 text-sm font-medium text-gray-700 hover:text-gray-900">
                    <span>Law</span>
                    <ChevronDown className="h-4 w-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem>Solicitor SQE</DropdownMenuItem>
                    <DropdownMenuItem>Barrister</DropdownMenuItem>
                    <DropdownMenuItem>Converting to Law</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                
                <DropdownMenu>
                  <DropdownMenuTrigger className="flex items-center space-x-1 text-sm font-medium text-gray-700 hover:text-gray-900">
                    <span>Data & Analytics</span>
                    <ChevronDown className="h-4 w-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem>Data Analyst</DropdownMenuItem>
                    <DropdownMenuItem>Data Scientist</DropdownMenuItem>
                    <DropdownMenuItem>Business Analyst</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                
                <Link href="#" className="text-sm font-medium text-gray-700 hover:text-gray-900">
                  Apprenticeships
                </Link>
                
                <Link href="#" className="text-sm font-medium text-gray-700 hover:text-gray-900">
                  About BPP
                </Link>
              </div>
              
              <div className="flex items-center space-x-6 text-sm">
                <Link href="/customer-journeys" className="text-gray-600 hover:text-gray-900">
                  Customer Journeys
                </Link>
                <Link href="/pricing-b2c" className="text-gray-600 hover:text-gray-900">
                  B2B Solutions
                </Link>
              </div>
            </nav>
          </div>
        </div>
      </header>
    </>
  );
} 