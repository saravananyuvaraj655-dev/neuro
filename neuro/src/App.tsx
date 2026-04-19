import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";

import Index from "./pages/Index.tsx";
import Login from "./pages/Login.tsx";
import Signup from "./pages/Signup.tsx";
import DoctorSignup from "./pages/DoctorSignup.tsx";
import NotFound from "./pages/NotFound.tsx";
import { TooltipProvider } from "./components/ui/tooltip.tsx";
import PatientLogin from "./pages/PatientLogin";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster position="top-right" richColors />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/doctor-signup" element={<DoctorSignup />} />
            <Route path="/patient-login" element={<PatientLogin />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;