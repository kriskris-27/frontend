import { useState } from "react"
import Component from "./Headname"
import { useAuth } from "./AuthContext"
import { useNavigate } from 'react-router-dom';

export default function Login(){
    const [email,setEmail] = useState('')
    const [password,setPassword] = useState('')
    const {login} = useAuth();
    const navigate = useNavigate(); 

    const handleLogin = async (e:React.FormEvent) =>{
            e.preventDefault()
            try{
                await login(email,password)
                navigate('/dashboard') // 
            }catch(err){
                console.error('Login failed', err);
            }
    }

    return (
    <>
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-50 to-blue-100">
            <form onSubmit={handleLogin} className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg space-y-6">
                <Component />
                <div className="flex flex-col space-y-4">
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-gray-100 placeholder-gray-400 text-gray-800 text-sm border border-gray-300 rounded-md px-4 py-2 transition duration-300 focus:outline-none focus:ring-2 focus:ring-blue-300"
                        placeholder="Email..."
                        required
                    />

                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-gray-100 placeholder-gray-400 text-gray-800 text-sm border border-gray-300 rounded-md px-4 py-2 transition duration-300 focus:outline-none focus:ring-2 focus:ring-blue-300"
                        placeholder="Password"
                        required
                    />
                </div>
                <button
                    type="submit"
                    className="px-4 py-2 bg-gray-700 text-white font-semibold rounded hover:bg-black focus:outline-none focus:ring focus:ring-blue-300"
                >
                    Login
                </button>
            </form>
        </div>
    </>
)
}