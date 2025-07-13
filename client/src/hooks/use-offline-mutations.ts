import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

export function useOfflineMutation(endpoint: string, mutationKey: string[]) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", endpoint, data);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Fehler beim Speichern");
      }
      
      const result = await response.json();
      
      // Check if this was stored offline
      if (result.offline) {
        toast({
          title: "Offline gespeichert",
          description: "Daten werden synchronisiert sobald du wieder online bist.",
          duration: 3000,
        });
      } else {
        toast({
          title: "Erfolgreich gespeichert",
          description: "Daten wurden erfolgreich übertragen.",
          duration: 2000,
        });
      }
      
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mutationKey });
    },
    onError: (error: any) => {
      toast({
        title: "Fehler beim Speichern",
        description: error.message || "Ein Fehler ist aufgetreten.",
        variant: "destructive",
      });
    },
  });
}