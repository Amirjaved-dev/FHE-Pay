import React, { useEffect, useState, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowRightIcon, UserIcon } from '@heroicons/react/24/outline';
import { ShieldCheckIcon, EyeSlashIcon, CurrencyDollarIcon } from '@heroicons/react/24/solid';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useWallet } from '../hooks/useWallet';
import { useSupabase } from '../contexts/SupabaseContext';
import { useWalletSync } from '../hooks/useWalletSync';

const features = [
  {
    name: 'Fully Homomorphic Encryption',
    description: 'Salary data is encrypted end-to-end using advanced FHE technology, ensuring complete privacy.',
    icon: ShieldCheckIcon,
  },
  {
    name: 'Private Salary Streams',
    description: 'Create confidential payroll streams that keep salary information hidden from everyone.',
    icon: EyeSlashIcon,
  },
  {
    name: 'Secure Withdrawals',
    description: 'Employees can withdraw their salaries securely without revealing amounts to third parties.',
    icon: CurrencyDollarIcon,
  },
];

export default function Home() {
  const { isConnected } = useWallet();
  const { user, loading: authLoading } = useSupabase();
  const { isInitializing } = useWalletSync();
  const location = useLocation();
  
  // Simple loading state management
  const [isLoading, setIsLoading] = useState(true);
  
  // Derived state
  const isAuthenticated = !!user;
  const canAccessDashboard = isAuthenticated && isConnected;
  
  // No longer need modal-based navigation
  
  // Simple loading state management
  useEffect(() => {
    if (!authLoading && !isInitializing) {
      setIsLoading(false);
    }
  }, [authLoading, isInitializing]);
  
  // Don't show buttons during initial loading to prevent flickering
  const shouldShowButtons = !isLoading && !authLoading && !isInitializing;

  return (
    <div className="bg-white">
      {/* Header */}
      <header className="absolute inset-x-0 top-0 z-50">
        <nav className="flex items-center justify-between p-6 lg:px-8" aria-label="Global">
          <div className="flex lg:flex-1">
            <span className="text-2xl font-bold text-purple-600">FHE-Pay</span>
          </div>
          <div className="flex lg:flex-1 lg:justify-end items-center space-x-4">
            {shouldShowButtons && canAccessDashboard && (
              <Link
                to="/app/dashboard"
                className="text-sm font-semibold leading-6 text-gray-900 hover:text-purple-600"
              >
                Dashboard
              </Link>
            )}
            <ConnectButton />
          </div>
        </nav>
      </header>

      {/* Hero section */}
      <div className="relative isolate px-6 pt-14 lg:px-8">
        <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
          <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-purple-400 to-blue-600 opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" />
        </div>
        
        <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Private Payroll with{' '}
              <span className="text-purple-600">FHE Technology</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              The first fully confidential payroll system built on Fully Homomorphic Encryption. 
              Keep salary information private while maintaining full functionality.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              {isLoading ? (
                <div className="rounded-md bg-gray-200 px-3.5 py-2.5 text-sm font-semibold text-gray-500 animate-pulse flex items-center gap-2">
                  <div className="h-4 w-4 bg-gray-300 rounded animate-pulse"></div>
                  Loading...
                </div>
              ) : canAccessDashboard ? (
                <Link
                  to="/app/dashboard"
                  className="rounded-md bg-purple-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-purple-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-600 flex items-center gap-2"
                >
                  Go to Dashboard
                  <ArrowRightIcon className="h-4 w-4" />
                </Link>
              ) : (
                <div className="flex flex-col sm:flex-row gap-4 items-center">
                  <ConnectButton.Custom>
                    {({ account, chain, openConnectModal, openAccountModal, mounted }) => {
                      const ready = mounted;
                      const connected = ready && account && chain;

                      return (
                        <div
                          {...(!ready && {
                            'aria-hidden': true,
                            style: {
                              opacity: 0,
                              pointerEvents: 'none',
                              userSelect: 'none',
                            },
                          })}
                        >
                          {(() => {
                            if (!connected) {
                              return (
                                <button
                                  onClick={openConnectModal}
                                  type="button"
                                  className="rounded-md bg-purple-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-purple-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-600 flex items-center gap-2 justify-center"
                                >
                                  <UserIcon className="h-4 w-4" />
                                  Connect Wallet & Get Started
                                </button>
                              );
                            }

                            return (
                              <div className="flex flex-col items-center gap-2">
                                <button
                                  onClick={openAccountModal}
                                  type="button"
                                  className="rounded-md bg-green-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600 flex items-center gap-2 justify-center"
                                >
                                  <UserIcon className="h-4 w-4" />
                                  Wallet Connected - Manage Account
                                </button>
                                {!isAuthenticated && (
                                  <p className="text-sm text-gray-600 text-center">
                                    Complete your profile setup to access the dashboard
                                  </p>
                                )}
                              </div>
                            );
                          })()
                          }
                        </div>
                      );
                    }}
                  </ConnectButton.Custom>
                </div>
              )}
              <a href="#features" className="text-sm font-semibold leading-6 text-gray-900">
                Learn more <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>
        </div>
        
        <div className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]">
          <div className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-purple-400 to-blue-600 opacity-30 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]" />
        </div>
      </div>

      {/* Features section */}
      <div id="features" className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-semibold leading-7 text-purple-600">Privacy First</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Revolutionary Payroll Privacy
            </p>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Built on Zama's FHEVM, FHE-Pay ensures that salary information remains completely private 
              throughout the entire payroll process, from creation to withdrawal.
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-3 lg:gap-y-16">
              {features.map((feature) => (
                <div key={feature.name} className="relative pl-16">
                  <dt className="text-base font-semibold leading-7 text-gray-900">
                    <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-purple-600">
                      <feature.icon className="h-6 w-6 text-white" aria-hidden="true" />
                    </div>
                    {feature.name}
                  </dt>
                  <dd className="mt-2 text-base leading-7 text-gray-600">{feature.description}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>

      {/* CTA section */}
      <div className="bg-purple-600">
        <div className="px-6 py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Ready to revolutionize your payroll?
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-purple-200">
              Join the future of private payroll management with FHE-Pay. 
              Your employees' financial privacy is guaranteed.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              {isLoading ? (
                <div className="rounded-md bg-white/20 px-3.5 py-2.5 text-sm font-semibold text-purple-200 animate-pulse">
                  Loading...
                </div>
              ) : canAccessDashboard ? (
                <Link
                  to="/app/dashboard"
                  className="rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-purple-600 shadow-sm hover:bg-purple-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <ConnectButton.Custom>
                  {({ account, chain, openConnectModal, openAccountModal, mounted }) => {
                    const ready = mounted;
                    const connected = ready && account && chain;

                    return (
                      <div
                        {...(!ready && {
                          'aria-hidden': true,
                          style: {
                            opacity: 0,
                            pointerEvents: 'none',
                            userSelect: 'none',
                          },
                        })}
                      >
                        {(() => {
                          if (!connected) {
                            return (
                              <button
                                onClick={openConnectModal}
                                type="button"
                                className="rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-purple-600 shadow-sm hover:bg-purple-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                              >
                                Get Started Now
                              </button>
                            );
                          }

                          return (
                            <button
                              onClick={openAccountModal}
                              type="button"
                              className="rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-purple-600 shadow-sm hover:bg-purple-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                            >
                              {isAuthenticated ? 'Go to Dashboard' : 'Complete Setup'}
                            </button>
                          );
                        })()
                        }
                      </div>
                    );
                  }}
                </ConnectButton.Custom>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}