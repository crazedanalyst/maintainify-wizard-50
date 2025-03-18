import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Shield, Home, Wrench, FileText, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
const HomePage = () => {
  return <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white overflow-hidden">
      {/* Navigation */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <span className="text-xl font-bold bg-gradient-to-r from-brand-500 to-brand-600 bg-clip-text text-transparent">MaintainWiz</span>
            </div>
            <div>
              <Link to="/login">
                <Button variant="ghost" className="text-brand-600">Log in</Button>
              </Link>
              <Link to="/register">
                <Button variant="neo-primary" className="ml-4 shadow-lg hover:shadow-brand-400/20 transition-all duration-300">Sign up</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero section */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-brand-50 to-transparent opacity-50 z-0"></div>
        <div className="absolute top-40 right-20 w-72 h-72 bg-brand-100 rounded-full filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-brand-200 rounded-full filter blur-3xl opacity-10"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-28 relative z-10">
          <div className="md:flex items-center">
            <div className="md:w-1/2 md:pr-12">
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                <span className="block">Keep your home</span>
                <span className="bg-gradient-to-r from-brand-500 to-brand-600 bg-clip-text text-transparent">maintenance on track</span>
              </h1>
              <p className="text-lg text-gray-600 mb-8 max-w-md">
                MaintainWiz helps you manage your home's maintenance tasks, warranties, and service providers in one simple dashboard.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/register">
                  <Button variant="neo-primary" className="px-8 shadow-lg hover:shadow-brand-400/20 transition-all duration-300" size="lg">
                    Get Started
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="neo" size="lg" className="hover:shadow-lg transition-all duration-300">
                    Log in to your account
                  </Button>
                </Link>
              </div>
            </div>
            <div className="md:w-1/2 mt-12 md:mt-0">
              <div className="bg-white/70 backdrop-blur-lg p-6 rounded-2xl shadow-neo rotate-1 hover:rotate-0 transition-all duration-500">
                <img alt="Dashboard preview" className="rounded-lg border border-gray-200 transform hover:scale-[1.02] transition-all duration-500" width="100%" height="auto" src="/lovable-uploads/a8383a1b-adbb-4f9d-abe5-0f81da170d3d.jpg" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features section */}
      <div className="bg-white py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.02] z-0"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Everything you need to maintain your home</h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">Simple tools to track maintenance, warranties, and service providers</p>
            <div className="w-24 h-1 bg-gradient-to-r from-brand-400 to-brand-600 mx-auto mt-8 rounded-full"></div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => <FeatureCard key={index} icon={feature.icon} title={feature.title} description={feature.description} />)}
          </div>
        </div>
      </div>

      {/* CTA section */}
      <div className="bg-gradient-to-br from-brand-50 to-white py-24 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-white to-transparent"></div>
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-brand-100 rounded-full filter blur-3xl opacity-30"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="glass-card max-w-4xl mx-auto py-16 px-8">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Ready to start organizing your home maintenance?
            </h2>
            <p className="text-lg text-gray-600 mb-8 max-w-3xl mx-auto">
              Join thousands of homeowners who use MaintainWiz to keep their homes in top condition.
            </p>
            <Link to="/register">
              <Button variant="neo-primary" className="px-8 shadow-lg hover:shadow-brand-400/30 hover:scale-105 transition-all duration-300" size="lg">
                Create your free account
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <span className="text-xl font-bold bg-gradient-to-r from-brand-500 to-brand-600 bg-clip-text text-transparent">MaintainWiz</span>
              <p className="mt-2 text-sm text-gray-500">© 2025 MaintainWiz. All rights reserved.</p>
            </div>
            <div className="flex space-x-6">
              <Link to="/login" className="text-gray-500 hover:text-brand-600 transition-colors">Log In</Link>
              <Link to="/register" className="text-gray-500 hover:text-brand-600 transition-colors">Sign Up</Link>
              <a href="#" className="text-gray-500 hover:text-brand-600 transition-colors">Privacy</a>
              <a href="#" className="text-gray-500 hover:text-brand-600 transition-colors">Terms</a>
            </div>
          </div>
        </div>
      </footer>
    </div>;
};
const features = [{
  icon: <Home className="h-10 w-10 text-brand-500" />,
  title: "Maintenance Tracking",
  description: "Never miss a maintenance task with automatic reminders and scheduling"
}, {
  icon: <FileText className="h-10 w-10 text-brand-500" />,
  title: "Warranty Management",
  description: "Keep all your warranty information in one place with expiration alerts"
}, {
  icon: <Wrench className="h-10 w-10 text-brand-500" />,
  title: "Service Provider Directory",
  description: "Store contact information for all your trusted service providers"
}];
const FeatureCard = ({
  icon,
  title,
  description
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) => {
  return <div className="bg-white/50 backdrop-blur-sm p-8 rounded-2xl shadow-neo-sm hover:shadow-neo transition-all duration-300 border border-gray-100 group">
      <div className="inline-flex items-center justify-center p-3 bg-brand-50 rounded-xl mb-6 group-hover:bg-brand-100 transition-colors duration-300">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>;
};
export default HomePage;