import Link from "next/link";
import { ArrowUpRight, PackageOpen, ArrowRight } from "lucide-react";
import { editorialProviders } from "@/lib/data";
export function Brand({ sibling = false }: { sibling?: boolean }) {
  return (
    <span className="brand">
      <PackageOpen size={29} strokeWidth={1.7} />
      <span>
        {sibling ? "middagen" : "middagskasser"}
        <span className="brand-dot">.</span>
        <small>no</small>
      </span>
    </span>
  );
}
export function Header() {
  return (
    <header className="header">
      <div className="container header-inner">
        <Link href="/" aria-label="Middagskasser.no – hjem">
          <Brand />
        </Link>
        <nav aria-label="Hovedmeny">
          <Link href="/hellofresh-vs-godtlevert">Sammenlign matkasser</Link>
          <Link href="/slik-sammenligner-vi">Slik sammenligner vi</Link>
          <Link href="/finn-matkasse" className="nav-cta">
            Hjelp meg å velge <ArrowUpRight size={16} />
          </Link>
        </nav>
      </div>
    </header>
  );
}
export function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-top">
        <div>
          <Link href="/">
            <Brand />
          </Link>
          <p>
            Litt mindre planlegging.
            <br />
            Et litt enklere middagsvalg.
          </p>
        </div>
        <div className="footer-links">
          <div>
            <strong>Finn din matkasse</strong>
            <Link href="/hellofresh-vs-godtlevert">Sammenlign de to</Link>
            <Link href="/finn-matkasse">Matkassevelgeren</Link>
            <Link href="/godtlevert">Godtlevert</Link>
            <Link href="/hellofresh">HelloFresh</Link>
            {editorialProviders.map((e) => (
              <Link key={e.id} href={`/${e.id}`}>
                {e.name}
              </Link>
            ))}
          </div>
          <div>
            <strong>Om Middagskasser.no</strong>
            <Link href="/slik-sammenligner-vi">Metode og kilder</Link>
            <Link href="/annonselenker">Annonselenker</Link>
            <Link href="/om">Om oss</Link>
            <Link href="/kontakt">Kontakt</Link>
            <Link href="/personvern">Personvern</Link>
          </div>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>
          © 2026 Middagskasser.no · Et prosjekt fra{" "}
          <a href="https://swanecreative.no/">Swane Creative</a>
        </span>
        <span>En del av middagen-familien</span>
      </div>
    </footer>
  );
}
export function Sibling() {
  return (
    <aside className="sibling">
      <div>
        <span className="eyebrow">NOEN GANGER HOLDER DET MED EN IDÉ</span>
        <h2>Vil dere heller finne på middag selv?</h2>
        <p>Få middagstips hos søsterproduktet vårt, Middagen.no.</p>
      </div>
      <a
        href="https://middagen.no"
        data-event="sibling_site_click"
        className="button button-outline"
      >
        Finn middagstips <ArrowUpRight size={18} />
      </a>
    </aside>
  );
}
export function PageIntro({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="page-intro">
      <Link href="/" className="breadcrumb">
        Forside <ArrowRight size={12} />
      </Link>
      <div className="eyebrow">{eyebrow}</div>
      <h1>{title}</h1>
      <div className="intro-copy">{children}</div>
    </div>
  );
}
