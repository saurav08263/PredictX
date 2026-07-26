import { create } from "zustand"

export type ActiveBet = {
  id: string

  direction: "UP" | "DOWN"

  amount: number

  multiplier: number

  potentialPayout: number

  round: {
    roundId: string
    coin: string
    duration: number
    entryPrice: number
  }

  createdAt: string
} | null

export type BetHistory = {
  id: string

  direction: string

  amount: number

  multiplier: number

  status: string

  payout: number

  round: {
    roundId: string
    coin: string
    duration: number
    entryPrice: number
    exitPrice: number | null
    status: string
  }

  createdAt: string
}

export type RoundResult = {
  roundId: string

  coin: string

  direction: "UP" | "DOWN"

  entryPrice: number

  exitPrice: number

  wentUp: boolean

  won: boolean

  amount: number

  payout: number
} | null

type BetState = {
  activeBet: ActiveBet

  history: BetHistory[]

  lastResult: RoundResult

  loading: boolean

  setActiveBet: (
    bet: ActiveBet
  ) => void

  setHistory: (
    bets: BetHistory[]
  ) => void

  setLastResult: (
    result: RoundResult
  ) => void

  clearResult: () => void

  refreshHistory: (
    userId: string
  ) => Promise<void>
}

export const useBetStore =
create<BetState>((set)=>({

activeBet:null,

history:[],

lastResult:null,

loading:false,

setActiveBet:(bet)=>
set({
activeBet:bet
}),

setHistory:(bets)=>
set({
history:bets
}),

setLastResult:(result)=>
set({
lastResult:result
}),

clearResult:()=>
set({
lastResult:null
}),

refreshHistory:async(userId)=>{

try{

const res=
await fetch(`/api/bets?userId=${userId}`)

if(!res.ok)
return

const data=
await res.json()

set({
history:data.bets||[]
})

}catch{}

}

}))