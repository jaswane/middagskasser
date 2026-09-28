import Link from "next/link";
export default function NotFound() {
  return (
    <div className="container empty-page">
      <span className="eyebrow" style={{ justifyContent: "center" }}>
        404 · SIDEN FINNES IKKE
      </span>
      <h1>Her var det tomt.</h1>
      <p>Lenken kan være gammel. Vi hjelper deg videre til sammenligningen.</p>
      <Link className="button button-primary" href="/">
        Til forsiden →
      </Link>
    </div>
  );
}
