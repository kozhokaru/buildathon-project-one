"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { SearchBar } from '@/components/screenshot/search-bar'
import { ResultsGrid } from '@/components/screenshot/results-grid'
import { SearchResult } from '@/lib/database.types'
import { useToast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'
import { Upload, Image, Search, AlertCircle } from 'lucide-react'
import Link from 'next/link'

interface DashboardStats {
  total_screenshots: number
  processed_screenshots: number
  pending_screenshots: number
  failed_screenshots: number
  total_storage_used: number
}

interface DashboardPageClientProps {
  initialStats: DashboardStats | null
}

export function DashboardPageClient({ initialStats }: DashboardPageClientProps) {
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [currentQuery, setCurrentQuery] = useState('')
  const [suggestions, setSuggestions] = useState<string[]>([])
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    // Fetch search suggestions
    fetchSuggestions()
  }, [])

  const fetchSuggestions = async () => {
    try {
      const response = await fetch('/api/search', { method: 'GET' })
      const data = await response.json()
      setSuggestions(data.suggestions || [])
    } catch (error) {
      console.error('Failed to fetch suggestions:', error)
    }
  }

  const handleSearch = async (query: string, searchType: 'text' | 'visual' | 'hybrid') => {
    setIsSearching(true)
    setCurrentQuery(query)
    
    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, searchType, limit: 10 })
      })

      if (!response.ok) {
        throw new Error('Search failed')
      }

      const data = await response.json()
      setSearchResults(data.results || [])
      
      if (data.results.length === 0) {
        toast({
          title: 'No results found',
          description: `No screenshots match "${query}". Try different keywords.`,
        })
      }
    } catch (error) {
      console.error('Search error:', error)
      toast({
        title: 'Search failed',
        description: 'An error occurred while searching. Please try again.',
        variant: 'destructive'
      })
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  const stats = initialStats || {
    total_screenshots: 0,
    processed_screenshots: 0,
    pending_screenshots: 0,
    failed_screenshots: 0,
    total_storage_used: 0
  }


  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Visual Memory Search</h1>
        <p className="text-muted-foreground">
          Search your screenshots using natural language - find text content or visual elements instantly
        </p>
      </div>


      {/* Search Section */}
      <Card>
        <CardHeader>
          <CardTitle>Search Screenshots</CardTitle>
          <CardDescription>
            Search by text content, visual elements, or both. Try queries like "error message", "blue button", or "login screen".
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SearchBar 
            onSearch={handleSearch}
            suggestions={suggestions}
            isSearching={isSearching}
          />
        </CardContent>
      </Card>

      {/* Quick Actions */}
      {(stats?.total_screenshots ?? 0) === 0 && !currentQuery && (
        <Card>
          <CardHeader>
            <CardTitle>Get Started</CardTitle>
            <CardDescription>
              Upload your first screenshots to start searching
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Link href="/dashboard/upload">
                <Button>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Screenshots
                </Button>
              </Link>
              <Link href="/dashboard/library">
                <Button variant="outline">
                  <Image className="mr-2 h-4 w-4" />
                  View Library
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search Results */}
      {(currentQuery || searchResults.length > 0) && (
        <div>
          <ResultsGrid 
            results={searchResults}
            query={currentQuery}
            isLoading={isSearching}
          />
        </div>
      )}

      {/* Recent Screenshots (when no search) */}
      {!currentQuery && (stats?.total_screenshots ?? 0) > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Manage your screenshot library
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <Link href="/dashboard/upload">
                <Button className="w-full" variant="outline">
                  <Upload className="mr-2 h-4 w-4" />
                  Upload More
                </Button>
              </Link>
              <Link href="/dashboard/library">
                <Button className="w-full" variant="outline">
                  <Image className="mr-2 h-4 w-4" />
                  Browse Library
                </Button>
              </Link>
              <Link href="/dashboard/settings">
                <Button className="w-full" variant="outline">
                  <Search className="mr-2 h-4 w-4" />
                  Search History
                </Button>
              </Link>
            </div>

            {(stats?.failed_screenshots ?? 0) > 0 && (
              <div className="flex items-center gap-2 p-3 bg-destructive/10 rounded-lg">
                <AlertCircle className="h-4 w-4 text-destructive" />
                <span className="text-sm">
                  {stats?.failed_screenshots ?? 0} screenshot{(stats?.failed_screenshots ?? 0) !== 1 ? 's' : ''} failed to process.
                  <Link href="/dashboard/library?filter=failed" className="ml-1 underline">
                    View failed items
                  </Link>
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}