'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useToast } from '@/lib/contexts/ToastContext';

export default function SignupPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Personal Information
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    
    // Hospital Information
    hospitalName: '',
    hospitalAddress: '',
    hospitalCity: '',
    hospitalState: '',
    hospitalZipCode: '',
    hospitalPhone: '',
    hospitalEmail: '',
    licenseNumber: '',
    established: '',
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();
  const { success, error } = useToast();

  const getInputClassName = (fieldName) => {
    return `w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base ${
      errors[fieldName] ? 'border-red-300 bg-red-50' : 'border-gray-300'
    }`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate final step
    if (!validateStep()) {
      error('Please fill in all required fields correctly');
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          userType: 'hospital'
        }),
      });

      const data = await response.json();

      if (data.success) {
        success('Account created successfully! Welcome to HealthCares.');
        router.push('/hospital/dashboard');
      } else {
        if (data.errors) {
          setErrors(data.errors);
        } else {
          error(data.message || 'Registration failed. Please try again.');
        }
      }
    } catch (err) {
      console.error('Signup error:', err);
      error('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // Clear field-specific errors when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const nextStep = () => {
    if (validateStep() && currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      error('Please fill in all required fields correctly before proceeding');
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const validateStep = () => {
    if (currentStep === 1) {
      return formData.firstName.trim() && 
             formData.lastName.trim() && 
             formData.email.trim() && 
             formData.phone.trim() &&
             /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);
    } else if (currentStep === 2) {
      return formData.password && 
             formData.confirmPassword && 
             formData.password === formData.confirmPassword && 
             formData.password.length >= 8;
    } else if (currentStep === 3) {
      return formData.hospitalName.trim() &&
             formData.hospitalAddress.trim() &&
             formData.hospitalCity.trim() &&
             formData.hospitalState.trim() &&
             formData.hospitalZipCode.trim() &&
             formData.hospitalPhone.trim() &&
             formData.hospitalEmail.trim() &&
             /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.hospitalEmail);
    }
    return true;
  };

  const stepVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center p-2 sm:p-4">
      <div className="w-full max-w-4xl bg-white rounded-lg sm:rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <motion.div 
          className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 sm:p-6 text-white"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <div className="max-w-3xl mx-auto">
            <h1 className="text-2xl sm:text-3xl font-bold text-center mb-2">Register Your Hospital</h1>
            <p className="text-blue-100 text-center text-sm sm:text-base">Join HealthCares platform to manage your hospital efficiently</p>
            
            {/* Progress Steps - Mobile Responsive */}
            <div className="mt-6 sm:mt-8">
              {/* Mobile Progress Bar */}
              <div className="sm:hidden">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-blue-100">Step {currentStep} of 3</span>
                  <span className="text-sm text-blue-100">
                    {currentStep === 1 && 'Personal Info'}
                    {currentStep === 2 && 'Security'}
                    {currentStep === 3 && 'Hospital Info'}
                  </span>
                </div>
                <div className="w-full bg-blue-500 rounded-full h-2">
                  <motion.div 
                    className="bg-white h-2 rounded-full transition-all duration-300"
                    initial={{ width: '33%' }}
                    animate={{ width: `${(currentStep / 3) * 100}%` }}
                  />
                </div>
              </div>

              {/* Desktop Progress Steps */}
              <div className="hidden sm:flex items-center justify-center space-x-4 lg:space-x-8">
                {[1, 2, 3].map((step) => (
                  <div key={step} className="flex items-center">
                    <motion.div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
                        currentStep >= step ? 'bg-white text-blue-600' : 'bg-blue-500 text-white'
                      }`}
                      whileHover={{ scale: 1.1 }}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: step * 0.1 }}
                    >
                      {step}
                    </motion.div>
                    <span className={`ml-2 text-sm hidden lg:block ${currentStep >= step ? 'text-white' : 'text-blue-200'}`}>
                      {step === 1 && 'Personal'}
                      {step === 2 && 'Security'}
                      {step === 3 && 'Hospital'}
                    </span>
                    {step < 3 && (
                      <div className={`w-8 lg:w-16 h-1 ml-2 lg:ml-4 rounded transition-all duration-300 ${
                        currentStep > step ? 'bg-white' : 'bg-blue-500'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Form Content */}
        <div className="p-4 sm:p-6 lg:p-12">
          {/* Error Display */}
          {Object.keys(errors).length > 0 && (
            <motion.div
              className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg max-w-3xl mx-auto"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="text-red-600 text-sm">
                <p className="font-medium mb-2">Please fix the following errors:</p>
                <ul className="list-disc list-inside space-y-1">
                  {Object.entries(errors).map(([field, message]) => (
                    <li key={field}>{message}</li>
                  ))}
                </ul>
              </div>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
            {/* Step 1: Personal Information */}
            {currentStep === 1 && (
              <motion.div
                variants={stepVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ duration: 0.5 }}
                className="space-y-6"
              >
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4 sm:mb-6">Personal Information</h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                      First Name *
                    </label>
                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      required
                      value={formData.firstName}
                      onChange={handleChange}
                      className={getInputClassName('firstName')}
                      placeholder="John"
                    />
                    {errors.firstName && (
                      <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name *
                    </label>
                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      required
                      value={formData.lastName}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="Doe"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="john.doe@hospital.com"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </motion.div>
            )}

            {/* Step 2: Security */}
            {currentStep === 2 && (
              <motion.div
                variants={stepVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ duration: 0.5 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">Security Information</h2>
                
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    Password *
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className={`${getInputClassName('password')} pr-10 sm:pr-11`}
                      placeholder="Enter a strong password"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <svg className="w-5 h-5 text-gray-400 hover:text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd"/>
                          <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z"/>
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 text-gray-400 hover:text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                          <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
                        </svg>
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                  )}
                  <p className="text-sm text-gray-600 mt-1">Password must be at least 8 characters long</p>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 pr-11"
                      placeholder="Confirm your password"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <svg className="w-5 h-5 text-gray-400 hover:text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd"/>
                          <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z"/>
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 text-gray-400 hover:text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                          <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
                        </svg>
                      )}
                    </button>
                  </div>
                  {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                    <p className="text-sm text-red-600 mt-1">Passwords do not match</p>
                  )}
                </div>
              </motion.div>
            )}

            {/* Step 3: Hospital Information */}
            {currentStep === 3 && (
              <motion.div
                variants={stepVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ duration: 0.5 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">Hospital Information</h2>
                
                <div>
                  <label htmlFor="hospitalName" className="block text-sm font-medium text-gray-700 mb-2">
                    Hospital Name *
                  </label>
                  <input
                    id="hospitalName"
                    name="hospitalName"
                    type="text"
                    required
                    value={formData.hospitalName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="City General Hospital"
                  />
                </div>

                <div>
                  <label htmlFor="hospitalAddress" className="block text-sm font-medium text-gray-700 mb-2">
                    Hospital Address *
                  </label>
                  <textarea
                    id="hospitalAddress"
                    name="hospitalAddress"
                    required
                    value={formData.hospitalAddress}
                    onChange={handleChange}
                    rows="3"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="123 Healthcare Ave, Medical District"
                  />
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <label htmlFor="hospitalCity" className="block text-sm font-medium text-gray-700 mb-2">
                      City *
                    </label>
                    <input
                      id="hospitalCity"
                      name="hospitalCity"
                      type="text"
                      required
                      value={formData.hospitalCity}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="New York"
                    />
                  </div>

                  <div>
                    <label htmlFor="hospitalState" className="block text-sm font-medium text-gray-700 mb-2">
                      State *
                    </label>
                    <input
                      id="hospitalState"
                      name="hospitalState"
                      type="text"
                      required
                      value={formData.hospitalState}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="NY"
                    />
                  </div>

                  <div>
                    <label htmlFor="hospitalZipCode" className="block text-sm font-medium text-gray-700 mb-2">
                      ZIP Code *
                    </label>
                    <input
                      id="hospitalZipCode"
                      name="hospitalZipCode"
                      type="text"
                      required
                      value={formData.hospitalZipCode}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="10001"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="hospitalPhone" className="block text-sm font-medium text-gray-700 mb-2">
                      Hospital Phone *
                    </label>
                    <input
                      id="hospitalPhone"
                      name="hospitalPhone"
                      type="tel"
                      required
                      value={formData.hospitalPhone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="+1 (555) 987-6543"
                    />
                  </div>

                  <div>
                    <label htmlFor="hospitalEmail" className="block text-sm font-medium text-gray-700 mb-2">
                      Hospital Email *
                    </label>
                    <input
                      id="hospitalEmail"
                      name="hospitalEmail"
                      type="email"
                      required
                      value={formData.hospitalEmail}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="info@citygeneralhospital.com"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="licenseNumber" className="block text-sm font-medium text-gray-700 mb-2">
                      License Number
                    </label>
                    <input
                      id="licenseNumber"
                      name="licenseNumber"
                      type="text"
                      value={formData.licenseNumber}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="HL-2024-001234"
                    />
                  </div>

                  <div>
                    <label htmlFor="established" className="block text-sm font-medium text-gray-700 mb-2">
                      Year Established
                    </label>
                    <input
                      id="established"
                      name="established"
                      type="number"
                      min="1900"
                      max={new Date().getFullYear()}
                      value={formData.established}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="1985"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Navigation Buttons */}
            <motion.div 
              className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-0 mt-6 sm:mt-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {currentStep > 1 && (
                <motion.button
                  type="button"
                  onClick={prevStep}
                  className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Previous
                </motion.button>
              )}

              <div className={`${currentStep === 1 ? 'w-full' : 'w-full sm:w-auto sm:ml-auto'}`}>
                {currentStep < 3 ? (
                  <motion.button
                    type="button"
                    onClick={nextStep}
                    disabled={!validateStep()}
                    className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Next Step
                  </motion.button>
                ) : (
                  <motion.button
                    type="submit"
                    disabled={loading}
                    className="w-full sm:w-auto px-6 sm:px-8 py-2 sm:py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {loading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Creating Account...</span>
                      </div>
                    ) : (
                      'Create Account'
                    )}
                  </motion.button>
                )}
              </div>
            </motion.div>
          </form>

          <motion.div
            className="mt-6 sm:mt-8 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <p className="text-gray-600 text-sm sm:text-base">
              Already have an account?{' '}
              <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium transition-colors">
                Sign in here
              </Link>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}