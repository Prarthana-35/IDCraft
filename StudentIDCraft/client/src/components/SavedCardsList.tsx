import { useState } from "react";
import { SavedCard } from "@/types";
import { Card } from "@/components/ui/card";
import { toPng } from "html-to-image";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { useRef, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";

interface SavedCardsListProps {
  savedCards: SavedCard[];
  onBackClick: () => void;
}

export default function SavedCardsList({ savedCards, onBackClick }: SavedCardsListProps) {
  const { toast } = useToast();
  const [renderedCards, setRenderedCards] = useState<Record<string, HTMLDivElement>>({});
  const containerRef = useRef<HTMLDivElement>(null);

  // Function to download a saved card
  const downloadSavedCard = async (card: SavedCard) => {
    try {
      const cardElement = renderedCards[card.id];
      
      if (!cardElement) {
        toast({
          title: "Error",
          description: "Unable to download card",
          variant: "destructive",
        });
        return;
      }
      
      const dataUrl = await toPng(cardElement, { quality: 0.95 });
      
      // Create a link and trigger download
      const link = document.createElement("a");
      link.download = `unity-id-${card.student.name.replace(/\s+/g, "-").toLowerCase()}.png`;
      link.href = dataUrl;
      link.click();
      
      toast({
        title: "Success",
        description: "ID Card downloaded successfully!",
      });
    } catch (error) {
      console.error("Error downloading card:", error);
      toast({
        title: "Error",
        description: "Failed to download ID card",
        variant: "destructive",
      });
    }
  };

  // Function to render a card based on its template
  const renderCard = (card: SavedCard, ref: React.RefObject<HTMLDivElement>) => {
    const { student, template } = card;
    
    if (template === 1) {
      return (
        <div className="hidden" ref={ref}>
          <div className="w-full max-w-md mx-auto">
            <div className="border-8 border-primary rounded-xl overflow-hidden shadow-xl bg-white">
              {/* Card Header */}
              <div className="bg-primary text-white py-3 px-4 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-10 h-10 mr-3">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                      <span className="text-primary font-bold text-xl">U</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">UNITY SCHOOL</h3>
                    <p className="text-xs text-blue-100">Student Identity Card</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs bg-white text-primary px-2 py-1 rounded font-medium">
                    {new Date().getFullYear()}-{new Date().getFullYear() + 1}
                  </span>
                </div>
              </div>
              
              {/* Card Body */}
              <div className="p-4 flex">
                <div className="w-1/3 mr-4">
                  <div className="w-full aspect-square bg-gray-100 rounded-lg overflow-hidden shadow">
                    <img
                      src={student.photo}
                      alt="Student"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div className="mt-3 bg-gray-100 p-2 rounded-lg flex items-center justify-center">
                    <div className="w-24 h-24 bg-white p-1 rounded">
                      <QRCodeSVG
                        value={JSON.stringify({
                          id: student.id,
                          name: student.name,
                          rollNumber: student.rollNumber,
                          classDivision: student.classDivision,
                          rackNumber: student.rackNumber,
                          busRoute: student.busRoute,
                          allergies: student.allergies
                        })}
                        size={96}
                        level="M"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="w-2/3">
                  <table className="w-full text-sm">
                    <tbody>
                      <tr>
                        <td className="py-2 text-gray-500 font-medium">Name:</td>
                        <td className="py-2 font-semibold text-gray-800">{student.name}</td>
                      </tr>
                      <tr>
                        <td className="py-2 text-gray-500 font-medium">Roll Number:</td>
                        <td className="py-2 font-semibold text-gray-800">{student.rollNumber}</td>
                      </tr>
                      <tr>
                        <td className="py-2 text-gray-500 font-medium">Class/Division:</td>
                        <td className="py-2 font-semibold text-gray-800">{student.classDivision}</td>
                      </tr>
                      <tr>
                        <td className="py-2 text-gray-500 font-medium">Rack Number:</td>
                        <td className="py-2 font-semibold text-gray-800">{student.rackNumber}</td>
                      </tr>
                      <tr>
                        <td className="py-2 text-gray-500 font-medium">Bus Route:</td>
                        <td className="py-2 font-semibold text-gray-800">Route {student.busRoute}</td>
                      </tr>
                      <tr>
                        <td className="py-2 text-gray-500 font-medium align-top">Allergies:</td>
                        <td className="py-2">
                          {student.allergies.length > 0 ? (
                            student.allergies.map((allergy) => (
                              <span
                                key={allergy}
                                className="inline-block bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full mr-1 mb-1"
                              >
                                {allergy.charAt(0).toUpperCase() + allergy.slice(1)}
                              </span>
                            ))
                          ) : (
                            <span className="text-gray-400">None</span>
                          )}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              
              <div className="bg-gray-100 px-4 py-3 text-center text-xs text-gray-600 flex justify-between items-center">
                <div>Valid until: <span className="font-medium">June 30, {new Date().getFullYear() + 1}</span></div>
                <div>ID: <span className="font-medium">{student.id}</span></div>
              </div>
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <div className="hidden" ref={ref}>
          <div className="w-full max-w-md mx-auto">
            <div className="rounded-xl overflow-hidden shadow-xl bg-gradient-to-r from-indigo-800 to-indigo-600">
              {/* Card Header */}
              <div className="py-3 px-5 flex items-center justify-between bg-white">
                <div className="flex items-center">
                  <div className="w-12 h-12 mr-3">
                    <div className="w-12 h-12 rounded-full bg-indigo-800 flex items-center justify-center">
                      <span className="text-white font-bold text-2xl">U</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-xl text-indigo-800">UNITY SCHOOL</h3>
                    <p className="text-xs text-indigo-600">Excellence in Education</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full font-medium">
                    {new Date().getFullYear()}-{new Date().getFullYear() + 1}
                  </span>
                </div>
              </div>
              
              <div className="p-5">
                <div className="mb-4 text-center">
                  <h3 className="font-bold text-xl text-white mb-1">{student.name}</h3>
                  <p className="text-indigo-200">{student.classDivision} | Roll #{student.rollNumber}</p>
                </div>
                
                <div className="flex items-center">
                  <div className="w-1/3">
                    <div className="w-full aspect-square bg-white rounded-lg overflow-hidden shadow-lg p-1">
                      <img
                        src={student.photo}
                        alt="Student"
                        className="w-full h-full object-cover rounded"
                      />
                    </div>
                  </div>
                  
                  <div className="w-2/3 pl-5">
                    <div className="bg-indigo-700 bg-opacity-50 rounded-lg p-3">
                      <table className="w-full text-sm">
                        <tbody>
                          <tr>
                            <td className="py-1 text-indigo-200">Roll No:</td>
                            <td className="py-1 font-medium text-white">{student.rollNumber}</td>
                          </tr>
                          <tr>
                            <td className="py-1 text-indigo-200">Rack No:</td>
                            <td className="py-1 font-medium text-white">{student.rackNumber}</td>
                          </tr>
                          <tr>
                            <td className="py-1 text-indigo-200">Bus Route:</td>
                            <td className="py-1 font-medium text-white">Route {student.busRoute}</td>
                          </tr>
                          <tr>
                            <td className="py-1 text-indigo-200">Allergies:</td>
                            <td className="py-1 font-medium">
                              {student.allergies.length > 0 ? (
                                student.allergies.map((allergy) => (
                                  <span
                                    key={allergy}
                                    className="inline-block bg-red-500 text-white text-xs px-2 py-0.5 rounded mr-1 mb-1"
                                  >
                                    {allergy.charAt(0).toUpperCase() + allergy.slice(1)}
                                  </span>
                                ))
                              ) : (
                                <span className="text-indigo-200">None</span>
                              )}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-center mt-4">
                  <div className="bg-white p-2 rounded-lg">
                    <QRCodeSVG
                      value={JSON.stringify({
                        id: student.id,
                        name: student.name,
                        rollNumber: student.rollNumber,
                        classDivision: student.classDivision,
                        rackNumber: student.rackNumber,
                        busRoute: student.busRoute,
                        allergies: student.allergies
                      })}
                      size={96}
                      level="M"
                    />
                  </div>
                </div>
              </div>
              
              <div className="bg-indigo-900 px-5 py-2.5 text-center text-xs text-indigo-200 flex justify-between items-center">
                <div>Valid until: <span className="font-medium text-white">June 30, {new Date().getFullYear() + 1}</span></div>
                <div>ID: <span className="font-medium text-white">{student.id}</span></div>
              </div>
            </div>
          </div>
        </div>
      );
    }
  };

  // Set up card refs for downloading
  useEffect(() => {
    // Ensure QR code is loaded
  }, []);

  const registerCardRef = (cardId: string, element: HTMLDivElement | null) => {
    if (element && !renderedCards[cardId]) {
      setRenderedCards(prev => ({
        ...prev,
        [cardId]: element
      }));
    }
  };

  return (
    <Card className="bg-white p-6 rounded-xl shadow-md">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center">
          <i className="ri-gallery-line mr-2 text-primary"></i> Previously Generated Cards
        </h2>
        <button 
          className="text-gray-600 hover:text-primary transition-colors"
          onClick={onBackClick}
        >
          <span className="flex items-center">
            <i className="ri-arrow-left-line mr-1"></i> Back to Form
          </span>
        </button>
      </div>
      
      {/* Empty State */}
      {savedCards.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          <i className="ri-folder-3-line text-5xl mb-3"></i>
          <p>No cards have been generated yet.</p>
          <button 
            className="mt-4 text-primary hover:text-blue-700 underline"
            onClick={onBackClick}
          >
            Create your first ID card
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedCards.map((card) => (
            <div
              key={card.id}
              className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Card Preview Thumbnail */}
              <div className="h-40 bg-gray-50 border-b">
                <div className="w-full h-full flex items-center justify-center overflow-hidden">
                  <img
                    src={card.student.photo}
                    alt="Card preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              
              {/* Card Details */}
              <div className="p-3">
                <h3 className="font-medium">{card.student.name}</h3>
                <p className="text-sm text-gray-600">{card.student.classDivision}</p>
                <div className="mt-3 flex justify-between">
                  <span className="text-xs text-gray-500">
                    {format(new Date(card.createdAt), "MMM d, yyyy")}
                  </span>
                  <button
                    className="text-sm text-primary hover:text-blue-700"
                    onClick={() => downloadSavedCard(card)}
                  >
                    <i className="ri-download-line"></i> Download
                  </button>
                </div>
              </div>

              {/* Hidden rendered card for download */}
              {renderCard(card, {
                get current() { return null; },
                set current(element: HTMLDivElement | null) {
                  if (element) registerCardRef(card.id, element);
                }
              })}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
