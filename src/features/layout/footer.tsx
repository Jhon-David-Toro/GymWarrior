import Link from "next/link";

import { SITE } from "@/lib/constants";

import styles from "./footer.module.scss";

const columns = [
  {
    title: "Entrena",
    links: [
      { href: "/planes", label: "Planes y precios" },
      { href: "/#entrenadores", label: "Entrenadores" },
      { href: "/#contacto", label: "Contacto" },
    ],
  },
  {
    title: "Herramientas",
    links: [
      { href: "/herramientas/imc", label: "Calculadora de IMC" },
      { href: "/herramientas/calorias", label: "Calculadora de calorías" },
    ],
  },
  {
    title: "Tienda",
    links: [
      { href: "/tienda?categoria=suplementos", label: "Suplementos" },
      { href: "/tienda?categoria=ropa", label: "Ropa" },
      { href: "/tienda?categoria=accesorios", label: "Accesorios" },
    ],
  },
] as const;

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.about}>
          <p className={styles.brand}>GymWarrior</p>
          <p>{SITE.address}</p>
          <ul role="list" className={styles.hours}>
            {SITE.hours.map((h) => (
              <li key={h.days}>
                <span>{h.days}</span>
                <span className="tabular">{h.time}</span>
              </li>
            ))}
          </ul>
        </div>

        {columns.map((col) => (
          <nav key={col.title} aria-label={col.title} className={styles.column}>
            <h2>{col.title}</h2>
            <ul role="list">
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href}>{l.label}</Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className={styles.bottom}>
        <p>Proyecto de portafolio de Jhon David Toro. Pagos simulados.</p>
        <ul role="list" className={styles.social}>
          <li>
            <a href={SITE.social.instagram} rel="noopener noreferrer" target="_blank">
              Instagram
            </a>
          </li>
          <li>
            <a href={SITE.social.facebook} rel="noopener noreferrer" target="_blank">
              Facebook
            </a>
          </li>
          <li>
            <a href={SITE.social.tiktok} rel="noopener noreferrer" target="_blank">
              TikTok
            </a>
          </li>
        </ul>
      </div>
    </footer>
  );
}
