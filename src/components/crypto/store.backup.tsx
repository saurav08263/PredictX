"use client"

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
  useSyncExternalStore,
  useMemo,
  type ReactNode,
} from "react"

import type { Socket } from "socket.io-client"


/* ---------------- Constants ---------------- */

export type Coin = "BTCUSDT" | "ETHUSDT" | "SOLUSDT"

export type Duration = 
  | 5 
  | 10 
  | 20 
  | 30 
  | 40 
  | 50 
  | 60


export const COINS: {
  id: Coin
  label: string
  icon: string
}[] = [
  {
    id:"BTCUSDT",
    label:"BTC/USDT",
    icon:"₿"
  },
  {
    id:"ETHUSDT",
    label:"ETH/USDT",
    icon:"Ξ"
  },
  {
    id:"SOLUSDT",
    label:"SOL/USDT",
    icon:"◎"
  },
]


export const DURATIONS:{
  value:Duration
  label:string
}[] = [

 {
  value:5,
  label:"5s"
 },

 {
  value:10,
  label:"10s"
 },

 {
  value:20,
  label:"20s"
 },

 {
  value:30,
  label:"30s"
 },

 {
  value:40,
  label:"40s"
 },

 {
  value:50,
  label:"50s"
 },

 {
  value:60,
  label:"1m"
 }

]


export const AMOUNT_OPTIONS = [
 100,
 500,
 1000,
 5000
]

/* ---------------- Countries ---------------- */


export type Country = {

 code:string
 name:string
 symbol:string
 locale:string

}
export const COUNTRIES:Country[] = [

 {
  code:"IN",
  name:"India",
  symbol:"₹",
  locale:"en-IN"
 },

 {
  code:"US",
  name:"United States",
  symbol:"$",
  locale:"en-US"
 },

 {
  code:"GB",
  name:"United Kingdom",
  symbol:"£",
  locale:"en-GB"
 },

 {
  code:"EU",
  name:"Eurozone",
  symbol:"€",
  locale:"de-DE"
 },

 {
  code:"AE",
  name:"UAE",
  symbol:"AED ",
  locale:"en-US"
 }

]
/* ---------------- Types ---------------- */

export type ActiveBet = {

 id:string

 direction:
 "UP" |
 "DOWN"

 amount:number

 multiplier:number

 potentialPayout:number


 round:{
  roundId:string
  coin:string
  duration:number
  entryPrice:number
 }

 createdAt:string


}|null
export type BetHistory = {

 id:string

 direction:string

 amount:number

 multiplier:number

 status:string

 payout:number


 round:{
  roundId:string
  coin:string
  duration:number
  entryPrice:number
  exitPrice:number|null
  status:string
 }
 createdAt:string

}
export type Transaction = {

 id:string

 type:string

 amount:number

 status:string

 method?:string|null

 balanceBefore:number

 balanceAfter:number

 createdAt:string

}
export type RoundInfo = {

 roundId:string

 coin:Coin

 duration:number

 timeLeft:number

 entryPrice:number

 currentPrice:number

}
export type RoundResult = {

 roundId:string

 coin:string

 direction:
 "UP"|
 "DOWN"

 entryPrice:number

 exitPrice:number

 wentUp:boolean

 won:boolean

 amount:number

 payout:number


}|null

export type WinEvent = {

 amount:number

 direction:
 "UP"|
 "DOWN"

 coin:string


}|null

