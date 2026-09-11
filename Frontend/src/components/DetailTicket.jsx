import { useParams } from "react-router-dom"
import {url} from "../utility/Url"
import { useEffect, useState } from "react"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

export default function DetailTicket(){
    const {id} =useParams()
    const [data,setData]=useState({})
    const [option ,setOption]= useState("")
    console.log(id)
    const token=localStorage.getItem("token")

    const fetchData=async(id)=>{
        const response = await fetch(`${url}/tickets/${id}`,{
            method:"GET",
            headers:{
                "Authorization":`Bearer ${token}`
            }
        })
        const data= await response.json()
        console.log(data)
        setData(data)
        

    }
    const handledata=async(newStatus)=>{
     try{

        const res=await fetch(`${url}/tickets/${id}/status`,{
        method:"PATCH",
        headers:{
            "Authorization":`Bearer ${token}`
        },
        body:JSON.stringify({
          status:newStatus
        })
      })
      
      const data= await res.json()
      console.log(data.error)
      if(res.ok){
        setData({
            ...data,status:newStatus
        })
        toast.success("Status updated successfully")
      }else{
        toast.error(responseData.error || "Unable to update status")
        console.log("error in status change",data)
      }
     

     }catch(e){
        console.log(e,"error in status change")
     }   
      
    }
    useEffect(()=>{
      fetchData(id)
    },[])
    
    return(
       <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">

    <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">

            <h1 className="text-3xl font-bold text-gray-800">
                Ticket Details
            </h1>

            <span
                className={`px-4 py-2 rounded-full text-sm font-semibold
                    ${
                        data.status === "open"
                            ? "bg-green-100 text-green-700"
                            : data.status === "in_progress"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-gray-200 text-gray-700"
                    }`}
            >
                {data.status}
            </span>

        </div>


        {/* Ticket information */}
        <div className="space-y-6">

            <div>
                <p className="text-sm font-medium text-gray-500 mb-1">
                    Title
                </p>

                <h2 className="text-xl font-semibold text-gray-800">
                    {data.title}
                </h2>
            </div>


            <div>
                <p className="text-sm font-medium text-gray-500 mb-1">
                    Description
                </p>

                <p className="text-gray-700 leading-relaxed">
                    {data.description}
                </p>
            </div>


            {/* Status */}
            <div>
                <p className="text-sm font-medium text-gray-500 mb-2">
                    Update Status
                </p>

                <select
                    value={data.status}
                    onChange={(e) => {
                        const newStatus = e.target.value
                        setOption(newStatus)
                        handledata(newStatus)
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg
                               bg-white text-gray-700
                               outline-none
                               focus:ring-2 focus:ring-blue-500
                               focus:border-blue-500
                               cursor-pointer
                               transition"
                >
                    <option value="open">
                        Open
                    </option>

                    <option value="in_progress">
                        In Progress
                    </option>

                    <option value="closed">
                        Closed
                    </option>
                </select>
            </div>

        </div>

    </div>
<ToastContainer />
</div>
    )
}