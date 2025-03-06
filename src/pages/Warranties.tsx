
import { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { useApp } from '@/context/AppContext';
import { Warranty } from '@/lib/db-service';
import { formatDate, getRelativeTime } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Plus, Clock, Receipt, AlertCircle, Check, X, Edit, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import WarrantyForm from '@/components/warranties/WarrantyForm';
import { toast } from '@/hooks/use-toast';

const Warranties = () => {
  const { warranties, selectedProperty, deleteWarranty } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedWarranty, setSelectedWarranty] = useState<Warranty | null>(null);
  
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
  
  // Handle edit warranty
  const handleEditWarranty = (warranty: Warranty) => {
    setSelectedWarranty(warranty);
    setIsEditDialogOpen(true);
  };
  
  // Handle delete warranty
  const handleDeleteWarranty = (warranty: Warranty) => {
    setSelectedWarranty(warranty);
    setIsDeleteDialogOpen(true);
  };
  
  // Confirm delete warranty
  const confirmDeleteWarranty = async () => {
    if (selectedWarranty) {
      try {
        await deleteWarranty(selectedWarranty.id);
        toast({
          title: 'Warranty Deleted',
          description: 'The warranty has been deleted successfully.',
        });
      } catch (error) {
        console.error('Error deleting warranty:', error);
        toast({
          title: 'Error',
          description: 'There was an error deleting the warranty.',
          variant: 'destructive'
        });
      } finally {
        setIsDeleteDialogOpen(false);
        setSelectedWarranty(null);
      }
    }
  };
  
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
            <Button onClick={() => setIsAddDialogOpen(true)}>
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
                    <WarrantyCard 
                      key={warranty.id} 
                      warranty={warranty} 
                      onEdit={handleEditWarranty} 
                      onDelete={handleDeleteWarranty}
                    />
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
                      <WarrantyCard 
                        key={warranty.id} 
                        warranty={warranty} 
                        onEdit={handleEditWarranty} 
                        onDelete={handleDeleteWarranty}
                      />
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
                    <WarrantyCard 
                      key={warranty.id} 
                      warranty={warranty} 
                      onEdit={handleEditWarranty} 
                      onDelete={handleDeleteWarranty}
                    />
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
                <Button onClick={() => setIsAddDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" /> Add Warranty
                </Button>
              </div>
            )}
          </div>
          
          {/* Add Warranty Dialog */}
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Warranty</DialogTitle>
                <DialogDescription>
                  Enter the details of your product warranty.
                </DialogDescription>
              </DialogHeader>
              <WarrantyForm onSave={() => setIsAddDialogOpen(false)} onCancel={() => setIsAddDialogOpen(false)} />
            </DialogContent>
          </Dialog>
          
          {/* Edit Warranty Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Edit Warranty</DialogTitle>
                <DialogDescription>
                  Update the details of your product warranty.
                </DialogDescription>
              </DialogHeader>
              {selectedWarranty && (
                <WarrantyForm 
                  warranty={selectedWarranty} 
                  onSave={() => setIsEditDialogOpen(false)} 
                  onCancel={() => setIsEditDialogOpen(false)} 
                />
              )}
            </DialogContent>
          </Dialog>
          
          {/* Delete Confirmation Dialog */}
          <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete the warranty for "{selectedWarranty?.itemName}". 
                  This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="h-8 text-xs">Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={confirmDeleteWarranty} className="h-8 text-xs bg-red-500 hover:bg-red-600">
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
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
interface WarrantyCardProps {
  warranty: Warranty;
  onEdit: (warranty: Warranty) => void;
  onDelete: (warranty: Warranty) => void;
}

const WarrantyCard = ({ warranty, onEdit, onDelete }: WarrantyCardProps) => {
  const now = Date.now();
  const isExpired = warranty.expiryDate <= now;
  const isExpiring = warranty.expiryDate > now && warranty.expiryDate < now + 30 * 24 * 60 * 60 * 1000;
  
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow group">
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
            <div className="flex space-x-1">
              {isExpired ? (
                <Badge variant="outline" className="bg-red-50 text-red-700">Expired</Badge>
              ) : isExpiring ? (
                <Badge variant="outline" className="bg-yellow-50 text-yellow-700">Expiring Soon</Badge>
              ) : (
                <Badge variant="outline" className="bg-green-50 text-green-700">Active</Badge>
              )}
            </div>
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
          
          <div className="mt-3 pt-2 border-t flex justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => onEdit(warranty)}>
              <Edit className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-500 hover:text-red-700" onClick={() => onDelete(warranty)}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Warranties;
