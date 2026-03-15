import { Linkedin } from "lucide-react";

export default function Leadership() {
  const leaders = [
    { name: "Dr. Elena Sharma", role: "Founder & Chief Medical Officer", desc: "A pediatrician with 15 years of experience, Dr. Sharma founded the platform to solve the fragmented nature of child healthcare.", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAxKCOiTOoNw-P46--k8lkVOVC19_k3VdeMEEIAVC7LKVdaZVpQEF5LO5KfpEanjPwIZW8pDglaiO_LecU5fMYI5tQ6uFnKy9XFAkJG1ZNulQRwol2dqe24q4ALwpoejnGLzHLnccLOq86TDr9mtLvGmaAacZbstrkBGAb5ZMiBSzGsGInp_3VGIbCYN9aAJr03UNT7aIBKJQQEGmFga0jcckUPapKs4vnX_RiKEU-fLx6-HMKYd-_RYjmGxsyUPg2C52wOnHdyyoo4" },
    { name: "Marcus Thorne", role: "Chief Technology Officer", desc: "Marcus brings a decade of enterprise software experience, ensuring WombTo18 remains secure, scalable, and beautifully designed.", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCaHWvjAuR5N2Py7nscQfQ5y2GiBe0er8J4LbFZ5vdV9RQtNN7VVVDEb9VcZfWuVoXQQPQZm2nf7TqXmRNcf-Srg1IodXwW42GOO5drehtIHhuMqW1HC4scYerURgFFZYDx943xzUVU1AxlSXWVXYU1N_TAPNKTbKepSrvIL8POiXzWaTnZyUEFIR-MVf4PDc9ilTnwDELg9_G1mB5mMCsVkNhOiVEBF0K6IFpfk0uNo3AaKJi0k6-lEg-we-yJFKhB5lPjdNlT1wW0" },
    { name: "Sarah Jenkins", role: "Head of Partnerships", desc: "Sarah leads our school and hospital integrations, ensuring the WombTo18 ecosystem connects seamlessly with real-world institutions.", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBNAnGkoL--gmJlQN_YgmV-TSOzSjXQ1zAqUPOggph-e9ETSghxrTGQh-VtsaS1tX_azihNlr2BqDbc6mtlc-1kE7atiDV3aSSQAXGplWKCjjmng7-WBkUWKC9j0OkHtFU_ffNDBuI53elu7fEJgOlBy5YjiAreEtF_8QuN6aPWEvPDl4n1Rrb1L3LuAvUicVaPk1K-e9_oqLXBkLJ5G0BjlJ5JpBEYkH15gPUk9fISbq6c2cN40vrDpaV_Geb3q4tLDiXB5X2-SVkf" },
  ];

  return (
    <section className="mb-24 w-full">
      <div className="mb-16 text-center">
        <h2 className="mb-4 text-4xl font-normal text-slate-900">Our Leadership</h2>
        <div className="mx-auto h-1.5 w-20 rounded-full bg-primary"></div>
      </div>
      <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
        {leaders.map((leader, idx) => (
          <div key={idx} className="group flex flex-col overflow-hidden rounded-[2.5rem] border border-slate-100 bg-white shadow-xl shadow-slate-200/40 transition-all duration-300 hover:-translate-y-2">
            <div className="relative h-80 overflow-hidden bg-slate-200 bg-cover bg-center" style={{ backgroundImage: `url("${leader.img}")` }}>
              <div className="absolute inset-0 flex items-end bg-slate-900/40 p-6 opacity-0 transition-opacity group-hover:opacity-100">
                <button className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-primary shadow-lg transition-colors hover:bg-slate-50">
                  <Linkedin className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="flex flex-1 flex-col p-8">
              <h3 className="mb-1 text-2xl font-medium text-slate-900">{leader.name}</h3>
              <p className="mb-4 text-xs font-normal uppercase tracking-widest text-primary">{leader.role}</p>
              <p className="text-sm leading-relaxed font-light text-slate-600">{leader.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}