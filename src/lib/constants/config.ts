export const SITE = {
  name: "GymWarrior",
  description:
    "Gimnasio en Caldas, Antioquia. Planes flexibles, entrenadores certificados, tienda de suplementos y calculadoras de IMC y calorías.",
  address: "Caldas, Antioquia — Colombia",
  phone: "+57 300 000 0000",
  email: "hola@gymwarrior.co",
  hours: [
    { days: "Lunes a viernes", time: "5:00 a. m. – 10:00 p. m." },
    { days: "Sábados", time: "7:00 a. m. – 6:00 p. m." },
    { days: "Domingos y festivos", time: "8:00 a. m. – 2:00 p. m." },
  ],
  social: {
    instagram: "https://instagram.com",
    facebook: "https://facebook.com",
    tiktok: "https://tiktok.com",
  },
} as const;

export const NAV_LINKS = [
  { href: "/planes", label: "Planes" },
  { href: "/tienda", label: "Tienda" },
  { href: "/herramientas/imc", label: "IMC" },
  { href: "/herramientas/calorias", label: "Calorías" },
] as const;
