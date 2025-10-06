import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { User, Stethoscope, BedDouble, CreditCard, Plus } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type Patient = Database["public"]["Tables"]["patients"]["Row"];
type MedicalRecord = Database["public"]["Tables"]["medical_records"]["Row"];
type Admission = Database["public"]["Tables"]["admissions"]["Row"];
type Billing = Database["public"]["Tables"]["billing"]["Row"];

interface PatientDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patient: Patient;
  onUpdate: () => void;
}

export const PatientDetailsDialog = ({ open, onOpenChange, patient, onUpdate }: PatientDetailsDialogProps) => {
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [admission, setAdmission] = useState<Admission | null>(null);
  const [billing, setBilling] = useState<Billing | null>(null);
  const [showAddRecord, setShowAddRecord] = useState(false);
  const [showAddAdmission, setShowAddAdmission] = useState(false);
  const [showAddBilling, setShowAddBilling] = useState(false);

  useEffect(() => {
    if (open) {
      fetchPatientData();
    }
  }, [open, patient.id]);

  const fetchPatientData = async () => {
    // Fetch medical records
    const { data: records } = await supabase
      .from("medical_records")
      .select("*")
      .eq("patient_id", patient.id)
      .order("created_at", { ascending: false });
    
    setMedicalRecords(records || []);

    // Fetch admission
    const { data: admissionData } = await supabase
      .from("admissions")
      .select("*")
      .eq("patient_id", patient.id)
      .maybeSingle();
    
    setAdmission(admissionData);

    // Fetch billing
    const { data: billingData } = await supabase
      .from("billing")
      .select("*")
      .eq("patient_id", patient.id)
      .maybeSingle();
    
    setBilling(billingData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {patient.full_name}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="info" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="info">Info</TabsTrigger>
            <TabsTrigger value="medical">Medical</TabsTrigger>
            <TabsTrigger value="admission">Admission</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Date of Birth</p>
                  <p className="font-medium">{new Date(patient.date_of_birth).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Gender</p>
                  <p className="font-medium">{patient.gender}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Blood Group</p>
                  <Badge variant="outline" className="bg-destructive/10">
                    {patient.blood_group || "N/A"}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Contact</p>
                  <p className="font-medium">{patient.contact_number}</p>
                </div>
                {patient.email && (
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{patient.email}</p>
                  </div>
                )}
                {patient.address && (
                  <div className="col-span-2">
                    <p className="text-sm text-muted-foreground">Address</p>
                    <p className="font-medium">{patient.address}</p>
                  </div>
                )}
                {patient.allergies && (
                  <div className="col-span-2">
                    <p className="text-sm text-muted-foreground">Allergies</p>
                    <p className="font-medium text-warning">{patient.allergies}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {(patient.emergency_contact_name || patient.emergency_contact_number) && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Emergency Contact</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  {patient.emergency_contact_name && (
                    <div>
                      <p className="text-sm text-muted-foreground">Name</p>
                      <p className="font-medium">{patient.emergency_contact_name}</p>
                    </div>
                  )}
                  {patient.emergency_contact_number && (
                    <div>
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <p className="font-medium">{patient.emergency_contact_number}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="medical" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold">Medical Records</h3>
              <Button size="sm" onClick={() => setShowAddRecord(!showAddRecord)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Record
              </Button>
            </div>

            {showAddRecord && (
              <AddMedicalRecordForm
                patientId={patient.id}
                onSuccess={() => {
                  setShowAddRecord(false);
                  fetchPatientData();
                }}
              />
            )}

            {medicalRecords.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  No medical records found
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {medicalRecords.map((record) => (
                  <Card key={record.id}>
                    <CardContent className="pt-6">
                      <div className="space-y-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold">{record.illness}</p>
                            <p className="text-sm text-muted-foreground">Dr. {record.doctor_name}</p>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {new Date(record.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Symptoms:</p>
                          <p className="text-sm">{record.symptoms}</p>
                        </div>
                        {record.diagnosis && (
                          <div>
                            <p className="text-sm text-muted-foreground">Diagnosis:</p>
                            <p className="text-sm">{record.diagnosis}</p>
                          </div>
                        )}
                        {record.prescription && (
                          <div>
                            <p className="text-sm text-muted-foreground">Prescription:</p>
                            <p className="text-sm">{record.prescription}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="admission" className="space-y-4">
            {!admission ? (
              <div className="space-y-4">
                <p className="text-muted-foreground">No admission record</p>
                <Button onClick={() => setShowAddAdmission(!showAddAdmission)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Admission
                </Button>
                {showAddAdmission && (
                  <AddAdmissionForm
                    patientId={patient.id}
                    onSuccess={() => {
                      setShowAddAdmission(false);
                      fetchPatientData();
                    }}
                  />
                )}
              </div>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Admission Status</span>
                    <Badge variant={admission.is_admitted ? "default" : "secondary"}>
                      {admission.is_admitted ? "Admitted" : "Discharged"}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {admission.is_admitted && (
                    <>
                      <div>
                        <p className="text-sm text-muted-foreground">Floor</p>
                        <p className="font-medium">{admission.floor_number}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Room Number</p>
                        <p className="font-medium">{admission.room_number}</p>
                      </div>
                    </>
                  )}
                  {admission.admission_date && (
                    <div>
                      <p className="text-sm text-muted-foreground">Admission Date</p>
                      <p className="font-medium">
                        {new Date(admission.admission_date).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                  {admission.discharge_date && (
                    <div>
                      <p className="text-sm text-muted-foreground">Discharge Date</p>
                      <p className="font-medium">
                        {new Date(admission.discharge_date).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="billing" className="space-y-4">
            {!billing ? (
              <div className="space-y-4">
                <p className="text-muted-foreground">No billing record</p>
                <Button onClick={() => setShowAddBilling(!showAddBilling)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Billing
                </Button>
                {showAddBilling && (
                  <AddBillingForm
                    patientId={patient.id}
                    onSuccess={() => {
                      setShowAddBilling(false);
                      fetchPatientData();
                    }}
                  />
                )}
              </div>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Billing Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Amount</p>
                      <p className="text-2xl font-bold">${billing.total_amount}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Amount Paid</p>
                      <p className="text-2xl font-bold text-success">${billing.amount_paid}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Amount Due</p>
                      <p className="text-2xl font-bold text-warning">${billing.amount_due}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Payment Status</p>
                      <Badge
                        variant={billing.payment_status === "paid" ? "default" : "secondary"}
                      >
                        {billing.payment_status}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

// Helper Components
const AddMedicalRecordForm = ({ patientId, onSuccess }: { patientId: string; onSuccess: () => void }) => {
  const [formData, setFormData] = useState({
    illness: "",
    symptoms: "",
    diagnosis: "",
    prescription: "",
    doctor_name: "",
    notes: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from("medical_records")
        .insert([{ ...formData, patient_id: patientId }]);

      if (error) throw error;
      toast.success("Medical record added!");
      onSuccess();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Illness *</Label>
              <Input
                value={formData.illness}
                onChange={(e) => setFormData({ ...formData, illness: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Doctor Name *</Label>
              <Input
                value={formData.doctor_name}
                onChange={(e) => setFormData({ ...formData, doctor_name: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Symptoms *</Label>
            <Textarea
              value={formData.symptoms}
              onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Diagnosis</Label>
            <Textarea
              value={formData.diagnosis}
              onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Prescription</Label>
            <Textarea
              value={formData.prescription}
              onChange={(e) => setFormData({ ...formData, prescription: e.target.value })}
            />
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? "Adding..." : "Add Record"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

const AddAdmissionForm = ({ patientId, onSuccess }: { patientId: string; onSuccess: () => void }) => {
  const [formData, setFormData] = useState({
    is_admitted: true,
    admission_date: new Date().toISOString().split("T")[0],
    floor_number: "",
    room_number: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from("admissions")
        .insert([{ 
          patient_id: patientId,
          is_admitted: formData.is_admitted,
          admission_date: formData.admission_date,
          floor_number: formData.floor_number ? parseInt(formData.floor_number) : null,
          room_number: formData.room_number,
        }]);

      if (error) throw error;
      toast.success("Admission record added!");
      onSuccess();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Admission Date</Label>
              <Input
                type="date"
                value={formData.admission_date}
                onChange={(e) => setFormData({ ...formData, admission_date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Floor Number</Label>
              <Input
                type="number"
                value={formData.floor_number}
                onChange={(e) => setFormData({ ...formData, floor_number: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Room Number</Label>
              <Input
                value={formData.room_number}
                onChange={(e) => setFormData({ ...formData, room_number: e.target.value })}
              />
            </div>
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? "Adding..." : "Add Admission"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

const AddBillingForm = ({ patientId, onSuccess }: { patientId: string; onSuccess: () => void }) => {
  const [formData, setFormData] = useState({
    total_amount: "",
    amount_paid: "0",
    payment_status: "pending",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const totalAmount = parseFloat(formData.total_amount);
      const amountPaid = parseFloat(formData.amount_paid);
      const amountDue = totalAmount - amountPaid;

      const { error } = await supabase
        .from("billing")
        .insert([{
          patient_id: patientId,
          total_amount: totalAmount,
          amount_paid: amountPaid,
          amount_due: amountDue,
          payment_status: formData.payment_status,
        }]);

      if (error) throw error;
      toast.success("Billing record added!");
      onSuccess();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Total Amount *</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.total_amount}
                onChange={(e) => setFormData({ ...formData, total_amount: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Amount Paid</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.amount_paid}
                onChange={(e) => setFormData({ ...formData, amount_paid: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Payment Status</Label>
              <Select
                value={formData.payment_status}
                onValueChange={(value) => setFormData({ ...formData, payment_status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="partial">Partial</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? "Adding..." : "Add Billing"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};