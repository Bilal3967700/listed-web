"use client";

import { useMemo, useState } from "react";
import { Check, ChevronRight, Search } from "lucide-react";
import { Category } from "@/types/listing";

export function CategoryPicker({ categories }: { categories: Category[] }) {
  const [levelOneId, setLevelOneId] = useState("");
  const [levelTwoId, setLevelTwoId] = useState("");
  const [levelThreeId, setLevelThreeId] = useState("");
  const [query, setQuery] = useState("");

  const sortedCategories = useMemo(
    () => [...categories].sort((a, b) => a.sort_order - b.sort_order),
    [categories]
  );

  const levelOneCategories = sortedCategories.filter(
    (category) => category.parent_id === null
  );

  const levelTwoCategories = sortedCategories.filter(
    (category) => category.parent_id === levelOneId
  );

  const levelThreeCategories = sortedCategories.filter(
    (category) => category.parent_id === levelTwoId
  );

  const selectedCategoryId = levelThreeId || levelTwoId || levelOneId;

  const selectedCategory = categories.find(
    (category) => category.id === selectedCategoryId
  );

  const filteredLevelOne = levelOneCategories.filter((category) =>
    category.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div>
      <input type="hidden" name="categoryId" value={selectedCategoryId} />

      <div className="flex h-12 items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--background)] px-4">
        <Search size={18} />
        <input
          type="text"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setLevelOneId("");
            setLevelTwoId("");
            setLevelThreeId("");
          }}
          placeholder="Find a category"
          className="w-full bg-transparent outline-none placeholder:text-[var(--text-muted)]"
        />
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl border border-[var(--border)] bg-[var(--background)] p-2">
          {filteredLevelOne.map((category) => {
            const active = levelOneId === category.id;

            return (
              <button
                type="button"
                key={category.id}
                onClick={() => {
                  setLevelOneId(category.id);
                  setLevelTwoId("");
                  setLevelThreeId("");
                }}
                className={[
                  "flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left font-bold",
                  active ? "bg-[var(--text)] text-[var(--surface)]" : ""
                ].join(" ")}
              >
                <span>{category.name}</span>
                <ChevronRight size={17} />
              </button>
            );
          })}
        </div>

        <div className="rounded-3xl border border-[var(--border)] bg-[var(--background)] p-2">
          {levelTwoCategories.length > 0 ? (
            levelTwoCategories.map((category) => {
              const active = levelTwoId === category.id;

              return (
                <button
                  type="button"
                  key={category.id}
                  onClick={() => {
                    setLevelTwoId(category.id);
                    setLevelThreeId("");
                  }}
                  className={[
                    "flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left font-bold",
                    active ? "bg-[var(--text)] text-[var(--surface)]" : ""
                  ].join(" ")}
                >
                  <span>{category.name}</span>
                  <ChevronRight size={17} />
                </button>
              );
            })
          ) : (
            <p className="px-4 py-3 text-sm text-[var(--text-muted)]">
              Choose a main category
            </p>
          )}
        </div>

        <div className="rounded-3xl border border-[var(--border)] bg-[var(--background)] p-2">
          {levelThreeCategories.length > 0 ? (
            levelThreeCategories.map((category) => {
              const active = levelThreeId === category.id;

              return (
                <button
                  type="button"
                  key={category.id}
                  onClick={() => setLevelThreeId(category.id)}
                  className={[
                    "flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left font-bold",
                    active ? "bg-[var(--text)] text-[var(--surface)]" : ""
                  ].join(" ")}
                >
                  <span>{category.name}</span>
                  {active && <Check size={17} />}
                </button>
              );
            })
          ) : (
            <p className="px-4 py-3 text-sm text-[var(--text-muted)]">
              Choose a subcategory
            </p>
          )}
        </div>
      </div>

      {selectedCategory ? (
        <p className="mt-3 text-sm font-bold text-[var(--success)]">
          Selected: {selectedCategory.name}
        </p>
      ) : (
        <p className="mt-3 text-sm text-[var(--text-muted)]">
          Choose the most specific category available.
        </p>
      )}
    </div>
  );
}