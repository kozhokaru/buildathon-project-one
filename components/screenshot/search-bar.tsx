"use client"

import { useState, useEffect, useRef } from 'react'
import { Search, Loader2, X, Filter } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

interface SearchBarProps {
  onSearch: (query: string, searchType: 'text' | 'visual' | 'hybrid') => void
  suggestions?: string[]
  isSearching?: boolean
  placeholder?: string
}

export function SearchBar({ 
  onSearch, 
  suggestions = [], 
  isSearching = false,
  placeholder = "Search screenshots by text or visual elements..."
}: SearchBarProps) {
  const [query, setQuery] = useState('')
  const [searchType, setSearchType] = useState<'text' | 'visual' | 'hybrid'>('hybrid')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim() && !isSearching) {
      onSearch(query.trim(), searchType)
      setShowSuggestions(false)
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion)
    setShowSuggestions(false)
    onSearch(suggestion, searchType)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedSuggestionIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedSuggestionIndex(prev => prev > 0 ? prev - 1 : -1)
        break
      case 'Enter':
        if (selectedSuggestionIndex >= 0) {
          e.preventDefault()
          handleSuggestionClick(suggestions[selectedSuggestionIndex])
        }
        break
      case 'Escape':
        setShowSuggestions(false)
        setSelectedSuggestionIndex(-1)
        break
    }
  }

  const getSearchTypeLabel = () => {
    switch (searchType) {
      case 'text':
        return 'Text Only'
      case 'visual':
        return 'Visual Only'
      case 'hybrid':
        return 'All Content'
    }
  }

  const getSearchTypeColor = () => {
    switch (searchType) {
      case 'text':
        return 'bg-blue-500'
      case 'visual':
        return 'bg-purple-500'
      case 'hybrid':
        return 'bg-green-500'
    }
  }

  return (
    <form onSubmit={handleSubmit} className="relative w-full">
      <div className="relative flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setShowSuggestions(e.target.value.length > 0 && suggestions.length > 0)
              setSelectedSuggestionIndex(-1)
            }}
            onFocus={() => setShowSuggestions(query.length > 0 && suggestions.length > 0)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="pl-10 pr-10"
            disabled={isSearching}
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('')
                inputRef.current?.focus()
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="h-4 w-4" />
              <Badge variant="secondary" className={cn("text-xs", getSearchTypeColor())}>
                {getSearchTypeLabel()}
              </Badge>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Search Type</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setSearchType('hybrid')}>
              <Badge variant="outline" className="mr-2 bg-green-500/10">All</Badge>
              Search all content
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSearchType('text')}>
              <Badge variant="outline" className="mr-2 bg-blue-500/10">Text</Badge>
              OCR text only
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSearchType('visual')}>
              <Badge variant="outline" className="mr-2 bg-purple-500/10">Visual</Badge>
              Visual elements only
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button type="submit" disabled={!query.trim() || isSearching}>
          {isSearching ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            'Search'
          )}
        </Button>
      </div>

      {/* Search Suggestions */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute top-full left-0 right-0 z-50 mt-1 rounded-md border bg-popover p-1 shadow-md"
        >
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              type="button"
              className={cn(
                "flex w-full items-center gap-2 rounded-sm px-3 py-2 text-sm hover:bg-accent",
                selectedSuggestionIndex === index && "bg-accent"
              )}
              onClick={() => handleSuggestionClick(suggestion)}
            >
              <Search className="h-3 w-3 text-muted-foreground" />
              <span className="flex-1 text-left">{suggestion}</span>
            </button>
          ))}
        </div>
      )}

      {/* Search Info */}
      <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
        <span>Examples: "error message", "blue button", "login screen"</span>
        <span className="flex items-center gap-1">
          <kbd className="rounded border px-1">⌘</kbd>
          <kbd className="rounded border px-1">K</kbd>
          to focus
        </span>
      </div>
    </form>
  )
}