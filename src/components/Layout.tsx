import React, { useState, Fragment } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Transition, Dialog } from '@headlessui/react';
import {
  Bars3Icon,
  XMarkIcon,
  HomeIcon,
  UsersIcon,
  CreditCardIcon,
  ChartBarIcon,
  ArrowRightOnRectangleIcon,
  UserIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';
import { useWallet } from '../hooks/useWallet';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Employees', href: '/employees', icon: UsersIcon },
  { name: 'Funding', href: '/funding', icon: CreditCardIcon },
  { name: 'Reports', href: '/reports', icon: ChartBarIcon },
];

interface LayoutProps {
  children?: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const location = useLocation();
  const { address, disconnectWallet } = useWallet();

  const handleDisconnect = () => {
    disconnectWallet();
    setUserMenuOpen(false);
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <div className="h-screen flex overflow-hidden bg-gray-100">
      {/* Mobile sidebar overlay */}
      <Transition.Root show={sidebarOpen} as={Fragment}>
        <Dialog as="div" className="relative z-40 md:hidden" onClose={setSidebarOpen}>
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-600 bg-opacity-75" aria-hidden="true" />
          </Transition.Child>

          <div className="fixed inset-0 flex z-40">
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <Dialog.Panel 
                id="mobile-sidebar"
                className="relative flex-1 flex flex-col max-w-xs w-full bg-white"
                aria-label="Navigation menu"
              >
                <Transition.Child
                  as={Fragment}
                  enter="ease-in-out duration-300"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="ease-in-out duration-300"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <div className="absolute top-0 right-0 -mr-12 pt-2">
                    <button
                      type="button"
                      className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white hover:bg-white/10 transition-colors"
                      onClick={() => setSidebarOpen(false)}
                      aria-label="Close navigation menu"
                    >
                      <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
                    </button>
                  </div>
                </Transition.Child>
                <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
                  <div className="flex-shrink-0 flex items-center px-4">
                    <h1 className="text-xl font-bold text-purple-600" role="banner">FHE-Pay</h1>
                  </div>
                  <nav className="mt-5 px-2 space-y-1" role="navigation" aria-label="Main navigation">
                    {navigation.map((item) => {
                      const isActive = location.pathname === item.href
                      return (
                        <Link
                          key={item.name}
                          to={item.href}
                          className={`${
                            isActive
                              ? 'bg-purple-100 text-purple-900'
                              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                          } group flex items-center px-2 py-2 text-base font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500`}
                          onClick={() => setSidebarOpen(false)}
                          aria-current={isActive ? 'page' : undefined}
                        >
                          <item.icon
                            className={`${
                              isActive ? 'text-purple-500' : 'text-gray-400 group-hover:text-gray-500'
                            } mr-4 flex-shrink-0 h-6 w-6`}
                            aria-hidden="true"
                          />
                          {item.name}
                        </Link>
                      )
                    })}
                  </nav>
                </div>
              </Dialog.Panel>
            </Transition.Child>
            <div className="flex-shrink-0 w-14" aria-hidden="true">
              {/* Force sidebar to shrink to fit close icon */}
            </div>
          </div>
        </Dialog>
      </Transition.Root>

      {/* Desktop sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <div className="flex-1 flex flex-col min-h-0 border-r border-gray-200 bg-white">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4">
              <h1 className="text-xl font-bold text-purple-600" role="banner">FHE-Pay</h1>
            </div>
            <nav className="mt-5 flex-1 px-2 bg-white space-y-1" role="navigation" aria-label="Main navigation">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`${
                      isActive
                        ? 'bg-purple-100 text-purple-900'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    } group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <item.icon
                      className={`${
                        isActive ? 'text-purple-500' : 'text-gray-400 group-hover:text-gray-500'
                      } mr-3 flex-shrink-0 h-6 w-6`}
                      aria-hidden="true"
                    />
                    {item.name}
                  </Link>
                )
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        {/* Top bar - Mobile optimized */}
        <div className="relative z-10 flex-shrink-0 flex h-16 bg-white shadow">
          <div className="flex-1 px-4 flex justify-between items-center">
            {/* Mobile menu button and title */}
            <div className="flex items-center">
              <button
                type="button"
                className="md:hidden -ml-0.5 mr-3 h-10 w-10 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-purple-500 transition-colors"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open navigation menu"
                aria-expanded={sidebarOpen}
                aria-controls="mobile-sidebar"
              >
                <Bars3Icon className="h-6 w-6" aria-hidden="true" />
              </button>
              <div className="flex items-center">
                <h1 className="md:hidden text-lg font-bold text-purple-600 mr-4">FHE-Pay</h1>
                <h2 className="text-base md:text-lg font-semibold text-gray-900 truncate">
                  {navigation.find(item => item.href === location.pathname)?.name || 'Dashboard'}
                </h2>
              </div>
            </div>
            
            {/* Right side - Wallet and User Menu */}
            <div className="flex items-center space-x-2 md:space-x-4">
              {/* Wallet Connection - Responsive */}
              <div className="hidden sm:block">
                <ConnectButton />
              </div>
              
              {/* User Menu - Mobile optimized */}
              <div className="relative">
                <button
                  type="button"
                  className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 hover:bg-gray-50 transition-colors p-1"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  aria-label="User menu"
                  aria-expanded={userMenuOpen}
                  aria-haspopup="true"
                  id="user-menu-button"
                >
                  <div className="flex items-center space-x-1 md:space-x-2">
                    <div className="h-8 w-8 rounded-full bg-purple-600 flex items-center justify-center">
                      <UserIcon className="h-5 w-5 text-white" aria-hidden="true" />
                    </div>
                    <span className="hidden lg:block text-sm font-medium text-gray-700 max-w-24 truncate">
                      {address ? formatAddress(address) : 'Wallet'}
                    </span>
                    <ChevronDownIcon className="h-4 w-4 text-gray-400" aria-hidden="true" />
                  </div>
                </button>
                
                {userMenuOpen && (
                  <div 
                    className="origin-top-right absolute right-0 mt-2 w-64 sm:w-72 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50"
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby="user-menu-button"
                  >
                    <div className="py-1">
                      <div className="px-4 py-3 text-sm text-gray-700 border-b" role="menuitem" tabIndex={-1}>
                        <p className="font-medium">Wallet Connected</p>
                        <p className="text-gray-500 font-mono text-xs break-all" title={address}>{address}</p>
                        <p className="text-xs text-purple-600 mt-1">Zama Sepolia Network</p>
                      </div>
                      {/* Mobile wallet connection */}
                      <div className="sm:hidden px-4 py-2 border-b" role="menuitem" tabIndex={-1}>
                        <ConnectButton />
                      </div>
                      <button
                        onClick={handleDisconnect}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
                        role="menuitem"
                        tabIndex={0}
                      >
                        <ArrowRightOnRectangleIcon className="inline h-4 w-4 mr-2" aria-hidden="true" />
                        Disconnect Wallet
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main content area */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {children || <Outlet />}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}