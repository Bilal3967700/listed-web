const conversations = [
  {
    name: "Amaya Perera",
    item: "Sony WH-1000XM5",
    message: "Still available. Can do pickup this evening.",
    time: "2m ago"
  },
  {
    name: "Rizwan Nazeer",
    item: "Tissot PRX",
    message: "Could you share one more wrist shot?",
    time: "18m ago"
  },
  {
    name: "Mila Fernando",
    item: "Coach Tabby Bag",
    message: "Thanks, I’ll confirm after work.",
    time: "1h ago"
  }
];

export default function InboxPage() {
  return (
    <div>
      <h1 className="text-4xl font-black">Inbox</h1>
      <p className="mt-2 text-[var(--text-muted)]">
        Messages from buyers and sellers.
      </p>

      <div className="mt-6 space-y-3">
        {conversations.map((chat) => (
          <div
            key={chat.name}
            className="flex items-center gap-4 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-4"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--background)] text-lg font-black">
              {chat.name.charAt(0)}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-3">
                <p className="truncate font-black">{chat.name}</p>
                <p className="shrink-0 text-xs text-[var(--text-muted)]">
                  {chat.time}
                </p>
              </div>
              <p className="mt-1 text-sm font-bold text-[var(--text-muted)]">
                {chat.item}
              </p>
              <p className="truncate text-sm text-[var(--text-muted)]">
                {chat.message}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}