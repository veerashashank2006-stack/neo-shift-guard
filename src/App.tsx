import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import Dashboard from "./pages/Dashboard";
import Employees from "./pages/Employees";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <MainLayout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/employees" element={<Employees />} />
            {/* Placeholder routes for future pages */}
            <Route path="/attendance" element={<div className="glass-card p-8 rounded-2xl text-center"><h2 className="text-xl font-semibold text-foreground mb-2">Attendance Page</h2><p className="text-muted-foreground">Coming soon...</p></div>} />
            <Route path="/payroll" element={<div className="glass-card p-8 rounded-2xl text-center"><h2 className="text-xl font-semibold text-foreground mb-2">Payroll Page</h2><p className="text-muted-foreground">Coming soon...</p></div>} />
            <Route path="/reports" element={<div className="glass-card p-8 rounded-2xl text-center"><h2 className="text-xl font-semibold text-foreground mb-2">Reports Page</h2><p className="text-muted-foreground">Coming soon...</p></div>} />
            <Route path="/qr-sessions" element={<div className="glass-card p-8 rounded-2xl text-center"><h2 className="text-xl font-semibold text-foreground mb-2">QR Sessions Page</h2><p className="text-muted-foreground">Coming soon...</p></div>} />
            <Route path="/notifications" element={<div className="glass-card p-8 rounded-2xl text-center"><h2 className="text-xl font-semibold text-foreground mb-2">Notifications Page</h2><p className="text-muted-foreground">Coming soon...</p></div>} />
            <Route path="/settings" element={<div className="glass-card p-8 rounded-2xl text-center"><h2 className="text-xl font-semibold text-foreground mb-2">Settings Page</h2><p className="text-muted-foreground">Coming soon...</p></div>} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </MainLayout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
