import { useState } from "react"
import { url } from "../utility/Url"
import { useNavigate } from "react-router-dom"

export default function CreateTicket() {
    const [info, setInfo] = useState({
        Title: "",
        Description: ""
    })
    const [isdata,setisData]=useState(false)
    const [res,setres]=useState({})
    const token = localStorage.getItem("token")
    const navigate=useNavigate()
    const handleSubmit = async (e) => {
        e.preventDefault()
        if (info.Title === "" || info.Description === "") {
            return
        }
        try {
            const response = await fetch(`${url}/tickets`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    title: info.Title,
                    description: info.Description
                })
            })
            const data = await response.json()
            if (response.ok && data) {
                console.log("data send successfully", data)
                setisData(true)
                setres(data)
                console.log(res)
        console.log(isdata)
            } else {
                console.log("data have some error", data)
            }
        } catch (e) {
            console.log("error while sending data", e)
        }
        


    }



    return (
       <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">

    <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-8">

        {isdata === true ? (

            // Success state
            <div className="text-center">

                <div className="mb-6">
                    <div className="w-16 h-16 mx-auto bg-green-100 rounded-full
                                    flex items-center justify-center">
                        <span className="text-3xl text-green-600">
                            ✓
                        </span>
                    </div>
                </div>

                <h2 className="text-2xl font-bold text-gray-800 mb-6">
                    Ticket Created Successfully
                </h2>

                <div className="text-left bg-gray-50 rounded-xl p-5 space-y-4">

                    <div>
                        <p className="text-sm text-gray-500">
                            Title
                        </p>
                        <p className="text-lg font-semibold text-gray-800">
                            {res.title}
                        </p>
                    </div>

                    <div>
                        <p className="text-sm text-gray-500">
                            Description
                        </p>
                        <p className="text-gray-700">
                            {res.description}
                        </p>
                    </div>

                    <div>
                        <p className="text-sm text-gray-500">
                            Status
                        </p>

                        <span className="inline-block mt-1 px-3 py-1
                                         bg-green-100 text-green-700
                                         rounded-full text-sm font-semibold">
                            {res.status}
                        </span>
                    </div>

                </div>

                <button
                    onClick={() => navigate("/home")}
                    className="w-full mt-6 bg-blue-600 text-white py-3
                               rounded-lg font-semibold
                               hover:bg-blue-700
                               active:scale-[0.98]
                               transition duration-200"
                >
                    View All Tickets
                </button>

            </div>

        ) : (

            // Create ticket form
            <div>

                <h2 className="text-3xl font-bold text-gray-800 text-center">
                    Create Ticket
                </h2>

                <p className="text-gray-500 text-center mt-2 mb-8">
                    Create a new support ticket
                </p>

                <form onSubmit={handleSubmit} className="space-y-6">

                    {["Title", "Description"].map((label) => (
                        <div key={label}>

                            <label className="block text-sm font-medium
                                              text-gray-700 mb-2">
                                {label}
                            </label>

                            <input
                                type="text"
                                value={info[label]}
                                onChange={(e) =>
                                    setInfo({
                                        ...info,
                                        [label]: e.target.value
                                    })
                                }
                                placeholder={`Enter ${label.toLowerCase()}`}
                                className="w-full px-4 py-3
                                           border border-gray-300 rounded-lg
                                           outline-none
                                           focus:ring-2 focus:ring-blue-500
                                           focus:border-blue-500
                                           hover:border-gray-400
                                           transition"
                            />

                        </div>
                    ))}

                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-3
                                   rounded-lg font-semibold text-lg
                                   hover:bg-blue-700
                                   active:scale-[0.98]
                                   transition duration-200
                                   shadow-md"
                    >
                        Create Ticket
                    </button>

                </form>

            </div>

        )}

    </div>

</div>
    )
}