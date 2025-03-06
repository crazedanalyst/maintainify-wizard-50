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
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Check, ChevronsUpDown } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

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
  const [openCategories, setOpenCategories] = useState(false);
  
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

  const toggleCategory = (category: Category) => {
    if (categories.includes(category)) {
      setCategories(categories.filter(c => c !== category));
    } else {
      setCategories([...categories, category]);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="text-xs font-medium">Name*</label>
        <Input 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          placeholder="Company or individual name" 
          required
          className="h-8 text-xs mt-1"
        />
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium">Phone</label>
          <Input 
            value={phone} 
            onChange={(e) => setPhone(e.target.value)} 
            placeholder="Contact phone number" 
            className="h-8 text-xs mt-1"
            type="tel"
          />
        </div>
        
        <div>
          <label className="text-xs font-medium">Email</label>
          <Input 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            placeholder="Contact email address" 
            className="h-8 text-xs mt-1"
            type="email"
          />
        </div>
      </div>
      
      <div>
        <label className="text-xs font-medium">Website</label>
        <Input 
          value={website} 
          onChange={(e) => setWebsite(e.target.value)} 
          placeholder="Company website" 
          className="h-8 text-xs mt-1"
          type="url"
        />
      </div>
      
      <div>
        <label className="text-xs font-medium">Categories*</label>
        <Popover open={openCategories} onOpenChange={setOpenCategories}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={openCategories}
              className="w-full justify-between h-8 text-xs mt-1"
            >
              {categories.length > 0
                ? `${categories.length} selected`
                : "Select categories..."}
              <ChevronsUpDown className="ml-2 h-3 w-3 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0">
            <Command>
              <CommandInput placeholder="Search categories..." className="text-xs h-8" />
              <CommandEmpty>No category found.</CommandEmpty>
              <CommandGroup className="max-h-40 overflow-auto">
                {categoryOptions.map(category => (
                  <CommandItem
                    key={category}
                    value={category}
                    onSelect={() => toggleCategory(category)}
                    className="text-xs"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-3 w-3",
                        categories.includes(category) ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {category}
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
      
      <div>
        <label className="text-xs font-medium">Rating (1-5)</label>
        <div className="flex items-center space-x-2 mt-1">
          {[1, 2, 3, 4, 5].map(value => (
            <Button
              key={value}
              type="button"
              variant={value <= rating ? "default" : "outline"}
              size="sm"
              className="h-7 w-7 p-0"
              onClick={() => setRating(value)}
            >
              {value}
            </Button>
          ))}
        </div>
      </div>
      
      <div>
        <label className="text-xs font-medium">Notes</label>
        <Textarea 
          value={notes} 
          onChange={(e) => setNotes(e.target.value)} 
          placeholder="Add any notes about the service provider..."
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
          {isSubmitting ? 'Saving...' : provider ? 'Update Provider' : 'Add Provider'}
        </Button>
      </div>
    </form>
  );
};

export default ServiceProviderForm;
