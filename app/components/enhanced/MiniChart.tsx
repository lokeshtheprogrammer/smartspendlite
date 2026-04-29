"use client";

import { useEffect, useRef, useState } from "react";

interface MiniChartProps {
  data: number[];
  height?: number;
  color?: string;
  showGradient?: boolean;
  animated?: boolean;
  className?: string;
}

export function MiniChart({ 
  data, 
  height = 60, 
  color = "#006adc", 
  showGradient = true,
  animated = true,
  className = ""
}: MiniChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || data.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    // Clear canvas
    ctx.clearRect(0, 0, rect.width, height);

    // Calculate points
    const padding = 8;
    const width = rect.width - padding * 2;
    const chartHeight = height - padding * 2;
    
    const maxValue = Math.max(...data);
    const minValue = Math.min(...data);
    const range = maxValue - minValue || 1;
    
    const points = data.map((value, index) => ({
      x: padding + (index / (data.length - 1)) * width,
      y: padding + (1 - (value - minValue) / range) * chartHeight
    }));

    // Draw gradient fill
    if (showGradient) {
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, color + '40');
      gradient.addColorStop(1, color + '00');
      
      ctx.beginPath();
      ctx.moveTo(points[0].x, height);
      points.forEach(point => ctx.lineTo(point.x, point.y));
      ctx.lineTo(points[points.length - 1].x, height);
      ctx.closePath();
      ctx.fillStyle = gradient;
      ctx.fill();
    }

    // Draw line
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    
    if (animated) {
      setTimeout(() => setIsAnimating(true), 0);
      let currentPoint = 0;
      
      const animateLine = () => {
        if (currentPoint < points.length - 1) {
          ctx.lineTo(points[currentPoint + 1].x, points[currentPoint + 1].y);
          ctx.strokeStyle = color;
          ctx.lineWidth = 2;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.stroke();
          
          currentPoint++;
          requestAnimationFrame(animateLine);
        } else {
          setIsAnimating(false);
        }
      };
      
      animateLine();
    } else {
      points.forEach(point => ctx.lineTo(point.x, point.y));
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();
    }

    // Draw dots
    points.forEach((point) => {
      ctx.beginPath();
      ctx.arc(point.x, point.y, 3, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      
      // Add white center
      ctx.beginPath();
      ctx.arc(point.x, point.y, 1.5, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
    });

  }, [data, height, color, showGradient, animated]);

  return (
    <div className={`relative ${className}`}>
      <canvas 
        ref={canvasRef}
        className="w-full"
        style={{ height: `${height}px` }}
      />
      {isAnimating && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
        </div>
      )}
    </div>
  );
}
