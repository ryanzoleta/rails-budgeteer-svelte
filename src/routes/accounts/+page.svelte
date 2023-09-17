<script lang="ts">
  import type { AccountType } from '$lib/types.js';
  import { createMutation, createQuery, useQueryClient } from '@tanstack/svelte-query';
  import axios from 'axios';
  import { Input } from '$lib/components/ui/input';
  import { Button } from '$lib/components/ui/button';
  import { Trash2 } from 'lucide-svelte';

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

  const client = useQueryClient();

  const deleteAccountTypeMutation = createMutation({
    mutationKey: ['delete', 'account_type'],
    mutationFn: async (accountType: AccountType) => {
      await axios.delete(`${data.apiHost}/account_types/${accountType.id}`);
    },
    onMutate: async (accountType: AccountType) => {
      await client.cancelQueries(['account_types']);

      const currentAccountTypes = client.getQueryData<AccountType[]>(['account_types']);

      const updatedAccountTypes = currentAccountTypes?.filter(
        (a: AccountType) => a.id !== accountType.id
      );

      client.setQueryData<AccountType[]>(['account_types'], []); // this forces a re-render
      client.setQueryData<AccountType[]>(['account_types'], updatedAccountTypes);
    },

    onSettled: () => {
      client.invalidateQueries(['account_types']);
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
          <div
            class="flex place-content-between place-items-center rounded-md border border-slate-800 px-5 py-2">
            <p>{accountType.name}</p>
            <Button
              variant="ghost"
              size="icon"
              class="group hover:bg-destructive"
              on:click={() => {
                $deleteAccountTypeMutation.mutate(accountType);
              }}><Trash2 class="h-5 w-5 text-zinc-500 group-hover:text-red-300" /></Button>
          </div>
        {/each}
      {/if}
    </div>
  </div>
</div>
