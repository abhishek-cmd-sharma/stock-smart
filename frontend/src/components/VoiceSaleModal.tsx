import React, { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Mic, Loader2, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";
import { parseVoiceCommand, ParsedVoiceCommand } from "@/lib/voiceParser";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface VoiceSaleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  inventory: any[];
  onConfirmSale: (productId: string, productName: string, quantity: number, totalAmount: number) => Promise<void>;
}

export function VoiceSaleModal({ open, onOpenChange, inventory, onConfirmSale }: VoiceSaleModalProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [parsedCommand, setParsedCommand] = useState<ParsedVoiceCommand | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const recognitionRef = useRef<any>(null);

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = "en-IN"; // English (India)

        recognitionRef.current.onresult = (event: any) => {
          let currentTranscript = "";
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            currentTranscript += event.results[i][0].transcript;
          }
          setTranscript(currentTranscript);
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error("Speech recognition error", event.error);
          setIsListening(false);
          if (event.error !== "no-speech") {
            setParsedCommand({ quantity: null, productName: null, matchedProduct: null, error: `Microphone error: ${event.error}` });
          }
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
      }
    }
  }, []);

  // Parse transcript when recording stops
  useEffect(() => {
    if (!isListening && transcript && !success && !isProcessing && !parsedCommand) {
      handleParseTranscript();
    }
  }, [isListening, transcript]);

  // Reset state when opened
  useEffect(() => {
    if (open) {
      resetState();
      startListening();
    } else {
      stopListening();
    }
  }, [open]);

  const resetState = () => {
    setTranscript("");
    setParsedCommand(null);
    setSuccess(false);
    setIsProcessing(false);
  };

  const startListening = () => {
    if (!recognitionRef.current) {
      setParsedCommand({ quantity: null, productName: null, matchedProduct: null, error: "Your browser does not support voice recognition." });
      return;
    }

    try {
      resetState();
      setIsListening(true);
      recognitionRef.current.start();
    } catch (err) {
      console.error("Failed to start listening", err);
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const handleParseTranscript = () => {
    const result = parseVoiceCommand(transcript, inventory);
    
    // Additional Validation: Check stock quantity
    if (result.matchedProduct && result.quantity !== null) {
      if (result.quantity > result.matchedProduct.totalQuantity) {
        result.error = `Insufficient stock. Available: ${result.matchedProduct.totalQuantity}, Requested: ${result.quantity}`;
      } else if (result.quantity <= 0) {
        result.error = `Invalid quantity requested: ${result.quantity}`;
      }
    } else if (!result.error) {
      if (!result.matchedProduct) result.error = "Could not identify the product.";
      else if (result.quantity === null) result.error = "Could not identify the quantity.";
    }

    setParsedCommand(result);
  };

  const handleConfirm = async () => {
    if (!parsedCommand || !parsedCommand.matchedProduct || !parsedCommand.quantity) return;
    
    setIsProcessing(true);
    try {
      const product = parsedCommand.matchedProduct;
      const totalAmount = parsedCommand.quantity * product.price;
      
      await onConfirmSale(product.id, product.name, parsedCommand.quantity, totalAmount);
      
      setSuccess(true);
      
      // Optional Voice Feedback
      if ("speechSynthesis" in window) {
        const utterance = new SpeechSynthesisUtterance(`Sale recorded successfully. ${parsedCommand.quantity} ${product.name} sold.`);
        window.speechSynthesis.speak(utterance);
      }

      // Close modal after delay
      setTimeout(() => {
        onOpenChange(false);
      }, 2000);

    } catch (err: any) {
      toast.error(err.message || "Failed to record sale");
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">Voice Sale</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center p-6 space-y-6">
          
          {success ? (
            <div className="flex flex-col items-center space-y-4 animate-in zoom-in duration-300">
              <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="h-10 w-10 text-green-600" />
              </div>
              <h3 className="text-lg font-medium text-green-700">Sale recorded successfully!</h3>
            </div>
          ) : parsedCommand && !parsedCommand.error ? (
            <div className="w-full space-y-4">
              <div className="bg-muted p-4 rounded-xl border border-border">
                <h4 className="text-sm font-semibold text-muted-foreground uppercase mb-2">Confirm Sale</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Product</span>
                    <span className="font-medium text-right">{parsedCommand.matchedProduct.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Quantity</span>
                    <span className="font-medium">{parsedCommand.quantity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Unit Price</span>
                    <span className="font-medium">₹{parsedCommand.matchedProduct.price}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t mt-2 font-bold text-base">
                    <span>Total</span>
                    <span>₹{parsedCommand.quantity! * parsedCommand.matchedProduct.price}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 w-full">
                <Button variant="outline" className="flex-1" onClick={startListening} disabled={isProcessing}>
                  Retry
                </Button>
                <Button className="flex-1" onClick={handleConfirm} disabled={isProcessing}>
                  {isProcessing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Confirm Sale"}
                </Button>
              </div>
            </div>
          ) : parsedCommand?.error ? (
            <div className="w-full space-y-4 flex flex-col items-center">
               <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mb-2">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
              <p className="text-center text-red-600 font-medium">{parsedCommand.error}</p>
              
              <div className="bg-muted w-full p-3 rounded-lg text-sm italic text-center">
                "{transcript}"
              </div>

              <Button onClick={startListening} className="mt-4 w-full">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-6">
              <div className={`relative flex items-center justify-center h-32 w-32 rounded-full transition-all duration-300 ${isListening ? 'bg-primary/20 scale-110' : 'bg-muted'}`}>
                <AnimatePresence>
                  {isListening && (
                    <motion.div 
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                      className="absolute inset-0 rounded-full border-4 border-primary/50"
                    />
                  )}
                </AnimatePresence>
                <Button 
                  size="icon" 
                  className={`h-20 w-20 rounded-full shadow-lg z-10 transition-colors ${isListening ? 'bg-red-500 hover:bg-red-600' : 'bg-primary hover:bg-primary/90'}`}
                  onClick={isListening ? stopListening : startListening}
                >
                  <Mic className={`h-10 w-10 ${isListening ? 'animate-pulse' : ''}`} />
                </Button>
              </div>

              <div className="text-center space-y-2">
                <h3 className="text-lg font-medium">{isListening ? "Listening..." : "Tap to Speak"}</h3>
                <p className="text-sm text-muted-foreground min-h-[1.5rem]">
                  {transcript ? `"${transcript}"` : (isListening ? "Say 'Sold 5 Parle G'" : "Press the microphone to record a sale")}
                </p>
              </div>
            </div>
          )}

        </div>
      </DialogContent>
    </Dialog>
  );
}