type Toast = {

 id:number

 msg:string

 tone:
 "win"|
 "lose"|
 "info"

}
/* ---------------- Store ---------------- */
type Store = {


 userId:string|null

 userName:string

 email:string|null

 phone:string|null


 country:Country

 setCountry:(c:Country)=>void


 fmt:(n:number,decimals?:number)=>string

 authStatus:
 "loading"|
 "authenticated"|
 "unauthenticated"


 authMethod:string|null

 authLoading:boolean

 authError:string|null

 twoFactorEnabled:boolean

 setTwoFactorEnabled:(v:boolean)=>void
 login:
 (
 email:string,
 password:string
 )=>Promise<any>

 signup:
 (
 name:string,
 email:string,
 password:string,
 referralCode?:string
 )=>Promise<any>

 loginWithGoogle:
 (
 referralCode?:string
 )=>Promise<any>

 sendOtp:
 (
 phone:string
 )=>Promise<any>

 verifyOtp:
 (
 phone:string,
 code:string,
 referralCode?:string
 )=>Promise<any>

 logout:
 ()=>Promise<void>
 prices:Record<Coin,number>
 priceHistory:Record<Coin,number[]>
 mounted:boolean
 wsConnected:boolean
 currentRound:RoundInfo|null
 balance:number
 winnings:number
 profit:number
 bonus:number
 wins:number
 totalBets:number
 winRate:number
 activeBet:ActiveBet
 lastResult:RoundResult
 recentBets:BetHistory[]
 transactions:Transaction[]
 placeBet:any
 deposit:any
 withdraw:any
 refreshUser:any
 refreshBets:any
 refreshTransactions:any
 fetchRoundInfo:any
 winEvent:WinEvent
 subscribeToRound:
(
coin:Coin,
duration:Duration
)=>void
 clearWinEvent:()=>void
 clearLastResult:()=>void
 toasts:Toast[]
}

const CryptoContext =
createContext<Store|null>(null)

const emptySubscribe = ()=>()=>{}

function useHydrated(){

 return useSyncExternalStore(
  emptySubscribe,
  ()=>true,
  ()=>false
 )

}

