import { create } from "zustand"

import {
  fetchUser,
  googleLoginService,
  loginService,
  logoutService,
} from "@/services/auth.service"

type AuthStatus =
  | "loading"
  | "authenticated"
  | "unauthenticated"

type User = {
  id: string
  name: string
  email: string | null
  phone: string | null
  authMethod: string | null
  twoFactorEnabled: boolean
} | null

type AuthStore = {
  user: User

  status: AuthStatus

  loading: boolean

  error: string | null

  loadUser: () => Promise<void>

  login: (
    email: string,
    password: string
  ) => Promise<boolean>

  loginWithGoogle: () => Promise<boolean>

  logout: () => Promise<void>
}

export const useAuthStore =
create<AuthStore>((set)=>({

user:null,

status:"loading",

loading:false,

error:null,

loadUser:async()=>{

try{

const data=
await fetchUser()

if(!data){

set({

status:"unauthenticated",

user:null

})

return

}

set({

status:"authenticated",

user:{

id:data.id,

name:data.name,

email:data.email,

phone:data.phone,

authMethod:data.authMethod,

twoFactorEnabled:
Boolean(
data.twoFactorEnabled
)

}

})

}catch{

set({

status:"unauthenticated",

user:null

})

}

},

login:async(
email,
password
)=>{

set({

loading:true,

error:null

})

try{

const data=
await loginService(
email,
password
)

if(data.error){

set({

loading:false,

error:data.error

})

return false

}

const user=
await fetchUser()

set({

loading:false,

status:"authenticated",

user

})

return true

}catch{

set({

loading:false,

error:"Login failed"

})

return false

}

},

loginWithGoogle:async()=>{

set({

loading:true,

error:null

})

try{

const data=
await googleLoginService()

if(data.error){

set({

loading:false,

error:data.error

})

return false

}

const user=
await fetchUser()

set({

loading:false,

status:"authenticated",

user

})

return true

}catch{

set({

loading:false,

error:"Google login failed"

})

return false

}

},

logout:async()=>{

await logoutService()

set({

status:"unauthenticated",

user:null

})

}

}))