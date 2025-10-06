import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Activity, Users, FileText, DollarSign } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col items-center text-center space-y-8">
          <div className="rounded-full bg-gradient-to-br from-primary to-secondary p-4 shadow-lg">
            <Activity className="h-16 w-16 text-primary-foreground" />
          </div>
          
          <div className="space-y-4 max-w-3xl">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Hospital Patient Management System
            </h1>
            <p className="text-xl text-muted-foreground">
              Comprehensive healthcare management with AI-powered patient assistance
            </p>
          </div>

          <div className="flex gap-4">
            <Button size="lg" onClick={() => navigate("/auth")} className="shadow-lg">
              Get Started
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate("/auth")}>
              Staff Login
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-20">
          <div className="bg-card rounded-lg p-6 shadow-md hover:shadow-lg transition-all">
            <div className="rounded-full bg-primary/10 p-3 w-fit mb-4">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Patient Records</h3>
            <p className="text-sm text-muted-foreground">
              Complete patient information management with medical history tracking
            </p>
          </div>

          <div className="bg-card rounded-lg p-6 shadow-md hover:shadow-lg transition-all">
            <div className="rounded-full bg-secondary/10 p-3 w-fit mb-4">
              <FileText className="h-6 w-6 text-secondary" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Medical Records</h3>
            <p className="text-sm text-muted-foreground">
              Track diagnoses, prescriptions, and treatment plans efficiently
            </p>
          </div>

          <div className="bg-card rounded-lg p-6 shadow-md hover:shadow-lg transition-all">
            <div className="rounded-full bg-primary/10 p-3 w-fit mb-4">
              <Activity className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Admission Management</h3>
            <p className="text-sm text-muted-foreground">
              Monitor patient admissions, floor assignments, and room allocations
            </p>
          </div>

          <div className="bg-card rounded-lg p-6 shadow-md hover:shadow-lg transition-all">
            <div className="rounded-full bg-secondary/10 p-3 w-fit mb-4">
              <DollarSign className="h-6 w-6 text-secondary" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Billing System</h3>
            <p className="text-sm text-muted-foreground">
              Comprehensive billing management with payment tracking
            </p>
          </div>
        </div>

        {/* AI Assistant Highlight */}
        <div className="mt-20 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-2xl p-8 shadow-lg border border-primary/10">
          <div className="text-center space-y-4">
            <div className="inline-block rounded-full bg-gradient-to-br from-primary to-secondary p-3">
              <Activity className="h-8 w-8 text-primary-foreground" />
            </div>
            <h2 className="text-3xl font-bold">AI-Powered Patient Assistant</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Query patient information instantly with our intelligent chatbot. Get real-time access to medical records, admission status, and billing details through natural conversation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
