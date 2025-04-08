import React, { useState, useEffect, useRef } from 'react';
import { SavedCard } from '@/types';
import { ArrowLeft, Plus, Download, User, RotateCw, Volume2, VolumeX, BookOpen, Bookmark, Music, Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import Panorama360Background from './Panorama360Background';

// We're implementing a CSS 3D effect instead of ThreeJS to avoid the replit errors
// This simulates a 3D gallery with pure CSS transforms
// Harry Potter theme with book rack styling

// Determine card color based on template
const getCardColor = (template: number): string => {
  switch (template) {
    case 1: return 'bg-blue-500 border-blue-600';
    case 2: return 'bg-green-500 border-green-600';
    case 3: return 'bg-purple-500 border-purple-600';
    case 4: return 'bg-red-500 border-red-600';
    default: return 'bg-indigo-600 border-indigo-700';
  }
};

// Card component for 3D display, styled like a magical ID book
const Card3D = ({ 
  card, 
  onClick, 
  isActive,
  rotateY 
}: { 
  card: SavedCard, 
  onClick: () => void,
  isActive: boolean,
  rotateY: number
}) => {
  // Function to get a house color based on the student's name (for fun)
  const getHogwartsHouse = (name: string): string => {
    const sum = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const houses = ['gryffindor', 'slytherin', 'ravenclaw', 'hufflepuff'];
    return houses[sum % houses.length];
  };
  
  // Get a consistent house for this student
  const studentHouse = getHogwartsHouse(card.student.name);
  
  // Map houses to theme colors
  const houseColors = {
    'gryffindor': {
      primary: 'from-red-800 to-red-900',
      accent: 'border-yellow-600',
      text: 'text-yellow-200',
      spine: 'bg-yellow-700'
    },
    'slytherin': {
      primary: 'from-green-800 to-green-900',
      accent: 'border-emerald-600',
      text: 'text-emerald-100',
      spine: 'bg-emerald-700'
    },
    'ravenclaw': {
      primary: 'from-blue-800 to-blue-900',
      accent: 'border-blue-600',
      text: 'text-blue-100',
      spine: 'bg-blue-500'
    },
    'hufflepuff': {
      primary: 'from-yellow-700 to-yellow-800',
      accent: 'border-yellow-900',
      text: 'text-yellow-100',
      spine: 'bg-yellow-500'
    }
  };
  
  const colors = houseColors[studentHouse as keyof typeof houseColors];
  
  return (
    <div 
      className={`card-3d relative cursor-pointer ${isActive ? 'animate-float z-30' : ''}`}
      onClick={onClick}
      style={{ 
        transform: `perspective(1000px) rotateY(${rotateY}deg) translateZ(${isActive ? '80px' : '0px'})`,
        transition: 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        transformStyle: 'preserve-3d'
      }}
    >
      {/* Card styled as a magical book or ID */}
      <div 
        className={`w-48 h-72 rounded-md overflow-hidden border-2 ${colors.accent} shadow-xl
          bg-gradient-to-b ${colors.primary}
          ${isActive ? 'ring-4 ring-amber-300/50 ring-offset-1' : 'hover:shadow-2xl hover:translate-y-[-5px]'}`}
        style={{ 
          transformStyle: 'preserve-3d',
          boxShadow: isActive 
            ? '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2), 0 0 15px 5px rgba(255, 191, 0, 0.2)'
            : '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -4px rgba(0, 0, 0, 0.2)'
        }}
      >
        {/* Book spine effect */}
        <div className={`absolute left-0 top-0 w-[6px] h-full ${colors.spine}`}></div>
        
        {/* Book gold trim effect */}
        <div className="absolute inset-[3px] border border-amber-600/40 rounded-sm pointer-events-none"></div>
        
        {/* Card Header - Hogwarts-inspired */}
        <div className="p-3 text-white relative">
          <h3 className={`font-bold text-center truncate font-serif ${colors.text}`}>
            {card.student.name}
          </h3>
          
          {/* Decorative crest behind the name */}
          <div className="absolute top-1 left-1/2 transform -translate-x-1/2 w-full h-full flex justify-center opacity-10 pointer-events-none">
            <div className="w-10 h-10 border-2 border-amber-500 rounded-full"></div>
          </div>
        </div>
        
        {/* Student Photo with parchment texture background */}
        <div className="h-32 bg-gradient-to-b from-amber-100 to-amber-200 flex items-center justify-center p-2 relative">
          {/* Parchment texture overlay */}
          <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1IiBoZWlnaHQ9IjUiPgo8cmVjdCB3aWR0aD0iNSIgaGVpZ2h0PSI1IiBmaWxsPSIjZmZmIj48L3JlY3Q+CjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiNmNWU2Y2MiPjwvcmVjdD4KPC9zdmc+')]"></div>
          
          {/* Photo frame with decorative border */}
          <div className="relative w-[90%] h-[90%] border-4 border-double border-amber-800/50 rounded-sm bg-amber-50 overflow-hidden shadow-inner">
            {card.student.photo ? (
              <img 
                src={card.student.photo} 
                alt={`${card.student.name}'s photo`} 
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full w-full bg-amber-50">
                <User className="h-12 w-12 text-amber-800/50" />
              </div>
            )}
          </div>
        </div>
        
        {/* Card Details styled as magical ID information */}
        <div className="p-3 text-white relative">
          <div className="text-sm">
            <p className="font-serif font-medium flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-amber-500/70 inline-block"></span>
              <span className="opacity-80">ID:</span> {card.student.rollNumber}
            </p>
            <p className="truncate font-serif flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-amber-500/70 inline-block"></span>
              <span className="opacity-80">Class:</span> {card.student.classDivision}
            </p>
            {card.student.busRoute && (
              <p className="truncate font-serif flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-amber-500/70 inline-block"></span>
                <span className="opacity-80">Bus:</span> {card.student.busRoute}
              </p>
            )}
          </div>
          
          {/* Magical QR Code styled like a wax seal or magical emblem */}
          <div className="mt-1 flex justify-end">
            <div className="w-14 h-14 rounded-full bg-gradient-to-b from-amber-800 to-amber-900 p-[3px] relative shadow-xl">
              <div className="w-full h-full bg-white rounded-full flex items-center justify-center overflow-hidden">
                <div className="w-10 h-10 relative">
                  {/* Simulate QR code with a grid pattern */}
                  <div className="absolute inset-0 grid grid-cols-4 grid-rows-4 gap-[1px]">
                    {[...Array(16)].map((_, i) => {
                      // Create a more consistent pattern based on the student ID
                      const shouldFill = (card.student.rollNumber.charCodeAt(i % card.student.rollNumber.length) % 2) === 0;
                      return (
                        <div 
                          key={i} 
                          className={`w-full h-full ${shouldFill ? 'bg-black' : 'bg-white'}`}
                        />
                      );
                    })}
                  </div>
                  {/* Central icon overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-4 h-4 bg-white rounded-full"></div>
                    <div className="absolute inset-[25%] bg-black rounded-full"></div>
                  </div>
                </div>
              </div>
              {/* Simulated wax drips */}
              {[...Array(4)].map((_, i) => (
                <div 
                  key={i}
                  className="absolute w-2 h-3 bg-amber-800"
                  style={{
                    top: '85%',
                    left: `${25 + i * 16}%`,
                    borderRadius: '0 0 2px 2px',
                    transform: `rotate(${(i - 1.5) * 10}deg)`
                  }}
                ></div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Floating magical selection indicator */}
      {isActive && (
        <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 z-10">
          <div className="relative">
            <Badge variant="outline" className="bg-gradient-to-r from-amber-500 to-amber-700 text-white border-amber-600 shadow-lg animate-pulse-custom">
              Selected
            </Badge>
            {/* Magical glowing effect */}
            <div className="absolute -inset-1 bg-amber-500 opacity-30 blur-md rounded-full animate-pulse-slow"></div>
          </div>
        </div>
      )}
      
      {/* Magical glow effect when active */}
      {isActive && (
        <div className="absolute -inset-3 bg-amber-400 opacity-20 blur-xl rounded-full animate-pulse-slow pointer-events-none"></div>
      )}
    </div>
  );
};

// Empty state component with Harry Potter theme
const EmptyState = ({ isDarkTheme }: { isDarkTheme: boolean }) => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center text-center p-8">
      {/* We don't need a background here as it's handled by the parent Panorama360Background */}
      
      {/* Improved empty state with floating magical elements */}
      <div className="relative z-10 w-full max-w-2xl bg-black/40 backdrop-blur-md rounded-xl border border-amber-600/30 p-8 shadow-2xl overflow-hidden">
        {/* Magical decoration elements */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-amber-500/10 rounded-full blur-2xl"></div>
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-amber-500/10 rounded-full blur-2xl"></div>
        
        {/* Hogwarts crest-inspired decorative element */}
        <div className="relative mb-6 flex flex-col items-center">
          <div className="w-24 h-24 rounded-full bg-gradient-to-b from-amber-800 to-amber-950 p-[3px] mb-4 shadow-lg shadow-amber-800/30">
            <div className="w-full h-full rounded-full bg-gradient-to-b from-amber-700 to-amber-900 flex items-center justify-center overflow-hidden">
              <BookOpen className="h-10 w-10 text-amber-200 animate-pulse-slow" />
            </div>
          </div>
          
          <h2 className="text-2xl font-serif font-bold mb-1 text-white tracking-wide">Hogwarts Library</h2>
          <div className="w-32 h-[1px] bg-gradient-to-r from-transparent via-amber-500 to-transparent mb-1"></div>
          <h3 className="text-lg font-serif text-amber-200 mb-6">Student Registry</h3>
          
          {/* Four house emblems in a row */}
          <div className="flex gap-4 mb-6">
            {[
              { name: 'Gryffindor', color: 'from-red-800 to-red-900', accent: 'bg-yellow-600' },
              { name: 'Slytherin', color: 'from-green-800 to-green-900', accent: 'bg-emerald-600' },
              { name: 'Ravenclaw', color: 'from-blue-800 to-blue-900', accent: 'bg-blue-500' },
              { name: 'Hufflepuff', color: 'from-yellow-700 to-yellow-800', accent: 'bg-yellow-500' }
            ].map((house, index) => (
              <div key={house.name} className="relative group">
                <div className={`w-12 h-16 bg-gradient-to-b ${house.color} rounded-md shadow-lg border border-amber-900/50 transform transition-all group-hover:scale-110 group-hover:-translate-y-1 duration-300 ease-out flex flex-col items-center justify-between py-1 overflow-hidden`}>
                  <div className={`w-1.5 h-full ${house.accent} absolute left-0 top-0`}></div>
                  <div className={`w-1.5 h-full ${house.accent} absolute right-0 top-0`}></div>
                  <div className="h-6 w-6 rounded-full bg-amber-800/20 border border-amber-500/20"></div>
                  <p className="text-[6px] text-amber-100 font-serif">{house.name}</p>
                </div>
                <div className={`absolute -inset-px rounded-md opacity-0 group-hover:opacity-50 transition-opacity duration-300 blur-sm bg-white`}></div>
              </div>
            ))}
          </div>
          
          <p className="text-white/90 max-w-md text-center mb-6 font-serif">
            Your student identity cards will appear here as magical tomes in the Hogwarts library.
          </p>
          
          <div className="flex flex-wrap gap-3 justify-center">
            <Badge className="bg-amber-900/60 hover:bg-amber-800 text-amber-100 border-amber-700">
              Create Student Profiles
            </Badge>
            <Badge className="bg-amber-900/60 hover:bg-amber-800 text-amber-100 border-amber-700">
              Scan Magical QR Codes
            </Badge>
            <Badge className="bg-amber-900/60 hover:bg-amber-800 text-amber-100 border-amber-700">
              Import from CSV Scrolls
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main component that sets up the 3D gallery
interface IDCardGallery3DProps {
  savedCards: SavedCard[];
  onSelectCard: (card: SavedCard) => void;
  onBack: () => void;
}

export default function IDCardGallery3D({ 
  savedCards, 
  onSelectCard,
  onBack
}: IDCardGallery3DProps) {
  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const [rotationY, setRotationY] = useState(0);
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Initialize audio on component mount with better error handling
  useEffect(() => {
    try {
      // Create audio element with preload
      const audio = new Audio('/assets/harry-potter-music.mp3');
      audio.preload = 'auto';
      audio.loop = true;
      audio.volume = 0.3;
      
      // Add error handling
      audio.onerror = (e) => {
        console.error('Audio failed to load:', e);
      };
      
      // Add loaded metadata handler to ensure it's ready
      audio.onloadedmetadata = () => {
        console.log('Audio metadata loaded successfully');
      };
      
      audioRef.current = audio;
      
      // Auto-play audio when component mounts if user has interaction
      const attemptAutoPlay = () => {
        if (audioRef.current) {
          audioRef.current.play()
            .then(() => {
              setAudioPlaying(true);
              console.log('Audio playing automatically');
            })
            .catch(e => {
              console.log('Auto-play prevented. User interaction required.', e);
            });
        }
      };
      
      // Try auto-play on mount (may be blocked by browsers)
      if (document.hasFocus()) {
        setTimeout(attemptAutoPlay, 1000);
      }
      
      // Listen for user interaction to enable audio
      const enableAudioOnInteraction = () => {
        if (!audioPlaying && audioRef.current) {
          attemptAutoPlay();
        }
        // Remove event listeners after first interaction
        window.removeEventListener('click', enableAudioOnInteraction);
        window.removeEventListener('keydown', enableAudioOnInteraction);
      };
      
      window.addEventListener('click', enableAudioOnInteraction);
      window.addEventListener('keydown', enableAudioOnInteraction);
    } catch (error) {
      console.error('Error setting up audio:', error);
    }
    
    // Cleanup on unmount
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      window.removeEventListener('click', () => {});
      window.removeEventListener('keydown', () => {});
    };
  }, []);
  
  // Toggle background music with better error handling
  const toggleAudio = () => {
    if (audioRef.current) {
      try {
        if (audioPlaying) {
          audioRef.current.pause();
          setAudioPlaying(false);
        } else {
          audioRef.current.play()
            .then(() => {
              setAudioPlaying(true);
            })
            .catch(error => {
              console.error('Error playing audio:', error);
            });
        }
      } catch (error) {
        console.error('Error toggling audio:', error);
      }
    }
  };
  
  // Handle card selection
  const handleCardClick = (card: SavedCard) => {
    setActiveCardId(card.id);
    onSelectCard(card);
  };
  
  // Rotate the display
  const rotateDisplay = (direction: 'left' | 'right') => {
    if (direction === 'left') {
      setRotationY(rotationY - 45);
    } else {
      setRotationY(rotationY + 45);
    }
  };

  return (
    <div className={`relative w-full h-[600px] rounded-lg overflow-hidden ${isDarkTheme ? 'bg-gray-900' : 'bg-gradient-to-b from-indigo-50 to-gray-100'} elevation-3 transition-all`}>
      {/* 360-degree Hogwarts Library Background */}
      <Panorama360Background 
        imagePath="/assets/hogwarts-library-360.jpg"
        rotationSpeed={1}
        autoRotate={true}
      >
        {/* Enhanced magical floating lights (overlaid on the 360 background) */}
        <div className="absolute top-1/4 left-1/4 w-3 h-3 rounded-full bg-amber-300 shadow-lg shadow-amber-300/50 animate-pulse-slow animate-floating opacity-70 blur-[1px]"></div>
        <div className="absolute top-1/5 right-1/4 w-4 h-4 rounded-full bg-yellow-200 shadow-lg shadow-yellow-200/50 animate-pulse-slow delay-300 animate-floating opacity-60 blur-[1px]"></div>
        <div className="absolute bottom-1/3 left-2/3 w-3 h-3 rounded-full bg-white shadow-lg shadow-white/50 animate-pulse-slow delay-500 animate-floating opacity-40 blur-[1px]"></div>
        <div className="absolute top-2/3 right-1/3 w-2 h-2 rounded-full bg-amber-100 shadow-lg shadow-amber-100/50 animate-pulse-slow delay-200 animate-floating opacity-50 blur-[1px]"></div>
        
        {/* Add magical dust particles */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div 
              key={i}
              className="absolute w-[2px] h-[2px] rounded-full bg-amber-200/60 animate-floating"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${3 + Math.random() * 7}s`
              }}
            />
          ))}
        </div>
      </Panorama360Background>
      
      {/* 3D Gallery Content */}
      <div className="absolute inset-0 flex items-center justify-center z-10" style={{ perspective: '2000px' }}>
        {savedCards.length > 0 ? (
          <div 
            className="relative w-full h-full flex items-center justify-center transition-all duration-700 ease-out"
            style={{ 
              transformStyle: 'preserve-3d',
              transform: `rotateY(${rotationY}deg)` 
            }}
          >
            {/* Wooden book rack as backdrop for cards - visible when cards are present */}
            <div className="absolute inset-0 flex items-center justify-center" style={{ transform: 'translateZ(-300px)' }}>
              <img 
                src="/assets/wooden-rack.svg" 
                alt="Wooden Book Rack" 
                className="w-full h-auto opacity-70"
                style={{ transform: 'scale(1.5)' }}
              />
            </div>
            
            {/* Card Display - Organized in shelves */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              {/* Virtual Hogwarts Library Shelves */}
              {[0, 1, 2].map((shelfIndex) => {
                // Calculate how many cards per shelf
                const cardsPerShelf = Math.ceil(savedCards.length / 3);
                // Get cards for this shelf
                const shelfCards = savedCards.slice(
                  shelfIndex * cardsPerShelf,
                  Math.min((shelfIndex + 1) * cardsPerShelf, savedCards.length)
                );
                
                // Calculate shelf position
                const shelfY = shelfIndex * 120 - 120; // Vertical spacing between shelves
                
                return (
                  <div 
                    key={`shelf-${shelfIndex}`}
                    className="absolute w-[800px] h-20"
                    style={{
                      transform: `translate3d(0, ${shelfY}px, 0)`,
                      transformStyle: 'preserve-3d'
                    }}
                  >
                    {/* Wooden shelf background with depth */}
                    <div 
                      className="absolute w-full h-6 bg-gradient-to-r from-amber-900/80 via-amber-800/80 to-amber-900/80 rounded-sm"
                      style={{
                        transform: 'translateZ(-40px) translateY(90px)',
                        boxShadow: '0 5px 15px rgba(0,0,0,0.3)',
                        border: '1px solid rgba(139, 69, 19, 0.6)'
                      }}
                    ></div>
                    
                    {/* Books/cards on this shelf */}
                    {shelfCards.map((card, cardIndex) => {
                      // Calculate position on the shelf
                      const totalWidth = Math.min(700, shelfCards.length * 70);
                      const cardSpacing = totalWidth / Math.max(shelfCards.length, 1);
                      const startX = -totalWidth / 2 + cardSpacing / 2;
                      const x = startX + cardIndex * cardSpacing;
                      
                      // Random slight rotation for natural look
                      const randomRotate = (Math.random() * 10 - 5);
                      
                      return (
                        <div 
                          key={card.id} 
                          className="absolute transition-all duration-500 ease-out cursor-pointer hover:z-30"
                          style={{
                            transform: `translate3d(${x}px, 0, 0) rotateY(${randomRotate}deg)`,
                            transformStyle: 'preserve-3d',
                            transition: 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                          }}
                        >
                          <Card3D 
                            card={card}
                            onClick={() => handleCardClick(card)}
                            isActive={activeCardId === card.id}
                            rotateY={0}
                          />
                          
                          {/* Add card shadow on the shelf */}
                          <div 
                            className="absolute bottom-0 w-full h-2 bg-black opacity-20 rounded-full blur-sm"
                            style={{ transform: 'translateY(2px) rotateX(90deg)' }}
                          ></div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
            
            {/* 3D floor with shadow effect */}
            <div 
              className="absolute bottom-0 w-[600px] h-[300px] bg-gradient-to-t from-gray-300 to-transparent rounded-full opacity-30"
              style={{ 
                transform: 'rotateX(90deg) translateZ(-150px)'
              }}
            ></div>
          </div>
        ) : (
          <EmptyState isDarkTheme={isDarkTheme} />
        )}
      </div>
      
      {/* Control Panel - Fixed position container for all controls */}
      <div className="absolute top-4 right-4 left-4 z-50 flex justify-between items-center">
        {/* Left side controls */}
        <Button 
          onClick={onBack}
          variant="outline"
          className="bg-black/40 backdrop-blur-md border-amber-700/50 text-amber-100 hover:bg-black/50 hover:border-amber-600/70 hover:text-amber-50 shadow-lg hover:shadow-amber-900/20 transition-all duration-300"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Return to Great Hall
        </Button>
        
        {/* Right side controls */}
        <div className="flex items-center gap-3">
          {/* Audio Controls */}
          <Button 
            variant="outline"
            size="sm"
            onClick={toggleAudio}
            className={`${audioPlaying 
              ? 'bg-amber-700/80 border-amber-600 text-amber-100' 
              : 'bg-black/40 border-amber-700/50 text-amber-100'} 
              backdrop-blur-md hover:bg-amber-800/80 hover:border-amber-500 hover:text-white
              shadow-lg hover:shadow-amber-900/20 transition-all duration-300 rounded-full p-2 h-auto w-auto`}
          >
            <div className="relative">
              {audioPlaying ? (
                <VolumeX className="h-4 w-4" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-400 animate-pulse-slow" 
                style={{ display: audioPlaying ? 'block' : 'none' }}></span>
            </div>
          </Button>
          
          {/* Dark Mode Toggle with improved styling */}
          <div className="p-1 rounded-full bg-black/40 backdrop-blur-md border border-amber-700/50 shadow-lg flex items-center">
            <Sun className={`h-3.5 w-3.5 ${!isDarkTheme ? 'text-amber-300' : 'text-amber-700/50'} transition-colors duration-300 mx-1`} />
            <Switch 
              checked={isDarkTheme}
              onCheckedChange={setIsDarkTheme}
              className="data-[state=checked]:bg-amber-900 data-[state=unchecked]:bg-amber-700/50"
            />
            <Moon className={`h-3.5 w-3.5 ${isDarkTheme ? 'text-amber-300' : 'text-amber-700/50'} transition-colors duration-300 mx-1`} />
          </div>
        </div>
      </div>
      
      {/* Improved controls for rotation */}
      {savedCards.length > 0 && (
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-3 z-40">
          <Button 
            onClick={() => rotateDisplay('left')}
            variant="outline" 
            size="sm"
            className="bg-black/40 backdrop-blur-md border-amber-700/50 text-amber-100 hover:bg-black/50 hover:border-amber-600/70 hover:text-amber-50 shadow-lg hover:shadow-amber-900/20 transition-all duration-300"
          >
            <RotateCw className="h-4 w-4 mr-2 transform rotate-180" />
            Rotate Left
          </Button>
          
          <Button 
            onClick={() => rotateDisplay('right')}
            variant="outline"
            size="sm"
            className="bg-black/40 backdrop-blur-md border-amber-700/50 text-amber-100 hover:bg-black/50 hover:border-amber-600/70 hover:text-amber-50 shadow-lg hover:shadow-amber-900/20 transition-all duration-300"
          >
            <RotateCw className="h-4 w-4 mr-2" />
            Rotate Right
          </Button>
        </div>
      )}
      
      {/* Wizarding Instructions */}
      <div className="absolute bottom-4 right-4 bg-black/40 text-amber-100 backdrop-blur-md px-4 py-2 rounded-md text-sm shadow-lg z-40 border border-amber-700/50">
        <p className="flex items-center">
          <Bookmark className="h-3 w-3 mr-1 text-amber-400" />
          {savedCards.length > 0 
            ? "Click on a student identity tome for details" 
            : "Add students to begin your wizarding collection"}
        </p>
      </div>
      
      {/* Card details preview when a card is selected - styled like a magical parchment */}
      {activeCardId && (
        <div className="absolute top-16 right-4 bg-black/40 text-amber-100 backdrop-blur-md p-4 rounded-lg shadow-lg animate-slideInRight z-40 border border-amber-700/50 overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute -top-10 -right-10 w-24 h-24 bg-amber-500/10 rounded-full blur-lg"></div>
          <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-amber-500/10 rounded-full blur-lg"></div>
          
          <h3 className="font-bold text-lg mb-3 font-serif flex items-center">
            <Bookmark className="h-4 w-4 mr-2 text-amber-400" />
            Magical Book Details
          </h3>
          
          {/* Decorative divider */}
          <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-amber-500/70 to-transparent mb-3"></div>
          
          {savedCards.find(card => card.id === activeCardId) && (
            <div className="relative">
              {/* Student details with magical styling */}
              <div className="text-sm space-y-2 mb-4">
                <p className="flex items-center">
                  <span className="w-2 h-2 rounded-full bg-amber-500 inline-block mr-2"></span>
                  <span className="font-medium text-amber-200">Wizard Name:</span> 
                  <span className="ml-1">{savedCards.find(card => card.id === activeCardId)?.student.name}</span>
                </p>
                <p className="flex items-center">
                  <span className="w-2 h-2 rounded-full bg-amber-500 inline-block mr-2"></span>
                  <span className="font-medium text-amber-200">Registry ID:</span> 
                  <span className="ml-1">{savedCards.find(card => card.id === activeCardId)?.student.rollNumber}</span>
                </p>
                <p className="flex items-center">
                  <span className="w-2 h-2 rounded-full bg-amber-500 inline-block mr-2"></span>
                  <span className="font-medium text-amber-200">Class:</span> 
                  <span className="ml-1">{savedCards.find(card => card.id === activeCardId)?.student.classDivision}</span>
                </p>
              </div>
              
              {/* Action button with improved styling */}
              <Button 
                size="sm" 
                className="w-full bg-amber-700/80 hover:bg-amber-600 text-amber-100 border border-amber-500/50 shadow-md hover:shadow-amber-900/30 transition-all duration-300"
                onClick={() => {
                  const card = savedCards.find(c => c.id === activeCardId);
                  if (card) onSelectCard(card);
                }}
              >
                <BookOpen className="h-4 w-4 mr-2" />
                Edit Magical Card
              </Button>
              
              {/* Magical sparkle effect */}
              <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-300 animate-pulse-slow opacity-70 blur-[1px]"></div>
              <div className="absolute bottom-1 left-1 w-2 h-2 rounded-full bg-amber-300 animate-pulse-slow opacity-70 blur-[1px] delay-300"></div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}