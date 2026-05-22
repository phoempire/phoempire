import { Navbar } from "@/components/site/Navbar";
import { ScrollBg } from "@/components/site/ScrollBg";
import { Hero } from "@/components/site/Hero";
import { Gallery } from "@/components/site/Gallery";
import { FoodSnaps } from "@/components/site/FoodSnaps";
import { Divider } from "@/components/site/Divider";
import { Story } from "@/components/site/Story";
import { Stats } from "@/components/site/Stats";
import { Reviews } from "@/components/site/Reviews";
import { Menu } from "@/components/site/Menu";
import { LimitedEdition } from "@/components/site/LimitedEdition";
import { Visit } from "@/components/site/Visit";
import { Contact } from "@/components/site/Contact";
import { Footer } from "@/components/site/Footer";

const Index = () => {
  return (
    <main className="min-h-screen">
      <ScrollBg />
      <Navbar />
      <Hero />
      <Gallery />
      <FoodSnaps />
      <Story />
      <Stats />
      <Reviews />
      <div className="bg-gradient-warm">
        <Divider solidBg="#FDF6ED" />
        <Menu />
        <Divider solidBg="#FDF6ED" />
      </div>
      <LimitedEdition />
      <Divider bgColor="#F5EBD8" bgStart="top 90%" bgEnd="top 40%" />
      <Visit />
      <Divider />
      <Contact />
      <Footer />
    </main>
  );
};

export default Index;
