import { useState, useEffect } from 'react';
import { Wifi, WifiOff, Upload, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingSync, setPendingSync] = useState(0);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Trigger sync when coming back online
      syncOfflineData();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check pending sync items on load
    checkPendingSync();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const checkPendingSync = async () => {
    try {
      const request = indexedDB.open('EduPlanixOffline', 1);
      
      request.onsuccess = () => {
        const db = request.result;
        
        // Check if the object store exists
        if (!db.objectStoreNames.contains('offline_requests')) {
          setPendingSync(0);
          return;
        }
        
        const transaction = db.transaction(['offline_requests'], 'readonly');
        const store = transaction.objectStore('offline_requests');
        const index = store.index('synced');
        const getRequest = index.getAll(false);
        
        getRequest.onsuccess = () => {
          setPendingSync(getRequest.result.length);
        };
        
        getRequest.onerror = () => {
          setPendingSync(0);
        };
      };
      
      request.onerror = () => {
        setPendingSync(0);
      };
    } catch (error) {
      console.error('Error checking pending sync:', error);
      setPendingSync(0);
    }
  };

  const syncOfflineData = async () => {
    try {
      const request = indexedDB.open('EduPlanixOffline', 1);
      
      request.onsuccess = async () => {
        const db = request.result;
        
        // Check if the object store exists
        if (!db.objectStoreNames.contains('offline_requests')) {
          return;
        }
        
        const transaction = db.transaction(['offline_requests'], 'readwrite');
        const store = transaction.objectStore('offline_requests');
        const index = store.index('synced');
        const getRequest = index.getAll(false);
        
        getRequest.onsuccess = async () => {
          const unsynced = getRequest.result;
          let syncedCount = 0;
          
          for (const item of unsynced) {
            try {
              const response = await fetch(item.endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(item.data)
              });
              
              if (response.ok) {
                item.synced = true;
                store.put(item);
                syncedCount++;
              }
            } catch (error) {
              console.error('Sync failed:', error);
            }
          }
          
          if (syncedCount > 0) {
            setLastSync(new Date());
            setPendingSync(prev => prev - syncedCount);
          }
        };
        
        getRequest.onerror = () => {
          console.error('Error getting unsynced data');
        };
      };
      
      request.onerror = () => {
        console.error('Error opening database');
      };
    } catch (error) {
      console.error('Error syncing offline data:', error);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('de-DE', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (isOnline && pendingSync === 0) {
    return (
      <div className="flex items-center gap-2 text-green-400 text-sm">
        <Wifi className="h-4 w-4" />
        <span>Online</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {!isOnline ? (
        <Badge variant="destructive" className="bg-red-500/20 text-red-400 border-red-500/30">
          <WifiOff className="h-3 w-3 mr-1" />
          Offline
        </Badge>
      ) : (
        <Badge variant="default" className="bg-green-500/20 text-green-400 border-green-500/30">
          <Wifi className="h-3 w-3 mr-1" />
          Online
        </Badge>
      )}
      
      {pendingSync > 0 && (
        <Badge variant="outline" className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
          <Upload className="h-3 w-3 mr-1" />
          {pendingSync} wartend
        </Badge>
      )}
      
      {isOnline && pendingSync > 0 && (
        <Button
          size="sm"
          variant="outline"
          onClick={syncOfflineData}
          className="h-6 px-2 text-xs bg-cyan-500/20 text-cyan-400 border-cyan-500/30 hover:bg-cyan-500/30"
        >
          <Upload className="h-3 w-3 mr-1" />
          Sync
        </Button>
      )}
      
      {lastSync && (
        <div className="flex items-center gap-1 text-xs text-slate-400">
          <Clock className="h-3 w-3" />
          {formatTime(lastSync)}
        </div>
      )}
    </div>
  );
}