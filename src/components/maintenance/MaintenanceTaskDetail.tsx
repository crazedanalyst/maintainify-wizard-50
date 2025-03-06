
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
import { Calendar, Clock, CheckCircle, FileText, Wrench, Trash, Edit, Plus, Tool, DollarSign, User } from 'lucide-react';
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
} from "@/components/ui/dialog";
import MaintenanceLogForm from './MaintenanceLogForm';

interface MaintenanceTaskDetailProps {
  task: MaintenanceTask;
  onEdit: () => void;
  onDelete: () => void;
}

const MaintenanceTaskDetail = ({ task, onEdit, onDelete }: MaintenanceTaskDetailProps) => {
  const { getMaintenanceLogsForTask, serviceProviders } = useApp();
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

  const getServiceProviderName = (id: string) => {
    const provider = serviceProviders.find(p => p.id === id);
    return provider ? provider.name : 'Unknown Provider';
  };

  return (
    <div className="space-y-6">
      <Card className="border-t-4" style={{ borderTopColor: task.category === 'HVAC' ? '#0ea5e9' : 
                                          task.category === 'Plumbing' ? '#22c55e' :
                                          task.category === 'Electrical' ? '#f59e0b' : 
                                          task.category === 'Appliances' ? '#8b5cf6' : '#64748b' }}>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <Badge className="mb-2" variant="outline">{task.category}</Badge>
              <CardTitle className="text-2xl">{task.title}</CardTitle>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={onEdit} className="h-8">
                <Edit className="h-3.5 w-3.5 mr-1" /> Edit
              </Button>
              <Button variant="outline" size="sm" onClick={confirmDelete} className="text-red-500 hover:text-red-700 h-8">
                <Trash className="h-3.5 w-3.5 mr-1" /> Delete
              </Button>
            </div>
          </div>
          {task.description && (
            <CardDescription className="text-base mt-2">{task.description}</CardDescription>
          )}
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border border-muted bg-muted/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-brand-500" /> Schedule Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-0">
                <div className="flex items-center text-sm">
                  <Clock className="h-4 w-4 mr-2 text-gray-500" />
                  <span className="text-gray-700 mr-1">Frequency:</span>
                  <span className="font-medium">{parseFrequencyText(task.frequency.value, task.frequency.unit)}</span>
                </div>
                <div className="flex items-center text-sm">
                  <Calendar className="h-4 w-4 mr-2 text-gray-500" />
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
              <CardFooter className="pt-2">
                <Button className="w-full" onClick={() => setIsShowingLogForm(true)}>
                  <CheckCircle className="h-4 w-4 mr-2" /> Mark as Completed
                </Button>
              </CardFooter>
            </Card>
            
            <Card className="border border-muted bg-muted/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium flex items-center">
                  <FileText className="h-4 w-4 mr-2 text-brand-500" /> Maintenance History
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                {logs.length > 0 ? (
                  <div className="space-y-3">
                    {logs.slice(0, 3).map((log) => (
                      <Card key={log.id} className="overflow-hidden border-0 shadow-sm bg-white">
                        <div className="px-3 py-2">
                          <div className="flex justify-between items-center mb-1">
                            <div className="flex items-center gap-1 text-sm font-medium">
                              <Calendar className="h-3.5 w-3.5 text-gray-500" />
                              {formatDate(log.completedDate)}
                            </div>
                            <Badge variant="outline" className="font-mono">
                              <DollarSign className="h-3 w-3 mr-0.5" />
                              {formatCurrency(log.cost)}
                            </Badge>
                          </div>
                          
                          {log.serviceProviderId && (
                            <div className="flex items-center text-xs text-gray-600 mb-1">
                              <User className="h-3 w-3 mr-1" />
                              {getServiceProviderName(log.serviceProviderId)}
                            </div>
                          )}
                          
                          {log.notes && (
                            <p className="text-xs text-gray-600 mt-1 line-clamp-2">{log.notes}</p>
                          )}
                        </div>
                      </Card>
                    ))}
                    {logs.length > 3 && (
                      <Button variant="link" className="p-0 h-auto">
                        View all {logs.length} entries
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    <FileText className="h-8 w-8 mx-auto mb-2 opacity-40" />
                    <p>No maintenance history yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
      
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
