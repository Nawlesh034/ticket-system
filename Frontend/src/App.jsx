import { BrowserRouter, Routes, Route } from "react-router-dom"

import Registration from "./components/Registration"
import Login from "./components/Login"
import Home from "./components/Home"
import CreateTicket from "./components/CreateTicket"
import DetailTicket from "./components/DetailTicket"
import Layout from "./Layout"
import GuestRoute from "./components/GuestRoute"
import ProtectedRoute from "./components/ProtectedRoute"

function App() {
    return (
        <BrowserRouter>

            <Routes>

                {/* Pages WITHOUT Header */}
                <Route element={<GuestRoute/>}>
                <Route path="/" element={<Registration />} />
                <Route path="/login" element={<Login />} />
                </Route>


                {/* Pages WITH Header */}
                <Route element={<ProtectedRoute/>}>
                <Route element={<Layout />}>

                    <Route path="/home" element={<Home />} />

                    <Route
                        path="/create-ticket"
                        element={<CreateTicket />}
                    />

                    <Route
                        path="/ticket/:id"
                        element={<DetailTicket />}
                    />

                </Route>
                </Route>

            </Routes>

        </BrowserRouter>
    )
}

export default App