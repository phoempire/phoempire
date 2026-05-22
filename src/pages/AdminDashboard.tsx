import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Home, BookOpen, Camera, Images, UtensilsCrossed, FileText, Sparkles, Star, Building2, LogOut, KeyRound } from "lucide-react";
import { Wordmark } from "@/components/site/Wordmark";
import HeroTab from "@/components/admin/HeroTab";
import StoryTab from "@/components/admin/StoryTab";
import FoodSnapsTab from "@/components/admin/FoodSnapsTab";
import GalleryTab from "@/components/admin/GalleryTab";
import MenuTab from "@/components/admin/MenuTab";
import MenuPdfsTab from "@/components/admin/MenuPdfsTab";
import LimitedEditionTab from "@/components/admin/LimitedEditionTab";
import RatingsTab from "@/components/admin/RatingsTab";
import BusinessInfoTab from "@/components/admin/BusinessInfoTab";
import AccountTab from "@/components/admin/AccountTab";

type TabKey = "hero" | "story" | "snaps" | "gallery" | "menu" | "menu-pdfs" | "limited" | "ratings" | "business" | "account";

const NAV: { key: TabKey; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: "hero", label: "Hero", icon: Home },
  { key: "gallery", label: "Food Snaps", icon: Images },
  { key: "snaps", label: "Gallery", icon: Camera },
  { key: "story", label: "Our Story", icon: BookOpen },
  { key: "menu", label: "Menu", icon: UtensilsCrossed },
  { key: "menu-pdfs", label: "Menu PDFs", icon: FileText },
  { key: "limited", label: "Limited Edition", icon: Sparkles },
  { key: "ratings", label: "Ratings", icon: Star },
  { key: "business", label: "Business Info", icon: Building2 },
  { key: "account", label: "Login Info", icon: KeyRound },
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { session, loading } = useAuth();
  const [tab, setTab] = useState<TabKey>("hero");

  useEffect(() => {
    if (!loading && !session) navigate("/admin/login", { replace: true });
  }, [loading, session, navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/admin/login", { replace: true });
  };

  if (loading || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#1A0A05" }}>
        <p className="text-white/60 text-sm tracking-widest uppercase">Loading…</p>
      </div>
    );
  }

  const active = NAV.find((n) => n.key === tab)!;

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: "#1A0A05" }}>
      <aside
        className="w-64 shrink-0 flex flex-col border-r"
        style={{ backgroundColor: "#1A0A05", borderColor: "rgba(212,160,23,0.2)" }}
      >
        <div className="px-6 py-6 border-b" style={{ borderColor: "rgba(212,160,23,0.2)" }}>
          <Wordmark className="text-xl" />
          <p className="text-[10px] uppercase tracking-[0.3em] mt-1" style={{ color: "rgba(253,246,237,0.5)" }}>Admin</p>
        </div>
        <nav className="flex-1 p-3 space-y-1.5" style={{ backgroundColor: "#2A1208" }}>
          {NAV.map((n) => {
            const Icon = n.icon;
            const isActive = tab === n.key;
            return (
              <button
                key={n.key}
                onClick={() => setTab(n.key)}
                className="group relative w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors"
                style={
                  isActive
                    ? { backgroundColor: "#C0392B", color: "#FDF6ED", fontWeight: 500 }
                    : { color: "rgba(253,246,237,0.5)" }
                }
              >
                {isActive && (
                  <span
                    aria-hidden
                    className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r"
                    style={{ backgroundColor: "#D4A017" }}
                  />
                )}
                <Icon className="h-4 w-4" />
                {n.label}
              </button>
            );
          })}
        </nav>
        <div className="p-3 border-t" style={{ borderColor: "rgba(212,160,23,0.2)" }}>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm transition-colors hover:bg-white/5"
            style={{ color: "rgba(253,246,237,0.6)" }}
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto" style={{ backgroundColor: "#FDF6ED" }}>
        <header
          className="px-10 py-6 border-b"
          style={{ backgroundColor: "#FDF6ED", borderColor: "rgba(26,10,5,0.12)" }}
        >
          <h2 className="font-serif text-2xl" style={{ color: "#1A0A05" }}>{active.label}</h2>
        </header>
        <div className="p-8 md:p-10 admin-light">
          <div
            className="rounded-lg border p-6 md:p-8 shadow-sm"
            style={{ backgroundColor: "#FFFFFF", borderColor: "rgba(26,10,5,0.12)" }}
          >
            {tab === "hero" && <HeroTab />}
            {tab === "story" && <StoryTab />}
            {tab === "snaps" && <FoodSnapsTab />}
            {tab === "gallery" && <GalleryTab />}
            {tab === "menu" && <MenuTab />}
            {tab === "menu-pdfs" && <MenuPdfsTab />}
            {tab === "limited" && <LimitedEditionTab />}
            {tab === "ratings" && <RatingsTab />}
            {tab === "business" && <BusinessInfoTab />}
            {tab === "account" && <AccountTab />}
          </div>
        </div>
      </main>
      <style>{`
        .admin-light label { color: #1A0A05; font-weight: 500; }
        .admin-light h1, .admin-light h2, .admin-light h3, .admin-light h4 { color: #1A0A05; }
        .admin-light .text-muted-foreground { color: rgba(26,10,5,0.65) !important; }
        .admin-light input, .admin-light textarea, .admin-light select {
          background-color: #FDF6ED !important;
          border-color: rgba(26,10,5,0.18) !important;
          color: #1A0A05 !important;
        }
        .admin-light input:focus, .admin-light textarea:focus, .admin-light select:focus {
          border-color: #D4A017 !important;
          box-shadow: 0 0 0 1px #D4A017 !important;
        }
        .admin-light button.bg-primary,
        .admin-light button[type="submit"].bg-primary {
          background-color: #C0392B !important;
          color: #FFFFFF !important;
        }
        .admin-light button.bg-primary:hover { filter: brightness(0.92); }
      `}</style>
    </div>
  );
}