<script lang="ts">
  import type { Account } from '$lib/types.js';
  import { createMutation, createQuery, useQueryClient } from '@tanstack/svelte-query';
  import axios from 'axios';
  import { Input } from '$lib/components/ui/input';
  import { Button } from '$lib/components/ui/button';
  import { Trash2 } from 'lucide-svelte';
  import { onMount } from 'svelte';

  export let apiHost: string;

  let loading = false;
  let accountName = '';
  let editingAccountId = 0;

  onMount(() => {
    document.addEventListener('click', () => {
      editingAccountId = 0;
    });
  });

  const accountQuery = createQuery({
    queryKey: ['accounts'],
    queryFn: async () => {
      const response = await axios.get(`${apiHost}/accounts`);
      return response.data as Account[];
    }
  });

  const client = useQueryClient();

  const addAccountMutation = createMutation({
    mutationKey: ['add', 'account'],
    mutationFn: async (accountName: string) => {
      await axios.post(`${apiHost}/accounts`, { name: accountName, account_type_id: 1 });
    },
    onMutate: async () => {
      await client.cancelQueries(['accounts']);

      const accounts = client.getQueryData<Account[]>(['accounts']);

      accounts?.push({
        id: -1,
        name: accountName,
        account_type_id: 1,
        created_at: new Date(),
        updated_at: new Date()
      });

      client.setQueryData<Account[]>(['accounts'], []); // this forces a re-render
      client.setQueryData<Account[]>(['accounts'], accounts);
      accountName = '';
    },
    onSettled: () => {
      client.invalidateQueries(['accounts']);
    }
  });

  const editAccountMutation = createMutation({
    mutationKey: ['edit', 'account'],
    mutationFn: async (account: Account) => {
      await axios.patch(`${apiHost}/accounts/${account.id}`, {
        name: account.name
      });
    },
    onMutate: async () => {
      await client.cancelQueries(['accounts']);

      const accounts = client.getQueryData<Account[]>(['accounts']);

      client.setQueryData<Account[]>(['accounts'], []); // this forces a re-render
      client.setQueryData<Account[]>(['accounts'], accounts);
    },
    onSettled: () => {
      client.invalidateQueries(['accounts']);
    }
  });

  const deleteAccountMutation = createMutation({
    mutationKey: ['delete', 'account'],
    mutationFn: async (account: Account) => {
      await axios.delete(`${apiHost}/accounts/${account.id}`);
    },
    onMutate: async (account: Account) => {
      await client.cancelQueries(['accounts']);

      const currentAccounts = client.getQueryData<Account[]>(['accounts']);

      const updatedAccounts = currentAccounts?.filter((a: Account) => a.id !== account.id);

      client.setQueryData<Account[]>(['accounts'], []); // this forces a re-render
      client.setQueryData<Account[]>(['accounts'], updatedAccounts);
    },
    onSettled: () => {
      client.invalidateQueries(['accounts']);
    }
  });
</script>

<div class="flex flex-col gap-3">
  <h1 class="text-xl font-bold">Your Accounts</h1>

  <form
    class="flex gap-2"
    on:submit={() => {
      $addAccountMutation.mutate(accountName);
    }}>
    <Input placeholder="Add a new account" bind:value={accountName} />
    <Button variant="outline" disabled={loading}>Add</Button>
  </form>

  <div class="flex flex-col gap-3">
    {#if $accountQuery.data}
      {#each $accountQuery.data as account}
        <button
          class="flex place-content-between place-items-center gap-2 rounded-md bg-green-950 px-5 py-2"
          on:click|stopPropagation={() => {
            editingAccountId = account.id;
          }}>
          {#if editingAccountId === account.id}
            <form
              on:submit={() => {
                $editAccountMutation.mutate(account);
                editingAccountId = 0;
              }}
              class="flex-1">
              <Input
                bind:value={account.name}
                on:blur={() => {
                  $editAccountMutation.mutate(account);
                }}
                autofocus />
            </form>
          {:else}
            <p>{account.name}</p>
          {/if}

          <Button
            variant="ghost"
            size="icon"
            class="group hover:bg-destructive"
            on:click={(e) => {
              e.stopPropagation();
              $deleteAccountMutation.mutate(account);
            }}><Trash2 class="h-5 w-5 text-zinc-500 group-hover:text-red-300" /></Button>
        </button>
      {/each}
    {/if}
  </div>
</div>
