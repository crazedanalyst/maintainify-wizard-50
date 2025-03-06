
import { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { Property } from '@/lib/db-service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';

interface PropertyFormProps {
  property?: Property;
  onSave?: () => void;
  onCancel?: () => void;
}

const PropertyForm = ({ property, onSave, onCancel }: PropertyFormProps) => {
  const { addProperty, updateProperty } = useApp();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  
  // Initialize form with property data if editing
  useEffect(() => {
    if (property) {
      setName(property.name);
      setAddress(property.address);
    }
  }, [property]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);
      
      const propertyData = {
        name,
        address,
      };
      
      if (property) {
        // Update existing property
        await updateProperty({
          ...property,
          ...propertyData,
        });
        toast({
          title: 'Property Updated',
          description: 'Property information has been updated successfully.',
        });
      } else {
        // Add new property
        await addProperty(propertyData);
        toast({
          title: 'Property Added',
          description: 'New property has been added successfully.',
        });
      }
      
      if (onSave) {
        onSave();
      }
    } catch (error) {
      console.error('Error saving property:', error);
      toast({
        title: 'Error',
        description: 'There was an error saving the property information.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="text-xs font-medium">Property Name*</label>
        <Input 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          placeholder="e.g. My Home, Rental Property" 
          required
          className="h-8 text-xs mt-1"
        />
      </div>
      
      <div>
        <label className="text-xs font-medium">Address*</label>
        <Textarea 
          value={address} 
          onChange={(e) => setAddress(e.target.value)} 
          placeholder="Full property address"
          required
          className="min-h-[60px] text-xs resize-none mt-1"
        />
      </div>
      
      <div className="flex justify-end space-x-2 pt-2">
        {onCancel && (
          <Button type="button" variant="outline" size="sm" onClick={onCancel} className="h-8 text-xs">
            Cancel
          </Button>
        )}
        <Button type="submit" size="sm" className="h-8 text-xs" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : property ? 'Update Property' : 'Add Property'}
        </Button>
      </div>
    </form>
  );
};

export default PropertyForm;
