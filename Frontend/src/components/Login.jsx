import { useState } from "react"
import {url} from "../utility/Url"
import { useNavigate } from "react-router-dom"
export default function Login(){
    const [details,setDetails]=useState({
        Email:"",
        Password:""
    })
    const handleSubmit=async(e)=>{
        e.preventDefault()
        if(details.Email==="" || details.Password===""){
            return
        }
        try{
                const response=await fetch(`${url}/auth/login`,{
                    method:"POST",
                    headers:{
                        "Content-type":"application/json"
                    },
                    body:JSON.stringify({
                        email:details.Email,
                        password:details.Password
                    })
                })
                const data = await response.json()
                if(response.ok){
                    console.log("login successfully",data)
                    localStorage.setItem("token",data.token)
                    navigate('/home')
                }else{
                    console.log("login unsuccessfull",data)
                }
            }catch(e){
                console.log("error while login",e)
            }

    }
    const navigate=useNavigate()
    return(<>
    
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
    
    <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        
        <h2 className="text-3xl font-bold text-gray-800 text-center mb-2">
            Welcome Back
        </h2>

        <p className="text-gray-500 text-center mb-8">
            Login to your account
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
            
            {["Email", "Password"].map((label) => (
                <div key={label}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        {label}
                    </label>

                    <input
                        type={label === "Password" ? "password" : "email"}
                        value={details[label]}
                        onChange={(e) =>
                            setDetails({
                                ...details,
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
                Login
            </button>
        </form>

        <div className="text-center mt-6">
            <span
                onClick={() => navigate("/")}
                className="text-blue-600 font-medium cursor-pointer 
                           hover:text-blue-800 hover:underline transition"
            >
                Create an account?
            </span>
        </div>

    </div>
</div>
    </>)
    
}