import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Get Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch all patient data with related records
    const { data: patients, error: patientsError } = await supabase
      .from("patients")
      .select(`
        *,
        medical_records (*),
        admissions (*),
        billing (*)
      `);

    if (patientsError) {
      console.error("Error fetching patients:", patientsError);
      throw patientsError;
    }

    // Create context from patient data
    const patientContext = JSON.stringify(patients, null, 2);

    const systemPrompt = `You are a helpful medical assistant chatbot for a Hospital Patient Management System. 
You have access to the complete patient database including:
- Patient personal information (name, DOB, contact details, etc.)
- Medical records (illnesses, symptoms, diagnoses, prescriptions)
- Admission status (floor, room number, admission dates)
- Billing information (amounts, payment status)

Here is the current patient database:
${patientContext}

When answering questions:
1. Be professional and concise
2. Respect patient privacy - only share information when asked
3. Format information clearly
4. Use proper medical terminology when appropriate
5. If asked about a patient, provide all relevant details in an organized manner
6. If a patient is not found, politely inform the user
7. You can answer questions about specific patients, admission status, billing, or provide summaries`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    return new Response(JSON.stringify({ response: aiResponse }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in patient-chat function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});