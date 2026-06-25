'use client'

import { motion } from 'framer-motion';
import Link from 'next/link';
import { PenTool, ShieldCheck, MapPin, Star, ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-zinc-950 font-sans selection:bg-indigo-500/30">
      
      {/* Navigation */}
      <nav className="fixed w-full z-50 top-0 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between h-16 items-center">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 text-white p-1.5 rounded-lg">
              <PenTool size={20} />
            </div>
            <span className="font-bold text-xl tracking-tight text-zinc-900 dark:text-white">ScriptBridge</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white transition">
              Log in
            </Link>
            <Link href="/signup" className="text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-full transition shadow-sm shadow-indigo-500/20">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-grow pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-block py-1 px-3 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-sm font-medium mb-6 border border-indigo-100 dark:border-indigo-500/20">
              Physical Writing as a Service
            </span>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-zinc-900 dark:text-white mb-8 leading-tight">
              Real human handwriting.<br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">
                Delivered in person.
              </span>
            </h1>
            <p className="text-xl text-zinc-600 dark:text-zinc-400 mb-10 max-w-2xl mx-auto leading-relaxed">
              Connect with skilled writers in your city for letters, journals, notes, and calligraphy. Hand over your notebook, get perfect penmanship back.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/browse" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-8 py-3.5 rounded-full font-medium hover:bg-zinc-800 dark:hover:bg-zinc-100 transition shadow-lg shadow-zinc-500/10">
                Find a Writer <ArrowRight size={18} />
              </Link>
              <Link href="/signup?role=writer" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-800 px-8 py-3.5 rounded-full font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition">
                Become a Writer
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Features / How it Works */}
        <div className="max-w-7xl mx-auto mt-32">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-zinc-900 dark:text-white">How ScriptBridge Works</h2>
            <p className="mt-4 text-zinc-600 dark:text-zinc-400">Our mandatory physical handoff model ensures trust and authenticity.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 p-8 rounded-3xl"
            >
              <div className="w-12 h-12 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mb-6">
                <ShieldCheck size={24} />
              </div>
              <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-3">1. Book & Connect</h3>
              <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Browse portfolios of verified writers in your city. Select their handwriting style, share digital references, and place a request.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 p-8 rounded-3xl"
            >
              <div className="w-12 h-12 bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-2xl flex items-center justify-center mb-6">
                <MapPin size={24} />
              </div>
              <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-3">2. The Physical Handoff</h3>
              <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Meet your writer at a safe, agreed-upon location to hand over your physical notebook or materials. This step is mandatory.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="bg-white dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 p-8 rounded-3xl"
            >
              <div className="w-12 h-12 bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 rounded-2xl flex items-center justify-center mb-6">
                <Star size={24} />
              </div>
              <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-3">3. Pay on Return</h3>
              <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                When the writing is complete, meet again to collect your finished materials. Payment happens directly in person via Cash or UPI.
              </p>
            </motion.div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800 py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 text-center text-zinc-500 dark:text-zinc-400 text-sm">
          <p>© {new Date().getFullYear()} ScriptBridge. Trust in every stroke.</p>
        </div>
      </footer>
    </div>
  );
}
