<script lang="ts">
  import type { AccountType } from '$lib/types.js';
  import { createQuery } from '@tanstack/svelte-query';
  import axios from 'axios';
  import { Input } from '$lib/components/ui/input';
  import { Button } from '$lib/components/ui/button';

  export let data;

  const accountTypesQuery = createQuery({
    queryKey: ['account_types'],
    queryFn: async () => {
      const response = await axios.get(`${data.apiHost}/account_types`);
      return response.data as AccountType[];
    }
  });

  $accountTypesQuery;
</script>

<div class="flex flex-col gap-5">
  <h1 class="text-xl font-bold">Your Accounts</h1>

  <div class="flex flex-col gap-3">
    <h1 class="text-xl font-bold">Account Types</h1>

    <div class="flex gap-2">
      <Input placeholder="Add a new account type" />
      <Button variant="outline">Add</Button>
    </div>

    <div>
      {#if $accountTypesQuery.data}
        {#each $accountTypesQuery.data as accountType}
          <p>{accountType.name}</p>
        {/each}
      {/if}
    </div>
  </div>
</div>
