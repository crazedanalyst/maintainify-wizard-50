
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, addDays, addWeeks, addMonths, addYears, formatDistanceToNow } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format a date as a readable string
export function formatDate(date: Date | number): string {
  return format(date, 'MMM d, yyyy');
}

// Format a date with time
export function formatDateTime(date: Date | number): string {
  return format(date, 'MMM d, yyyy h:mm a');
}

// Get relative time (e.g. "2 days ago", "in 3 months")
export function getRelativeTime(date: Date | number): string {
  return formatDistanceToNow(date, { addSuffix: true });
}

// Add time to a date based on frequency
export function addTimeToDate(date: Date | number, value: number, unit: 'days' | 'weeks' | 'months' | 'years'): Date {
  const dateObj = typeof date === 'number' ? new Date(date) : date;
  
  switch (unit) {
    case 'days':
      return addDays(dateObj, value);
    case 'weeks':
      return addWeeks(dateObj, value);
    case 'months':
      return addMonths(dateObj, value);
    case 'years':
      return addYears(dateObj, value);
    default:
      return dateObj;
  }
}

// Generate a unique ID
export function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

// Format currency
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

// Truncate text with ellipsis
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

// Convert base64 to blob
export function base64ToBlob(base64: string, mimeType: string): Blob {
  const byteCharacters = atob(base64.split(',')[1]);
  const byteArrays = [];

  for (let i = 0; i < byteCharacters.length; i += 512) {
    const slice = byteCharacters.slice(i, i + 512);
    const byteNumbers = new Array(slice.length);
    
    for (let j = 0; j < slice.length; j++) {
      byteNumbers[j] = slice.charCodeAt(j);
    }
    
    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }

  return new Blob(byteArrays, { type: mimeType });
}

// Parse frequency text
export function parseFrequencyText(value: number, unit: 'days' | 'weeks' | 'months' | 'years'): string {
  if (value === 1) {
    // Remove the 's' for singular units
    return `Every ${unit.substring(0, unit.length - 1)}`;
  }
  return `Every ${value} ${unit}`;
}

// Get priority level based on due date
export function getPriorityLevel(dueDate: number): 'low' | 'medium' | 'high' | 'overdue' {
  const now = Date.now();
  const daysUntilDue = Math.floor((dueDate - now) / (1000 * 60 * 60 * 24));
  
  if (daysUntilDue < 0) return 'overdue';
  if (daysUntilDue < 7) return 'high';
  if (daysUntilDue < 30) return 'medium';
  return 'low';
}

// Get color for priority level
export function getPriorityColor(priority: 'low' | 'medium' | 'high' | 'overdue'): string {
  switch (priority) {
    case 'low':
      return 'bg-green-100 text-green-800';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800';
    case 'high':
      return 'bg-orange-100 text-orange-800';
    case 'overdue':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

// Group tasks by priority
export function groupTasksByPriority(tasks: any[]): Record<string, any[]> {
  return tasks.reduce((acc, task) => {
    const priority = getPriorityLevel(task.nextDue);
    if (!acc[priority]) acc[priority] = [];
    acc[priority].push(task);
    return acc;
  }, {} as Record<string, any[]>);
}

// Check if a string is a valid URL
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
}
