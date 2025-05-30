import type { JSX } from "react";
import { useAuth } from "./AuthContext";
import { Navigate } from "react-router-dom";

interface Props{
    children:JSX.Element;
}
export default function ProtectedRoute({children}:Props){
    const {user} = useAuth();
    return user?children:<Navigate to ="/login"/>

}