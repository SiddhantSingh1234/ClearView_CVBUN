import React, { useEffect, useRef } from "react";
import { useTheme } from "next-themes";

interface PoliticalLeaningData {
  farLeft: number;
  leanLeft: number;
  center: number;
  leanRight: number;
  farRight: number;
}

interface PoliticalLeaningBarProps {
  data: PoliticalLeaningData;
  className?: string;
}

const PoliticalLeaningBar: React.FC<PoliticalLeaningBarProps> = ({ 
  data, 
  className = "" 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { theme, systemTheme } = useTheme();
  
  // Determine if dark mode is active
  const isDarkMode = theme === "dark" || (theme === "system" && systemTheme === "dark");

  // Color mapping for light and dark modes
  const colorMapping = {
    light: {
      farLeft: "#1e3a8a", // blue-900
      leanLeft: "#3b82f6", // blue-500
      center: "#6b7280", // gray-500
      leanRight: "#ef4444", // red-500
      farRight: "#991b1b", // red-800
    },
    dark: {
      farLeft: "#93c5fd", // blue-300
      leanLeft: "#3b82f6", // blue-500
      center: "#9ca3af", // gray-400
      leanRight: "#f87171", // red-400
      farRight: "#fca5a5", // red-300
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas dimensions to match displayed size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const colors = isDarkMode ? colorMapping.dark : colorMapping.light;

    const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
    
    // Calculate positions for gradient stops
    let position = 0;
    const addGradientStop = (color: string, value: number) => {
      gradient.addColorStop(position, color);
      position += value;
      gradient.addColorStop(Math.min(position, 1), color);
    };

    // Add color stops in political spectrum order
    addGradientStop(colors.farLeft, data.farLeft);
    addGradientStop(colors.leanLeft, data.leanLeft);
    addGradientStop(colors.center, data.center);
    addGradientStop(colors.leanRight, data.leanRight);
    addGradientStop(colors.farRight, data.farRight);

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, [data, theme, systemTheme, isDarkMode]);

  return (
    <div className={`flex flex-col items-center w-full gap-4 ${className}`}>
      {/* Canvas for gradient */}
      <canvas 
        ref={canvasRef} 
        className="w-full h-8 rounded-md shadow-sm" 
        aria-label="Political leaning distribution visualization"
      />
      
      {/* Labels and color indicators */}
      <div className="flex w-full text-sm justify-between">
        {/* Far Left */}
        <div className="flex flex-col items-center w-1/5">
          <div className={`w-4 h-4 rounded-full mb-1 ${isDarkMode ? 'bg-blue-300' : 'bg-blue-900'}`}></div>
          <span className="font-medium">Far Left</span>
          <span className="text-xs">{(data.farLeft * 100).toFixed(1)}%</span>
        </div>
        
        {/* Lean Left */}
        <div className="flex flex-col items-center w-1/5">
          <div className="w-4 h-4 rounded-full mb-1 bg-blue-500"></div>
          <span className="font-medium">Lean Left</span>
          <span className="text-xs">{(data.leanLeft * 100).toFixed(1)}%</span>
        </div>
        
        {/* Center */}
        <div className="flex flex-col items-center w-1/5">
          <div className={`w-4 h-4 rounded-full mb-1 ${isDarkMode ? 'bg-gray-400' : 'bg-gray-500'}`}></div>
          <span className="font-medium">Center</span>
          <span className="text-xs">{(data.center * 100).toFixed(1)}%</span>
        </div>
        
        {/* Lean Right */}
        <div className="flex flex-col items-center w-1/5">
          <div className={`w-4 h-4 rounded-full mb-1 ${isDarkMode ? 'bg-red-400' : 'bg-red-500'}`}></div>
          <span className="font-medium">Lean Right</span>
          <span className="text-xs">{(data.leanRight * 100).toFixed(1)}%</span>
        </div>
        
        {/* Far Right */}
        <div className="flex flex-col items-center w-1/5">
          <div className={`w-4 h-4 rounded-full mb-1 ${isDarkMode ? 'bg-red-300' : 'bg-red-800'}`}></div>
          <span className="font-medium">Far Right</span>
          <span className="text-xs">{(data.farRight * 100).toFixed(1)}%</span>
        </div>
      </div>
    </div>
  );
};

export default PoliticalLeaningBar;