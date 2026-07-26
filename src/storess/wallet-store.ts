import { create } from "zustand"

export type Transaction = {
  id: string
  type: string
  amount: number
  status: string
  method?: string | null
  balanceBefore: number
  balanceAfter: number
  createdAt: string
}

type WalletState = {
  balance: number
  winnings: number
  profit: number
  bonus: number

  transactions: Transaction[]

  setWallet: (
    data: {
      balance: number
      winnings: number
      profit: number
      bonus: number
    }
  ) => void

  setTransactions: (
    tx: Transaction[]
  ) => void

  refreshWallet: () => Promise<void>
}

export const useWalletStore =
create<WalletState>((set)=>({

balance:0,

winnings:0,

profit:0,

bonus:0,

transactions:[],

setWallet:(data)=>
set({
balance:data.balance,
winnings:data.winnings,
profit:data.profit,
bonus:data.bonus
}),

setTransactions:(tx)=>
set({
transactions:tx
}),

refreshWallet:async()=>{

try{

const res=
await fetch("/api/user")

if(!res.ok)
return

const data=
await res.json()

set({

balance:data.balance,

winnings:data.winnings,

profit:data.profit,

bonus:data.bonus

})

}catch{}

}

}))