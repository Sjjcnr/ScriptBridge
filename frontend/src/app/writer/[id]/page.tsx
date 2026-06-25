'use client'

import { useState, useEffect, use } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Star, MapPin, CheckCircle, Clock, BookOpen, MessageSquare, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

type WriterProfile = {
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
    languages: string[]
    turnaround_time: string
    portfolio_description: string
  }
}

export default function WriterProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const [writer, setWriter] = useState<WriterProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchWriter() {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id, full_name, avatar_url, bio,
          writer_profiles(charge_per_page, rating, total_orders, specializations, writing_styles, languages, turnaround_time, portfolio_description)
        `)
        .eq('id', resolvedParams.id)
        .single()

      if (data && !error) {
        setWriter(data as unknown as WriterProfile)
      }
      setIsLoading(false)
    }

    fetchWriter()
  }, [resolvedParams.id])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (!writer) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 pt-32 pb-12 text-center">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Writer not found</h1>
        <Link href="/browse" className="text-indigo-600 mt-4 inline-block hover:underline">
          Return to browse
        </Link>
      </div>
    )
  }

  const p = writer.writer_profiles

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 pt-24 pb-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <Link href="/browse" className="inline-flex items-center text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-white mb-8 transition">
          <ArrowLeft size={16} className="mr-1" /> Back to writers
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Info Column */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <div className="flex flex-col sm:flex-row gap-6 items-start">
                <div className="w-24 h-24 sm:w-32 sm:h-32 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-4xl overflow-hidden shrink-0 border-4 border-white dark:border-zinc-900 shadow-lg">
                  {writer.avatar_url ? (
                    <img src={writer.avatar_url} alt={writer.full_name} className="w-full h-full object-cover" />
                  ) : (
                    writer.full_name?.charAt(0) || 'W'
                  )}
                </div>
                <div className="flex-grow pt-2">
                  <div className="flex items-center gap-2 mb-2">
                    <h1 className="text-3xl font-bold text-zinc-900 dark:text-white tracking-tight">{writer.full_name}</h1>
                    <CheckCircle className="text-blue-500" size={20} />
                  </div>
                  <div className="flex items-center text-sm text-zinc-600 dark:text-zinc-400 mb-4">
                    <Star className="text-amber-400 fill-amber-400 mr-1.5" size={16} />
                    <span className="font-bold text-zinc-900 dark:text-zinc-100 mr-1.5">{p.rating || 'New'}</span>
                    <span>({p.total_orders || 0} reviews)</span>
                  </div>
                  <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed text-lg">
                    {writer.bio || "Professional physical writer. Ready to turn your digital ideas into beautiful physical keepsakes."}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-6">About My Work</h2>
              <p className="text-zinc-600 dark:text-zinc-400 whitespace-pre-wrap leading-relaxed">
                {p.portfolio_description || "I specialize in clean, elegant handwriting perfect for assignments, letters, and invitations. Every piece is done with the utmost care and attention to detail. Please feel free to message me with any specific requirements!"}
              </p>

              <div className="grid sm:grid-cols-2 gap-8 mt-8">
                <div>
                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-white uppercase tracking-wider mb-3 flex items-center gap-2"><BookOpen size={16} className="text-indigo-500" /> Styles</h3>
                  <div className="flex flex-wrap gap-2">
                    {p.writing_styles && p.writing_styles.length > 0 ? (
                      p.writing_styles.map((style, i) => <Badge key={i} variant="secondary">{style}</Badge>)
                    ) : (
                      <span className="text-zinc-500 italic text-sm">Cursive, Print, Calligraphy</span>
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-white uppercase tracking-wider mb-3 flex items-center gap-2"><MapPin size={16} className="text-indigo-500" /> Specializations</h3>
                  <div className="flex flex-wrap gap-2">
                    {p.specializations && p.specializations.length > 0 ? (
                      p.specializations.map((spec, i) => <Badge key={i} variant="secondary">{spec}</Badge>)
                    ) : (
                      <span className="text-zinc-500 italic text-sm">Assignments, Letters, Notes</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm sticky top-24">
              <div className="mb-6">
                <span className="text-3xl font-bold text-zinc-900 dark:text-white tracking-tight">₹{p.charge_per_page || 0}</span>
                <span className="text-zinc-500 font-medium"> / page</span>
              </div>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-center text-sm">
                  <Clock className="w-5 h-5 text-zinc-400 mr-3" />
                  <span className="text-zinc-600 dark:text-zinc-300">Avg. turnaround: <strong>{p.turnaround_time || "2-3 days"}</strong></span>
                </div>
                <div className="flex items-center text-sm">
                  <MessageSquare className="w-5 h-5 text-zinc-400 mr-3" />
                  <span className="text-zinc-600 dark:text-zinc-300">Languages: <strong>{(p.languages || ["English", "Hindi"]).join(", ")}</strong></span>
                </div>
              </div>

              <div className="space-y-3">
                <Link href={`/order/new?writer=${writer.id}`} className="block">
                  <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-6 text-lg font-semibold shadow-lg shadow-indigo-500/20">
                    Request Writing
                  </Button>
                </Link>
                <Button variant="outline" className="w-full rounded-xl py-6 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800">
                  Message Writer
                </Button>
              </div>
              
              <p className="text-xs text-center text-zinc-500 mt-4">
                Remember: Payment is made in person during the physical return of materials.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
