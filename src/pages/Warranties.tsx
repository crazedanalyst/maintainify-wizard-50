
import { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { useApp } from '@/context/AppContext';
import { Warranty } from '@/lib/db-service';
import { formatDate, getRelativeTime } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Plus, Clock, Receipt, AlertCircle, Check, X } from 'lucide-react';

const Warranties = () => {
  const { warranties, selectedProperty } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filter warranties by property
  const propertyWarranties = selectedProperty
    ? warranties.filter(warranty => warranty.propertyId === selectedProperty.id)
    : [];
  
  // Apply search filter
  const filteredWarranties = propertyWarranties.filter(warranty => {
    const matchesSearch = searchTerm === '' || 
      warranty.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      warranty.manufacturer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      warranty.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });
  
  // Group warranties by status
  const now = Date.now();
  const activeWarranties = filteredWarranties.filter(warranty => warranty.expiryDate > now);
  const expiringWarranties = activeWarranties.filter(
    warranty => warranty.expiryDate < now + 30 * 24 * 60 * 60 * 1000
  );
  const expiredWarranties = filteredWarranties.filter(warranty => warranty.expiryDate <= now);
  
  // Sort warranties by expiry date (soonest first)
  activeWarranties.sort((a, b) => a.expiryDate - b.expiryDate);
  expiredWarranties.sort((a, b) => b.expiryDate - a.expiryDate);
  
  const getStatusBadge = (warranty: Warranty) => {
    if (warranty.expiryDate <= now) {
      return <Badge variant="outline" className="bg-red-50 text-red-700">Expired</Badge>;
    } else if (warranty.expiryDate < now + 30 * 24 * 60 * 60 * 1000) {
      return <Badge variant="outline" className="bg-yellow-50 text-yellow-700">Expiring Soon</Badge>;
    } else {
      return <Badge variant="outline" className="bg-green-50 text-green-700">Active</Badge>;
    }
  };

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Warranty Management</h1>
        <p className="text-gray-500">Keep track of your product warranties and expiration dates</p>
      </div>
      
      {selectedProperty ? (
        <>
          {/* Search and add */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search warranties..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" /> Add Warranty
            </Button>
          </div>
          
          {/* Summary cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium">Active Warranties</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <div className="bg-green-50 p-2 rounded-full mr-4">
                    <Check className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{activeWarranties.length}</p>
                    <p className="text-sm text-gray-500">Valid warranties</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium">Expiring Soon</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <div className="bg-yellow-50 p-2 rounded-full mr-4">
                    <AlertCircle className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{expiringWarranties.length}</p>
                    <p className="text-sm text-gray-500">Expiring in 30 days</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium">Expired Warranties</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <div className="bg-red-50 p-2 rounded-full mr-4">
                    <X className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{expiredWarranties.length}</p>
                    <p className="text-sm text-gray-500">No longer valid</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Warranty listings */}
          <div className="space-y-6">
            {expiringWarranties.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-3 flex items-center">
                  <AlertCircle className="h-5 w-5 mr-2 text-yellow-600" />
                  Expiring Soon
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {expiringWarranties.map(warranty => (
                    <WarrantyCard key={warranty.id} warranty={warranty} />
                  ))}
                </div>
              </div>
            )}
            
            {activeWarranties.filter(w => !expiringWarranties.includes(w)).length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-3 flex items-center">
                  <Check className="h-5 w-5 mr-2 text-green-600" />
                  Active Warranties
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {activeWarranties
                    .filter(w => !expiringWarranties.includes(w))
                    .map(warranty => (
                      <WarrantyCard key={warranty.id} warranty={warranty} />
                    ))}
                </div>
              </div>
            )}
            
            {expiredWarranties.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-3 flex items-center">
                  <X className="h-5 w-5 mr-2 text-red-600" />
                  Expired Warranties
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {expiredWarranties.map(warranty => (
                    <WarrantyCard key={warranty.id} warranty={warranty} />
                  ))}
                </div>
              </div>
            )}
            
            {filteredWarranties.length === 0 && (
              <div className="text-center py-12 border rounded-lg bg-gray-50">
                <Receipt className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No warranties found</h3>
                <p className="text-gray-500 mb-4">
                  Add your product warranties to keep track of expiration dates and documents.
                </p>
                <Button>
                  <Plus className="h-4 w-4 mr-2" /> Add Warranty
                </Button>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Properties Found</h2>
          <p className="text-gray-500 mb-6">Add a property to get started tracking warranties.</p>
          <Button>Add Property</Button>
        </div>
      )}
    </Layout>
  );
};

// Warranty card component
const WarrantyCard = ({ warranty }: { warranty: Warranty }) => {
  const now = Date.now();
  const isExpired = warranty.expiryDate <= now;
  const isExpiring = warranty.expiryDate > now && warranty.expiryDate < now + 30 * 24 * 60 * 60 * 1000;
  
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
      <CardContent className="p-0">
        <div className={`h-2 ${
          isExpired ? 'bg-red-500' : isExpiring ? 'bg-yellow-500' : 'bg-green-500'
        }`} />
        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="font-medium text-gray-900">{warranty.itemName}</h3>
              <p className="text-sm text-gray-500">{warranty.manufacturer}</p>
            </div>
            {isExpired ? (
              <Badge variant="outline" className="bg-red-50 text-red-700">Expired</Badge>
            ) : isExpiring ? (
              <Badge variant="outline" className="bg-yellow-50 text-yellow-700">Expiring Soon</Badge>
            ) : (
              <Badge variant="outline" className="bg-green-50 text-green-700">Active</Badge>
            )}
          </div>
          
          <p className="text-sm text-gray-700 mb-3 line-clamp-2">{warranty.description}</p>
          
          <div className="text-xs text-gray-500 space-y-1">
            <div className="flex justify-between">
              <span>Purchase Date:</span>
              <span className="font-medium">{formatDate(warranty.purchaseDate)}</span>
            </div>
            <div className="flex justify-between">
              <span>Expiry Date:</span>
              <span className={`font-medium ${isExpired ? 'text-red-600' : isExpiring ? 'text-yellow-600' : ''}`}>
                {formatDate(warranty.expiryDate)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Status:</span>
              <span className="font-medium">
                {isExpired ? 'Expired' : `Expires ${getRelativeTime(warranty.expiryDate)}`}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Warranties;
