'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useToast } from '@/lib/contexts/ToastContext';

export default function DoctorSignupPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Personal Information
    name: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    
    // Professional Information
    specialtyId: '',
    qualification: '',
    experience: '',
    licenseNumber: '',
    bio: '',
    consultationFee: '',
    
    // Security
    password: '',
    confirmPassword: '',
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [specialties, setSpecialties] = useState([]);
  const [loadingSpecialties, setLoadingSpecialties] = useState(true);
  const router = useRouter();
  const { success, error } = useToast();

  // Fetch specialties on component mount
  useEffect(() => {
    const fetchSpecialties = async () => {
      try {
        const response = await fetch('/api/specialties');
        const data = await response.json();
        if (data.success) {
          setSpecialties(data.specialties);
        }
      } catch (err) {
        console.error('Error fetching specialties:', err);
      } finally {
        setLoadingSpecialties(false);
      }
    };

    fetchSpecialties();
  }, []);

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
      const response = await fetch('/api/auth/doctor/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        success('Account created successfully! Welcome to HealthCares.');
        router.push('/doctor/dashboard');
      } else {
        if (data.errors) {
          setErrors(data.errors);
        } else {
          error(data.error || 'Registration failed. Please try again.');
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
      return formData.name.trim() && 
             formData.email.trim() && 
             formData.phone.trim() &&
             formData.address.trim() &&
             formData.city.trim() &&
             formData.state.trim() &&
             /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);
    } else if (currentStep === 2) {
      return formData.specialtyId && 
             formData.qualification.trim() && 
             formData.experience && 
             formData.licenseNumber.trim() &&
             formData.bio.trim() &&
             formData.consultationFee &&
             parseInt(formData.experience) > 0 &&
             parseFloat(formData.consultationFee) > 0;
    } else if (currentStep === 3) {
      return formData.password && 
             formData.confirmPassword && 
             formData.password === formData.confirmPassword && 
             formData.password.length >= 8;
    }
    return true;
  };

  const stepVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100 flex items-center justify-center p-2 sm:p-4">
      <div className="w-full max-w-4xl bg-white rounded-lg sm:rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <motion.div 
          className="bg-gradient-to-r from-green-600 to-green-700 p-4 sm:p-6 text-white"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <div className="max-w-3xl mx-auto">
            <h1 className="text-2xl sm:text-3xl font-bold text-center mb-2">Register as a Doctor</h1>
            <p className="text-green-100 text-center text-sm sm:text-base">Join HealthCares platform and connect with patients</p>
            
            {/* Progress Steps - Mobile Responsive */}
            <div className="mt-6 sm:mt-8">
              {/* Mobile Progress Bar */}
              <div className="sm:hidden">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-green-100">Step {currentStep} of 3</span>
                  <span className="text-sm text-green-100">
                    {currentStep === 1 && 'Personal Info'}
                    {currentStep === 2 && 'Professional Info'}
                    {currentStep === 3 && 'Security'}
                  </span>
                </div>
                <div className="w-full bg-green-500 rounded-full h-2">
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
                        currentStep >= step ? 'bg-white text-green-600' : 'bg-green-500 text-white'
                      }`}
                      whileHover={{ scale: 1.1 }}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: step * 0.1 }}
                    >
                      {step}
                    </motion.div>
                    <span className={`ml-2 text-sm hidden lg:block ${currentStep >= step ? 'text-white' : 'text-green-200'}`}>
                      {step === 1 && 'Personal'}
                      {step === 2 && 'Professional'}
                      {step === 3 && 'Security'}
                    </span>
                    {step < 3 && (
                      <div className={`w-8 lg:w-16 h-1 ml-2 lg:ml-4 rounded transition-all duration-300 ${
                        currentStep > step ? 'bg-white' : 'bg-green-500'
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
                
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className={getInputClassName('name')}
                    placeholder="Dr. John Smith"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
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
                      className={getInputClassName('email')}
                      placeholder="doctor@example.com"
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                    )}
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
                      className={getInputClassName('phone')}
                      placeholder="+1 (555) 123-4567"
                    />
                    {errors.phone && (
                      <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-2">
                    Date of Birth
                  </label>
                  <input
                    id="dateOfBirth"
                    name="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    className={getInputClassName('dateOfBirth')}
                  />
                </div>

                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                    Address *
                  </label>
                  <textarea
                    id="address"
                    name="address"
                    required
                    value={formData.address}
                    onChange={handleChange}
                    rows="3"
                    className={getInputClassName('address')}
                    placeholder="123 Medical Street, Medical District"
                  />
                  {errors.address && (
                    <p className="mt-1 text-sm text-red-600">{errors.address}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                      City *
                    </label>
                    <input
                      id="city"
                      name="city"
                      type="text"
                      required
                      value={formData.city}
                      onChange={handleChange}
                      className={getInputClassName('city')}
                      placeholder="New York"
                    />
                    {errors.city && (
                      <p className="mt-1 text-sm text-red-600">{errors.city}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-2">
                      State *
                    </label>
                    <input
                      id="state"
                      name="state"
                      type="text"
                      required
                      value={formData.state}
                      onChange={handleChange}
                      className={getInputClassName('state')}
                      placeholder="NY"
                    />
                    {errors.state && (
                      <p className="mt-1 text-sm text-red-600">{errors.state}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-2">
                      ZIP Code
                    </label>
                    <input
                      id="zipCode"
                      name="zipCode"
                      type="text"
                      value={formData.zipCode}
                      onChange={handleChange}
                      className={getInputClassName('zipCode')}
                      placeholder="10001"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: Professional Information */}
            {currentStep === 2 && (
              <motion.div
                variants={stepVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ duration: 0.5 }}
                className="space-y-6"
              >
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4 sm:mb-6">Professional Information</h2>
                
                <div>
                  <label htmlFor="specialtyId" className="block text-sm font-medium text-gray-700 mb-2">
                    Medical Specialty *
                  </label>
                  <select
                    id="specialtyId"
                    name="specialtyId"
                    required
                    value={formData.specialtyId}
                    onChange={handleChange}
                    className={getInputClassName('specialtyId')}
                    disabled={loadingSpecialties}
                  >
                    <option value="">
                      {loadingSpecialties ? 'Loading specialties...' : 'Select your specialty'}
                    </option>
                    {specialties.map((specialty) => (
                      <option key={specialty.id} value={specialty.id}>
                        {specialty.name}
                      </option>
                    ))}
                  </select>
                  {errors.specialtyId && (
                    <p className="mt-1 text-sm text-red-600">{errors.specialtyId}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label htmlFor="qualification" className="block text-sm font-medium text-gray-700 mb-2">
                      Qualification *
                    </label>
                    <input
                      id="qualification"
                      name="qualification"
                      type="text"
                      required
                      value={formData.qualification}
                      onChange={handleChange}
                      className={getInputClassName('qualification')}
                      placeholder="MBBS, MD (Cardiology)"
                    />
                    {errors.qualification && (
                      <p className="mt-1 text-sm text-red-600">{errors.qualification}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="experience" className="block text-sm font-medium text-gray-700 mb-2">
                      Years of Experience *
                    </label>
                    <input
                      id="experience"
                      name="experience"
                      type="number"
                      min="0"
                      max="50"
                      required
                      value={formData.experience}
                      onChange={handleChange}
                      className={getInputClassName('experience')}
                      placeholder="5"
                    />
                    {errors.experience && (
                      <p className="mt-1 text-sm text-red-600">{errors.experience}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label htmlFor="licenseNumber" className="block text-sm font-medium text-gray-700 mb-2">
                      Medical License Number *
                    </label>
                    <input
                      id="licenseNumber"
                      name="licenseNumber"
                      type="text"
                      required
                      value={formData.licenseNumber}
                      onChange={handleChange}
                      className={getInputClassName('licenseNumber')}
                      placeholder="MED-123456789"
                    />
                    {errors.licenseNumber && (
                      <p className="mt-1 text-sm text-red-600">{errors.licenseNumber}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="consultationFee" className="block text-sm font-medium text-gray-700 mb-2">
                      Consultation Fee (₹) *
                    </label>
                    <input
                      id="consultationFee"
                      name="consultationFee"
                      type="number"
                      min="0"
                      step="50"
                      required
                      value={formData.consultationFee}
                      onChange={handleChange}
                      className={getInputClassName('consultationFee')}
                      placeholder="500"
                    />
                    {errors.consultationFee && (
                      <p className="mt-1 text-sm text-red-600">{errors.consultationFee}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
                    Professional Bio *
                  </label>
                  <textarea
                    id="bio"
                    name="bio"
                    required
                    value={formData.bio}
                    onChange={handleChange}
                    rows="4"
                    className={getInputClassName('bio')}
                    placeholder="Describe your medical expertise, experience, and approach to patient care..."
                  />
                  {errors.bio && (
                    <p className="mt-1 text-sm text-red-600">{errors.bio}</p>
                  )}
                  <p className="text-sm text-gray-600 mt-1">This will be visible to patients when they search for doctors</p>
                </div>
              </motion.div>
            )}

            {/* Step 3: Security */}
            {currentStep === 3 && (
              <motion.div
                variants={stepVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ duration: 0.5 }}
                className="space-y-6"
              >
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4 sm:mb-6">Security Information</h2>
                
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
                      className={`${getInputClassName('confirmPassword')} pr-10 sm:pr-11`}
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

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-blue-900 mb-2">Account Verification</h3>
                  <p className="text-sm text-blue-700">
                    After registration, your account will be reviewed for verification. You'll be able to start accepting appointments once your medical credentials are verified.
                  </p>
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
                    className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Next Step
                  </motion.button>
                ) : (
                  <motion.button
                    type="submit"
                    disabled={loading}
                    className="w-full sm:w-auto px-6 sm:px-8 py-2 sm:py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
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
              <Link href="/login" className="text-green-600 hover:text-green-700 font-medium transition-colors">
                Sign in here
              </Link>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}