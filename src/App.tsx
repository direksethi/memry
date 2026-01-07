import { ConvexProvider, ConvexReactClient } from "convex/react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useOrderStore } from "@/lib/store";
import { Toaster } from "@/components/ui/toaster";

// Pages
import { HomePage } from "@/pages/HomePage";
import { PageOptionsPage } from "@/pages/PageOptionsPage";
import { ThemeSelectionPage } from "@/pages/ThemeSelectionPage";
import { PhotoUploadPage } from "@/pages/PhotoUploadPage";
import { BookEditorPage } from "@/pages/BookEditorPage";
import { ViewBookPage } from "@/pages/ViewBookPage";
import { AdminLoginPage } from "@/pages/AdminLoginPage";
import { AdminDashboardPage } from "@/pages/AdminDashboardPage";

import "./index.css";

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);

// Order flow component that handles step navigation
function OrderFlow() {
  const { currentStep } = useOrderStore();

  switch (currentStep) {
    case 1:
      return <HomePage />;
    case 2:
      return <PageOptionsPage />;
    case 3:
      return <ThemeSelectionPage />;
    case 4:
      return <PhotoUploadPage />;
    case 5:
      return <BookEditorPage />;
    default:
      return <HomePage />;
  }
}

function App() {
  return (
    <ConvexProvider client={convex}>
      <BrowserRouter>
        <Routes>
          {/* Main order flow */}
          <Route path="/" element={<OrderFlow />} />

          {/* View shared book */}
          <Route path="/view/:shareId" element={<ViewBookPage />} />

          {/* Admin routes */}
          <Route path="/admin" element={<AdminLoginPage />} />
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
        </Routes>
        <Toaster />
      </BrowserRouter>
    </ConvexProvider>
  );
}

export default App;
