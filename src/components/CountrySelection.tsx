"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Check, Globe, ArrowRight } from "lucide-react"

interface CountryOption {
  code: string
  name: string
  currency: string
  symbol: string
  flag: string
}

const COUNTRIES: CountryOption[] = [
  { code: "IN", name: "India", currency: "INR", symbol: "₹", flag: "🇮🇳" },
  { code: "US", name: "United States", currency: "USD", symbol: "$", flag: "🇺🇸" },
  { code: "EU", name: "Eurozone", currency: "EUR", symbol: "€", flag: "🇪🇺" },
  { code: "GB", name: "United Kingdom", currency: "GBP", symbol: "£", flag: "🇬🇧" },
]

export default function CountrySelection({ onComplete }: { onComplete: () => void }) {
  const [selectedCountry, setSelectedCountry] = useState<string>("IN")

  const handleSaveCountry = () => {
    // Saves choice to localStorage so the trading screen can read it instantly
    localStorage.setItem("user_country", selectedCountry)
    onComplete()
  }

  return (
    <div className="flex flex-col justify-between min-h-screen bg-[#0b0e11] text-white p-6 font-sans">
      
      {/* Header Info */}
      <div className="mt-8">
        <div className="flex items-center gap-2 text-emerald-400 mb-2">
          <Globe className="size-5 animate-pulse" />
          <span className="text-xs font-black tracking-widest uppercase">Localization</span>
        </div>
        <h1 className="text-2xl font-black tracking-tight">Select Your Region</h1>
        <p className="text-xs text-zinc-500 font-medium mt-1">
          Choose your home country to configure your native currency and local trading thresholds.
        </p>
      </div>

      {/* Country List Elements */}
      <div className="flex-1 my-8 flex flex-col gap-3 justify-center">
        {COUNTRIES.map((country) => {
          const isSelected = selectedCountry === country.code
          return (
            <button
              key={country.code}
              onClick={() => setSelectedCountry(country.code)}
              className={`w-full flex items-center justify-between p-4 rounded-xl border text-left transition-all duration-200 ${
                isSelected
                  ? "bg-[#1f2630] border-emerald-500 shadow-lg shadow-emerald-950/20"
                  : "bg-[#12161a] border-white/5 opacity-70 hover:opacity-100"
              }`}
            >
              <div className="flex items-center gap-4">
                <span className="text-2xl select-none">{country.flag}</span>
                <div>
                  <h3 className="text-sm font-bold text-white">{country.name}</h3>
                  <p className="text-[10px] text-zinc-500 font-bold tracking-wider mt-0.5">
                    Currency: {country.currency} ({country.symbol})
                  </p>
                </div>
              </div>

              {isSelected && (
                <div className="bg-emerald-500 text-black p-1 rounded-full">
                  <Check className="size-3.5 stroke-[4]" />
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* Action Footer Button */}
      <div className="mb-6">
        <button
          onClick={handleSaveCountry}
          className="w-full bg-[#10b981] hover:brightness-105 active:scale-[0.99] text-black font-black text-sm py-4 rounded-xl flex items-center justify-center gap-2 transition shadow-xl shadow-emerald-950/25"
        >
          Confirm and Proceed <ArrowRight className="size-4" />
        </button>
      </div>

    </div>
  )
}