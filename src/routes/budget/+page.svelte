<script lang="ts">
  import { ChevronLeft, ChevronRight, Loader2, Pencil } from 'lucide-svelte';
  import { Input } from '$lib/components/ui/input';
  import { Button } from '$lib/components/ui/button';
  import { formatAmountToCurrency, generateMutation, monthsInAYear } from '$lib/utils';
  import { createQuery, useQueryClient } from '@tanstack/svelte-query';
  import axios from 'axios';
  import { defaultCategory, type Category, type Budget } from '$lib/types.js';
  import * as Dialog from '$lib/components/ui/dialog';
  import { onMount } from 'svelte';
  import moment from 'moment';

  export let data;

  let year = moment().year();
  let monthIndex = moment().month();

  let dialogAddCategoryIsOpen = false;
  let dialogEditCategoryIsOpen = false;
  let editingBudgetId = 0;

  let category: Category = defaultCategory;

  const client = useQueryClient();

  const categoriesQuery = createQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await axios.get(`${data.apiHost}/categories`);
      return response.data as Category[];
    },
    onSuccess: () => {
      client.invalidateQueries(['budgets']);
    },
    refetchOnWindowFocus: false
  });

  const addCategoryMutation = generateMutation(client, {
    queryKey: ['categories'],
    mutationKey: ['add', 'category'],
    mutationFn: async (category: Category) => {
      await axios.post(`${data.apiHost}/categories`, { name: category.name });
    },
    updateFn: (categories: Category[], item: Category) => {
      categories?.push({
        id: -1,
        name: item.name,
        created_at: new Date(),
        updated_at: new Date()
      });
      return categories;
    }
  });

  const deleteCategoryMutation = generateMutation(client, {
    queryKey: ['categories'],
    mutationKey: ['delete', 'category'],
    mutationFn: async (category: Category) => {
      await axios.delete(`${data.apiHost}/categories/${category.id}`);
    },
    updateFn: (categories: Category[], category: Category) =>
      categories?.filter((c) => c.id !== category.id)
  });

  const editCategoryMutation = generateMutation(client, {
    queryKey: ['categories'],
    mutationKey: ['edit', 'category'],
    mutationFn: async (category: Category) => {
      await axios.patch(`${data.apiHost}/categories/${category.id}`, { name: category.name });
    },
    updateFn: (categories: Category[], category: Category) =>
      categories.map((c) => {
        c.name = c.id === category.id ? category.name : c.name;
        return c;
      })
  });

  const budgetsQuery = createQuery({
    queryKey: ['budgets'],
    queryFn: async () => {
      const response = await axios.get(`${data.apiHost}/budgets`, { params: { year } });
      const budgets = response.data as Budget[];

      return budgets;
    },
    refetchOnWindowFocus: false
  });

  $: if (year) client.invalidateQueries(['budgets']);

  const editBudgetMutation = generateMutation(client, {
    queryKey: ['budgets'],
    mutationKey: ['edit', 'budget'],
    mutationFn: async (budget: Budget) => {
      await axios.patch(`${data.apiHost}/budgets/${budget.id}`, {
        budgeted_amount: budget.budgeted_amount
      });
    },
    updateFn: (budgets: Budget[], budget: Budget) =>
      budgets.map((b) => (b.id === budget.id ? budget : b))
  });

  onMount(() => {
    document.addEventListener('click', () => {
      editingBudgetId = 0;
    });
  });

  function totalBudgeted(budgets: Budget[]) {
    return budgets.reduce((total, b) => total + b.budgeted_amount, 0);
  }

  function totalSpent(budgets: Budget[]) {
    return budgets.reduce((total, b) => total + (b.sum ?? 0), 0);
  }
</script>

