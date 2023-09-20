<script lang="ts">
  import type { AccountType, Account } from '$lib/types.js';
  import { createMutation, createQuery, useQueryClient } from '@tanstack/svelte-query';
  import axios from 'axios';
  import { Input } from '$lib/components/ui/input';
  import { Button } from '$lib/components/ui/button';
  import { Loader2, Trash2 } from 'lucide-svelte';
  import { onMount } from 'svelte';
  import { formatAmountToCurrency, generateMutation } from '$lib/utils.js';
  import * as Dialog from '$lib/components/ui/dialog';
  import Label from '$lib/components/ui/label/label.svelte';

  export let data;

  let loading = false;
  let accountTypeName = '';
  let editingAccountTypeId = 0;

  let dialogOpen = false;

  let accountToBeAdded: Account = {
    id: 0,
    name: '',
    account_type_id: 0,
    created_at: new Date(),
    updated_at: new Date()
  };

  let accountToBeEdited: Account = {
    id: 0,
    name: '',
    account_type_id: 0,
    created_at: new Date(),
    updated_at: new Date()
  };

  let errorMessage = '';

  onMount(() => {
    document.addEventListener('click', () => {
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
    },
    refetchOnWindowFocus: false
  });

  const addAccountMutation = generateMutation(client, {
    queryKey: ['accounts'],
    mutationKey: ['add', 'account'],
    mutationFn: async (account: Account) => {
      loading = true;
      await axios.post(`${data.apiHost}/accounts`, {
        name: account.name,
        account_type_id: account.account_type_id
      });
      loading = false;
    },
    updateFn: (accounts: Account[], account: Account) => {
      accounts?.push(account);
      return accounts;
    }
  });

  const editAccountMutation = generateMutation(client, {
    queryKey: ['accounts'],
    mutationKey: ['edit', 'account'],
    mutationFn: async (account: Account) => {
      await axios.patch(`${data.apiHost}/accounts/${account.id}`, {
        name: account.name,
        account_type_id: account.account_type_id
      });
    },
    updateFn: (accounts: Account[], account: Account) => {
      return accounts.map((a) => {
        return a.id === account.id ? account : a;
      });
    }
  });

  const deleteAccountMutation = generateMutation(client, {
    queryKey: ['accounts'],
    mutationKey: ['delete', 'account'],
    mutationFn: async (account: Account) => {
      await axios.delete(`${data.apiHost}/accounts/${account.id}`);
    },
    updateFn: (accounts: Account[], account: Account) =>
      accounts?.filter((a: Account) => a.id !== account.id)
  });
</script>

<div class="flex flex-col gap-10">
  <div class="flex flex-col gap-3">
    <h1 class="text-2xl font-bold">Your Accounts</h1>

    <form
      class="flex gap-2"
      on:submit={() => {
        accountToBeAdded.account_type = $accountTypesQuery.data?.find(
          (a) => a.id === accountToBeAdded.account_type_id
        );
        $addAccountMutation.mutate(structuredClone(accountToBeAdded));
      }}>
      <Input placeholder="Add a new account" bind:value={accountToBeAdded.name} required />
      <select
        name="accountType"
        id="accountType"
        class="rounded-md border border-zinc-800 bg-background px-3 text-sm"
        bind:value={accountToBeAdded.account_type_id}
        required>
        {#if $accountTypesQuery.data}
          {#each $accountTypesQuery.data as accountType, index}
            <option value={accountType.id} selected={index === 0 ? true : false}
              >{accountType.name}</option>
          {/each}
        {/if}
      </select>
      <Button variant="default" disabled={loading}>Add</Button>
    </form>
    {#if $accountQuery.isLoading}
      <div class="flex place-content-center"><Loader2 class="animate-spin" /></div>
    {:else if $accountQuery.data}
      <div class="flex flex-col gap-3">
        {#each $accountQuery.data as account}
          <button
            class="flex place-content-between place-items-center gap-2 rounded-md bg-zinc-900 px-5 py-3 transition duration-200 hover:bg-zinc-700"
            on:click|stopPropagation={() => {
              accountToBeEdited = account;
              dialogOpen = true;
            }}>
            <div class="flex flex-col place-items-start">
              <p class="font-bold">{account.name}</p>
              <p class="text-sm text-zinc-500">{account.account_type?.name}</p>
            </div>
            <p>{formatAmountToCurrency(account.balance ?? 0)}</p>
          </button>
        {/each}
      </div>
    {/if}
  </div>

  <div class="flex flex-col gap-3">
    <h1 class="text-2xl font-bold">Account Types</h1>

    <form
      class="flex gap-2"
      on:submit={() => {
        $addAccountTypeMutation.mutate(accountTypeName);
      }}>
      <Input placeholder="Add a new account type" bind:value={accountTypeName} required />
      <Button variant="default" disabled={loading}>Add</Button>
    </form>

    {#if $accountTypesQuery.isLoading}
      <div class="flex place-content-center"><Loader2 class="animate-spin" /></div>
    {:else if $accountTypesQuery.data}
      <div class="flex flex-col gap-3" />
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
              required
              autofocus />

            <Button variant="secondary">Save</Button>
          </form>
        {:else}
          <button
            class="flex place-content-between place-items-center gap-2 rounded-md border-2 border-zinc-800 px-5 py-2"
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

{#if $accountTypesQuery.data}
  <Dialog.Root bind:open={dialogOpen}>
    <Dialog.Content>
      <Dialog.Header>
        <Dialog.Title>Edit Account</Dialog.Title>
      </Dialog.Header>
      <form
        on:submit={() => {
          if (accountToBeEdited.name === '') {
            errorMessage = 'Please provide an account name';
          } else {
            accountToBeEdited.account_type = $accountTypesQuery.data?.find(
              (a) => a.id === accountToBeEdited.account_type_id
            );
            $editAccountMutation.mutate(accountToBeEdited);
            dialogOpen = false;
            errorMessage = '';
          }
        }}
        class="flex flex-col gap-5 py-2">
        <div class="flex flex-col gap-1">
          <Label>Name</Label>
          <Input bind:value={accountToBeEdited.name} class="text-base" autofocus />
        </div>

        <div class="flex flex-col gap-1">
          <Label>Account Type</Label>
          <select
            name="accountType"
            id="accountType"
            class="h-10 rounded-md border border-zinc-800 bg-background px-3 text-sm"
            bind:value={accountToBeEdited.account_type_id}>
            {#if $accountTypesQuery.data}
              {#each $accountTypesQuery.data as accountType, index}
                <option value={accountType.id} selected={index === 0 ? true : false}
                  >{accountType.name}</option>
              {/each}
            {/if}
          </select>
        </div>

        <p class="text-red-500">{errorMessage}</p>
      </form>

      <div class="flex place-content-between">
        <Button
          variant="destructive"
          on:click={(e) => {
            e.preventDefault();
            $deleteAccountMutation.mutate(accountToBeEdited);
            dialogOpen = false;
          }}>Delete</Button>

        <div class="flex place-content-end gap-2">
          <Button
            variant="secondary"
            on:click={(e) => {
              e.preventDefault();
              dialogOpen = false;
            }}>Cancel</Button>

          <Button
            variant="default"
            on:click={() => {
              if (accountToBeEdited.name === '') {
                errorMessage = 'Please provide an account name';
              } else {
                accountToBeEdited.account_type = $accountTypesQuery.data?.find(
                  (a) => a.id === accountToBeEdited.account_type_id
                );
                $editAccountMutation.mutate(accountToBeEdited);
                dialogOpen = false;
                errorMessage = '';
              }
            }}>Save</Button>
        </div>
      </div>
    </Dialog.Content>
  </Dialog.Root>
{/if}
