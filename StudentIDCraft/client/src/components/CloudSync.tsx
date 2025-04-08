import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Student, SavedCard } from "@/types";
import { 
  Cloud, 
  CloudOff, 
  Upload, 
  Download, 
  Database,
  InfoIcon
} from "lucide-react";

interface CloudSyncProps {
  students: Student[];
  savedCards: SavedCard[];
  onImportStudent: (student: Student) => void;
  onImportCard: (card: SavedCard) => void;
}

// Simulates cloud data with local storage
const useLocalCloudSimulation = () => {
  const saveToLocalCloud = (data: any, key: string) => {
    try {
      const existingData = localStorage.getItem(key);
      let allItems = existingData ? JSON.parse(existingData) : [];
      
      // Check if the item already exists
      const existingIndex = allItems.findIndex((item: any) => item.id === data.id);
      
      if (existingIndex >= 0) {
        // Update existing item
        allItems[existingIndex] = {
          ...data,
          syncedAt: new Date().toISOString()
        };
      } else {
        // Add new item
        allItems.push({
          ...data,
          syncedAt: new Date().toISOString()
        });
      }
      
      localStorage.setItem(key, JSON.stringify(allItems));
      return true;
    } catch (error) {
      console.error(`Error saving to local storage (${key}):`, error);
      return false;
    }
  };
  
  const getFromLocalCloud = (key: string) => {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error(`Error loading from local storage (${key}):`, error);
      return [];
    }
  };
  
  return {
    saveToLocalCloud,
    getFromLocalCloud
  };
};