<div class="flex flex-col gap-5">
  <div class="flex place-content-between">
    <h1 class="text-2xl font-bold">Budget</h1>

    <div class="flex place-items-center gap-3">
      <Button
        variant="ghost"
        size="icon"
        class="rounded-full"
        on:click={() => {
          if (monthIndex === 0) {
            year -= 1;
            monthIndex = 11;
          } else {
            monthIndex -= 1;
          }
        }}><ChevronLeft /></Button>
      <p class="font-mono font-bold">{monthsInAYear[monthIndex].abbr} {year}</p>
      <Button
        variant="ghost"
        size="icon"
        class="rounded-full"
        on:click={() => {
          if (monthIndex === 11) {
            year += 1;
            monthIndex = 0;
          } else {
            monthIndex += 1;
          }
        }}><ChevronRight /></Button>
    </div>
  </div>

  {#if $budgetsQuery.isLoading || $categoriesQuery.isLoading}
    <div class="flex place-content-center"><Loader2 class="animate-spin" /></div>
  {:else if $categoriesQuery.data && $budgetsQuery.data}
    <div class="inline-grid w-full auto-cols-auto grid-cols-[auto_1fr_1fr] items-center gap-y-2">
      <h3 class="font-bold text-zinc-400">Category</h3>
      <h3 class="text-right font-bold text-zinc-400">Budgeted</h3>
      <h3 class="text-right font-bold text-zinc-400">Spent</h3>

      {#each $categoriesQuery.data as c}
        <div class="group flex place-items-center gap-2">
          <p>{c.name}</p>
          <Button
            variant="ghost"
            size="icon"
            class="h-8 w-8 rounded-full p-2 text-zinc-950 group-hover:text-zinc-50"
            on:click={() => {
              dialogEditCategoryIsOpen = true;
              category = c;
            }}><Pencil /></Button>
        </div>

        {#each $budgetsQuery.data.filter((b) => {
          return b.year === year && b.month === monthIndex + 1 && b.category_id === c.id;
        }) as budget}
          {#if editingBudgetId === budget.id}
            <Input
              type="number"
              class="h-8 rounded-md border border-zinc-800 bg-background px-3 py-0 text-right text-base"
              bind:value={budget.budgeted_amount}
              on:keypress={(e) => {
                if (e.key === 'Enter') {
                  //@ts-ignore
                  e.target.blur();
                }
              }}
              on:blur={() => {
                $editBudgetMutation.mutate(budget);
                editingBudgetId = 0;
              }}
              autofocus />
          {:else}
            <button
              class="text-right"
              on:click|stopPropagation={() => {
                editingBudgetId = budget.id;
              }}>{formatAmountToCurrency(budget.budgeted_amount)}</button>
          {/if}

          <p class="text-right">{formatAmountToCurrency(budget.sum ?? 0)}</p>
        {/each}
      {/each}

      <p class="border-t border-zinc-800 text-lg font-bold">Total</p>
      <p class="border-t border-zinc-800 text-right text-lg font-bold">
        {formatAmountToCurrency(totalBudgeted($budgetsQuery.data))}
      </p>
      <p class="border-t border-zinc-800 text-right text-lg font-bold">
        {formatAmountToCurrency(totalSpent($budgetsQuery.data))}
      </p>
    </div>

    <div class="flex place-content-end">
      <Dialog.Root bind:open={dialogAddCategoryIsOpen}>
        <Dialog.Trigger>
          <Button
            on:click={() => {
              category = defaultCategory;
            }}>Add Category</Button>
        </Dialog.Trigger>
        <Dialog.Content>
          <Dialog.Header>
            <Dialog.Title>New Category</Dialog.Title>
            <Dialog.Description>Add a new budget category</Dialog.Description>
          </Dialog.Header>
          <form
            class="flex flex-col gap-5"
            on:submit={() => {
              $addCategoryMutation.mutate(structuredClone(category));
              category.name = '';
              dialogAddCategoryIsOpen = false;
            }}>
            <Input placeholder="Category Name" bind:value={category.name} required />
          </form>
          <div class="flex place-content-end gap-2">
            <Button
              variant="secondary"
              on:click={() => {
                dialogAddCategoryIsOpen = false;
              }}>Cancel</Button>
            <Button
              type="submit"
              variant="default"
              on:click={() => {
                $addCategoryMutation.mutate(structuredClone(category));
                category.name = '';
                dialogAddCategoryIsOpen = false;
              }}>Add</Button>
          </div>
        </Dialog.Content>
      </Dialog.Root>
    </div>
  {/if}
</div>

<Dialog.Root bind:open={dialogEditCategoryIsOpen}>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>Edit Category</Dialog.Title>
    </Dialog.Header>
    <form
      class="flex flex-col gap-5"
      on:submit={() => {
        $editCategoryMutation.mutate(category);
        dialogEditCategoryIsOpen = false;
      }}>
      <Input placeholder="Category Name" bind:value={category.name} required />
    </form>
    <div class="flex place-content-between">
      <Button
        variant="destructive"
        on:click={(e) => {
          e.preventDefault();
          console.log('delete triggered');
          $deleteCategoryMutation.mutate(category);
          dialogEditCategoryIsOpen = false;
        }}>Delete</Button>
      <div class="flex gap-2">
        <Button
          variant="secondary"
          on:click={(e) => {
            e.preventDefault();
            dialogEditCategoryIsOpen = false;
          }}>Cancel</Button>

        <Button variant="default">Save</Button>
      </div>
    </div>
  </Dialog.Content>
</Dialog.Root>
