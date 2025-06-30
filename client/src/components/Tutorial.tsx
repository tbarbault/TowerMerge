import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { X, ArrowRight, ArrowLeft } from "lucide-react";

interface TutorialStep {
  title: string;
  content: string;
  highlight?: string;
}

interface TutorialProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

const tutorialSteps: TutorialStep[] = [
  {
    title: "Welcome to Tower Defense!",
    content: "This is a 3D tower defense game where you must defend your base from waves of enemies. Let's learn the basics!",
  },
  {
    title: "Placing Towers",
    content: "Click on empty green squares to place towers. You can choose between Turrets (fast, short range) and Mortars (slow, long range, area damage).",
    highlight: "towers"
  },
  {
    title: "Game Modes",
    content: "Choose your difficulty: Normal (20 lives, 75 coins), Hardcore (1 life, 75 coins), or Legend (1 life, 50 coins, expensive towers).",
    highlight: "modes"
  },
  {
    title: "Managing Resources",
    content: "You start with coins to buy towers. Defeat enemies to earn more coins. Merge identical towers by dragging them together to create stronger versions!",
    highlight: "resources"
  },
  {
    title: "Research Tree",
    content: "Earn diamonds by completing waves and spend them in the Research Tree to unlock permanent upgrades for your towers and abilities.",
    highlight: "research"
  },
  {
    title: "Wave Events",
    content: "Random events may occur between waves, giving buffs or debuffs. Click on event alerts to skip the countdown and start the wave immediately.",
    highlight: "events"
  },
  {
    title: "Ready to Play!",
    content: "You're all set! Choose a game mode and start defending. Good luck, commander!",
  }
];

export default function Tutorial({ isOpen, onClose, onComplete }: TutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
    }
  }, [isOpen]);

  const nextStep = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const skipTutorial = () => {
    onComplete();
  };

  if (!isOpen) return null;

  const step = tutorialSteps[currentStep];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-8">
      <Card className="bg-gradient-to-br from-blue-900 to-purple-900 border-blue-500 max-w-sm w-full mx-4">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-white">
            Tutorial ({currentStep + 1}/{tutorialSteps.length})
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClose}
            className="text-white hover:bg-white/20"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4 p-4">
          <div className="text-center space-y-3">
            <h3 className="text-lg font-bold text-yellow-400">
              {step.title}
            </h3>
            <p className="text-gray-200 leading-relaxed text-sm">
              {step.content}
            </p>
          </div>

          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 0}
              size="sm"
              className="bg-transparent border-gray-400 text-white hover:bg-white/20 rounded-lg"
            >
              <ArrowLeft className="h-3 w-3 mr-1" />
              Previous
            </Button>

            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={skipTutorial}
                size="sm"
                className="bg-transparent border-gray-400 text-white hover:bg-white/20 rounded-lg"
              >
                Skip
              </Button>
              <Button
                onClick={nextStep}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
              >
                {currentStep === tutorialSteps.length - 1 ? "Finish" : "Next"}
                <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}