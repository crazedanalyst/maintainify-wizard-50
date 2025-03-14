import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { ServiceProvider } from '@/lib/db-service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Plus, Phone, Mail, Globe, Star } from 'lucide-react';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import ServiceProviderForm from '@/components/providers/ServiceProviderForm';

const ServiceProviders = () => {
  const { serviceProviders } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  
  const allCategories = Array.from(
    new Set(serviceProviders.flatMap(provider => provider.category))
  );
  
  const filteredProviders = serviceProviders.filter(provider => {
    const matchesSearch = searchTerm === '' || 
      provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      provider.notes.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === null || 
      provider.category.includes(selectedCategory as any);
    
    return matchesSearch && matchesCategory;
  });
  
  filteredProviders.sort((a, b) => b.rating - a.rating);

  return (
    <>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Service Providers</h1>
        <p className="text-gray-500">Manage your service provider contacts and reviews</p>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search service providers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button 
            variant={selectedCategory === null ? "default" : "outline"} 
            size="sm"
            onClick={() => setSelectedCategory(null)}
          >
            All
          </Button>
          
          {allCategories.map(category => (
            <Button 
              key={category} 
              variant={selectedCategory === category ? "default" : "outline"} 
              size="sm"
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>
        
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" /> Add Provider
        </Button>
      </div>
      
      {filteredProviders.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProviders.map(provider => (
            <ServiceProviderCard key={provider.id} provider={provider} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border rounded-lg bg-gray-50">
          <Phone className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No service providers found</h3>
          <p className="text-gray-500 mb-4">
            Add your trusted service providers to easily access their contact information.
          </p>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" /> Add Service Provider
          </Button>
        </div>
      )}

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Add Service Provider</DialogTitle>
            <DialogDescription>
              Add a new service provider to your contacts.
            </DialogDescription>
          </DialogHeader>
          <ServiceProviderForm 
            onSuccess={() => setIsAddDialogOpen(false)}
            onCancel={() => setIsAddDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

const ServiceProviderCard = ({ provider }: { provider: ServiceProvider }) => {
  const renderStars = (rating: number) => {
    return Array(5).fill(0).map((_, i) => (
      <Star 
        key={i} 
        className={`h-4 w-4 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
      />
    ));
  };
  
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-medium text-gray-900">{provider.name}</h3>
            <div className="flex items-center mt-1">
              {renderStars(provider.rating)}
            </div>
          </div>
          <div className="flex flex-wrap gap-1">
            {provider.category.map(cat => (
              <Badge key={cat} variant="outline" className="text-xs">
                {cat}
              </Badge>
            ))}
          </div>
        </div>
        
        {provider.notes && (
          <p className="text-sm text-gray-700 mb-4 line-clamp-2">{provider.notes}</p>
        )}
        
        <div className="space-y-2 text-sm">
          {provider.phone && (
            <div className="flex items-center">
              <Phone className="h-4 w-4 mr-2 text-gray-500" />
              <a 
                href={`tel:${provider.phone}`} 
                className="text-brand-600 hover:underline"
              >
                {provider.phone}
              </a>
            </div>
          )}
          
          {provider.email && (
            <div className="flex items-center">
              <Mail className="h-4 w-4 mr-2 text-gray-500" />
              <a 
                href={`mailto:${provider.email}`} 
                className="text-brand-600 hover:underline truncate"
              >
                {provider.email}
              </a>
            </div>
          )}
          
          {provider.website && (
            <div className="flex items-center">
              <Globe className="h-4 w-4 mr-2 text-gray-500" />
              <a 
                href={provider.website.startsWith('http') ? provider.website : `https://${provider.website}`} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-brand-600 hover:underline truncate"
              >
                {provider.website}
              </a>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ServiceProviders;
