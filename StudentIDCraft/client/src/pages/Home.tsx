import { useState, useEffect } from "react";
import StudentForm from "@/components/StudentForm";
import CardPreview from "@/components/CardPreview";
import SavedCardsList from "@/components/SavedCardsList";
import QRCodeScanner from "@/components/QRCodeScanner";
import ARQRScanner from "@/components/ARQRScanner";
import CSVImport from "@/components/CSVImport";
import CardLayoutEditor from "@/components/CardLayoutEditor";
import CloudSync from "@/components/CloudSync";
import IDCardGallery3D from "@/components/IDCardGallery3D";
import { Student, SavedCard, CardLayout } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { nanoid } from "nanoid";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { apiRequest } from "@/lib/queryClient";
import { 
  ArrowLeft, 
  History, 
  QrCode, 
  FileUp, 
  Pencil, 
  Download, 
  Cloud, 
  Video, 
  Box, 
  Layers,
  Sun,
  Moon,
  Bookmark,
  BookOpen
} from "lucide-react";

export default function Home() {
  const [activeView, setActiveView] = useState<"form" | "preview" | "saved" | "scanner" | "ar-scanner" | "3d-gallery" | "import" | "layout-editor" | "cloud">("form");
  const [savedCards, setSavedCards] = useState<SavedCard[]>([]);
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null);
  const [activeTemplate, setActiveTemplate] = useState<number>(1);
  const [currentLayout, setCurrentLayout] = useState<CardLayout | null>(null);
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const { toast } = useToast();
  
  // Effect to apply dark mode class to document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark-theme');
    } else {
      document.documentElement.classList.remove('dark-theme');
    }
  }, [darkMode]);
  
  // Fetch saved cards from API
  useEffect(() => {
    const fetchSavedCards = async () => {
      try {
        const cards = await apiRequest<SavedCard[]>('/api/saved-cards');
        setSavedCards(cards);
      } catch (error) {
        console.error('Failed to fetch saved cards', error);
      }
    };
    
    fetchSavedCards();
  }, []);

  const viewSavedCards = () => {
    setActiveView("saved");
  };

  const returnToForm = () => {
    setActiveView("form");
  };
  
  const goToScanner = () => {
    setActiveView("scanner");
  };
  
  const goToARScanner = () => {
    setActiveView("ar-scanner");
  };
  
  const goTo3DGallery = () => {
    setActiveView("3d-gallery");
  };
  
  const goToImport = () => {
    setActiveView("import");
  };
  
  const handleScanResult = (student: Student) => {
    setCurrentStudent(student);
    
    toast({
      title: "Student Found",
      description: `Loaded ${student.name}'s information from QR code`,
    });

    // First save the student to database
    saveStudentToDatabase(student).then((savedStudent) => {
      // After student is saved, create a card with either the saved student or original
      const studentToUse = savedStudent !== null ? savedStudent : student;
      
      const defaultCard: SavedCard = {
        id: crypto.randomUUID(),
        student: studentToUse,
        template: 0,
        createdAt: new Date().toISOString(),
        uniqueId: studentToUse.uniqueId || studentToUse.id
      };
      
      // Save card and redirect to 3D gallery
      saveCard(defaultCard);
      
      // Immediately go to 3D gallery without waiting for saveCard
      setActiveView("3d-gallery");
    }).catch(error => {
      console.error("Error handling scan result:", error);
      toast({
        title: "Error",
        description: "An error occurred while processing the student data",
        variant: "destructive"
      });
    });
  };
  
  const handleImportStudents = (students: Student[]) => {
    if (students.length > 0) {
      setCurrentStudent(students[0]);
      setActiveView("preview");
      
      // Save the students to the database
      for (const student of students) {
        saveStudentToDatabase(student);
      }
    }
  };
  
  const saveStudentToDatabase = async (student: Student) => {
    try {
      // Convert the allergies from array to string as expected by the database
      const formattedStudent = {
        ...student,
        allergies: JSON.stringify(student.allergies),
        customFields: student.customFields ? JSON.stringify(student.customFields) : null
      };
      
      const savedStudent = await apiRequest('/api/students', {
        method: 'POST',
        body: JSON.stringify(formattedStudent)
      });
      
      return savedStudent; // Return the saved student with server-generated ID
    } catch (error) {
      console.error('Failed to save student', error);
      toast({
        title: "Error",
        description: "Failed to save student information",
        variant: "destructive"
      });
      return null; // Return null on error
    }
  };
  
  const goToLayoutEditor = () => {
    if (!currentStudent) {
      toast({
        title: "No Student Selected",
        description: "Please create a student first before designing a custom layout",
        variant: "destructive"
      });
      return;
    }
    setActiveView("layout-editor");
  };
  
  const handleLayoutSave = (layout: CardLayout) => {
    setCurrentLayout(layout);
    setActiveView("preview");
    toast({
      title: "Layout Saved",
      description: "Custom card layout has been saved",
    });
  };

  const saveCard = async (card: SavedCard) => {
    // Add custom layout if it exists
    if (currentLayout) {
      card.customLayout = currentLayout;
    }
    
    try {
      // For cards created via QR scan, we need to use the card's student data
      // not the currentStudent which might not be updated yet
      const studentToUse = card.student || currentStudent;
      
      // Prepare the card data for the API according to server schema
      // SERVER EXPECTS: studentId, not a student object
      const cardData = {
        studentId: studentToUse.id, // Use the ID, not the entire student object
        template: card.template,
        customLayout: currentLayout ? JSON.stringify(currentLayout) : null
      };
      
      // Save to API
      const savedCard = await apiRequest('/api/saved-cards', {
        method: 'POST',
        body: JSON.stringify(cardData)
      });
      
      // Update local state with the response from the server
      const updatedCards = [savedCard, ...savedCards];
      setSavedCards(updatedCards);
      
      toast({
        title: "Card Saved",
        description: "ID card saved successfully!",
      });
      
      // Automatically redirect to 3D gallery to see the new card
      setTimeout(() => {
        setActiveView("3d-gallery");
        toast({
          title: "Viewing in 3D Gallery",
          description: "Your saved cards are now displayed in the 3D rack!",
        });
      }, 1500);
    } catch (error) {
      console.error('Failed to save card', error);
      toast({
        title: "Error",
        description: "Failed to save ID card",
        variant: "destructive"
      });
    }
  };

  return (
    <div className={`${darkMode ? 'dark-theme bg-gradient-to-b from-gray-900 to-gray-800 text-white' : 'bg-gradient-to-b from-gray-50 to-white text-gray-800'} font-sans min-h-screen overflow-x-hidden transition-all duration-300`}>
      <div className="container mx-auto px-4 py-8 max-w-6xl relative z-10">
        <header className={`mb-8 ${darkMode ? 'bg-gray-800/90 backdrop-blur-sm' : 'bg-white/90 backdrop-blur-sm'} rounded-2xl p-6 animate-fadeIn transition-all duration-300 shadow-xl hover:shadow-2xl border border-opacity-10 ${darkMode ? 'border-white' : 'border-black'}`}>
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="animate-slideInLeft">
              <h1 className="text-3xl font-bold text-primary">Unity School ID Generator</h1>
              <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} mt-1`}>Generate professional student ID cards with ease</p>
            </div>
            
            {/* Dark mode toggle */}
            <div className="fixed top-4 right-4 z-50 flex items-center gap-2 animate-fadeIn">
              <Sun className={`h-4 w-4 ${!darkMode ? 'text-yellow-500' : 'text-gray-400'}`} />
              <Switch 
                checked={darkMode}
                onCheckedChange={setDarkMode}
                className="data-[state=checked]:bg-indigo-600"
              />
              <Moon className={`h-4 w-4 ${darkMode ? 'text-indigo-300' : 'text-gray-400'}`} />
            </div>
            
            {/* Navigation buttons */}
            <div className="mt-4 md:mt-0 flex flex-wrap gap-2 animate-slideInRight">
              {activeView !== "form" && (
                <Button 
                  variant="outline" 
                  onClick={returnToForm} 
                  className="flex items-center gap-1 ripple-button elevation-1 hover:elevation-3"
                >
                  <ArrowLeft className="h-4 w-4" /> Back to Form
                </Button>
              )}
              
              <Button 
                onClick={viewSavedCards} 
                variant="secondary" 
                className="flex items-center gap-1 ripple-button elevation-1 hover:elevation-3"
              >
                <History className="h-4 w-4" /> Saved Cards
              </Button>
              
              <Tabs defaultValue="scan" className="w-full max-w-[320px] elevation-1">
                <TabsList className="w-full">
                  <TabsTrigger value="scan" onClick={goToScanner} className="ripple-button">
                    <QrCode className="h-4 w-4 mr-1" /> Basic Scan
                  </TabsTrigger>
                  <TabsTrigger value="ar" onClick={goToARScanner} className="ripple-button">
                    <Video className="h-4 w-4 mr-1" /> AR Scan
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              
              <div className="flex gap-2">
                <Button 
                  onClick={goToImport} 
                  variant="default" 
                  className="flex items-center gap-1 ripple-button elevation-1 hover:elevation-3"
                >
                  <FileUp className="h-4 w-4" /> Import CSV
                </Button>
                
                <Button 
                  onClick={goTo3DGallery} 
                  variant="secondary" 
                  className="flex items-center gap-1 ripple-button elevation-1 hover:elevation-3 animate-pulse-custom"
                >
                  <Box className="h-4 w-4" /> 3D Gallery
                </Button>
                
                <Button 
                  onClick={() => setActiveView("cloud")} 
                  variant="outline" 
                  className="flex items-center gap-1 border-blue-400 text-blue-600 hover:bg-blue-50 ripple-button elevation-1 hover:elevation-3"
                >
                  <Cloud className="h-4 w-4 animate-floating" /> Cloud Sync
                </Button>
              </div>
            </div>
          </div>
        </header>

        <main className={`elevation-1 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-5 animate-slideUp transition-material`}>
          {activeView === "form" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="animate-slideInLeft">
                <StudentForm onSubmit={(student) => {
                  setCurrentStudent(student);
                  saveStudentToDatabase(student);
                  setActiveView("preview");
                }} />
              </div>
              
              {currentStudent && (
                <div className="animate-slideInRight card-3d">
                  <CardPreview 
                    student={currentStudent} 
                    activeTemplate={activeTemplate}
                    onTemplateChange={setActiveTemplate}
                    onSave={saveCard}
                    customLayout={currentLayout}
                  />
                </div>
              )}
            </div>
          )}
          
          {activeView === "preview" && currentStudent && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold animate-slideInLeft">ID Card Preview</h2>
                <div className="flex gap-2 animate-slideInRight">
                  <Button 
                    variant="outline" 
                    onClick={returnToForm} 
                    className="flex items-center gap-1 ripple-button elevation-1"
                  >
                    <ArrowLeft className="h-4 w-4" /> Edit Info
                  </Button>
                  <Button 
                    onClick={goToLayoutEditor} 
                    className="flex items-center gap-1 ripple-button elevation-1"
                  >
                    <Pencil className="h-4 w-4" /> Customize Layout
                  </Button>
                </div>
              </div>
              
              <div className="max-w-xl mx-auto animate-slideUp card-3d">
                <CardPreview 
                  student={currentStudent} 
                  activeTemplate={activeTemplate}
                  onTemplateChange={setActiveTemplate}
                  onSave={saveCard}
                  customLayout={currentLayout}
                />
              </div>
            </div>
          )}
          
          {activeView === "saved" && (
            <div className="animate-fadeIn">
              <SavedCardsList 
                savedCards={savedCards} 
                onBackClick={returnToForm}
              />
            </div>
          )}
          
          {activeView === "scanner" && (
            <div className="max-w-xl mx-auto animate-fadeIn">
              <QRCodeScanner 
                onResult={handleScanResult}
                onBack={returnToForm}
              />
            </div>
          )}
          
          {activeView === "import" && (
            <div className="animate-fadeIn">
              <CSVImport 
                onImport={handleImportStudents}
                onBack={returnToForm}
              />
            </div>
          )}
          
          {activeView === "layout-editor" && currentStudent && (
            <div className="animate-fadeIn">
              <CardLayoutEditor 
                student={currentStudent}
                initialLayout={currentLayout || undefined}
                onSave={handleLayoutSave}
                onBack={() => setActiveView("preview")}
              />
            </div>
          )}
          
          {activeView === "ar-scanner" && (
            <div className="max-w-xl mx-auto animate-fadeIn">
              <div className="relative">
                <ARQRScanner 
                  onResult={handleScanResult}
                  onBack={returnToForm}
                />
                <div className="ar-scan-animation"></div>
              </div>
            </div>
          )}
          
          {activeView === "3d-gallery" && (
            <div className="w-full animate-fadeIn">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold animate-slideInLeft">3D Card Gallery</h2>
                <div className="animate-slideInRight">
                  <Button 
                    onClick={returnToForm}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md font-medium flex items-center gap-2 shadow-md ripple-button"
                  >
                    <ArrowLeft className="h-4 w-4" /> Back to Dashboard
                  </Button>
                </div>
              </div>
              
              {/* Always render the 3D gallery, it will show empty state automatically */}
              <div className="elevation-3 rounded-lg overflow-hidden">
                <IDCardGallery3D 
                  savedCards={savedCards}
                  onSelectCard={(card) => {
                    setCurrentStudent(card.student);
                    setActiveTemplate(card.template);
                    if (card.customLayout) {
                      setCurrentLayout(card.customLayout);
                    }
                    setActiveView("preview");
                  }}
                  onBack={returnToForm}
                />
              </div>
            </div>
          )}
          
          {activeView === "cloud" && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold animate-slideInLeft">Cloud Sync</h2>
              </div>
              
              <CloudSync 
                students={[]} // We'll fetch students on demand in the CloudSync component
                savedCards={savedCards}
                onImportStudent={(student) => {
                  setCurrentStudent(student);
                  setActiveView("preview");
                  toast({
                    title: "Student Imported",
                    description: `Loaded ${student.name}'s information from cloud`,
                  });
                }}
                onImportCard={(card) => {
                  // Add to saved cards
                  const updatedCards = [card, ...savedCards];
                  setSavedCards(updatedCards);
                  
                  // Show the card
                  setCurrentStudent(card.student);
                  setActiveTemplate(card.template);
                  if (card.customLayout) {
                    setCurrentLayout(card.customLayout);
                  }
                  setActiveView("preview");
                  
                  toast({
                    title: "Card Imported",
                    description: `Imported ID card for ${card.student.name} from cloud`,
                  });
                }}
              />
            </div>
          )}
        </main>

        <footer className={`mt-10 py-5 text-center ${darkMode ? 'text-gray-300' : 'text-gray-500'} text-sm animate-fadeIn delay-500 elevation-1 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl`}>
          <div className="flex flex-col md:flex-row justify-center items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="inline-block w-6 h-6 rounded-full bg-indigo-500 animate-pulse-custom"></span>
              <p>© {new Date().getFullYear()} Unity School ID Card Generator. All rights reserved.</p>
            </div>
            <div className="flex gap-3">
              <a href="#" className={`${darkMode ? 'text-gray-400 hover:text-indigo-300' : 'text-gray-600 hover:text-indigo-500'} transition-material`}>Privacy Policy</a>
              <a href="#" className={`${darkMode ? 'text-gray-400 hover:text-indigo-300' : 'text-gray-600 hover:text-indigo-500'} transition-material`}>Terms of Service</a>
              <a href="#" className={`${darkMode ? 'text-gray-400 hover:text-indigo-300' : 'text-gray-600 hover:text-indigo-500'} transition-material`}>Contact</a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
