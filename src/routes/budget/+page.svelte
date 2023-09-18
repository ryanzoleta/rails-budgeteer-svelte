<script lang="ts">
  import { ChevronLeft, ChevronRight, Pencil } from 'lucide-svelte';
  import { Input } from '$lib/components/ui/input';
  import { Button } from '$lib/components/ui/button';
  import { generateMutation, monthsInAYear } from '$lib/utils';
  import { createMutation, createQuery, useQueryClient } from '@tanstack/svelte-query';
  import axios from 'axios';
  import { defaultCategory, type Category } from '$lib/types.js';
  import * as Dialog from '$lib/components/ui/dialog';

  export let data;

  let year = 2023;
  let monthIndex = 0;

  let dialogAddCategoryIsOpen = false;
  let dialogEditCategoryIsOpen = false;

  let category: Category = defaultCategory;

  const categoriesQuery = createQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await axios.get(`${data.apiHost}/categories`);
      return response.data as Category[];
    }
  });

  const client = useQueryClient();

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

        <Input type="number" value={0} class="text-right" />
      {/each}
    {/if}
  </div>

  <div>
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
          }}>
          <Input placeholder="Category Name" bind:value={category.name} required />
          <div class="flex place-content-end gap-2">
            <Button
              variant="secondary"
              on:click={() => {
                dialogAddCategoryIsOpen = false;
              }}>Cancel</Button>
            <Button type="submit" variant="default">Add</Button>
          </div>
        </form>
      </Dialog.Content>
    </Dialog.Root>
  </div>
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
