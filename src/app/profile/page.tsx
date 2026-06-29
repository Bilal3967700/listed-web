import { CreditCard, Heart, Settings, ShieldCheck, Star, Store, Wallet } from "lucide-react";

const stats = [
  { label: "Listings", value: "12" },
  { label: "Sold", value: "38" },
  { label: "Saved", value: "126" }
];

const menu = [
  { label: "Saved items", icon: Heart },
  { label: "Purchases", icon: Wallet },
  { label: "Selling activity", icon: Store },
  { label: "Payments & payouts", icon: CreditCard },
  { label: "Settings", icon: Settings }
];

export default function ProfilePage() {
  return (
    <div>
      <section className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-5 md:p-8">
        <div className="flex items-center gap-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[var(--background)] text-3xl font-black">
            N
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-black">Nethul</h1>
              <ShieldCheck size={20} />
            </div>
            <p className="text-sm text-[var(--text-muted)]">@nethul.archive</p>

            <div className="mt-2 flex items-center gap-2 text-sm">
              <Star size={15} />
              <span className="font-bold">4.9 seller rating</span>
              <span className="text-[var(--text-muted)]">• Colombo 07</span>
            </div>
          </div>
        </div>

        <p className="mt-5 max-w-xl leading-6 text-[var(--text-muted)]">
          Selling a curated mix of fashion, tech and timeless everyday pieces.
        </p>

        <div className="mt-6 grid grid-cols-3 gap-3">
          {stats.map((item) => (
            <div
              key={item.label}
              className="rounded-3xl border border-[var(--border)] bg-[var(--background)] p-4 text-center"
            >
              <p className="text-xl font-black">{item.value}</p>
              <p className="text-xs text-[var(--text-muted)]">{item.label}</p>
            </div>
          ))}
        </div>

        <button className="mt-6 h-13 w-full rounded-full bg-[var(--text)] py-4 font-bold text-[var(--surface)]">
          Edit profile
        </button>
      </section>

      <section className="mt-8">
        <h2 className="text-2xl font-black">Account</h2>

        <div className="mt-4 space-y-3">
          {menu.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.label}
                className="flex w-full items-center gap-3 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-4 text-left font-bold"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--background)]">
                  <Icon size={18} />
                </span>
                {item.label}
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}