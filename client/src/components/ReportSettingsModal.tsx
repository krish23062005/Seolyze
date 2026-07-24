import { useState, useEffect } from "react";
import { X, Mail, Building, Send } from "lucide-react";
import { useApp } from "../context/AppContext";

export default function ReportSettingsModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const { user, api } = useApp();
  const [schedule, setSchedule] = useState("none");
  const [agency, setAgency] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailSuccess, setEmailSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      setSchedule(user.reportSchedule || "none");
      setAgency(user.agencyName || "");
    }
  }, [isOpen, user]);

  const handleSave = async () => {
    setLoading(true);
    try {
      await api.put("/api/reports/settings", {
        reportSchedule: schedule,
        agencyName: agency
      });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 2000);
    } catch (err) {
      console.error(err);
      alert("Failed to save settings");
    }
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-2xl w-full max-w-md p-6 shadow-xl relative animate-in fade-in zoom-in duration-200">
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X size={20} />
        </button>
        
        <h2 className="text-xl font-bold text-foreground mb-1">Report Settings</h2>
        <p className="text-sm text-muted-foreground mb-6">Configure white-labeling and email reports.</p>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
              <Building size={16} className="text-primary"/> Agency Name
            </label>
            <input 
              type="text" 
              value={agency}
              onChange={(e) => setAgency(e.target.value)}
              placeholder="e.g. Acme SEO Agency"
              className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/50"
            />
            <p className="text-xs text-muted-foreground mt-1">This will appear on the PDF reports.</p>
          </div>
          
          <div>
            <label className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
              <Mail size={16} className="text-primary"/> Email Schedule
            </label>
            <div className="grid grid-cols-3 gap-2 mb-3">
              {['none', 'weekly', 'monthly'].map((opt) => (
                <button
                  key={opt}
                  onClick={() => setSchedule(opt)}
                  className={`py-2 rounded-lg text-sm font-medium transition-colors border ${schedule === opt ? 'bg-primary/10 border-primary/50 text-primary' : 'bg-transparent border-border text-muted-foreground hover:bg-muted/50'}`}
                >
                  {opt.charAt(0).toUpperCase() + opt.slice(1)}
                </button>
              ))}
            </div>
            
            <button 
              onClick={async () => {
                setSendingEmail(true);
                try {
                  const res = await api.post("/api/reports/send-latest-email");
                  if (res.data.success) {
                    setEmailSuccess(true);
                    setTimeout(() => setEmailSuccess(false), 3000);
                  }
                } catch (err: any) {
                  alert(err.response?.data?.message || "Failed to send email");
                }
                setSendingEmail(false);
              }}
              disabled={sendingEmail}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-colors border border-primary/30 bg-primary/5 text-primary hover:bg-primary/10"
            >
              <Send size={16} />
              {sendingEmail ? "Sending..." : emailSuccess ? "Email Sent!" : "Generate & Send Latest Report Now"}
            </button>
            <p className="text-xs text-muted-foreground mt-3">Receive automated updates of your latest analysis, or send one immediately.</p>
          </div>
        </div>
        
        <div className="mt-8 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            disabled={loading}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-5 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2"
            style={{ color: "var(--background)" }}
          >
            {loading ? "Saving..." : success ? "Saved!" : "Save Settings"}
          </button>
        </div>
      </div>
    </div>
  );
}
