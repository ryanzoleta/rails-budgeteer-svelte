<script lang="ts">
  import type { AccountType, Account } from '$lib/types.js';
  import { createMutation, createQuery, useQueryClient } from '@tanstack/svelte-query';
  import axios from 'axios';
  import { Input } from '$lib/components/ui/input';
  import { Button } from '$lib/components/ui/button';
  import { Trash2 } from 'lucide-svelte';
  import { onMount } from 'svelte';

  export let data;

  let loading = false;
  let accountTypeName = '';
  let editingAccountId = 0;
  let editingAccountTypeId = 0;

  let accountToBeAdded: Account = {
    id: 0,
    name: '',
    account_type_id: 0,
    created_at: new Date(),
    updated_at: new Date()
  };

  onMount(() => {
    document.addEventListener('click', () => {
      editingAccountId = 0;
      editingAccountTypeId = 0;
    });
  });

  const accountTypesQuery = createQuery({
    queryKey: ['account_types'],
    queryFn: async () => {
      const response = (await axios.get(`${data.apiHost}/account_types`)).data as AccountType[];

      if (accountToBeAdded.account_type_id === 0) accountToBeAdded.account_type_id = response[0].id;

      return response;
    }
  });

  const client = useQueryClient();

  const addAccountTypeMutation = createMutation({
    mutationKey: ['add', 'account_type'],
    mutationFn: async (accountTypeName: string) => {
      loading = true;
      await axios.post(`${data.apiHost}/account_types`, { name: accountTypeName });
      loading = false;
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
      await axios.patch(`${data.apiHost}/account_types/${accountType.id}`, {
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

  const accountQuery = createQuery({
    queryKey: ['accounts'],
    queryFn: async () => {
      const response = await axios.get(`${data.apiHost}/accounts`);
      return response.data as Account[];
    }
  });

  const addAccountMutation = createMutation({
    mutationKey: ['add', 'account'],
    mutationFn: async (account: Account) => {
      loading = true;
      await axios.post(`${data.apiHost}/accounts`, {
        name: account.name,
        account_type_id: account.account_type_id
      });
      loading = false;
    },
    onMutate: async (account: Account) => {
      await client.cancelQueries(['accounts']);

      const accounts = client.getQueryData<Account[]>(['accounts']);

      accounts?.push({
        id: -1,
        name: account.name,
        account_type_id: 1,
        created_at: new Date(),
        updated_at: new Date()
      });

      client.setQueryData<Account[]>(['accounts'], []); // this forces a re-render
      client.setQueryData<Account[]>(['accounts'], accounts);
    },
    onSettled: () => {
      client.invalidateQueries(['accounts']);
    }
  });

  const editAccountMutation = createMutation({
    mutationKey: ['edit', 'account'],
    mutationFn: async (account: Account) => {
      await axios.patch(`${data.apiHost}/accounts/${account.id}`, {
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
      await axios.delete(`${data.apiHost}/accounts/${account.id}`);
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

<div class="flex flex-col gap-10">
  <div class="flex flex-col gap-3">
    <h1 class="text-xl font-bold">Your Accounts</h1>

    <form
      class="flex gap-2"
      on:submit={() => {
        $addAccountMutation.mutate(structuredClone(accountToBeAdded));
      }}>
      <Input placeholder="Add a new account" bind:value={accountToBeAdded.name} />
      <select
        name="accountType"
        id="accountType"
        class="rounded-md border border-zinc-800 bg-background px-3 text-sm"
        bind:value={accountToBeAdded.account_type_id}>
        {#if $accountTypesQuery.data}
          {#each $accountTypesQuery.data as accountType, index}
            <option value={accountType.id} selected={index === 0 ? true : false}
              >{accountType.name}</option>
          {/each}
        {/if}
      </select>
      <Button variant="default" disabled={loading}>Add</Button>
    </form>

    <div class="flex flex-col gap-3">
      {#if $accountQuery.data}
        {#each $accountQuery.data as account}
          {#if editingAccountId === account.id}
            <form
              on:submit={() => {
                $editAccountMutation.mutate(account);
                editingAccountId = 0;
              }}
              class="flex flex-1 gap-3 py-2">
              <Input
                bind:value={account.name}
                on:blur={() => {
                  $editAccountMutation.mutate(account);
                }}
                class="text-base"
                autofocus />

              <Button variant="secondary">Save</Button>
            </form>
          {:else}
            <button
              class="flex place-content-between place-items-center gap-2 rounded-md bg-green-950 px-5 py-2"
              on:click|stopPropagation={() => {
                editingAccountId = account.id;
              }}>
              <p>{account.name}</p>

              <Button
                variant="ghost"
                size="icon"
                class="group hover:bg-destructive"
                on:click={(e) => {
                  e.stopPropagation();
                  $deleteAccountMutation.mutate(account);
                }}><Trash2 class="h-5 w-5 text-zinc-500 group-hover:text-red-300" /></Button>
            </button>
          {/if}
        {/each}
      {/if}
    </div>
  </div>

  <div class="flex flex-col gap-3">
    <h1 class="text-xl font-bold">Account Types</h1>

    <form
      class="flex gap-2"
      on:submit={() => {
        $addAccountTypeMutation.mutate(accountTypeName);
      }}>
      <Input placeholder="Add a new account type" bind:value={accountTypeName} />
      <Button variant="default" disabled={loading}>Add</Button>
    </form>

    <div class="flex flex-col gap-3">
      {#if $accountTypesQuery.data}
        {#each $accountTypesQuery.data as accountType}
          {#if editingAccountTypeId === accountType.id}
            <form
              on:submit={() => {
                $editAccountTypeMutation.mutate(accountType);
                editingAccountTypeId = 0;
              }}
              class="flex flex-1 gap-3 border-2 border-zinc-950 py-2">
              <Input
                bind:value={accountType.name}
                on:blur={() => {
                  $editAccountTypeMutation.mutate(accountType);
                }}
                class="text-base"
                autofocus />

              <Button variant="secondary">Save</Button>
            </form>
          {:else}
            <button
              class="flex place-content-between place-items-center gap-2 rounded-md border-2 border-green-950 px-5 py-2"
              on:click|stopPropagation={() => {
                editingAccountTypeId = accountType.id;
              }}>
              <p>{accountType.name}</p>

              <Button
                variant="ghost"
                size="icon"
                class="group hover:bg-destructive"
                on:click={(e) => {
                  e.stopPropagation();
                  $deleteAccountTypeMutation.mutate(accountType);
                }}><Trash2 class="h-5 w-5 text-zinc-500 group-hover:text-red-300" /></Button>
            </button>
          {/if}
        {/each}
      {/if}
    </div>
  </div>
</div>
