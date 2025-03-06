
import { useState, useEffect, useRef } from 'react';
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
import { CalendarIcon, Upload, Loader2, FileText } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn, formatDate } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

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
  const [isProcessingOCR, setIsProcessingOCR] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Form state
  const [itemName, setItemName] = useState('');
  const [manufacturer, setManufacturer] = useState('');
  const [category, setCategory] = useState<Category>('Home');
  const [description, setDescription] = useState('');
  const [purchaseDate, setPurchaseDate] = useState<Date | undefined>(new Date());
  const [expiryDate, setExpiryDate] = useState<Date | undefined>(new Date());
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [documents, setDocuments] = useState<string[]>([]);
  
  // Initialize form with warranty data if editing
  useEffect(() => {
    if (warranty) {
      setItemName(warranty.itemName);
      setManufacturer(warranty.manufacturer);
      setCategory(warranty.category);
      setDescription(warranty.description);
      setPurchaseDate(new Date(warranty.purchaseDate));
      setExpiryDate(new Date(warranty.expiryDate));
      setDocuments(warranty.documents || []);
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
      
      // Simulate document upload
      let updatedDocuments = [...documents];
      if (documentFile) {
        // In a real app, this would upload the file to a storage service
        const fakeStorageUrl = `documents/${Date.now()}_${documentFile.name}`;
        updatedDocuments.push(fakeStorageUrl);
      }
      
      const warrantyData = {
        propertyId: selectedProperty.id,
        itemName,
        manufacturer,
        category,
        description,
        purchaseDate: purchaseDate.getTime(),
        expiryDate: expiryDate.getTime(),
        documents: updatedDocuments,
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setDocumentFile(file);
    processOCR(file);
  };

  const processOCR = async (file: File) => {
    setIsProcessingOCR(true);
    
    try {
      // Simulate OCR processing
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In a real app, we would send the file to an OCR service and process the results
      // Here we're just simulating the extraction of some plausible data
      
      // Only populate fields that are still empty
      if (!itemName) setItemName('Smart Refrigerator X5');
      if (!manufacturer) setManufacturer('CoolTech Appliances');
      if (!description) setDescription('5-year extended warranty covering parts and labor for all mechanical and electrical failures.');
      
      // Set realistic dates if they're at the default values
      const today = new Date();
      const purchaseDateIsDefault = purchaseDate && 
        purchaseDate.getDate() === today.getDate() &&
        purchaseDate.getMonth() === today.getMonth() &&
        purchaseDate.getFullYear() === today.getFullYear();
      
      if (purchaseDateIsDefault) {
        const simulatedPurchaseDate = new Date();
        simulatedPurchaseDate.setMonth(simulatedPurchaseDate.getMonth() - 1);
        setPurchaseDate(simulatedPurchaseDate);
      }
      
      const expiryDateIsDefault = expiryDate && 
        expiryDate.getDate() === today.getDate() &&
        expiryDate.getMonth() === today.getMonth() &&
        expiryDate.getFullYear() === today.getFullYear();
      
      if (expiryDateIsDefault) {
        const simulatedExpiryDate = new Date();
        simulatedExpiryDate.setFullYear(simulatedExpiryDate.getFullYear() + 5);
        setExpiryDate(simulatedExpiryDate);
      }
      
      toast({
        title: 'Document Processed',
        description: 'Information has been extracted from the document.',
      });
    } catch (error) {
      console.error('OCR processing error:', error);
      toast({
        title: 'OCR Error',
        description: 'Could not extract information from the document.',
        variant: 'destructive'
      });
    } finally {
      setIsProcessingOCR(false);
    }
  };

  const handleRemoveDocument = (index: number) => {
    setDocuments(prev => prev.filter((_, i) => i !== index));
    setDocumentFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
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
                className={cn("p-3 pointer-events-auto")}
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
                className={cn("p-3 pointer-events-auto")}
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
      
      <div>
        <label className="text-xs font-medium">Warranty Document</label>
        <div className="mt-1 flex items-center space-x-2">
          <Input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.png,.jpg,.jpeg"
            onChange={handleFileUpload}
            className="text-xs h-8"
          />
          <Button 
            type="button" 
            size="sm" 
            variant="secondary" 
            className="h-8 text-xs"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-3 w-3 mr-1" />
            Browse
          </Button>
        </div>
        
        {isProcessingOCR && (
          <div className="mt-2 flex items-center space-x-2 text-xs text-blue-600">
            <Loader2 className="h-3 w-3 animate-spin" />
            <span>Processing document with OCR...</span>
          </div>
        )}
        
        {documentFile && (
          <div className="mt-2 flex items-center justify-between bg-blue-50 p-2 rounded-md">
            <div className="flex items-center space-x-2">
              <FileText className="h-4 w-4 text-blue-500" />
              <span className="text-xs">{documentFile.name}</span>
              <Badge variant="outline" className="text-xs bg-blue-100">New</Badge>
            </div>
            <Button 
              type="button" 
              variant="ghost" 
              size="sm" 
              className="h-6 w-6 p-0 rounded-full text-gray-400 hover:text-red-500"
              onClick={() => setDocumentFile(null)}
            >
              ×
            </Button>
          </div>
        )}
        
        {documents.length > 0 && (
          <div className="mt-2 space-y-2">
            {documents.map((doc, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4 text-gray-500" />
                  <span className="text-xs">
                    {doc.split('/').pop() || `Document ${index + 1}`}
                  </span>
                </div>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 w-6 p-0 rounded-full text-gray-400 hover:text-red-500"
                  onClick={() => handleRemoveDocument(index)}
                >
                  ×
                </Button>
              </div>
            ))}
          </div>
        )}
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
