import type { Section } from "@/lib/cms/sections";
import type { Project } from "@/lib/cms/projects";
import type { TeamMember } from "@/lib/cms/team";
import type { BlogPost } from "@/lib/blog";
import Hero from "./Hero";
import RichText from "./RichText";
import Cards from "./Cards";
import Steps from "./Steps";
import ImageText from "./ImageText";
import Logos from "./Logos";
import Faq from "./Faq";
import Cta from "./Cta";
import Projects from "./Projects";
import Posts from "./Posts";
import Team from "./Team";
import { BookingForm, ContactSection, type Contact } from "./Forms";
import { Anchor, str } from "./helpers";

export type SectionData = { projects: Project[]; posts: BlogPost[]; team: TeamMember[]; contact: Contact };
export const EMPTY_DATA: SectionData = { projects: [], posts: [], team: [], contact: { email: "", phone: "", footerText: "" } };

function One({ s, data }: { s: Section; data: SectionData }) {
  const f = s.fields ?? {};
  switch (s.type) {
    case "hero": return <Hero f={f} />;
    case "richText": return <RichText f={f} />;
    case "cards": return <Cards f={f} />;
    case "steps": return <Steps f={f} />;
    case "imageText": return <ImageText f={f} />;
    case "logos": return <Logos f={f} />;
    case "faq": return <Faq f={f} />;
    case "cta": return <Cta f={f} />;
    case "projects": return <Projects f={f} projects={data.projects} />;
    case "posts": return <Posts f={f} posts={data.posts} />;
    case "team": return <Team f={f} team={data.team} />;
    case "bookingForm": return <BookingForm f={f} />;
    case "contactForm": return <ContactSection f={f} contact={data.contact} />;
    default: return null;
  }
}

/** Renders visible sections in order. Used by the public site and by the admin preview, so both look the same. */
export default function Sections({ sections, data = EMPTY_DATA }: { sections: Section[]; data?: SectionData }) {
  return (
    <>
      {sections.filter((s) => s.visible !== false).map((s) => (
        <Anchor key={s.key} id={str(s.fields ?? {}, "anchor") || undefined}><One s={s} data={data} /></Anchor>
      ))}
    </>
  );
}
