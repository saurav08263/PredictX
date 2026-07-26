"use client"

import { useState } from "react"
import { Globe, Check, ChevronDown } from "lucide-react"
import { COUNTRIES, useCrypto } from "./store"

export function CountrySelector() {
  const { country, setCountry } = useCrypto()
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Select country and currency"
        className="flex items-center gap-1 rounded-lg border border-border bg-card px-2 py-1.5 text-xs font-bold"
      >
        <Globe className="size-4 text-bull" />
        <span>{country.code}</span>
        <span className="text-bull">{country.symbol.trim()}</span>
        <ChevronDown className="size-3.5 text-muted-foreground" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-0" onClick={() => setOpen(false)}>
          <div
            className="mx-auto w-full max-w-md rounded-t-2xl border-t border-border bg-panel p-4 pb-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center gap-2">
              <Globe className="size-5 text-bull" />
              <h2 className="font-bold tracking-wide">SELECT YOUR COUNTRY</h2>
            </div>
            <ul className="max-h-[55vh] overflow-y-auto">
              {COUNTRIES.map((c) => {
                const active = c.code === country.code
                return (
                  <li key={c.code}>
                    <button
                      onClick={() => {
                        setCountry(c)
                        setOpen(false)
                      }}
                      className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-semibold transition ${
                        active ? "bg-bull/15 text-bull" : "text-foreground"
                      }`}
                    >
                      <span className="flex size-8 items-center justify-center rounded-md border border-border bg-card text-xs font-bold">
                        {c.code}
                      </span>
                      <span className="flex-1">{c.name}</span>
                      <span className="font-bold">{c.symbol.trim()}</span>
                      {active && <Check className="size-4" />}
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>
      )}
    </>
  )
}
