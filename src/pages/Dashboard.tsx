import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Activity, LogOut, Plus, Search, MessageSquare } from "lucide-react";
import { Input } from "@/components/ui/input";
import { PatientList } from "@/components/PatientList";
import { AddPatientDialog } from "@/components/AddPatientDialog";
import { PatientDetailsDialog } from "@/components/PatientDetailsDialog";
import { ChatbotDialog } from "@/components/ChatbotDialog";
import type { Database } from "@/integrations/supabase/types";

type Patient = Database["public"]["Tables"]["patients"]["Row"];

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showChatbot, setShowChatbot] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
        fetchPatients();
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchPatients = async () => {
    const { data, error } = await supabase
      .from("patients")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching patients:", error);
    } else {
      setPatients(data || []);
      setFilteredPatients(data || []);
    }
  };

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredPatients(patients);
    } else {
      const filtered = patients.filter((patient) =>
        patient.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patient.contact_number.includes(searchQuery) ||
        patient.email?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredPatients(filtered);
    }
  }, [searchQuery, patients]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const handlePatientClick = (patient: Patient) => {
    setSelectedPatient(patient);
    setShowDetailsDialog(true);
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-gradient-to-br from-primary to-secondary p-2">
              <Activity className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Hospital Management</h1>
              <p className="text-sm text-muted-foreground">Patient Care System</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowChatbot(true)}
              className="gap-2"
            >
              <MessageSquare className="h-4 w-4" />
              AI Assistant
            </Button>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Actions Bar */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search patients by name, phone, or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={() => setShowAddDialog(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Patient
            </Button>
          </div>

          {/* Patient List */}
          <PatientList
            patients={filteredPatients}
            onPatientClick={handlePatientClick}
          />
        </div>
      </main>

      {/* Dialogs */}
      <AddPatientDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onPatientAdded={fetchPatients}
      />
      
      {selectedPatient && (
        <PatientDetailsDialog
          open={showDetailsDialog}
          onOpenChange={setShowDetailsDialog}
          patient={selectedPatient}
          onUpdate={fetchPatients}
        />
      )}

      <ChatbotDialog
        open={showChatbot}
        onOpenChange={setShowChatbot}
      />
    </div>
  );
};

export default Dashboard;