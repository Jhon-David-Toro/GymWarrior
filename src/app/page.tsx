import { Calculator, Flame, Mail, MapPin, Phone } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { ButtonLink } from "@/components/ui/button";
import { Container, SectionHeading } from "@/components/ui/misc";
import { ContactForm } from "@/features/contact/contact-form";
import { PlanCard, PlanGrid } from "@/features/plans/plan-card";
import { ProductGrid } from "@/features/shop/product-card";
import { SITE } from "@/lib/constants";
import { getActivePlans, getActiveProducts, getTrainers } from "@/server/queries/catalog";

import styles from "./page.module.scss";

export default async function HomePage() {
  const [plans, trainers, products] = await Promise.all([
    getActivePlans(),
    getTrainers(),
    getActiveProducts(),
  ]);
  const featured = products.slice(0, 4);

  return (
    <>
      <section className={styles.hero} aria-labelledby="hero-title">
        <Container className={styles.heroInner}>
          <div className={styles.heroCopy}>
            <h1 id="hero-title" className={styles.heroTitle}>
              <span>Fuerza</span> <span>que se</span> <span>nota.</span>
            </h1>
            <p className={styles.heroLead}>
              Pesas, cardio y clases grupales en Caldas, Antioquia, con entrenadores que te corrigen
              la técnica desde el primer día.
            </p>
            <div className={styles.heroActions}>
              <ButtonLink href="/planes" size="lg">
                Ver planes desde $45.000
              </ButtonLink>
              <ButtonLink href="/herramientas/imc" size="lg" variant="outline">
                Calcular mi IMC
              </ButtonLink>
            </div>
          </div>

          <div className={styles.heroVisual}>
            <Image
              src="/images/gym-floor.webp"
              alt="Zona de máquinas y pesas del gimnasio"
              fill
              priority
              sizes="(min-width: 1024px) 45vw, 100vw"
            />
            <aside className={styles.board} aria-label="Horario">
              <h2>Horario</h2>
              <dl>
                {SITE.hours.map((h) => (
                  <div key={h.days}>
                    <dt>{h.days}</dt>
                    <dd className="tabular">{h.time}</dd>
                  </div>
                ))}
              </dl>
            </aside>
          </div>
        </Container>
      </section>

      <section className={styles.section} aria-labelledby="planes-title">
        <Container>
          <SectionHeading
            id="planes-title"
            title="Planes sin letra pequeña"
            description="Sin matrícula ni permanencia. Pagas por lo que vas a usar y lo activas en línea."
          />
          <div className={styles.sectionBody}>
            <PlanGrid>
              {plans.map((plan) => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  action={
                    <ButtonLink
                      href={`/planes#${plan.slug}`}
                      block
                      size="lg"
                      variant={plan.isHighlighted ? "primary" : "dark"}
                    >
                      Elegir {plan.name}
                    </ButtonLink>
                  }
                />
              ))}
            </PlanGrid>
          </div>
        </Container>
      </section>

      <section
        id="entrenadores"
        className={`${styles.section} ${styles.paper}`}
        aria-labelledby="entrenadores-title"
      >
        <Container>
          <SectionHeading
            id="entrenadores-title"
            title="Quién te va a entrenar"
            description="Profesionales en sala durante todo el horario. Pregúntales lo que quieras: para eso están."
          />
          <ul role="list" className={styles.trainers}>
            {trainers.map((t) => (
              <li key={t.id} className={styles.trainer}>
                <span className={styles.monogram} aria-hidden>
                  {t.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)}
                </span>
                <div>
                  <h3>{t.name}</h3>
                  <p className={styles.specialty}>{t.specialty}</p>
                  <p>{t.bio}</p>
                  <ul role="list" className={styles.achievements}>
                    {t.achievements.map((a) => (
                      <li key={a}>{a}</li>
                    ))}
                  </ul>
                  <p className={styles.schedule}>{t.schedule}</p>
                </div>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section className={styles.tools} aria-labelledby="herramientas-title">
        <Container className={styles.toolsInner}>
          <div>
            <h2 id="herramientas-title">¿No sabes por dónde empezar?</h2>
            <p>
              Calcula tu índice de masa corporal y cuántas calorías necesitas al día. Si tienes
              cuenta, guardamos tu historial para que veas tu progreso.
            </p>
          </div>
          <div className={styles.toolLinks}>
            <Link href="/herramientas/imc" className={styles.toolLink}>
              <Calculator aria-hidden />
              <span>
                <strong>Calculadora de IMC</strong>
                Tu rango de peso saludable
              </span>
            </Link>
            <Link href="/herramientas/calorias" className={styles.toolLink}>
              <Flame aria-hidden />
              <span>
                <strong>Calculadora de calorías</strong>
                Calorías y macros según tu objetivo
              </span>
            </Link>
          </div>
        </Container>
      </section>

      <section className={styles.section} aria-labelledby="tienda-title">
        <Container>
          <div className={styles.rowHeading}>
            <SectionHeading
              id="tienda-title"
              title="Lo que más se llevan"
              description="Suplementos, ropa y accesorios. Recoges en recepción o te lo enviamos."
            />
            <ButtonLink href="/tienda" variant="outline">
              Ver toda la tienda
            </ButtonLink>
          </div>
          <div className={styles.sectionBody}>
            <ProductGrid products={featured} />
          </div>
        </Container>
      </section>

      <section
        id="contacto"
        className={`${styles.section} ${styles.paper}`}
        aria-labelledby="contacto-title"
      >
        <Container className={styles.contact}>
          <div>
            <SectionHeading
              id="contacto-title"
              title="Ven a conocernos"
              description="Agenda una clase de prueba gratis o escríbenos con tus dudas."
            />
            <ul role="list" className={styles.contactList}>
              <li>
                <MapPin aria-hidden /> {SITE.address}
              </li>
              <li>
                <Phone aria-hidden />{" "}
                <a href={`tel:${SITE.phone.replace(/\s/g, "")}`}>{SITE.phone}</a>
              </li>
              <li>
                <Mail aria-hidden /> <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
              </li>
            </ul>
          </div>
          <ContactForm />
        </Container>
      </section>
    </>
  );
}
