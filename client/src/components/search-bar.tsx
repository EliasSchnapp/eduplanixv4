import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, X, Filter, SortAsc, SortDesc } from "lucide-react";

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

export default function SearchBar({ onSearch, placeholder = "Suchen..." }: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    onSearch(value);
  };

  const clearSearch = () => {
    setSearchQuery("");
    onSearch("");
  };

  const quickSearchTerms = [
    "Mathematik", "Deutsch", "Englisch", "Physik", "Chemie", "Biologie", 
    "Geschichte", "Geographie", "Informatik", "Kunst", "Sport", "Musik"
  ];

  const handleQuickSearch = (term: string) => {
    setSearchQuery(term);
    onSearch(term);
  };

  return (
    <div className="space-y-4">
      <div className="relative flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-cyan-400" />
          <Input
            type="text"
            placeholder={placeholder}
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10 pr-10 bg-black/50 border-cyan-500/30 text-cyan-100 placeholder:text-cyan-400/60 focus:border-cyan-400 focus:ring-cyan-400/20"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSearch}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-cyan-500/20"
            >
              <X className="h-3 w-3 text-cyan-400" />
            </Button>
          )}
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className="border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/10"
        >
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          className="border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/10"
        >
          {sortOrder === 'asc' ? (
            <SortAsc className="h-4 w-4" />
          ) : (
            <SortDesc className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Quick Search Terms */}
      <div className="flex flex-wrap gap-2">
        {quickSearchTerms.map((term) => (
          <Badge
            key={term}
            variant="outline"
            className="border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20 cursor-pointer transition-colors"
            onClick={() => handleQuickSearch(term)}
          >
            {term}
          </Badge>
        ))}
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="bg-black/50 border border-cyan-500/30 rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-cyan-300 mb-2">
                Zeitraum
              </label>
              <select className="w-full bg-black/50 border border-cyan-500/30 rounded-md px-3 py-2 text-cyan-100">
                <option>Alle</option>
                <option>Letzte Woche</option>
                <option>Letzter Monat</option>
                <option>Letztes Jahr</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-cyan-300 mb-2">
                Typ
              </label>
              <select className="w-full bg-black/50 border border-cyan-500/30 rounded-md px-3 py-2 text-cyan-100">
                <option>Alle</option>
                <option>Noten</option>
                <option>Hausaufgaben</option>
                <option>Termine</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-cyan-300 mb-2">
                Status
              </label>
              <select className="w-full bg-black/50 border border-cyan-500/30 rounded-md px-3 py-2 text-cyan-100">
                <option>Alle</option>
                <option>Abgeschlossen</option>
                <option>Ausstehend</option>
                <option>Überfällig</option>
              </select>
            </div>
          </div>
          
          <div className="flex justify-between items-center mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(false)}
              className="border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/10"
            >
              Filter schließen
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="border-yellow-500/30 text-yellow-300 hover:bg-yellow-500/10"
              >
                Filter zurücksetzen
              </Button>
              <Button
                size="sm"
                className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white"
              >
                Filter anwenden
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Search Results Info */}
      {searchQuery && (
        <div className="text-sm text-cyan-400">
          Suche nach: <span className="font-semibold text-cyan-300">"{searchQuery}"</span>
        </div>
      )}
    </div>
  );
}