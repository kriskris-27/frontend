import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../api/axios';

interface User {
    id:string;
    email:string;
    role:string;
}
interface MeResponse {
  user: User;
}

interface AuthContextType{
    user:User | null;
    login:(email:string, password:string)=>Promise<void>
    logout:()=>Promise<void>
    loading: boolean;
    // setAuthToken: (token: string) => void;    
    refetchUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);


export const AuthProvider = ({children}:{children:React.ReactNode}) =>{
    const [user,setUser] = useState<User|null>(null);
    const [loading, setLoading] = useState(true);

     const refetchUser = async () => {
    setLoading(true); 
    try {
      const res = await api.get<MeResponse>('/auth/me');
      setUser(res.data.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false); 
    }
  };

    useEffect(()=>{
        refetchUser();
    },[]);

    const login = async (email:string,password:string) =>{
        await  api.post('/auth/login',{email,password});
        await refetchUser();
    } 
    const logout =async() => {
        await api.post('/auth/logout');
        setUser(null);
    }

//   const setAuthToken = (token: string) => {
//     api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
//   };

    return(
        <AuthContext.Provider value={{user,login,logout,loading,refetchUser}}>
            {children}
        </AuthContext.Provider>
    )

}


export const useAuth = () : AuthContextType =>{
    const context = useContext(AuthContext);
    if(!context){
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context;
};