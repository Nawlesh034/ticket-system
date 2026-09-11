import { useState } from "react"
import {url} from "../utility/Url"
import { useNavigate } from "react-router-dom"

import { ToastContainer, toast } from 'react-toastify';

export default function Registration(){
    const [val,setVal]=useState({
        Name:"",
        Email:"",
        Password:""

    })
    console.log(url)
    const navigate=useNavigate()
    
    const handleSubmit=async(e)=>{
        e.preventDefault()
        if (val.Name==="" || val.Email==="" || val.Password===""){
            return
        }
        try{
            const response=await fetch(`${url}/auth/register`,{
                method:"POST",
                headers:{
                    "Content-type":"application/json"
                },
                body: JSON.stringify({
                    name:val.Name,
                    email:val.Email,
                    password:val.Password

                })
            })
            const data=await response.json()
            console.log(data,"nawlesh")
            if(response.ok){
                 toast.success("Registration successful!")
                console.log("data send successfully")
            }else{
                console.log("error ")
                toast.error( data.message ||"already exist")

            }

        }catch(e){
            console.log(e,"error in registration")
        }

    }
    return(
        <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">

    <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">

        <h2 className="text-3xl font-bold text-gray-800 text-center mb-2">
            Create Account
        </h2>

        <p className="text-gray-500 text-center mb-8">
            Sign up to get started
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">

            {["Name", "Email", "Password"].map((label) => (
                <div key={label}>

                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        {label}
                    </label>

                    <input
                        type={
                            label === "Password"
                                ? "password"
                                : label === "Email"
                                ? "email"
                                : "text"
                        }
                        value={val[label]}
                        onChange={(e) =>
                            setVal({
                                ...val,
                                [label]: e.target.value
                            })
                        }
                        placeholder={`Enter your ${label.toLowerCase()}`}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg
                                   outline-none transition
                                   focus:ring-2 focus:ring-blue-500
                                   focus:border-blue-500
                                   hover:border-gray-400"
                    />

                </div>
            ))}

            <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 rounded-lg
                           font-semibold text-lg
                           hover:bg-blue-700
                           active:scale-[0.98]
                           transition duration-200
                           shadow-md"
            >
                Sign Up
            </button>

        </form>

        <div className="text-center mt-6">
            <span
                onClick={() => navigate("/login")}
                className="text-blue-600 font-medium cursor-pointer
                           hover:text-blue-800 hover:underline transition"
            >
                Already have an account?
            </span>
        </div>

    </div>
    <ToastContainer />
</div>
    )
}