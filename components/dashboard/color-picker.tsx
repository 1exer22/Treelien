'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Palette } from 'lucide-react';

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  disabled?: boolean;
}

const presetColors = [
  '#3B82F6', '#8B5CF6', '#EC4899', '#10B981', '#F59E0B', '#EF4444',
  '#6366F1', '#14B8A6', '#F97316', '#84CC16', '#06B6D4', '#8B5A2B',
  '#000000', '#374151', '#6B7280', '#9CA3AF', '#D1D5DB', '#FFFFFF'
];

export function ColorPicker({ color, onChange, disabled = false }: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(color);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setInputValue(color);
  }, [color]);

  const handleColorChange = (newColor: string) => {
    setInputValue(newColor);
    onChange(newColor);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    
    // Valider le format hex
    if (/^#[0-9A-F]{6}$/i.test(value)) {
      onChange(value);
    }
  };

  const handleInputBlur = () => {
    // Si la valeur n'est pas valide, revenir à la couleur précédente
    if (!/^#[0-9A-F]{6}$/i.test(inputValue)) {
      setInputValue(color);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-start space-x-2 h-10"
          disabled={disabled}
        >
          <div 
            className="w-6 h-6 rounded border-2 border-white shadow-sm"
            style={{ backgroundColor: color }}
          />
          <span className="font-mono text-sm">{color}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-4" align="start">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Couleur personnalisée</label>
            <div className="flex space-x-2">
              <Input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                onBlur={handleInputBlur}
                placeholder="#000000"
                className="font-mono"
                maxLength={7}
              />
              <input
                type="color"
                value={color}
                onChange={(e) => handleColorChange(e.target.value)}
                className="w-10 h-10 rounded border border-gray-300 cursor-pointer"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Couleurs prédéfinies</label>
            <div className="grid grid-cols-6 gap-2">
              {presetColors.map((presetColor) => (
                <button
                  key={presetColor}
                  className={`w-8 h-8 rounded border-2 transition-all hover:scale-110 ${
                    color === presetColor 
                      ? 'border-gray-900 ring-2 ring-blue-500' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  style={{ backgroundColor: presetColor }}
                  onClick={() => {
                    handleColorChange(presetColor);
                    setIsOpen(false);
                  }}
                  title={presetColor}
                />
              ))}
            </div>
          </div>

          <div className="pt-2 border-t">
            <Button
              variant="ghost"
              size="sm"
              className="w-full"
              onClick={() => setIsOpen(false)}
            >
              Fermer
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}