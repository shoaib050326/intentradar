'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { X, ChevronRight, ChevronLeft, Check } from 'lucide-react'
import Link from 'next/link'

type TourStep = {
  target: string
  title: string
  description: string
  position: 'top' | 'bottom' | 'left' | 'right'
}

const tourSteps: TourStep[] = [
  {
    target: 'dashboard-link',
    title: 'Welcome to IntentRadar!',
    description: 'Your AI-powered lead detection platform. Let\'s show you around.',
    position: 'bottom',
  },
  {
    target: 'watchlists-nav',
    title: '1. Create Watchlists',
    description: 'Add subreddits and keywords you want to monitor. We\'ll scan Reddit for matching posts.',
    position: 'bottom',
  },
  {
    target: 'leads-nav',
    title: '2. Review Leads',
    description: 'See all potential customers ranked by intent score. High scores = hot leads!',
    position: 'bottom',
  },
  {
    target: 'analytics-nav',
    title: '3. Track Performance',
    description: 'View conversion metrics and see which sources bring the best leads.',
    position: 'bottom',
  },
]

export function OnboardingTour() {
  const [isOpen, setIsOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [hasSeenTour, setHasSeenTour] = useState(false)

  useEffect(() => {
    const seen = localStorage.getItem('onboarding_seen')
    if (!seen) {
      setIsOpen(true)
      setHasSeenTour(false)
    } else {
      setHasSeenTour(true)
    }
  }, [])

  const handleClose = () => {
    setIsOpen(false)
    localStorage.setItem('onboarding_seen', 'true')
  }

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleClose()
    }
  }

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  if (hasSeenTour && !isOpen) return null

  const step = tourSteps[currentStep]
  const isLastStep = currentStep === tourSteps.length - 1

  return (
    <>
      {/* Highlighted elements during tour */}
      {isOpen && (
        <>
          <div 
            id="dashboard-link"
            className="fixed top-0 left-0 right-0 z-40 pointer-events-none"
          />
          <div className="fixed inset-0 bg-black/50 z-30" onClick={handleClose} />
        </>
      )}

      {/* Tour Card */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 animate-slide-up">
          <Card className="bg-gray-900 border-gray-700 shadow-2xl w-80">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                    {currentStep + 1}
                  </div>
                  <span className="text-xs text-gray-400">Step {currentStep + 1} of {tourSteps.length}</span>
                </div>
                <button onClick={handleClose} className="text-gray-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <h3 className="font-semibold text-white mb-2">{step.title}</h3>
              <p className="text-sm text-gray-400 mb-4">{step.description}</p>

              <div className="flex items-center justify-between">
                <button
                  onClick={handlePrev}
                  disabled={currentStep === 0}
                  className="text-sm text-gray-400 hover:text-white disabled:opacity-50"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="flex gap-1">
                  {tourSteps.map((_, i) => (
                    <div 
                      key={i}
                      className={`w-2 h-2 rounded-full ${i === currentStep ? 'bg-blue-500' : 'bg-gray-600'}`}
                    />
                  ))}
                </div>
                <Button 
                  onClick={handleNext}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isLastStep ? (
                    <>
                      <Check className="w-4 h-4 mr-1" />
                      Done
                    </>
                  ) : (
                    <>
                      Next
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  )
}

export function QuickStartGuide() {
  const [dismissed, setDismissed] = useState(true)

  useEffect(() => {
    const seen = localStorage.getItem('quickstart_dismissed')
    if (!seen) {
      setDismissed(false)
    }
  }, [])

  const handleDismiss = () => {
    setDismissed(true)
    localStorage.setItem('quickstart_dismissed', 'true')
  }

  if (dismissed) return null

  return (
    <div className="fixed bottom-6 left-6 z-40">
      <Card className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 border-blue-500/30 shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-lg">🚀</span>
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-white mb-1">Quick Start Guide</h4>
              <ol className="text-sm text-gray-300 space-y-1 mb-3">
                <li>1. Create a watchlist with your target subreddits</li>
                <li>2. Load demo data to see how it works</li>
                <li>3. Start detecting buyer intent!</li>
              </ol>
              <div className="flex gap-2">
                <Link href="/watchlists">
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                    Get Started
                  </Button>
                </Link>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleDismiss}
                  className="text-gray-400"
                >
                  Dismiss
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
