
import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { formatDate } from '@/lib/utils';
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
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage 
} from '@/components/ui/form';

interface MaintenanceLogFormProps {
  taskId: string;
  propertyId: string;
  onComplete?: () => void;
  onCancel?: () => void;
}

const MaintenanceLogForm = ({ taskId, propertyId, onComplete, onCancel }: MaintenanceLogFormProps) => {
  const { completeMaintenanceTask, serviceProviders } = useApp();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [completedDate, setCompletedDate] = useState<Date>(new Date());
  const [cost, setCost] = useState('0.00');
  const [notes, setNotes] = useState('');
  const [serviceProviderId, setServiceProviderId] = useState<string | null>(null);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);
      
      // Convert cost to number, defaulting to 0 if invalid
      const costValue = parseFloat(cost) || 0;
      
      await completeMaintenanceTask(taskId, {
        taskId, // Add the missing taskId property
        propertyId,
        completedDate: completedDate.getTime(),
        cost: costValue,
        notes,
        serviceProviderId,
        documents: [],
      });
      
      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      console.error('Error completing task:', error);
      toast({
        title: 'Error',
        description: 'There was an error recording the maintenance completion.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <FormItem className="col-span-1">
          <FormLabel className="text-xs">Completion Date</FormLabel>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "w-full justify-start text-left font-normal text-xs h-8",
                  !completedDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-1 h-3 w-3" />
                {completedDate ? formatDate(completedDate) : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={completedDate}
                onSelect={(date) => date && setCompletedDate(date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </FormItem>

        <FormItem className="col-span-1">
          <FormLabel className="text-xs">Cost ($)</FormLabel>
          <FormControl>
            <Input 
              type="number" 
              value={cost} 
              onChange={(e) => setCost(e.target.value)} 
              placeholder="0.00" 
              step="0.01"
              min="0"
              className="h-8 text-xs"
            />
          </FormControl>
        </FormItem>
      </div>

      <FormItem>
        <FormLabel className="text-xs">Service Provider</FormLabel>
        <Select 
          value={serviceProviderId || ''} 
          onValueChange={(value) => setServiceProviderId(value || null)}
        >
          <SelectTrigger className="h-8 text-xs">
            <SelectValue placeholder="Select a service provider (optional)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="" className="text-xs">None</SelectItem>
            {serviceProviders.map((provider) => (
              <SelectItem key={provider.id} value={provider.id} className="text-xs">{provider.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormItem>

      <FormItem>
        <FormLabel className="text-xs">Notes</FormLabel>
        <FormControl>
          <Textarea 
            value={notes} 
            onChange={(e) => setNotes(e.target.value)} 
            placeholder="Add any notes about the maintenance work..."
            className="min-h-[60px] text-xs resize-none"
          />
        </FormControl>
      </FormItem>

      <div className="flex justify-end space-x-2 pt-2">
        {onCancel && (
          <Button type="button" variant="outline" size="sm" onClick={onCancel} className="h-8 text-xs">
            Cancel
          </Button>
        )}
        <Button type="submit" size="sm" className="h-8 text-xs" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Complete Task'}
        </Button>
      </div>
    </form>
  );
};

export default MaintenanceLogForm;
