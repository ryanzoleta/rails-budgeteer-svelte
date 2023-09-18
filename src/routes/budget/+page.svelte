<script lang="ts">
  import { ChevronLeft, ChevronRight } from 'lucide-svelte';
  import { Input } from '$lib/components/ui/input';
  import { Button } from '$lib/components/ui/button';
  import { monthsInAYear } from '$lib/utils';
  import { createMutation, createQuery, useQueryClient } from '@tanstack/svelte-query';
  import axios from 'axios';
  import type { Category } from '$lib/types.js';
  import * as Dialog from '$lib/components/ui/dialog';

  export let data;

  let year = 2023;
  let monthIndex = 0;

  let dialogAddCategoryIsOpen = false;

  let category: Category = {
    id: 0,
    name: '',
    created_at: new Date(),
    updated_at: new Date()
  };

  const categoriesQuery = createQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await axios.get(`${data.apiHost}/categories`);
      return response.data as Category[];
    }
  });

  const client = useQueryClient();

  const addCategoryMutation = createMutation({
    mutationKey: ['add', 'category'],
    mutationFn: async (category: Category) => {
      await axios.post(`${data.apiHost}/categories`, { name: category.name });
    },
    onMutate: async (category: Category) => {
      await client.cancelQueries(['categories']);

      const categories = client.getQueryData<Category[]>(['categories']);

      categories?.push({
        id: -1,
        name: category.name,
        created_at: new Date(),
        updated_at: new Date()
      });

      client.setQueryData<Category[]>(['categories'], []); // this forces a re-render
      client.setQueryData<Category[]>(['categories'], categories);
    }
  });
</script>

<div class="flex flex-col gap-5">
  <div class="flex place-content-between">
    <h1 class="text-xl font-bold">Budget</h1>

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

  <div class="inline-grid w-full auto-cols-auto grid-cols-[auto_auto] items-center gap-2">
    <h3 class="font-bold text-zinc-400">Category</h3>
    <h3 class="text-right font-bold text-zinc-400">Budgeted</h3>

    {#if $categoriesQuery.data}
      {#each $categoriesQuery.data as category}
        <p>{category.name}</p>

        <Input type="number" value={0} class="text-right" />
      {/each}
    {/if}
  </div>

  <div>
    <Dialog.Root bind:open={dialogAddCategoryIsOpen}>
      <Dialog.Trigger>
        <Button>Add Category</Button>
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
          <div class="flex place-content-end gap-2">
            <Button variant="default">Add</Button>
            <Button
              variant="secondary"
              on:click={() => {
                dialogAddCategoryIsOpen = false;
              }}>Cancel</Button>
          </div>
        </form>
      </Dialog.Content>
    </Dialog.Root>
  </div>
</div>
