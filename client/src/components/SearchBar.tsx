import { useState, useEffect, useRef } from "react";
import { Search, X, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";

interface SearchBarProps {
  placeholder?: string;
  onSelect?: (item: string) => void;
  className?: string;
}

export default function SearchBar({ placeholder = "Search...", onSelect, className = "" }: SearchBarProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const searchTimerRef = useRef<number | null>(null);
  const { toast } = useToast();

  // Initialize WebSocket connection
  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    const ws = new WebSocket(wsUrl);
    
    ws.onopen = () => {
      console.log("WebSocket connection established");
      setSocketConnected(true);
    };
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'connection_established') {
          console.log(data.message);
        }
        else if (data.type === 'search_results') {
          setSuggestions(data.results);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };
    
    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      toast({
        title: "Connection Error",
        description: "Failed to connect to search service.",
        variant: "destructive",
      });
      setSocketConnected(false);
    };
    
    ws.onclose = () => {
      console.log("WebSocket connection closed");
      setSocketConnected(false);
    };
    
    setSocket(ws);
    
    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [toast]);

  // Handle search input change with debounce
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    
    if (searchTimerRef.current) {
      window.clearTimeout(searchTimerRef.current);
    }
    
    if (value.trim().length > 1) {
      setIsLoading(true);
      setIsOpen(true);
      
      // Debounce search to avoid too many requests
      searchTimerRef.current = window.setTimeout(() => {
        if (socket && socket.readyState === WebSocket.OPEN) {
          socket.send(JSON.stringify({
            type: 'search',
            query: value
          }));
        } else {
          setIsLoading(false);
          toast({
            title: "Search Unavailable",
            description: "Search service is currently unavailable.",
            variant: "destructive",
          });
        }
      }, 300);
    } else {
      setIsOpen(false);
      setSuggestions([]);
      setIsLoading(false);
    }
  };

  const handleSelect = (item: string) => {
    setSearchTerm(item);
    setIsOpen(false);
    if (onSelect) {
      onSelect(item);
    }
  };

  const clearSearch = () => {
    setSearchTerm("");
    setSuggestions([]);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={placeholder}
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10 pr-10 focus-visible:ring-[#4CAF50]"
              onFocus={() => searchTerm.trim().length > 1 && setIsOpen(true)}
            />
            {searchTerm ? (
              <Button
                variant="ghost"
                onClick={clearSearch}
                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </Button>
            ) : null}
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandList>
              {isLoading ? (
                <div className="flex justify-center items-center py-6">
                  <Loader2 className="h-6 w-6 animate-spin text-[#4CAF50]" />
                </div>
              ) : (
                <>
                  {!socketConnected && (
                    <CommandEmpty className="py-6 text-center">
                      Search service unavailable
                    </CommandEmpty>
                  )}
                  
                  {socketConnected && suggestions.length === 0 && (
                    <CommandEmpty className="py-6 text-center">
                      No results found
                    </CommandEmpty>
                  )}
                  
                  {suggestions.length > 0 && (
                    <CommandGroup heading="Suggestions">
                      {suggestions.map((item, index) => (
                        <CommandItem 
                          key={`${item}-${index}`}
                          onSelect={() => handleSelect(item)}
                          className="cursor-pointer"
                        >
                          {item}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}