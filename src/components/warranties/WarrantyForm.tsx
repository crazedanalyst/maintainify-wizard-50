
import { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { Warranty, Category } from '@/lib/db-service';
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
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn, formatDate } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

interface WarrantyFormProps {
  warranty?: Warranty;
  onSave?: () => void;
  onCancel?: () => void;
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

const WarrantyForm = ({ warranty, onSave, onCancel }: WarrantyFormProps) => {
  const { selectedProperty, addWarranty, updateWarranty } = useApp();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [itemName, setItemName] = useState('');
  const [manufacturer, setManufacturer] = useState('');
  const [category, setCategory] = useState<Category>('Home');
  const [description, setDescription] = useState('');
  const [purchaseDate, setPurchaseDate] = useState<Date | undefined>(new Date());
  const [expiryDate, setExpiryDate] = useState<Date | undefined>(new Date());
  
  // Initialize form with warranty data if editing
  useEffect(() => {
    if (warranty) {
      setItemName(warranty.itemName);
      setManufacturer(warranty.manufacturer);
      setCategory(warranty.category);
      setDescription(warranty.description);
      setPurchaseDate(new Date(warranty.purchaseDate));
      setExpiryDate(new Date(warranty.expiryDate));
    }
  }, [warranty]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedProperty || !purchaseDate || !expiryDate) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields.',
        variant: 'destructive'
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const warrantyData = {
        propertyId: selectedProperty.id,
        itemName,
        manufacturer,
        category,
        description,
        purchaseDate: purchaseDate.getTime(),
        expiryDate: expiryDate.getTime(),
        documents: warranty?.documents || [],
      };
      
      if (warranty) {
        await updateWarranty({
          ...warranty,
          ...warrantyData,
        });
        toast({
          title: 'Warranty Updated',
          description: 'Warranty information has been updated successfully.',
        });
      } else {
        await addWarranty(warrantyData);
        toast({
          title: 'Warranty Added',
          description: 'New warranty has been added successfully.',
        });
      }
      
      if (onSave) {
        onSave();
      }
    } catch (error) {
      console.error('Error saving warranty:', error);
      toast({
        title: 'Error',
        description: 'There was an error saving the warranty information.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium">Item Name*</label>
          <Input 
            value={itemName} 
            onChange={(e) => setItemName(e.target.value)} 
            placeholder="e.g. Refrigerator, TV, Roof" 
            required
            className="h-8 text-xs mt-1"
          />
        </div>
        
        <div>
          <label className="text-xs font-medium">Manufacturer*</label>
          <Input 
            value={manufacturer} 
            onChange={(e) => setManufacturer(e.target.value)} 
            placeholder="e.g. Samsung, LG, CertainTeed" 
            required
            className="h-8 text-xs mt-1"
          />
        </div>
      </div>
      
      <div>
        <label className="text-xs font-medium">Category*</label>
        <Select 
          value={category} 
          onValueChange={(value) => setCategory(value as Category)}
          required
        >
          <SelectTrigger className="h-8 text-xs mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {categoryOptions.map(option => (
              <SelectItem key={option} value={option} className="text-xs">{option}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium">Purchase Date*</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "w-full justify-start text-left font-normal text-xs h-8 mt-1",
                  !purchaseDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-1 h-3 w-3" />
                {purchaseDate ? formatDate(purchaseDate) : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={purchaseDate}
                onSelect={setPurchaseDate}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>
        
        <div>
          <label className="text-xs font-medium">Expiry Date*</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "w-full justify-start text-left font-normal text-xs h-8 mt-1",
                  !expiryDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-1 h-3 w-3" />
                {expiryDate ? formatDate(expiryDate) : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={expiryDate}
                onSelect={setExpiryDate}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
      
      <div>
        <label className="text-xs font-medium">Description</label>
        <Textarea 
          value={description} 
          onChange={(e) => setDescription(e.target.value)} 
          placeholder="Add details about the warranty coverage..."
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
          {isSubmitting ? 'Saving...' : warranty ? 'Update Warranty' : 'Add Warranty'}
        </Button>
      </div>
    </form>
  );
};

export default WarrantyForm;
