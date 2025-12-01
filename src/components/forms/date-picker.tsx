import * as React from 'react';
import { CalendarIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

export const DatePicker: React.FC = () => {
  const [open, setOpen] = React.useState(false);

  // Helper to format date → dd.mm.yyyy
  const formatDate = (d: Date) =>
    `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`;

  // Default to today's date
  const today = new Date();
  const [date, setDate] = React.useState<Date | undefined>(today);
  const [inputValue, setInputValue] = React.useState(formatDate(today));

  // Parse dd.mm.yyyy → Date
  const parseDate = (str: string): Date | undefined => {
    const [day, month, year] = str.split('.').map(Number);
    if (!day || !month || !year) return undefined;
    const parsed = new Date(year, month - 1, day);
    return isNaN(parsed.getTime()) ? undefined : parsed;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    const parsed = parseDate(value);
    if (parsed) setDate(parsed);
  };

  const handleSelect = (selectedDate?: Date) => {
    if (selectedDate) {
      setDate(selectedDate);
      setInputValue(formatDate(selectedDate));
      setOpen(false);
    }
  };

  return (
    <div className="space-y-3">
      <Label htmlFor="date" className="text-base font-medium">
        Select Order Date
      </Label>
      <div className="flex items-center gap-3">
        {/* Manual input field */}
        <input
          id="date"
          type="text"
          placeholder="dd.mm.yyyy"
          value={inputValue}
          onChange={handleInputChange}
          className={cn(
            'w-44 rounded-md border border-input bg-background px-4 py-2.5 text-sm shadow-sm transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
          )}
        />
        {/* Calendar popover */}
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="icon" className="h-10 w-10">
              <CalendarIcon className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            side="bottom"
            className="w-auto overflow-hidden p-0"
            align="start"
            sideOffset={10}
          >
            <Calendar
              mode="single"
              selected={date}
              onSelect={handleSelect}
              captionLayout="dropdown"
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};
