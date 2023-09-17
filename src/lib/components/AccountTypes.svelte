<script lang="ts">
  import type { AccountType } from '$lib/types.js';
  import { createMutation, createQuery, useQueryClient } from '@tanstack/svelte-query';
  import axios from 'axios';
  import { Input } from '$lib/components/ui/input';
  import { Button } from '$lib/components/ui/button';
  import { Trash2 } from 'lucide-svelte';
  import { onMount } from 'svelte';

  export let apiHost: string;

  let loading = false;
  let accountTypeName = '';
  let editingAccountTypeId = 0;

  onMount(() => {
    document.addEventListener('click', () => {
      editingAccountTypeId = 0;
    });
  });

  const accountTypesQuery = createQuery({
    queryKey: ['account_types'],
    queryFn: async () => {
      const response = await axios.get(`${apiHost}/account_types`);
      return response.data as AccountType[];
    }
  });

  const client = useQueryClient();

  const addAccountTypeMutation = createMutation({
    mutationKey: ['add', 'account_type'],
    mutationFn: async (accountTypeName: string) => {
      await axios.post(`${apiHost}/account_types`, { name: accountTypeName });
    },
    onMutate: async () => {
      await client.cancelQueries(['account_types']);

      const accountTypes = client.getQueryData<AccountType[]>(['account_types']);

      accountTypes?.push({
        id: -1,
        name: accountTypeName,
        created_at: new Date(),
        updated_at: new Date()
      });

      client.setQueryData<AccountType[]>(['account_types'], []); // this forces a re-render
      client.setQueryData<AccountType[]>(['account_types'], accountTypes);
      accountTypeName = '';
    },
    onSettled: () => {
      client.invalidateQueries(['account_types']);
    }
  });

  const editAccountTypeMutation = createMutation({
    mutationKey: ['edit', 'account_type'],
    mutationFn: async (accountType: AccountType) => {
      await axios.patch(`${apiHost}/account_types/${accountType.id}`, {
        name: accountType.name
      });
    },
    onMutate: async () => {
      await client.cancelQueries(['account_types']);

      const accountTypes = client.getQueryData<AccountType[]>(['account_types']);

      client.setQueryData<AccountType[]>(['account_types'], []); // this forces a re-render
      client.setQueryData<AccountType[]>(['account_types'], accountTypes);
    },
    onSettled: () => {
      client.invalidateQueries(['account_types']);
    }
  });

  const deleteAccountTypeMutation = createMutation({
    mutationKey: ['delete', 'account_type'],
    mutationFn: async (accountType: AccountType) => {
      await axios.delete(`${apiHost}/account_types/${accountType.id}`);
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

  
</script>

<div class="flex flex-col gap-3">
  <h1 class="text-xl font-bold">Account Types</h1>

  <form
    class="flex gap-2"
    on:submit={() => {
      $addAccountTypeMutation.mutate(accountTypeName);
    }}>
    <Input placeholder="Add a new account type" bind:value={accountTypeName} />
    <Button variant="outline" disabled={loading}>Add</Button>
  </form>

  <div class="flex flex-col gap-3">
    {#if $accountTypesQuery.data}
      {#each $accountTypesQuery.data as accountType}
        <button
          class="flex place-content-between place-items-center gap-2 rounded-md border-2 border-green-950 px-5 py-2"
          on:click|stopPropagation={() => {
            editingAccountTypeId = accountType.id;
          }}>
          {#if editingAccountTypeId === accountType.id}
            <form
              on:submit={() => {
                $editAccountTypeMutation.mutate(accountType);
                editingAccountTypeId = 0;
              }}
              class="flex-1">
              <Input
                bind:value={accountType.name}
                on:blur={() => {
                  $editAccountTypeMutation.mutate(accountType);
                }}
                autofocus />
            </form>
          {:else}
            <p>{accountType.name}</p>
          {/if}

          <Button
            variant="ghost"
            size="icon"
            class="group hover:bg-destructive"
            on:click={(e) => {
              e.stopPropagation();
              $deleteAccountTypeMutation.mutate(accountType);
            }}><Trash2 class="h-5 w-5 text-zinc-500 group-hover:text-red-300" /></Button>
        </button>
      {/each}
    {/if}
  </div>
</div>
