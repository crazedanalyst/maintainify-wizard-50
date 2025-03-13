
import { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { ServiceProvider, Category } from '@/lib/db-service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';

interface ServiceProviderFormProps {
  provider?: ServiceProvider;
  onSave?: () => void;
  onCancel?: () => void;
  onSuccess?: () => void;
}

const categoryOptions: Category[] = [
  'Home', 
  'Electronics', 
  'Plumbing', 
  'Electrical', 
  'HVAC', 
  'Appliances', 
  'Outdoor', 
  'Vehicles', 
  'Other'
];

const ServiceProviderForm = ({ provider, onSave, onCancel, onSuccess }: ServiceProviderFormProps) => {
  const { addServiceProvider, updateServiceProvider } = useApp();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [notes, setNotes] = useState('');
  const [rating, setRating] = useState(0);
  const [categories, setCategories] = useState<Category[]>([]);
  
  // Initialize form with provider data if editing
  useEffect(() => {
    if (provider) {
      setName(provider.name);
      setPhone(provider.phone);
      setEmail(provider.email);
      setWebsite(provider.website);
      setNotes(provider.notes);
      setRating(provider.rating);
      setCategories(provider.category);
    }
  }, [provider]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (categories.length === 0) {
      toast({
        title: 'Validation Error',
        description: 'Please select at least one category.',
        variant: 'destructive'
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const providerData = {
        name,
        phone,
        email,
        website,
        notes,
        rating,
        category: categories,
      };
      
      if (provider) {
        // Update existing provider
        await updateServiceProvider({
          ...provider,
          ...providerData,
        });
        toast({
          title: 'Provider Updated',
          description: 'Service provider information has been updated successfully.',
        });
      } else {
        // Add new provider
        await addServiceProvider(providerData);
        toast({
          title: 'Provider Added',
          description: 'New service provider has been added successfully.',
        });
      }
      
      // Call the appropriate callback
      if (onSuccess) {
        onSuccess();
      } else if (onSave) {
        onSave();
      }
    } catch (error) {
      console.error('Error saving service provider:', error);
      toast({
        title: 'Error',
        description: 'There was an error saving the service provider information.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Function to toggle category selection
  const toggleCategory = (category: Category) => {
    setCategories(prev => {
      if (prev.includes(category)) {
        return prev.filter(c => c !== category);
      } else {
        return [...prev, category];
      }
    });
  };

  // Function to handle category selection from dropdown
  const handleCategorySelect = (value: string) => {
    const category = value as Category;
    if (!categories.includes(category)) {
      setCategories(prev => [...prev, category]);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label className="text-sm font-medium text-neo-text">Name*</Label>
        <Input 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          placeholder="Company or individual name" 
          required
          className="h-10 shadow-neo-inner bg-white text-sm"
        />
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-sm font-medium text-neo-text">Phone</Label>
          <Input 
            value={phone} 
            onChange={(e) => setPhone(e.target.value)} 
            placeholder="Contact phone number" 
            className="h-10 shadow-neo-inner bg-white text-sm"
            type="tel"
          />
        </div>
        
        <div className="space-y-2">
          <Label className="text-sm font-medium text-neo-text">Email</Label>
          <Input 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            placeholder="Contact email address" 
            className="h-10 shadow-neo-inner bg-white text-sm"
            type="email"
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label className="text-sm font-medium text-neo-text">Website</Label>
        <Input 
          value={website} 
          onChange={(e) => setWebsite(e.target.value)} 
          placeholder="Company website" 
          className="h-10 shadow-neo-inner bg-white text-sm"
          type="url"
        />
      </div>
      
      <div className="space-y-2">
        <Label className="text-sm font-medium text-neo-text">Categories*</Label>
        <div>
          <div className="flex flex-wrap gap-2 mb-3">
            {categories.map((cat) => (
              <Badge key={cat} variant="neo-default" className="text-brand-600 cursor-pointer" onClick={() => toggleCategory(cat)}>
                {cat} <span className="ml-1">×</span>
              </Badge>
            ))}
          </div>
          <Select onValueChange={handleCategorySelect}>
            <SelectTrigger className="h-10 rounded-xl shadow-neo-btn bg-white">
              <SelectValue placeholder="Add categories..." />
            </SelectTrigger>
            <SelectContent className="rounded-xl shadow-neo">
              {categoryOptions
                .filter(cat => !categories.includes(cat))
                .map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label className="text-sm font-medium text-neo-text">Rating (1-5)</Label>
        <div className="flex items-center space-x-3 mt-1">
          {[1, 2, 3, 4, 5].map(value => (
            <Button
              key={value}
              type="button"
              variant={value <= rating ? "neo-primary" : "neo"}
              size="sm"
              className="h-9 w-9 p-0"
              onClick={() => setRating(value)}
            >
              {value}
            </Button>
          ))}
        </div>
      </div>
      
      <div className="space-y-2">
        <Label className="text-sm font-medium text-neo-text">Notes</Label>
        <Textarea 
          value={notes} 
          onChange={(e) => setNotes(e.target.value)} 
          placeholder="Add any notes about the service provider..."
          className="min-h-[80px] text-sm resize-none rounded-xl shadow-neo-inner bg-white"
        />
      </div>
      
      <div className="flex justify-end space-x-3 pt-4">
        {onCancel && (
          <Button type="button" variant="neo" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" variant="neo-primary" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : provider ? 'Update Provider' : 'Add Provider'}
        </Button>
      </div>
    </form>
  );
};

export default ServiceProviderForm;
