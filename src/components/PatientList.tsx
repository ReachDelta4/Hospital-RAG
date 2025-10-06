import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Calendar, Phone } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type Patient = Database["public"]["Tables"]["patients"]["Row"];

interface PatientListProps {
  patients: Patient[];
  onPatientClick: (patient: Patient) => void;
}

export const PatientList = ({ patients, onPatientClick }: PatientListProps) => {
  if (patients.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          No patients found. Add your first patient to get started.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {patients.map((patient) => (
        <Card
          key={patient.id}
          className="cursor-pointer hover:shadow-md transition-all hover:scale-[1.02] duration-200"
          onClick={() => onPatientClick(patient)}
        >
          <CardContent className="p-6">
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="rounded-full bg-primary/10 p-2">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{patient.full_name}</h3>
                    <p className="text-sm text-muted-foreground">{patient.gender}</p>
                  </div>
                </div>
                {patient.blood_group && (
                  <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">
                    {patient.blood_group}
                  </Badge>
                )}
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>{new Date(patient.date_of_birth).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-3.5 w-3.5" />
                  <span>{patient.contact_number}</span>
                </div>
              </div>

              {patient.allergies && (
                <div className="pt-2 border-t">
                  <p className="text-xs text-warning font-medium">
                    Allergies: {patient.allergies}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};