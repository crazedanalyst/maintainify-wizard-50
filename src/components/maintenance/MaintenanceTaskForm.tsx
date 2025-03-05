
import { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { Category, MaintenanceTask } from '@/lib/db-service';
import { addTimeToDate, formatDate } from '@/lib/utils';
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage 
} from '@/components/ui/form';
import { toast } from '@/hooks/use-toast';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

// List of available maintenance categories
const CATEGORIES: Category[] = [
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

// Frequency options
const FREQUENCY_UNITS = [
  { value: 'days', label: 'Days' },
  { value: 'weeks', label: 'Weeks' },
  { value: 'months', label: 'Months' },
  { value: 'years', label: 'Years' }
];

interface MaintenanceTaskFormProps {
  initialData?: MaintenanceTask;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const MaintenanceTaskForm = ({ initialData, onSuccess, onCancel }: MaintenanceTaskFormProps) => {
  const { selectedProperty, addMaintenanceTask, updateMaintenanceTask } = useApp();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [category, setCategory] = useState<Category>(initialData?.category || 'Home');
  const [frequencyValue, setFrequencyValue] = useState(initialData?.frequency.value.toString() || '3');
  const [frequencyUnit, setFrequencyUnit] = useState<'days' | 'weeks' | 'months' | 'years'>(
    initialData?.frequency.unit || 'months'
  );
  const [nextDueDate, setNextDueDate] = useState<Date>(
    initialData?.nextDue ? new Date(initialData.nextDue) : addTimeToDate(new Date(), 3, 'months')
  );
  
  const isEditing = Boolean(initialData);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedProperty) {
      toast({
        title: 'No property selected',
        description: 'Please select a property before adding a maintenance task.',
        variant: 'destructive'
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const taskData = {
        propertyId: selectedProperty.id,
        title,
        description,
        category,
        frequency: {
          value: parseInt(frequencyValue, 10),
          unit: frequencyUnit,
        },
        lastCompleted: initialData?.lastCompleted || null,
        nextDue: nextDueDate.getTime(),
      };
      
      if (isEditing && initialData) {
        await updateMaintenanceTask({
          ...initialData,
          ...taskData,
        });
        toast({
          title: 'Task updated',
          description: 'The maintenance task has been updated successfully.'
        });
      } else {
        await addMaintenanceTask(taskData);
        toast({
          title: 'Task added',
          description: 'The maintenance task has been added successfully.'
        });
      }
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error saving task:', error);
      toast({
        title: 'Error',
        description: 'There was an error saving the maintenance task.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormItem>
        <FormLabel>Task Name</FormLabel>
        <FormControl>
          <Input 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            placeholder="e.g. Replace HVAC Filter" 
            required
          />
        </FormControl>
      </FormItem>

      <FormItem>
        <FormLabel>Description</FormLabel>
        <FormControl>
          <Textarea 
            value={description} 
            onChange={(e) => setDescription(e.target.value)} 
            placeholder="Describe the maintenance task..." 
            className="min-h-[100px]"
          />
        </FormControl>
      </FormItem>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormItem>
          <FormLabel>Category</FormLabel>
          <Select 
            value={category} 
            onValueChange={(value: Category) => setCategory(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormItem>

        <div className="flex flex-col space-y-1.5">
          <FormLabel>Repeat Every</FormLabel>
          <div className="flex space-x-2">
            <Input 
              type="number" 
              value={frequencyValue} 
              onChange={(e) => setFrequencyValue(e.target.value)} 
              min="1" 
              className="w-20"
              required
            />
            <Select 
              value={frequencyUnit} 
              onValueChange={(value: 'days' | 'weeks' | 'months' | 'years') => setFrequencyUnit(value)}
            >
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Select unit" />
              </SelectTrigger>
              <SelectContent>
                {FREQUENCY_UNITS.map((unit) => (
                  <SelectItem key={unit.value} value={unit.value}>{unit.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <FormItem>
        <FormLabel>Next Due Date</FormLabel>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !nextDueDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {nextDueDate ? formatDate(nextDueDate) : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={nextDueDate}
              onSelect={(date) => date && setNextDueDate(date)}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </FormItem>

      <div className="flex justify-end space-x-2 pt-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : isEditing ? 'Update Task' : 'Add Task'}
        </Button>
      </div>
    </form>
  );
};

export default MaintenanceTaskForm;
