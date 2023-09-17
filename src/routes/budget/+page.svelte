<script lang="ts">
  import { ChevronLeft, ChevronRight } from 'lucide-svelte';
  import { Input } from '$lib/components/ui/input';
  import { Button } from '$lib/components/ui/button';
  import { monthsInAYear } from '$lib/utils';

  let year = 2023;
  let monthIndex = 0;
</script>

<div class="flex flex-col gap-5">
  <div class="flex flex-col gap-1">
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
  </div>
</div>
