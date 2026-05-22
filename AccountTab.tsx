import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function AccountTab() {
  const { session } = useAuth();
  const currentEmail = session?.user?.email ?? "";

  const [email, setEmail] = useState(currentEmail);
  const [savingEmail, setSavingEmail] = useState(false);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  const updateEmail = async () => {
    if (!email || email === currentEmail) {
      toast.error("Enter a new email address");
      return;
    }
    setSavingEmail(true);
    const { error } = await supabase.auth.updateUser({ email });
    setSavingEmail(false);
    if (error) toast.error(error.message);
    else toast.success("Confirmation sent to the new email. Click the link to finish the change.");
  };

  const updatePassword = async () => {
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setSavingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setSavingPassword(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setNewPassword("");
    setConfirmPassword("");
    toast.success("Password updated");
  };

  return (
    <div className="space-y-10 max-w-xl">
      <section className="space-y-4">
        <div>
          <h3 className="font-serif text-lg">Email</h3>
          <p className="text-sm text-muted-foreground">Used to sign in. Changing it requires confirming the new address.</p>
        </div>
        <div className="space-y-1">
          <Label>Email address</Label>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <Button onClick={updateEmail} disabled={savingEmail}>
          {savingEmail ? "Saving…" : "Update Email"}
        </Button>
      </section>

      <div className="h-px bg-border" />

      <section className="space-y-4">
        <div>
          <h3 className="font-serif text-lg">Password</h3>
          <p className="text-sm text-muted-foreground">Choose something at least 8 characters long.</p>
        </div>
        <div className="space-y-1">
          <Label>New password</Label>
          <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} autoComplete="new-password" />
        </div>
        <div className="space-y-1">
          <Label>Confirm new password</Label>
          <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} autoComplete="new-password" />
        </div>
        <Button onClick={updatePassword} disabled={savingPassword}>
          {savingPassword ? "Saving…" : "Update Password"}
        </Button>
      </section>
    </div>
  );
}
