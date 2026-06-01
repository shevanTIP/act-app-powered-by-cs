import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import Nav from "./components/Nav";
import Toast from "./components/Toast";
import Dashboard from "./pages/Dashboard";
import Onboarding from "./pages/Onboarding";
import Queue from "./pages/Queue";
import SwipeReview from "./pages/SwipeReview";
import VoiceGuide from "./pages/VoiceGuide";

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Nav />
        <main>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard"  element={<Dashboard />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/queue"      element={<Queue />} />
            <Route path="/swipe"      element={<SwipeReview />} />
            <Route path="/voice-guide" element={<VoiceGuide />} />
          </Routes>
        </main>
        <Toast />
      </BrowserRouter>
    </AppProvider>
  );
}
