<script lang="ts">
  import { ChevronLeft, ChevronRight } from 'lucide-svelte';
  import { Input } from '$lib/components/ui/input';
  import { Button } from '$lib/components/ui/button';
  import { monthsInAYear } from '$lib/utils';
  import { createQuery } from '@tanstack/svelte-query';
  import axios from 'axios';
  import type { Category } from '$lib/types.js';

  export let data;

  let year = 2023;
  let monthIndex = 0;

  const categoriesQuery = createQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await axios.get(`${data.apiHost}/categories`);
      return response.data as Category[];
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
</div>
