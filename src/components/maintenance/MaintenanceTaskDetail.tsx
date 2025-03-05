
import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { MaintenanceTask, MaintenanceLog } from '@/lib/db-service';
import { 
  formatDate, 
  formatCurrency, 
  parseFrequencyText, 
  getRelativeTime 
} from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, CheckCircle, FileText, Tool, Trash, Edit, Plus } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import MaintenanceLogForm from './MaintenanceLogForm';

interface MaintenanceTaskDetailProps {
  task: MaintenanceTask;
  onEdit: () => void;
  onDelete: () => void;
}

const MaintenanceTaskDetail = ({ task, onEdit, onDelete }: MaintenanceTaskDetailProps) => {
  const { getMaintenanceLogsForTask } = useApp();
  const [isShowingLogForm, setIsShowingLogForm] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  
  const logs = getMaintenanceLogsForTask(task.id);
  
  // Get the priority level based on due date
  const getDueDateClass = () => {
    const now = Date.now();
    const daysUntilDue = Math.floor((task.nextDue - now) / (1000 * 60 * 60 * 24));
    
    if (daysUntilDue < 0) return 'text-red-600';
    if (daysUntilDue < 7) return 'text-orange-600';
    if (daysUntilDue < 30) return 'text-yellow-600';
    return 'text-green-600';
  };
  
  const handleLogComplete = () => {
    setIsShowingLogForm(false);
    toast({
      title: 'Task completed',
      description: 'The maintenance task has been marked as completed.'
    });
  };
  
  const confirmDelete = () => {
    setIsConfirmingDelete(true);
  };
  
  const handleDelete = () => {
    onDelete();
    setIsConfirmingDelete(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold">{task.title}</h2>
          <p className="text-gray-500">{task.category}</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={onEdit}>
            <Edit className="h-4 w-4 mr-1" /> Edit
          </Button>
          <Button variant="outline" size="sm" onClick={confirmDelete} className="text-red-500 hover:text-red-700">
            <Trash className="h-4 w-4 mr-1" /> Delete
          </Button>
        </div>
      </div>
      
      <p className="text-gray-700">{task.description}</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Schedule Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center text-sm">
              <Calendar className="h-4 w-4 mr-2 text-gray-500" />
              <span className="text-gray-700 mr-1">Frequency:</span>
              <span className="font-medium">{parseFrequencyText(task.frequency.value, task.frequency.unit)}</span>
            </div>
            <div className="flex items-center text-sm">
              <Clock className="h-4 w-4 mr-2 text-gray-500" />
              <span className="text-gray-700 mr-1">Next due:</span>
              <span className={`font-medium ${getDueDateClass()}`}>
                {formatDate(task.nextDue)} ({getRelativeTime(task.nextDue)})
              </span>
            </div>
            {task.lastCompleted && (
              <div className="flex items-center text-sm">
                <CheckCircle className="h-4 w-4 mr-2 text-gray-500" />
                <span className="text-gray-700 mr-1">Last completed:</span>
                <span className="font-medium">{formatDate(task.lastCompleted)}</span>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={() => setIsShowingLogForm(true)}>
              <CheckCircle className="h-4 w-4 mr-2" /> Mark as Completed
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Maintenance History</CardTitle>
          </CardHeader>
          <CardContent>
            {logs.length > 0 ? (
              <div className="space-y-3">
                {logs.slice(0, 3).map((log) => (
                  <div key={log.id} className="text-sm border-b pb-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{formatDate(log.completedDate)}</span>
                      <Badge variant="outline">{formatCurrency(log.cost)}</Badge>
                    </div>
                    <p className="text-gray-500 mt-1 line-clamp-2">{log.notes}</p>
                  </div>
                ))}
                {logs.length > 3 && (
                  <Button variant="link" className="p-0 h-auto">
                    View all {logs.length} entries
                  </Button>
                )}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">
                <FileText className="h-8 w-8 mx-auto mb-2 opacity-40" />
                <p>No maintenance history yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Mark as Completed Dialog */}
      <Dialog open={isShowingLogForm} onOpenChange={setIsShowingLogForm}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Complete Maintenance Task</DialogTitle>
            <DialogDescription>
              Record details about the completed maintenance task.
            </DialogDescription>
          </DialogHeader>
          <MaintenanceLogForm 
            taskId={task.id} 
            propertyId={task.propertyId} 
            onComplete={handleLogComplete} 
            onCancel={() => setIsShowingLogForm(false)} 
          />
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isConfirmingDelete} onOpenChange={setIsConfirmingDelete}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this maintenance task? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsConfirmingDelete(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete Task</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MaintenanceTaskDetail;