export default function CloudSync({ 
  students, 
  savedCards, 
  onImportStudent, 
  onImportCard 
}: CloudSyncProps) {
  const [cloudStudents, setCloudStudents] = useState<Student[]>([]);
  const [cloudCards, setCloudCards] = useState<SavedCard[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const { toast } = useToast();
  const { saveToLocalCloud, getFromLocalCloud } = useLocalCloudSimulation();

  const fetchLocalCloudData = () => {
    try {
      setIsLoading(true);
      const fetchedStudents = getFromLocalCloud('cloud_students');
      const fetchedCards = getFromLocalCloud('cloud_cards');
      
      setCloudStudents(fetchedStudents);
      setCloudCards(fetchedCards);
      
      toast({
        title: "Local cloud data loaded",
        description: `${fetchedStudents.length} students and ${fetchedCards.length} cards loaded`,
      });
    } catch (error) {
      console.error("Error fetching local cloud data:", error);
      toast({
        title: "Local sync failed",
        description: "Could not load local cloud data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const syncAllToLocalCloud = async () => {
    try {
      setSyncStatus('syncing');
      
      // Sync all students
      let successCount = 0;
      for (const student of students) {
        const success = saveToLocalCloud(student, 'cloud_students');
        if (success) successCount++;
      }
      
      // Sync all cards
      for (const card of savedCards) {
        saveToLocalCloud(card, 'cloud_cards');
      }
      
      // Refresh cloud data
      fetchLocalCloudData();
      
      setSyncStatus('success');
      toast({
        title: "Local sync completed",
        description: `${students.length} students and ${savedCards.length} cards synced to local cloud`,
      });
    } catch (error) {
      console.error("Error syncing to local cloud:", error);
      setSyncStatus('error');
      toast({
        title: "Local sync failed",
        description: "Could not sync data to local cloud",
        variant: "destructive",
      });
    }
  };

  const importFromCloud = (item: Student | SavedCard, type: 'student' | 'card') => {
    if (type === 'student') {
      onImportStudent(item as Student);
      toast({
        title: "Student imported",
        description: `Imported ${(item as Student).name} from local cloud`,
      });
    } else {
      onImportCard(item as SavedCard);
      toast({
        title: "Card imported",
        description: `Imported card for ${(item as SavedCard).student.name} from local cloud`,
      });
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Database className="h-6 w-6 text-primary" />
              Local Cloud Sync
            </CardTitle>
            <CardDescription>
              Sync your student data and ID cards in browser storage
            </CardDescription>
          </div>
          
          <Badge variant="outline" className="gap-1">
            <InfoIcon className="h-3 w-3" /> Offline Mode
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-2 justify-between">
            <div className="space-y-1">
              <h3 className="font-medium">Sync Status</h3>
              <div className="flex items-center gap-2 text-sm">
                {syncStatus === 'idle' && <Badge variant="outline">Ready to sync</Badge>}
                {syncStatus === 'syncing' && <Badge variant="secondary" className="animate-pulse">Syncing...</Badge>}
                {syncStatus === 'success' && <Badge variant="secondary" className="bg-green-100 text-green-800">Synced successfully</Badge>}
                {syncStatus === 'error' && <Badge variant="destructive">Sync failed</Badge>}
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={fetchLocalCloudData}
                disabled={isLoading}
              >
                <Cloud className="h-4 w-4 mr-1" />
                Load Cloud Data
              </Button>
              <Button 
                onClick={syncAllToLocalCloud} 
                disabled={isLoading || syncStatus === 'syncing'}
              >
                <Upload className="h-4 w-4 mr-1" />
                Sync to Local Cloud
              </Button>
            </div>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-md">
            <p className="text-blue-700 text-sm">
              <InfoIcon className="inline-block h-4 w-4 mr-1" />
              Google authentication is temporarily disabled due to configuration issues. Your data will be saved locally in your browser for now.
            </p>
          </div>
          
          <Tabs defaultValue="students">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="students">Students ({cloudStudents.length})</TabsTrigger>
              <TabsTrigger value="cards">ID Cards ({cloudCards.length})</TabsTrigger>
            </TabsList>
            
            <TabsContent value="students" className="pt-4">
              {cloudStudents.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {cloudStudents.map((student) => (
                    <Card key={student.id} className="overflow-hidden">
                      <div className="flex h-16 bg-primary text-white p-3">
                        <div className="w-10 h-10 mr-3 bg-white rounded-full flex items-center justify-center text-primary">
                          {student.photo ? (
                            <img src={student.photo} alt={student.name} className="w-full h-full object-cover rounded-full" />
                          ) : (
                            student.name.charAt(0)
                          )}
                        </div>
                        <div className="overflow-hidden">
                          <h3 className="font-medium truncate">{student.name}</h3>
                          <p className="text-xs text-opacity-80 truncate">ID: {student.rollNumber}</p>
                        </div>
                      </div>
                      <div className="p-3 text-sm">
                        <p className="truncate">Class: {student.classDivision}</p>
                        <p className="text-gray-500 text-xs mt-1">
                          Synced: {new Date(student.syncedAt || 0).toLocaleString()}
                        </p>
                      </div>
                      <div className="p-2 bg-gray-50 flex justify-end">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => importFromCloud(student, 'student')}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Import
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <CloudOff className="mx-auto h-12 w-12 mb-2 text-gray-300" />
                  <p>No students found in local cloud</p>
                  <p className="text-sm mt-1">Sync your local students to see them here</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="cards" className="pt-4">
              {cloudCards.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {cloudCards.map((card) => (
                    <Card key={card.id} className="overflow-hidden">
                      <div className={`h-16 p-3 flex items-center ${
                        card.template === 1 ? 'bg-primary text-white' : 
                        card.template === 2 ? 'bg-indigo-600 text-white' : 
                        'bg-gray-100'
                      }`}>
                        <div className="w-10 h-10 mr-3 bg-white rounded-full flex items-center justify-center text-primary shadow">
                          {card.student.photo ? (
                            <img src={card.student.photo} alt={card.student.name} className="w-full h-full object-cover rounded-full" />
                          ) : (
                            card.student.name.charAt(0)
                          )}
                        </div>
                        <div className="overflow-hidden">
                          <h3 className="font-medium truncate">{card.student.name}</h3>
                          <p className="text-xs opacity-80 truncate">
                            Template {card.template}
                            {card.customLayout ? " (Custom)" : ""}
                          </p>
                        </div>
                      </div>
                      <div className="p-3 text-sm">
                        <p className="truncate">Created: {new Date(card.createdAt).toLocaleDateString()}</p>
                        <p className="text-gray-500 text-xs mt-1 truncate">
                          Synced: {new Date(card.syncedAt || 0).toLocaleString()}
                        </p>
                      </div>
                      <div className="p-2 bg-gray-50 flex justify-end">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => importFromCloud(card, 'card')}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Import
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <CloudOff className="mx-auto h-12 w-12 mb-2 text-gray-300" />
                  <p>No ID cards found in local cloud</p>
                  <p className="text-sm mt-1">Sync your local cards to see them here</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </CardContent>
    </Card>
  );
}