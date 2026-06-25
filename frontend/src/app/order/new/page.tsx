'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Clock, ShieldCheck, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import Link from 'next/link'

function OrderForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const writerId = searchParams.get('writer')
  
  const [writer, setWriter] = useState<any>(null)
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [pages, setPages] = useState(1)
  const [meetupLocation, setMeetupLocation] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    async function loadData() {
      const supabase = createClient()
      
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login?redirect=/order/new?writer=' + writerId)
        return
      }
      setUser(session.user)

      if (writerId) {
        const { data } = await supabase
          .from('profiles')
          .select(`
            id, full_name, avatar_url,
            writer_profiles(charge_per_page)
          `)
          .eq('id', writerId)
          .single()
        
        if (data) setWriter(data)
      }
      
      setIsLoading(false)
    }
    loadData()
  }, [writerId, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!writer || !user) return
    setIsSubmitting(true)

    const supabase = createClient()
    const amount = pages * (writer.writer_profiles?.charge_per_page || 0)

    const { data, error } = await supabase
      .from('orders')
      .insert({
        client_id: user.id,
        writer_id: writer.id,
        title,
        description,
        pages_count: pages,
        total_amount: amount,
        meetup_location: meetupLocation,
        status: 'pending_handoff'
      })
      .select()
      .single()

    if (!error && data) {
      router.push(`/order/${data.id}`)
    } else {
      setIsSubmitting(false)
      alert("Error placing order.")
    }
  }

  if (isLoading) return <div className="p-20 text-center">Loading...</div>
  if (!writer) return <div className="p-20 text-center">Writer not found.</div>

  const chargePerPage = writer.writer_profiles?.charge_per_page || 0
  const totalAmount = chargePerPage * pages

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 border border-zinc-200 dark:border-zinc-800 shadow-sm max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Request Writing from {writer.full_name}</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Project Title</label>
          <Input 
            required 
            placeholder="e.g., Physics Assignment 3" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Instructions & Description</label>
          <Textarea 
            required 
            rows={4}
            placeholder="Describe what needs to be written, style preferences, ink color, etc." 
            value={description} 
            onChange={(e) => setDescription(e.target.value)} 
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Estimated Pages</label>
            <Input 
              type="number" 
              required 
              min={1}
              value={pages} 
              onChange={(e) => setPages(parseInt(e.target.value) || 1)} 
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Total Amount (₹)</label>
            <div className="h-10 px-3 flex items-center bg-zinc-50 dark:bg-zinc-800 rounded-md border border-zinc-200 dark:border-zinc-700 font-bold">
              ₹{totalAmount}
            </div>
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2 font-semibold text-blue-800 dark:text-blue-300">
            <MapPin size={18} /> Physical Handoff Required
          </div>
          <p className="text-sm text-blue-600 dark:text-blue-400 mb-3">
            You must meet the writer to hand over the physical notebook or paper. Where would you like to meet?
          </p>
          <Input 
            required 
            placeholder="e.g., Central Library Cafe or XYZ College Main Gate" 
            value={meetupLocation} 
            onChange={(e) => setMeetupLocation(e.target.value)} 
          />
        </div>

        <Button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-6 text-lg font-semibold shadow-lg shadow-indigo-500/20"
        >
          {isSubmitting ? 'Placing Order...' : 'Place Order Request'}
        </Button>
      </form>
    </div>
  )
}

export default function PlaceOrderPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/browse" className="inline-flex items-center text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-white mb-8 transition">
          <ArrowLeft size={16} className="mr-1" /> Back to writers
        </Link>
        <Suspense fallback={<div className="p-20 text-center">Loading form...</div>}>
          <OrderForm />
        </Suspense>
      </div>
    </div>
  )
}
