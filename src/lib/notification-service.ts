
import { toast } from "@/hooks/use-toast";

// Simple notification service
class NotificationService {
  // Request permission for browser notifications
  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return false;
    }
    
    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }
  
  // Check if notification permission is granted
  hasPermission(): boolean {
    return 'Notification' in window && Notification.permission === 'granted';
  }
  
  // Show a browser notification
  showNotification(title: string, options?: NotificationOptions): void {
    if (this.hasPermission()) {
      try {
        new Notification(title, options);
      } catch (error) {
        console.error('Error showing notification:', error);
        // Fallback to toast notification
        this.showToast(title, options?.body || '');
      }
    } else {
      // Fallback to toast notification
      this.showToast(title, options?.body || '');
    }
  }
  
  // Show a toast notification
  showToast(title: string, description?: string): void {
    toast({
      title,
      description,
      duration: 5000,
    });
  }
  
  // Schedule a notification for a future time
  scheduleNotification(title: string, options: NotificationOptions, scheduledTime: number): void {
    const now = Date.now();
    const delay = scheduledTime - now;
    
    if (delay <= 0) {
      // If the scheduled time is in the past, show immediately
      this.showNotification(title, options);
      return;
    }
    
    // Schedule the notification
    setTimeout(() => {
      this.showNotification(title, options);
    }, delay);
  }
}

// Create a singleton instance
const notificationService = new NotificationService();

export default notificationService;
