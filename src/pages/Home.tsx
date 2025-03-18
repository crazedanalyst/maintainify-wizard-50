
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Shield, Home, Tool, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <span className="text-xl font-bold text-brand-600">MaintainWiz</span>
            </div>
            <div>
              <Link to="/login">
                <Button variant="ghost" className="text-brand-600">Log in</Button>
              </Link>
              <Link to="/register">
                <Button variant="neo-primary" className="ml-4">Sign up</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero section */}
      <div className="relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="md:flex items-center">
            <div className="md:w-1/2 md:pr-12">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Keep your home maintenance on track
              </h1>
              <p className="text-lg text-gray-600 mb-8">
                MaintainWiz helps you manage your home's maintenance tasks, warranties, and service providers in one simple dashboard.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/register">
                  <Button variant="neo-primary" className="px-8" size="lg">
                    Get Started
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="neo" size="lg">
                    Log in to your account
                  </Button>
                </Link>
              </div>
            </div>
            <div className="md:w-1/2 mt-12 md:mt-0">
              <div className="bg-white p-6 rounded-xl shadow-neo">
                <img 
                  src="/placeholder.svg" 
                  alt="Dashboard preview" 
                  className="rounded-lg border border-gray-200"
                  width="100%"
                  height="auto"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Everything you need to maintain your home</h2>
            <p className="mt-4 text-lg text-gray-600">Simple tools to track maintenance, warranties, and service providers</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Home className="h-10 w-10 text-brand-500" />}
              title="Maintenance Tracking"
              description="Never miss a maintenance task with automatic reminders and scheduling"
            />
            <FeatureCard 
              icon={<FileText className="h-10 w-10 text-brand-500" />}
              title="Warranty Management"
              description="Keep all your warranty information in one place with expiration alerts"
            />
            <FeatureCard 
              icon={<Tool className="h-10 w-10 text-brand-500" />}
              title="Service Provider Directory"
              description="Store contact information for all your trusted service providers"
            />
          </div>
        </div>
      </div>

      {/* CTA section */}
      <div className="bg-brand-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to start organizing your home maintenance?
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-3xl mx-auto">
            Join thousands of homeowners who use MaintainWiz to keep their homes in top condition.
          </p>
          <Link to="/register">
            <Button variant="neo-primary" className="px-8" size="lg">
              Create your free account
            </Button>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <span className="text-xl font-bold text-gray-900">MaintainWiz</span>
              <p className="mt-2 text-sm text-gray-500">© 2025 MaintainWiz. All rights reserved.</p>
            </div>
            <div className="flex space-x-6">
              <Link to="/login" className="text-gray-500 hover:text-gray-900">Log In</Link>
              <Link to="/register" className="text-gray-500 hover:text-gray-900">Sign Up</Link>
              <a href="#" className="text-gray-500 hover:text-gray-900">Privacy</a>
              <a href="#" className="text-gray-500 hover:text-gray-900">Terms</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-neo-sm text-center">
      <div className="inline-flex items-center justify-center p-3 bg-brand-50 rounded-full mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
};

export default HomePage;