const MAX_HISTORY = 60
export function CryptoProvider({
 children
}:{
 children:ReactNode
}){

const mounted = useHydrated()

const [country,setCountry] =
useState(COUNTRIES[0])

const [authStatus,setAuthStatus] =
useState<
"loading"|
"authenticated"|
"unauthenticated"
>("loading")

const [authMethod,setAuthMethod] =
useState<string|null>(null)


const [authLoading,setAuthLoading] =
useState(false)


const [authError,setAuthError] =
useState<string|null>(null)


const [userId,setUserId] =
useState<string|null>(null)

const [userName,setUserName] =
useState("Trader")

const [email,setEmail] =
useState<string|null>(null)

const [phone,setPhone] =
useState<string|null>(null)


const [twoFactorEnabled,setTwoFactorEnabled] =
useState(false)

const [balance,setBalance] =
useState(0)
const [winnings,setWinnings] =
useState(0)
const [profit,setProfit] =
useState(0)
const [bonus,setBonus] =
useState(0)
const [wins,setWins] =
useState(0)
const [totalBets,setTotalBets] =
useState(0)
const [winRate,setWinRate] =
useState(0)
const [prices, setPrices] = useState<Record<Coin, number>>({
  BTCUSDT: 0,
  ETHUSDT: 0,
  SOLUSDT: 0,
})

const [priceHistory, setPriceHistory] = useState<Record<Coin, number[]>>({
  BTCUSDT: [],
  ETHUSDT: [],
  SOLUSDT: [],
})

const [currentRound, setCurrentRound] =
  useState<RoundInfo | null>(null)

const [wsConnected,setWsConnected] =
useState(false)

const [activeBet,setActiveBet] =
useState<ActiveBet>(null)

const [recentBets,setRecentBets] =
useState<BetHistory[]>([])

const [transactions,setTransactions] =
useState<Transaction[]>([])

const [lastResult,setLastResult] =
useState<RoundResult>(null)

const [winEvent,setWinEvent] =
useState<WinEvent>(null)

const [toasts,setToasts] =
useState<Toast[]>([])

const socketRef =
useRef<Socket|null>(null)

const userIdRef =
useRef<string|null>(null)

const activeBetRef =
useRef<ActiveBet>(null)

useEffect(()=>{
 userIdRef.current=userId
},[userId])

useEffect(()=>{
 activeBetRef.current=activeBet
},[activeBet])
/* ---------------- Helpers ---------------- */


const clearLastResult = useCallback(()=>{
 setLastResult(null)
},[])



const clearWinEvent = useCallback(()=>{
 setWinEvent(null)
},[])



const pushToast = useCallback(
(msg:string,tone:Toast["tone"])=>{

 const id = Date.now()

 setToasts(prev=>[
  ...prev,
  {
   id,
   msg,
   tone
  }
 ])


 setTimeout(()=>{

  setToasts(prev=>
   prev.filter(
    x=>x.id!==id
   )
  )

 },3500)


},[])




/* ---------------- Price History ---------------- */


const updatePriceHistory =
useCallback(
(newPrices:Record<Coin,number>)=>{


 setPriceHistory(prev=>{


  const updated={...prev}


  ;(
   [
    "BTCUSDT",
    "ETHUSDT",
    "SOLUSDT"
   ] as Coin[]
  )
  .forEach((coin)=>{


   if(newPrices[coin]>0){

    const arr=[
     ...(prev[coin]||[]),
     newPrices[coin]
    ]


    if(arr.length>MAX_HISTORY)
     arr.shift()


    updated[coin]=arr

   }


  })


  return updated


 })

},[])




/* ---------------- User Load ---------------- */


useEffect(()=>{


if(!mounted) return



fetch("/api/user")


.then(async res=>{


 if(res.status===401){

  setAuthStatus(
   "unauthenticated"
  )

  return null

 }


 if(!res.ok){

  setAuthStatus(
   "unauthenticated"
  )

  return null

 }



 return res.json()



})


.then(data=>{


if(!data) return



setUserId(data.id)

setUserName(data.name)

setEmail(data.email||null)

setPhone(data.phone||null)


setBalance(data.balance)

setWinnings(data.winnings)

setProfit(data.profit)

setBonus(data.bonus)

setWins(data.wins)

setTotalBets(data.totalBets)

setWinRate(data.winRate)


setAuthMethod(
 data.authMethod||null
)


setTwoFactorEnabled(
 Boolean(data.twoFactorEnabled)
)



setAuthStatus(
 "authenticated"
)



})


.catch(()=>{

setAuthStatus(
 "unauthenticated"
)

})


},[mounted])





/* ---------------- Refresh User ---------------- */


const refreshUser = useCallback(
async()=>{


if(!userIdRef.current)
 return



try{


const res =
await fetch("/api/user")


if(res.ok){


const data =
await res.json()



setBalance(data.balance)

setWinnings(data.winnings)

setProfit(data.profit)

setBonus(data.bonus)

setWins(data.wins)

setTotalBets(data.totalBets)

setWinRate(data.winRate)



}


}
catch(err){

console.error(err)

}



},[])





/* ---------------- Auth ---------------- */



const login = useCallback(
async(email,password)=>{


setAuthLoading(true)


try{


const res =
await fetch(
"/api/auth/login",
{

method:"POST",

headers:{
"Content-Type":
"application/json"
},

body:JSON.stringify({
email,
password
})

})


const data =
await res.json()



if(!res.ok){

return {
 success:false,
 error:data.error || "Login failed"
}

}



await refreshUser()


setAuthStatus(
"authenticated"
)



return {
success:true
}


}
catch{

return {
success:false,
error:"Network error"
}

}
finally{

setAuthLoading(false)

}


},
[refreshUser])



const loginWithGoogle = useCallback(
async()=>{

try{

const result =
await signInWithPopup(
auth,
googleProvider
)


const user =
result.user


if(!user.email){

return {
success:false,
error:"Google email not found"
}

}


const res =
await fetch(
"/api/auth/google",
{

method:"POST",

headers:{
"Content-Type":
"application/json"
},


body:JSON.stringify({

email:user.email,

name:user.displayName || "Trader"

})

}

)



const data =
await res.json()



if(!res.ok){

return {

success:false,

error:data.error || "Google login failed"

}

}



await refreshUser()


setAuthMethod("google")


setAuthStatus(
"authenticated"
)


return {
success:true
}


}
catch(error:any){

return {

success:false,

error:error?.message || "Google login failed"

}

}


},
[
refreshUser
]

)


const logout = useCallback(
async()=>{

try{

await fetch(
"/api/auth/logout",
{
method:"POST"
}
)

setUserId(null)

setUserName("Trader")

setBalance(0)

setActiveBet(null)

setRecentBets([])

setTransactions([])

setAuthStatus("unauthenticated")


}
catch(error){

console.log("Logout error", error)

}

},[])



/* ---------------- Fetch Round ---------------- */



const fetchRoundInfo =
useCallback(
async(
coin:Coin,
duration:Duration
)=>{


try{


const res =
await fetch(
`/api/round/current?coin=${coin}&duration=${duration}`
)


if(res.ok){


const data =
await res.json()



const info:RoundInfo={


roundId:data.roundId,


coin:data.coin,


duration:data.duration,


timeLeft:data.timeLeft,


entryPrice:data.entryPrice,


currentPrice:
data.currentPrice || data.entryPrice


}



setCurrentRound(info)



return info


}



}
catch{}



return null



},
[])





/* ---------------- Active Bet ---------------- */



const refreshActiveBet =
useCallback(
async()=>{


if(!userIdRef.current)
return



try{


const res =
await fetch(
`/api/bet/active?userId=${userIdRef.current}`
)



if(res.ok){


const data =
await res.json()


setActiveBet(
data.activeBet
)



}



}
catch(err){

console.error(err)

}



},
[])





/* ---------------- Refresh Bets ---------------- */



const refreshBets =
useCallback(
async()=>{


if(!userIdRef.current)
return



const res =
await fetch(
`/api/bets?userId=${userIdRef.current}`
)


if(res.ok){

const data =
await res.json()


setRecentBets(
data.bets||[]
)


}


},[])




/* ---------------- Transactions ---------------- */



const refreshTransactions =
useCallback(
async()=>{


if(!userIdRef.current)
return



const res =
await fetch(
`/api/transactions?userId=${userIdRef.current}`
)



if(res.ok){


const data =
await res.json()


setTransactions(
data.transactions||[]
)


}


},[])

const subscribeToRound =
useCallback(
(
coin:Coin,
duration:Duration
)=>{

const socket =
socketRef.current


if(!socket)
return


socket.emit(
"subscribe:round",
{
coin,
duration
}
)


},
[]
)



/* ---------------- WebSocket ---------------- */

useEffect(() => {
  if (!mounted) return

  const loadPrices = async () => {
    try {
      const res = await fetch("/api/prices")

      if (!res.ok) return

      const data = await res.json()

      if (!data?.prices) return

      setUserId(data.id)
setUserName(data.name)
setEmail(data.email || null)
setAuthMethod(data.authMethod || null)

      const p = {
        BTCUSDT: Number(data.prices.BTCUSDT?.price ?? 0),
        ETHUSDT: Number(data.prices.ETHUSDT?.price ?? 0),
        SOLUSDT: Number(data.prices.SOLUSDT?.price ?? 0),
      }

      setPrices(p)
      updatePriceHistory(p)

    } catch (err) {
      console.error(err)
    }
  }

  loadPrices()

  const interval = setInterval(loadPrices, 1000)

  return () => clearInterval(interval)

}, [mounted, updatePriceHistory])

/* ---------------- Place Bet ---------------- */


const placeBet = useCallback(
async(
direction:"UP"|"DOWN",
coin:Coin,
duration:Duration,
amount:number
)=>{


if(!userIdRef.current){

return {
 success:false,
 error:"Not logged in"
}

}



try{


const res =
await fetch("/api/bet",{

method:"POST",

headers:{
"Content-Type":
"application/json"
},


body:JSON.stringify({

userId:userIdRef.current,

direction,

coin,

duration,

amount


})


})



const data =
await res.json()



if(!res.ok){


pushToast(
data.error ||
"Bet failed",
"lose"
)


return {
success:false,
error:data.error
}


}



setBalance(
data.balance
)



setActiveBet({

id:data.id,

direction:data.direction,

amount:data.amount,

multiplier:data.multiplier,

potentialPayout:data.potentialPayout,


round:{

roundId:data.roundId,

coin:data.coin,

duration:data.duration,

entryPrice:data.entryPrice

},


createdAt:data.createdAt


})



pushToast(
`${direction} placed ₹${amount}`,
"info"
)



return {
success:true
}



}
catch{


return {
success:false,
error:"Network error"
}


}



},
[
pushToast
])





/* ---------------- Deposit ---------------- */



const deposit =
useCallback(
async(
amount:number,
method="UPI"
)=>{


if(!userIdRef.current)
return



const res =
await fetch(
"/api/wallet/deposit",
{

method:"POST",

headers:{
"Content-Type":
"application/json"
},

body:JSON.stringify({

userId:userIdRef.current,

amount,

method

})


})



const data =
await res.json()



if(res.ok){


setBalance(
data.balance
)



pushToast(
"Deposit successful",
"win"
)



refreshTransactions()



}



},
[
pushToast,
refreshTransactions
])





/* ---------------- Withdraw ---------------- */



const withdraw =
useCallback(
async(
amount:number,
method="UPI"
)=>{


if(!userIdRef.current)
return



const res =
await fetch(
"/api/wallet/withdraw",
{

method:"POST",

headers:{
"Content-Type":
"application/json"
},

body:JSON.stringify({

userId:userIdRef.current,

amount,

method

})


})



const data =
await res.json()



if(res.ok){


setBalance(
data.balance
)



pushToast(
"Withdrawal requested",
"info"
)



refreshTransactions()



}


},
[
pushToast,
refreshTransactions
])





/* ---------------- Format Money ---------------- */


const fmt = useCallback(
  (n: any, decimals = 0) => {
    const safeValue = Number(n ?? 0)

    return (
      (country?.symbol || "₹") +
      safeValue.toLocaleString(country?.locale || "en-IN", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })
    )
  },
  [country]
)


