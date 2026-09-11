import { useEffect, useState } from "react"
import {url} from "../utility/Url"
import { useNavigate } from "react-router-dom"
import DetailTicket from "./DetailTicket"

export default function Home(){
    const [data,setData]=useState([])
    const token=localStorage.getItem("token")
    console.log(token)
    const navigate=useNavigate()
    const fetchData=async()=>{
      try{
        const responses=await fetch(`${url}/tickets`,{
          method:"GET",
          headers:{
            "Authorization":`Bearer ${token}`
          }
        })
        const data=await responses.json()
        console.log(data)
        setData(data.tickets)

      }catch(e){
        console.log("error in fetching",e)
      }


    }

    useEffect(() => {
    fetchData()
}, [])
    return(
        <div className="min-h-screen bg-gray-100 p-6">

    <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-800">
                    My Tickets
                </h1>

                <p className="text-gray-500 mt-1">
                    Manage and track your tickets
                </p>
            </div>

            <button
                onClick={() => navigate("/create-ticket")}
                className="bg-blue-600 text-white px-5 py-3 rounded-lg
                           font-semibold shadow-md
                           hover:bg-blue-700
                           active:scale-95
                           transition"
            >
                + Create Ticket
            </button>
        </div>


        {/* Tickets */}
        <div className="grid gap-5">

            {data.map((item, index) => (
                <div
                    key={index}
                    className="bg-white rounded-xl shadow-sm border border-gray-200
                               p-6
                               hover:shadow-lg hover:-translate-y-1
                               transition duration-200"
                >

                    <div className="flex items-center justify-between">

                        <div>
                            <h2 className="text-xl font-semibold text-gray-800">
                                {item.title}
                            </h2>

                            <p className="text-gray-500 mt-2">
                                {item.description}
                            </p>
                        </div>

                        <span
                            className={`px-3 py-1 rounded-full text-sm font-medium
                                ${
                                    item.status === "open"
                                        ? "bg-green-100 text-green-700"
                                        : item.status === "in_progress"
                                        ? "bg-yellow-100 text-yellow-700"
                                        : "bg-gray-100 text-gray-700"
                                }`}
                        >
                            {item.status}
                        </span>

                    </div>


                    <div className="mt-5 flex justify-end">

                        <button
                            onClick={() => navigate(`/ticket/${item.id}`)}
                            className="text-blue-600 font-medium
                                       hover:text-blue-800
                                       hover:underline
                                       transition"
                        >
                            View Ticket →
                        </button>

                    </div>

                </div>
            ))}

        </div>

    </div>

</div>
    )
}