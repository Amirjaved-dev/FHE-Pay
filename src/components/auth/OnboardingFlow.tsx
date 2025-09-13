import React, { useState } from 'react';
import { useAccount } from 'wagmi';
import { ArrowLeft, ArrowRight, User, Building, CheckCircle } from 'lucide-react';
import { useSupabase } from '../../contexts/SupabaseContext';

interface OnboardingFlowProps {
  onComplete: () => void;
  onBack: () => void;
}

type OnboardingStep = 'profile' | 'role' | 'company' | 'complete';

interface UserData {
  fullName: string;
  role: 'employee' | 'owner';
  companyName?: string;
  companyDescription?: string;
}

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete, onBack }) => {
  const { address } = useAccount();
  const { signUpWithWallet, createCompany } = useSupabase();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('profile');
  const [userData, setUserData] = useState<UserData>({
    fullName: '',
    role: 'employee',
    companyName: '',
    companyDescription: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleNext = () => {
    const steps: OnboardingStep[] = ['profile', 'role', 'company', 'complete'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      // Skip company step if user is an employee
      if (currentStep === 'role' && userData.role === 'employee') {
        setCurrentStep('complete');
      } else {
        setCurrentStep(steps[currentIndex + 1]);
      }
    }
  };

  const handlePrevious = () => {
    const steps: OnboardingStep[] = ['profile', 'role', 'company', 'complete'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      // Skip company step if coming back and user is employee
      if (currentStep === 'complete' && userData.role === 'employee') {
        setCurrentStep('role');
      } else {
        setCurrentStep(steps[currentIndex - 1]);
      }
    } else {
      onBack();
    }
  };

  const handleComplete = async () => {
    if (!address) {
      setError('Wallet not connected');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Create user account
      const result = await signUpWithWallet(address, userData.fullName, userData.role);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to create account');
      }

      // Create company if user is an owner
      if (userData.role === 'owner' && userData.companyName) {
        await createCompany(
          userData.companyName,
          userData.companyDescription,
          address
        );
      }

      onComplete();
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'Failed to complete onboarding');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 'profile':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome to FHE-Pay!
              </h2>
              <p className="text-gray-600 text-lg mb-4">
                Let's set up your account to get started with secure, private payroll management.
              </p>
              <div className="bg-blue-50 p-3 rounded-lg mb-6">
                <p className="text-sm text-blue-800">
                  <strong>Connected Wallet:</strong> {address?.slice(0, 6)}...{address?.slice(-4)}
                </p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="fullName"
                  value={userData.fullName}
                  onChange={(e) => setUserData({ ...userData, fullName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="Enter your full name"
                  required
                />
              </div>
            </div>
          </div>
        );

      case 'role':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                What's your role?
              </h2>
              <p className="text-gray-600">
                This helps us customize your experience.
              </p>
            </div>
            
            <div className="space-y-3">
              <div
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 transform hover:scale-[1.02] ${
                  userData.role === 'employee'
                    ? 'border-blue-500 bg-blue-50 shadow-md'
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                }`}
                onClick={() => setUserData({ ...userData, role: 'employee' })}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-5 h-5 rounded-full border-2 transition-all duration-200 ${
                    userData.role === 'employee'
                      ? 'border-blue-500 bg-blue-500 scale-110'
                      : 'border-gray-300'
                  }`}>
                    {userData.role === 'employee' && (
                      <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5 animate-pulse"></div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Employee</h3>
                    <p className="text-sm text-gray-600">I receive payments from employers</p>
                  </div>
                </div>
              </div>
              
              <div
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 transform hover:scale-[1.02] ${
                  userData.role === 'owner'
                    ? 'border-purple-500 bg-purple-50 shadow-md'
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                }`}
                onClick={() => setUserData({ ...userData, role: 'owner' })}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-5 h-5 rounded-full border-2 transition-all duration-200 ${
                    userData.role === 'owner'
                      ? 'border-purple-500 bg-purple-500 scale-110'
                      : 'border-gray-300'
                  }`}>
                    {userData.role === 'owner' && (
                      <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5 animate-pulse"></div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Company Owner</h3>
                    <p className="text-sm text-gray-600">I manage payroll and pay employees</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'company':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 transform transition-transform hover:scale-105">
                <Building className="w-8 h-8 text-purple-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Company Information
              </h2>
              <p className="text-gray-600 mb-2">
                Set up your company to start managing payroll.
              </p>
              <p className="text-sm text-gray-500">
                You can skip this step and add company details later.
              </p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name
                </label>
                <input
                  type="text"
                  id="companyName"
                  value={userData.companyName}
                  onChange={(e) => setUserData({ ...userData, companyName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter your company name"
                />
              </div>
              
              <div>
                <label htmlFor="companyDescription" className="block text-sm font-medium text-gray-700 mb-2">
                  Company Description (Optional)
                </label>
                <textarea
                  id="companyDescription"
                  value={userData.companyDescription}
                  onChange={(e) => setUserData({ ...userData, companyDescription: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 resize-none"
                  placeholder="Brief description of your company"
                  rows={3}
                />
              </div>
              
              <div className="text-center">
                <button
                  onClick={() => setCurrentStep('complete')}
                  className="text-sm text-gray-500 hover:text-gray-700 underline transition-colors"
                >
                  Skip for now
                </button>
              </div>
            </div>
          </div>
        );

      case 'complete':
        return (
          <div className="text-center space-y-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                You're all set!
              </h2>
              <p className="text-gray-600 text-lg">
                Your account has been created successfully. Welcome to FHE-Pay!
              </p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg text-left">
              <h3 className="font-medium text-gray-900 mb-2">Account Summary:</h3>
              <div className="space-y-1 text-sm text-gray-600">
                <p><strong>Name:</strong> {userData.fullName}</p>
                <p><strong>Role:</strong> {userData.role}</p>
                {userData.role === 'owner' && userData.companyName && (
                  <p><strong>Company:</strong> {userData.companyName}</p>
                )}
                <p><strong>Wallet:</strong> {address?.slice(0, 6)}...{address?.slice(-4)}</p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 'profile':
        return userData.fullName.trim().length > 0;
      case 'role':
        return true;
      case 'company':
        return true; // Company setup is now optional
      case 'complete':
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="p-8">
        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">
              Step {['profile', 'role', 'company', 'complete'].indexOf(currentStep) + 1} of {userData.role === 'employee' ? '3' : '4'}
            </span>
            <span className="text-xs text-gray-500">
              {currentStep === 'profile' && 'Profile Setup'}
              {currentStep === 'role' && 'Role Selection'}
              {currentStep === 'company' && 'Company Info'}
              {currentStep === 'complete' && 'Complete'}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500 ease-out"
              style={{ 
                width: `${((['profile', 'role', 'company', 'complete'].indexOf(currentStep) + 1) / (userData.role === 'employee' ? 3 : 4)) * 100}%` 
              }}
            ></div>
          </div>
        </div>

        {/* Step content */}
        <div className="mb-8">
          {renderStep()}
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex justify-between">
          <button
            onClick={handlePrevious}
            className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            disabled={isLoading}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          {currentStep === 'complete' ? (
            <button
              onClick={handleComplete}
              disabled={isLoading}
              className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <CheckCircle className="w-4 h-4" />
              )}
              <span>{isLoading ? 'Creating Account...' : 'Get Started'}</span>
            </button>
          ) : (
            <button
              onClick={handleNext}
              disabled={!canProceed() || isLoading}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              <span>Next</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};