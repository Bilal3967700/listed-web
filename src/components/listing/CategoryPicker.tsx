"use client";

import {
  useMemo,
  useState
} from "react";

import {
  Check,
  ChevronRight,
  Search,
  X
} from "lucide-react";

import { Category } from "@/types/listing";

function findCategoryPath(
  categories: Category[],
  categoryId?: string
) {
  if (!categoryId) {
    return [];
  }

  const path: Category[] = [];

  let current:
    | Category
    | undefined = categories.find(
    (category) =>
      category.id === categoryId
  );

  while (current) {
    path.unshift(current);

    if (!current.parent_id) {
      break;
    }

    current = categories.find(
      (category) =>
        category.id ===
        current?.parent_id
    );
  }

  return path;
}

function getCategoryPathLabel(
  categories: Category[],
  category: Category
) {
  return findCategoryPath(
    categories,
    category.id
  )
    .map((item) => item.name)
    .join(" › ");
}

export function CategoryPicker({
  categories,
  initialCategoryId
}: {
  categories: Category[];
  initialCategoryId?: string;
}) {
  const initialPath = useMemo(
    () =>
      findCategoryPath(
        categories,
        initialCategoryId
      ),
    [categories, initialCategoryId]
  );

  const [
    levelOneId,
    setLevelOneId
  ] = useState(
    initialPath[0]?.id || ""
  );

  const [
    levelTwoId,
    setLevelTwoId
  ] = useState(
    initialPath[1]?.id || ""
  );

  const [
    levelThreeId,
    setLevelThreeId
  ] = useState(
    initialPath[2]?.id || ""
  );

  const [query, setQuery] =
    useState("");

  const sortedCategories =
    useMemo(
      () =>
        [...categories].sort(
          (a, b) =>
            a.sort_order -
            b.sort_order
        ),
      [categories]
    );

  const levelOneCategories =
    sortedCategories.filter(
      (category) =>
        category.parent_id === null
    );

  const levelTwoCategories =
    sortedCategories.filter(
      (category) =>
        category.parent_id ===
        levelOneId
    );

  const levelThreeCategories =
    sortedCategories.filter(
      (category) =>
        category.parent_id ===
        levelTwoId
    );

  const selectedCategoryId =
    levelThreeId ||
    levelTwoId ||
    levelOneId;

  const selectedCategory =
    categories.find(
      (category) =>
        category.id ===
        selectedCategoryId
    );

  const cleanQuery =
    query.trim().toLowerCase();

  const searchResults = useMemo(() => {
    if (!cleanQuery) {
      return [];
    }

    return sortedCategories.filter(
      (category) => {
        const categoryName =
          category.name.toLowerCase();

        const categoryPath =
          getCategoryPathLabel(
            categories,
            category
          ).toLowerCase();

        return (
          categoryName.includes(
            cleanQuery
          ) ||
          categoryPath.includes(
            cleanQuery
          )
        );
      }
    );
  }, [
    categories,
    cleanQuery,
    sortedCategories
  ]);

  function selectCategory(
    category: Category
  ) {
    const path = findCategoryPath(
      categories,
      category.id
    );

    setLevelOneId(
      path[0]?.id || ""
    );

    setLevelTwoId(
      path[1]?.id || ""
    );

    setLevelThreeId(
      path[2]?.id || ""
    );

    setQuery("");
  }

  function clearSearch() {
    setQuery("");
  }

  function clearSelection() {
    setLevelOneId("");
    setLevelTwoId("");
    setLevelThreeId("");
    setQuery("");
  }

  return (
    <div>
      <input
        type="hidden"
        name="categoryId"
        value={selectedCategoryId}
      />

      <div className="flex h-12 items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--background)] px-4">
        <Search size={18} />

        <input
          type="text"
          value={query}
          onChange={(event) =>
            setQuery(
              event.target.value
            )
          }
          placeholder="Find a category"
          className="w-full bg-transparent outline-none placeholder:text-[var(--text-muted)]"
        />

        {query && (
          <button
            type="button"
            onClick={clearSearch}
            className="text-[var(--text-muted)]"
            aria-label="Clear category search"
          >
            <X size={17} />
          </button>
        )}
      </div>

      {cleanQuery ? (
        <div className="mt-4 max-h-80 overflow-y-auto rounded-3xl border border-[var(--border)] bg-[var(--background)] p-2">
          {searchResults.length > 0 ? (
            searchResults.map(
              (category) => {
                const active =
                  selectedCategoryId ===
                  category.id;

                return (
                  <button
                    type="button"
                    key={category.id}
                    onClick={() =>
                      selectCategory(
                        category
                      )
                    }
                    className={[
                      "flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left",
                      active
                        ? "bg-[var(--text)] text-[var(--surface)]"
                        : "hover:bg-[var(--surface-soft)]"
                    ].join(" ")}
                  >
                    <span>
                      <span className="block font-bold">
                        {category.name}
                      </span>

                      <span
                        className={[
                          "mt-1 block text-xs",
                          active
                            ? "text-[var(--surface)]/75"
                            : "text-[var(--text-muted)]"
                        ].join(" ")}
                      >
                        {getCategoryPathLabel(
                          categories,
                          category
                        )}
                      </span>
                    </span>

                    {active && (
                      <Check size={17} />
                    )}
                  </button>
                );
              }
            )
          ) : (
            <p className="px-4 py-6 text-center text-sm text-[var(--text-muted)]">
              No matching categories.
            </p>
          )}
        </div>
      ) : (
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-[var(--border)] bg-[var(--background)] p-2">
            <p className="px-4 pb-2 pt-1 text-xs font-bold uppercase tracking-[0.15em] text-[var(--text-muted)]">
              Category
            </p>

            {levelOneCategories.map(
              (category) => {
                const active =
                  levelOneId ===
                  category.id;

                return (
                  <button
                    type="button"
                    key={category.id}
                    onClick={() => {
                      setLevelOneId(
                        category.id
                      );

                      setLevelTwoId("");
                      setLevelThreeId("");
                    }}
                    className={[
                      "flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left font-bold",
                      active
                        ? "bg-[var(--text)] text-[var(--surface)]"
                        : "hover:bg-[var(--surface-soft)]"
                    ].join(" ")}
                  >
                    <span>
                      {category.name}
                    </span>

                    <ChevronRight
                      size={17}
                    />
                  </button>
                );
              }
            )}
          </div>

          <div className="rounded-3xl border border-[var(--border)] bg-[var(--background)] p-2">
            <p className="px-4 pb-2 pt-1 text-xs font-bold uppercase tracking-[0.15em] text-[var(--text-muted)]">
              Subcategory
            </p>

            {levelTwoCategories.length >
            0 ? (
              levelTwoCategories.map(
                (category) => {
                  const active =
                    levelTwoId ===
                    category.id;

                  return (
                    <button
                      type="button"
                      key={category.id}
                      onClick={() => {
                        setLevelTwoId(
                          category.id
                        );

                        setLevelThreeId(
                          ""
                        );
                      }}
                      className={[
                        "flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left font-bold",
                        active
                          ? "bg-[var(--text)] text-[var(--surface)]"
                          : "hover:bg-[var(--surface-soft)]"
                      ].join(" ")}
                    >
                      <span>
                        {category.name}
                      </span>

                      <ChevronRight
                        size={17}
                      />
                    </button>
                  );
                }
              )
            ) : (
              <p className="px-4 py-3 text-sm text-[var(--text-muted)]">
                Choose a main category.
              </p>
            )}
          </div>

          <div className="rounded-3xl border border-[var(--border)] bg-[var(--background)] p-2">
            <p className="px-4 pb-2 pt-1 text-xs font-bold uppercase tracking-[0.15em] text-[var(--text-muted)]">
              Item type
            </p>

            {levelThreeCategories.length >
            0 ? (
              levelThreeCategories.map(
                (category) => {
                  const active =
                    levelThreeId ===
                    category.id;

                  return (
                    <button
                      type="button"
                      key={category.id}
                      onClick={() =>
                        setLevelThreeId(
                          category.id
                        )
                      }
                      className={[
                        "flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left font-bold",
                        active
                          ? "bg-[var(--text)] text-[var(--surface)]"
                          : "hover:bg-[var(--surface-soft)]"
                      ].join(" ")}
                    >
                      <span>
                        {category.name}
                      </span>

                      {active && (
                        <Check size={17} />
                      )}
                    </button>
                  );
                }
              )
            ) : (
              <p className="px-4 py-3 text-sm text-[var(--text-muted)]">
                {levelTwoId
                  ? "No more specific category is available."
                  : "Choose a subcategory."}
              </p>
            )}
          </div>
        </div>
      )}

      {selectedCategory ? (
        <div className="mt-3 flex items-center justify-between gap-3 rounded-2xl bg-[var(--surface-soft)] px-4 py-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-[var(--text-muted)]">
              Selected
            </p>

            <p className="mt-1 text-sm font-black text-[var(--success)]">
              {getCategoryPathLabel(
                categories,
                selectedCategory
              )}
            </p>
          </div>

          <button
            type="button"
            onClick={clearSelection}
            className="shrink-0 text-sm font-bold text-[var(--text-muted)]"
          >
            Clear
          </button>
        </div>
      ) : (
        <p className="mt-3 text-sm text-[var(--text-muted)]">
          Choose the most specific category
          available.
        </p>
      )}
    </div>
  );
}