import { useNavigate } from "react-router-dom"

export default function Header() {
    const navigate = useNavigate()
    const token = localStorage.getItem("token")

    const handleLogout = () => {
        localStorage.removeItem("token")
        navigate("/login")
    }

    return (
        <header className="bg-white shadow-md">
            <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">

                {/* Logo */}
                <h1
                    onClick={() => navigate(token ? "/home" : "/")}
                    className="text-2xl font-bold text-blue-600 cursor-pointer"
                >
                    TicketSystem
                </h1>

                {/* Navigation */}
                <nav className="flex items-center gap-6">

                    {token ? (
                        <>
                            {/* Home */}
                            <button
                                onClick={() => navigate("/home")}
                                className="text-gray-600 hover:text-blue-600 font-medium transition"
                            >
                                Home
                            </button>

                            {/* Create Ticket */}
                            <button
                                onClick={() => navigate("/create-ticket")}
                                className="text-gray-600 hover:text-blue-600 font-medium transition"
                            >
                                Create Ticket
                            </button>

                            {/* Logout */}
                            <button
                                onClick={handleLogout}
                                className="bg-red-500 text-white px-4 py-2 rounded-lg
                                           hover:bg-red-600 transition"
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            {/* Login */}
                            <button
                                onClick={() => navigate("/login")}
                                className="text-gray-600 hover:text-blue-600 font-medium transition"
                            >
                                Login
                            </button>

                            {/* Register */}
                            <button
                                onClick={() => navigate("/")}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg
                                           hover:bg-blue-700 transition"
                            >
                                Register
                            </button>
                        </>
                    )}

                </nav>
            </div>
        </header>
    )
}