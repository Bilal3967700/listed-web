import { Camera, ImagePlus, Package, Sparkles, Tag } from "lucide-react";

const steps = [
  {
    icon: Camera,
    title: "Add photos",
    text: "Use bright natural light and include all angles."
  },
  {
    icon: Tag,
    title: "Set your price",
    text: "Price fairly based on condition and demand."
  },
  {
    icon: Package,
    title: "Publish fast",
    text: "List in under two minutes with smart defaults."
  }
];

export default function SellPage() {
  return (
    <div>
      <section className="rounded-[2rem] bg-[#111111] p-6 text-white md:p-10">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-2 text-sm font-bold">
          <Sparkles size={16} />
          Sell on Listed
        </div>

        <h1 className="max-w-2xl text-4xl font-black tracking-tight md:text-6xl">
          Turn quality items into cash.
        </h1>

        <p className="mt-4 max-w-xl text-sm leading-6 text-white/75 md:text-base">
          List fashion, tech, watches, jewellery and more in a clean premium
          marketplace experience.
        </p>

        <button className="mt-6 flex h-14 items-center justify-center gap-2 rounded-full bg-white px-6 font-bold text-black">
          <ImagePlus size={18} />
          Start a new listing
        </button>
      </section>

      <section className="mt-8">
        <h2 className="text-2xl font-black">How it works</h2>

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {steps.map((step) => {
            const Icon = step.icon;

            return (
              <div
                key={step.title}
                className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-[var(--background)]">
                  <Icon size={18} />
                </div>
                <h3 className="font-black">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">
                  {step.text}
                </p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}