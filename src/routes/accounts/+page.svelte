<script lang="ts">
  import type { AccountType } from '$lib/types.js';
  import { createQuery } from '@tanstack/svelte-query';
  import axios from 'axios';
  import { Input } from '$lib/components/ui/input';
  import { Button } from '$lib/components/ui/button';

  export let data;

  let loading = false;
  let accountTypeName = '';

  const accountTypesQuery = createQuery({
    queryKey: ['account_types'],
    queryFn: async () => {
      const response = await axios.get(`${data.apiHost}/account_types`);
      return response.data as AccountType[];
    }
  });

  async function addAccountType() {
    loading = true;
    await axios.post(`${data.apiHost}/account_types`, { name: accountTypeName });
    accountTypeName = '';
    loading = false;
    $accountTypesQuery.refetch();
  }
</script>

<div class="flex flex-col gap-5">
  <h1 class="text-xl font-bold">Your Accounts</h1>

  <div class="flex flex-col gap-3">
    <h1 class="text-xl font-bold">Account Types</h1>

    <form class="flex gap-2" on:submit={addAccountType}>
      <Input placeholder="Add a new account type" bind:value={accountTypeName} />
      <Button variant="outline" disabled={loading}>Add</Button>
    </form>

    <div class="flex flex-col gap-3">
      {#if $accountTypesQuery.data}
        {#each $accountTypesQuery.data as accountType}
          <div class="rounded-md border border-slate-800 p-3">
            <p>{accountType.name}</p>
          </div>
        {/each}
      {/if}
    </div>
  </div>
</div>
