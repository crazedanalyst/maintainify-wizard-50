
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
        taskId,
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
      
      toast({
        title: "Task completed",
        description: "The maintenance task has been completed successfully."
      });
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Completion Date</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !completedDate && "text-muted-foreground"
                )}
                type="button"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
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
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Cost ($)</label>
          <Input 
            type="number" 
            value={cost} 
            onChange={(e) => setCost(e.target.value)} 
            placeholder="0.00" 
            step="0.01"
            min="0"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Service Provider</label>
        <Select 
          value={serviceProviderId || undefined} 
          onValueChange={(value) => setServiceProviderId(value || null)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a service provider (optional)" />
          </SelectTrigger>
          <SelectContent>
            {/* Fix empty string value issue by using "none" string instead */}
            <SelectItem value="none">None</SelectItem>
            {serviceProviders.map((provider) => (
              <SelectItem key={provider.id} value={provider.id}>{provider.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Notes</label>
        <Textarea 
          value={notes} 
          onChange={(e) => setNotes(e.target.value)} 
          placeholder="Add any notes about the maintenance work..."
          className="min-h-[100px] resize-none"
        />
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting} className="bg-brand-500 hover:bg-brand-600">
          {isSubmitting ? 'Saving...' : 'Complete Task'}
        </Button>
      </div>
    </form>
  );
};

export default MaintenanceLogForm;
