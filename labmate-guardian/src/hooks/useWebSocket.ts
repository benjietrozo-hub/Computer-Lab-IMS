import { useState, useEffect, useRef } from 'react';

type Notification = {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read?: boolean;
  actionUrl?: string;
  type?: string;
};

type WebSocketHook = {
  notifications: Notification[];
  unreadCount: number;
  isConnected: boolean;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  loadMoreNotifications: () => void;
  hasMoreNotifications: boolean;
  totalNotifications: number;
  removeNotification: (notificationId: string) => void;
  clearAllNotifications: () => void;
};

type Subscriber = (notifications: Notification[]) => void;

let sharedNotifications: Notification[] = [];
const subscribers = new Set<Subscriber>();

const notifySubscribers = () => {
  subscribers.forEach((subscriber) => subscriber(sharedNotifications));
};

const setSharedNotifications = (updater: (prev: Notification[]) => Notification[]) => {
  sharedNotifications = updater(sharedNotifications);
  notifySubscribers();
};

export const useWebSocket = (userId: string, userRole: string): WebSocketHook => {
  const [notifications, setNotifications] = useState<Notification[]>(sharedNotifications);
  const [isConnected, setIsConnected] = useState(false);
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    subscribers.add(setNotifications);
    setNotifications(sharedNotifications);
    return () => {
      subscribers.delete(setNotifications);
    };
  }, []);

  // Load persisted notifications when user changes
  useEffect(() => {
    if (!userId) return;
    loadPersistedNotifications();
  }, [userId]);

  // Initialize WebSocket connection
  useEffect(() => {
    if (!userId) return;

    const wsUrl = `ws://localhost:8082?userId=${userId}&role=${userRole}`;
    
    try {
      ws.current = new WebSocket(wsUrl);

      ws.current.onopen = () => {
        setIsConnected(true);
        console.log('WebSocket connected');
        // Send identification message to server
        ws.current?.send(JSON.stringify({
          type: 'identify',
          userId: userId,
          role: userRole
        }));
      };

      ws.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('Received WebSocket message:', data);
          
          if (data.type === 'notification') {
            const notification = data.payload || data.notification;
            
            // Handle role change notifications specially
            if (notification.type === 'role_change') {
              console.log('Role change notification received:', notification);
              
              // Force refresh user data from localStorage
              const storedUser = typeof window !== "undefined" ? localStorage.getItem("user") : null;
              const currentUser = storedUser ? JSON.parse(storedUser) : null;
              
              console.log('Current user from localStorage:', currentUser);
              
              if (currentUser) {
                // Get the new role from notification data or message
                let newRole = notification.data?.new_role;
                
                // If new_role is not in data, try to extract it from message
                if (!newRole && notification.message) {
                  const roleMatch = notification.message.match(/to (\w+)$/);
                  if (roleMatch) {
                    newRole = roleMatch[1];
                  }
                }
                
                console.log('New role extracted:', newRole);
                
                if (newRole) {
                  // Update the user's role in localStorage
                  const updatedUser = {
                    ...currentUser,
                    role: newRole === 'student' ? 'user' : newRole,
                  };
                  
                  console.log('Updated user object:', updatedUser);
                  
                  localStorage.setItem("user", JSON.stringify(updatedUser));
                  
                  // Trigger storage event for other tabs
                  window.dispatchEvent(new StorageEvent('storage', {
                    key: 'user',
                    newValue: JSON.stringify(updatedUser),
                    oldValue: storedUser
                  }));
                  
                  // Force page reload after a short delay to show the notification
                  setTimeout(() => {
                    console.log('Reloading page due to role change');
                    window.location.reload();
                  }, 2000);
                } else {
                  console.error('Could not extract new role from notification');
                }
              }
            }
            
            setSharedNotifications(prev => [
              {
                title: notification.title || 'Notification',
                message: notification.message || '',
                timestamp: notification.timestamp || new Date().toISOString(),
                id: notification.id || Date.now().toString(),
                read: false,
                actionUrl: notification.actionUrl,
                type: notification.type
              },
              ...prev
            ]);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.current.onclose = () => {
        setIsConnected(false);
        console.log('WebSocket disconnected');
      };

      ws.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setIsConnected(false);
      };
    } catch (error) {
      console.error('Error creating WebSocket connection:', error);
    }

    return () => {
      if (ws.current) {
        ws.current.close();
        ws.current = null;
      }
    };
  }, [userId, userRole]);

  const loadPersistedNotifications = async () => {
    try {
      const response = await fetch(`http://localhost/labmate/labmate-guardian/api/notifications.php?user_id=${userId}&limit=50`);
      const result = await response.json();
      
      if (result.success) {
        const persistedNotifications = result.data.map((notif: any) => ({
          title: notif.title,
          message: notif.message,
          timestamp: notif.created_at,
          id: notif.id,
          read: notif.read_status,
          actionUrl: notif.action_url,
          type: notif.type
        }));
        setSharedNotifications(() => persistedNotifications);
      }
    } catch (error) {
      console.error('Error loading persisted notifications:', error);
    }
  };

  const markAsRead = async (notificationId: string) => {
    // Update database first
    try {
      const response = await fetch(`http://localhost/labmate/labmate-guardian/api/notifications.php?id=${notificationId}&action=mark_read`, {
        method: 'PUT'
      });
      
      if (response.ok) {
        setSharedNotifications(prev => 
          prev.map(notification => 
            notification.id === notificationId 
              ? { ...notification, read: true }
              : notification
          )
        );
      } else {
        console.error('Failed to mark notification as read in database');
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    // Update database first
    try {
      const response = await fetch(`http://localhost/labmate/labmate-guardian/api/notifications.php?user_id=${userId}&action=mark_all_read`, {
        method: 'PUT'
      });
      
      if (response.ok) {
        setSharedNotifications(prev => 
          prev.map(notification => ({ ...notification, read: true }))
        );
      } else {
        console.error('Failed to mark all notifications as read in database');
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const removeNotification = async (notificationId: string) => {
    // Update database first
    try {
      const response = await fetch(`http://localhost/labmate/labmate-guardian/api/notifications.php?id=${notificationId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        setSharedNotifications(prev => 
          prev.filter(notification => notification.id !== notificationId)
        );
      } else {
        console.error('Failed to delete notification in database');
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const clearAllNotifications = async () => {
    // Update database first
    try {
      const response = await fetch(`http://localhost/labmate/labmate-guardian/api/notifications.php?user_id=${userId}&action=clear_all`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        setSharedNotifications(() => []);
      } else {
        console.error('Failed to clear all notifications in database');
      }
    } catch (error) {
      console.error('Error clearing all notifications:', error);
    }
  };

  const loadMoreNotifications = () => {
    // Placeholder for loading more notifications from server
    console.log('Loading more notifications...');
  };

  const hasMoreNotifications = false; // Placeholder
  const totalNotifications = notifications.length;
  const unreadCount = notifications.filter(n => !n.read).length;

  return {
    notifications,
    unreadCount,
    isConnected,
    markAsRead,
    markAllAsRead,
    loadMoreNotifications,
    hasMoreNotifications,
    totalNotifications,
    removeNotification,
    clearAllNotifications
  };
};