/* ---------------- Context Value ---------------- */


const value =
useMemo<Store>(()=>(


{


userId,

userName,

email,

phone,


country,

setCountry,


fmt,



authStatus,

authMethod,

authLoading,

authError,


twoFactorEnabled,

setTwoFactorEnabled,

login,

signup:async()=>({
success:false
}),

loginWithGoogle,

sendOtp:
async()=>({
success:false
}),


verifyOtp:
async()=>({
success:false
}),


logout,



prices,

priceHistory,


mounted,


wsConnected,



currentRound,



balance,

winnings,

profit,

bonus,

wins,

totalBets,

winRate,



activeBet,


lastResult,


recentBets,


transactions,



placeBet,


deposit,


withdraw,



refreshUser,

refreshBets,

refreshTransactions,

fetchRoundInfo,

subscribeToRound,


winEvent,


clearWinEvent,


clearLastResult,



toasts,


}


),
[

userId,

userName,

email,

phone,

country,

fmt,

authStatus,

authMethod,

authLoading,

authError,

twoFactorEnabled,

prices,

priceHistory,

wsConnected,

currentRound,

balance,

winnings,

profit,

bonus,

wins,

totalBets,

winRate,

activeBet,

lastResult,

recentBets,

transactions,

winEvent,

toasts,

subscribeToRound


]


);



return (

<CryptoContext.Provider
 value={value}
>

{children}

</CryptoContext.Provider>


)



}




/* ---------------- Hook ---------------- */

export function formatClock(seconds: number) {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60

  return `${mins}:${secs.toString().padStart(2, "0")}`
}

export function formatPrice(price: number, coin?: string) {
  return Number(price || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}
export function useCrypto(){


const context =
useContext(
CryptoContext
)



if(!context){


throw new Error(
"useCrypto must be used inside CryptoProvider"
)


}



return context



}