'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100">
      {/* Navigation */}
      <nav className="px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-2xl font-bold text-blue-600"
          >
            HealthCares
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-x-4"
          >
            <div className="hidden md:flex space-x-4">
              <Link 
                href="/hospital/login"
                className="px-4 py-2 text-blue-600 hover:text-blue-700 transition-colors"
              >
                Hospital Login
              </Link>
              <Link 
                href="/doctor/login"
                className="px-4 py-2 text-emerald-600 hover:text-emerald-700 transition-colors"
              >
                Doctor Login
              </Link>
            </div>
            <Link 
              href="#get-started"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Get Started
            </Link>
          </motion.div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-5xl md:text-6xl font-bold text-gray-900 mb-6"
          >
            Healthcare Management
            <span className="text-blue-600"> Simplified</span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto"
          >
            Connect hospitals and doctors seamlessly. Manage operations, schedule sessions, 
            and provide better patient care with our comprehensive healthcare platform.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="space-x-4"
          >
            <a 
              href="#get-started"
              className="inline-block px-8 py-4 bg-blue-600 text-white text-lg font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
            >
              Get Started
            </a>
            <a 
              href="#features"
              className="inline-block px-8 py-4 border border-blue-600 text-blue-600 text-lg font-medium rounded-lg hover:bg-blue-50 transition-colors"
            >
              Learn More
            </a>
          </motion.div>
        </div>
      </div>

      {/* User Type Selection Section */}
      <div id="get-started" className="bg-white py-20">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Choose Your Portal
            </h2>
            <p className="text-xl text-gray-600">
              Select the appropriate portal based on your role
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Hospital Portal */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1 }}
              className="bg-gradient-to-br from-blue-50 to-indigo-100 p-8 rounded-2xl border border-blue-200 hover:shadow-xl transition-all duration-300 group"
            >
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-6 bg-blue-600 rounded-full flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                  <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Hospital Management
                </h3>
                
                <p className="text-gray-600 mb-6">
                  Manage your healthcare facility, search for doctors, send collaboration requests, and oversee operations.
                </p>
                
                <ul className="text-left space-y-2 mb-8 text-gray-700">
                  <li className="flex items-center">
                    <svg className="w-4 h-4 text-blue-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                    Search & Connect with Doctors
                  </li>
                  <li className="flex items-center">
                    <svg className="w-4 h-4 text-blue-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                    Manage Hospital Operations
                  </li>
                  <li className="flex items-center">
                    <svg className="w-4 h-4 text-blue-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                    Appointment Scheduling
                  </li>
                </ul>
                
                <div className="space-y-3">
                  <Link 
                    href="/hospital/login"
                    className="block w-full py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Hospital Login
                  </Link>
                  <Link 
                    href="/signup"
                    className="block w-full py-3 border border-blue-600 text-blue-600 font-medium rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    Register Hospital
                  </Link>
                </div>
              </div>
            </motion.div>

            {/* Doctor Portal */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.2 }}
              className="bg-gradient-to-br from-emerald-50 to-teal-100 p-8 rounded-2xl border border-emerald-200 hover:shadow-xl transition-all duration-300 group"
            >
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-6 bg-emerald-600 rounded-full flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                  <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1V3H9V1L3 7V9H21ZM12 8C14.2 8 16 9.8 16 12S14.2 16 12 16S8 14.2 8 12S9.8 8 12 8Z"/>
                  </svg>
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Doctor Practice
                </h3>
                
                <p className="text-gray-600 mb-6">
                  Manage your medical practice, respond to hospital requests, schedule sessions, and provide patient care.
                </p>
                
                <ul className="text-left space-y-2 mb-8 text-gray-700">
                  <li className="flex items-center">
                    <svg className="w-4 h-4 text-emerald-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                    Manage Hospital Requests
                  </li>
                  <li className="flex items-center">
                    <svg className="w-4 h-4 text-emerald-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                    Schedule Sessions
                  </li>
                  <li className="flex items-center">
                    <svg className="w-4 h-4 text-emerald-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                    Patient Care Management
                  </li>
                </ul>
                
                <div className="space-y-3">
                  <Link 
                    href="/doctor/login"
                    className="block w-full py-3 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors"
                  >
                    Doctor Login
                  </Link>
                  <Link 
                    href="/doctor/signup"
                    className="block w-full py-3 border border-emerald-600 text-emerald-600 font-medium rounded-lg hover:bg-emerald-50 transition-colors"
                  >
                    Register as Doctor
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Powerful Features for Healthcare
            </h2>
            <p className="text-xl text-gray-600">
              Everything you need to manage modern healthcare operations
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: "🔗",
                title: "Seamless Collaboration",
                description: "Connect hospitals and doctors with smart request and approval systems"
              },
              {
                icon: "📅",
                title: "Smart Scheduling",
                description: "Conflict-free session management with automated scheduling"
              },
              {
                icon: "📊",
                title: "Analytics Dashboard",
                description: "Comprehensive insights into operations and performance metrics"
              },
              {
                icon: "🛡️",
                title: "Security First",
                description: "Enterprise-grade security with HIPAA compliance"
              },
              {
                icon: "📱",
                title: "Modern Interface",
                description: "Beautiful, intuitive design with responsive layouts"
              },
              {
                icon: "⚡",
                title: "Real-time Updates",
                description: "Instant notifications and live status updates"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.6 + index * 0.1 }}
                className="p-6 bg-white border border-gray-200 rounded-xl hover:shadow-lg transition-shadow"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">HealthCares</h3>
              <p className="text-gray-400">
                Modern healthcare management solutions connecting hospitals and doctors.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Portals</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/hospital/login" className="hover:text-white transition-colors">Hospital Login</Link></li>
                <li><Link href="/doctor/login" className="hover:text-white transition-colors">Doctor Login</Link></li>
                <li><Link href="/signup" className="hover:text-white transition-colors">Register Hospital</Link></li>
                <li><Link href="/doctor/signup" className="hover:text-white transition-colors">Register Doctor</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 HealthCares. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
