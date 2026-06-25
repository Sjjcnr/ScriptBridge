'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Search, MapPin, Star, Filter } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

type Writer = {
  id: string
  full_name: string
  avatar_url: string
  bio: string
  writer_profiles: {
    charge_per_page: number
    rating: number
    total_orders: number
    specializations: string[]
    writing_styles: string[]
  }
}

export default function BrowseWritersPage() {
  const [writers, setWriters] = useState<Writer[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchWriters() {
      const supabase = createClient()
      
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id, full_name, avatar_url, bio,
          writer_profiles(charge_per_page, rating, total_orders, specializations, writing_styles)
        `)
        .eq('role', 'writer')

      if (data && !error) {
        // Only show verified/available writers (our DB defaults to verified for new signups)
        setWriters(data as unknown as Writer[])
      }
      setIsLoading(false)
    }

    fetchWriters()
  }, [])

  const filteredWriters = writers.filter((writer) => {
    const searchLower = searchQuery.toLowerCase()
    return (
      writer.full_name?.toLowerCase().includes(searchLower) ||
      writer.writer_profiles?.specializations?.some(s => s.toLowerCase().includes(searchLower)) ||
      writer.writer_profiles?.writing_styles?.some(s => s.toLowerCase().includes(searchLower))
    )
  })

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header & Search */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <h1 className="text-4xl font-bold text-zinc-900 dark:text-white tracking-tight">Find a Writer</h1>
            <p className="text-zinc-600 dark:text-zinc-400 mt-2">Discover skilled physical writers in your area.</p>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
              <Input 
                placeholder="Search styles, skills, or names..." 
                className="pl-10 rounded-full bg-white dark:bg-zinc-900"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" className="rounded-full px-4"><Filter size={18} /> <span className="hidden sm:inline ml-2">Filters</span></Button>
          </div>
        </div>

        {/* Results Grid */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : filteredWriters.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800">
            <h3 className="text-xl font-semibold text-zinc-900 dark:text-white">No writers found</h3>
            <p className="text-zinc-500 mt-2">Try adjusting your search terms.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredWriters.map((writer) => (
              <Link href={`/writer/${writer.id}`} key={writer.id}>
                <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800 hover:border-indigo-300 dark:hover:border-indigo-700 transition shadow-sm hover:shadow-md cursor-pointer h-full flex flex-col group">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-xl overflow-hidden shrink-0">
                        {writer.avatar_url ? (
                          <img src={writer.avatar_url} alt={writer.full_name} className="w-full h-full object-cover" />
                        ) : (
                          writer.full_name?.charAt(0) || 'W'
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-zinc-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">{writer.full_name}</h3>
                        <div className="flex items-center text-sm text-zinc-500">
                          <Star className="text-amber-400 fill-amber-400 mr-1" size={14} />
                          <span className="font-medium text-zinc-700 dark:text-zinc-300 mr-1">{writer.writer_profiles?.rating || 'New'}</span>
                          <span>({writer.writer_profiles?.total_orders || 0} orders)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2 mb-4 flex-grow">
                    {writer.bio || "Professional physical writer offering custom handwritten services."}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {writer.writer_profiles?.writing_styles?.slice(0, 3).map((style, i) => (
                      <Badge key={i} variant="secondary" className="bg-zinc-100 dark:bg-zinc-800 font-normal">
                        {style}
                      </Badge>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex justify-between items-center mt-auto">
                    <div className="text-sm">
                      <span className="font-bold text-zinc-900 dark:text-white">₹{writer.writer_profiles?.charge_per_page || 0}</span>
                      <span className="text-zinc-500"> / page</span>
                    </div>
                    <div className="text-indigo-600 dark:text-indigo-400 text-sm font-medium">
                      View Profile →
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
