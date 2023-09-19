<script lang="ts">
  import Button from '$lib/components/ui/button/button.svelte';
  import * as Dialog from '$lib/components/ui/dialog';
  import { defaultTransaction, type Account, type Category, type Transaction } from '$lib/types';
  import { Input } from '$lib/components/ui/input';
  import Label from '$lib/components/ui/label/label.svelte';
  import { createQuery, useQueryClient } from '@tanstack/svelte-query';
  import axios from 'axios';
  import { generateMutation } from '$lib/utils.js';
  import { Loader2, Pencil } from 'lucide-svelte';
  import moment from 'moment';

  export let data;

  let dialogOpen = false;
  let errorMessage = '';

  let transaction: Transaction = defaultTransaction;

  const client = useQueryClient();

  const transactionsQuery = createQuery({
    queryKey: ['transactions'],
    queryFn: async () => {
      const response = await axios.get(`${data.apiHost}/transactions`);
      return response.data as Transaction[];
    },
    refetchOnWindowFocus: false
  });

  const addTransactionMutation = generateMutation(client, {
    queryKey: ['transactions'],
    mutationKey: ['add', 'transaction'],
    mutationFn: async (transaction: Transaction) => {
      await axios.post(`${data.apiHost}/transactions`, {
        date: transaction.date,
        category_id: transaction.category_id,
        account_id: transaction.account_id,
        amount: transaction.amount
      });
    },
    updateFn: (transactions: Transaction[], transaction: Transaction) => {
      transaction.account = $accountsQuery.data?.find((a) => a.id === transaction.account_id);
      transaction.category = $categoriesQuery.data?.find((c) => c.id === transaction.category_id);
      transactions.push(transaction);
      return transactions;
    }
  });

  const editTransactionMutation = generateMutation(client, {
    queryKey: ['transactions'],
    mutationKey: ['edit', 'transaction'],
    mutationFn: async (transaction: Transaction) => {
      await axios.patch(`${data.apiHost}/transactions/${transaction.id}`, {
        date: transaction.date,
        category_id: transaction.category_id,
        account_id: transaction.account_id,
        amount: transaction.amount
      });
    },
    updateFn: (transactions: Transaction[], transaction: Transaction) => {
      transaction.account = $accountsQuery.data?.find((a) => a.id === transaction.account_id);
      transaction.category = $categoriesQuery.data?.find((c) => c.id === transaction.category_id);

      return transactions.map((t) => (t.id === transaction.id ? transaction : t));
    }
  });

  const deleteTransactionMutation = generateMutation(client, {
    queryKey: ['transactions'],
    mutationKey: ['delete', 'transaction'],
    mutationFn: async (transaction: Transaction) => {
      await axios.delete(`${data.apiHost}/transactions/${transaction.id}`);
    },
    updateFn: (transactions: Transaction[], transaction: Transaction) =>
      transactions.filter((t) => t.id !== transaction.id)
  });

  const categoriesQuery = createQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await axios.get(`${data.apiHost}/categories`);
      return response.data as Category[];
    },
    refetchOnWindowFocus: false
  });

  const accountsQuery = createQuery({
    queryKey: ['accounts'],
    queryFn: async () => {
      const response = await axios.get(`${data.apiHost}/accounts`);
      return response.data as Account[];
    }
  });

  $transactionsQuery;
</script>

<div class="flex flex-col gap-5">
  <div class="flex place-content-between place-items-center">
    <h1 class="text-xl font-bold">Transactions</h1>
    <Button
      class="h-fit"
      on:click={() => {
        dialogOpen = true;
        transaction = defaultTransaction;
      }}>Add</Button>
  </div>

  {#if $transactionsQuery.isLoading}
    <div class="flex place-content-center"><Loader2 class="animate-spin" /></div>
  {:else if $categoriesQuery.data && $accountsQuery.data}
    <div class="inline-grid auto-cols-auto grid-cols-[auto_auto_auto_auto_auto] items-center">
      {#if $transactionsQuery.data}
        {#each $transactionsQuery.data as t}
          <div>
            {moment(t.date).format('MMM DD')}
          </div>
          <div>
            {t.account?.name}
          </div>
          <div>
            {t.category?.name}
          </div>
          <div>
            {t.amount ?? 0}
          </div>
          <div>
            <Button
              size="icon"
              variant="ghost"
              class="h-8 w-8 rounded-full p-2"
              on:click={() => {
                dialogOpen = true;
                transaction = t;
              }}><Pencil /></Button>
          </div>
        {/each}
      {/if}
    </div>
  {/if}
</div>

{#if $categoriesQuery.data && $accountsQuery.data}
  <Dialog.Root bind:open={dialogOpen}>
    <Dialog.Content>
      <Dialog.Header>
        <Dialog.Title>{transaction.id === 0 ? 'Add' : 'Edit'} Transaction</Dialog.Title>
      </Dialog.Header>
      <form
        class="flex flex-col gap-3"
        on:submit={() => {
          if (transaction.account_id === 0 || transaction.category_id === 0) {
            errorMessage = 'Provide Account and Category';
          } else {
            errorMessage = '';
            if (transaction.id === 0) {
              $addTransactionMutation.mutate(transaction);
            } else {
              $editTransactionMutation.mutate(transaction);
            }
            dialogOpen = false;
          }
        }}>
        <div class="flex flex-col gap-2">
          <Label class="text-zinc-400">Date</Label>
          <Input type="date" bind:value={transaction.date} required />
        </div>
        <div class="flex flex-col gap-2">
          <Label class="text-zinc-400">Amount</Label>
          <select
            name="category"
            id="category"
            class="h-10 rounded-md border border-zinc-800 bg-background px-3 text-sm"
            bind:value={transaction.account_id}>
            <option value={0} selected>Select account</option>
            {#each $accountsQuery.data as account}
              <option value={account.id}>{account.name}</option>
            {/each}
          </select>
        </div>
        <div class="flex flex-col gap-2">
          <Label class="text-zinc-400">Category</Label>
          <select
            name="category"
            id="category"
            class="h-10 rounded-md border border-zinc-800 bg-background px-3 text-sm"
            placeholder="hello"
            bind:value={transaction.category_id}>
            <option value={0} selected>Select category</option>
            {#each $categoriesQuery.data as category}
              <option value={category.id}>{category.name}</option>
            {/each}
          </select>
        </div>
        <div class="flex flex-col gap-2">
          <Label class="text-zinc-400">Account</Label>
          <Input type="number" placeholder="Account" bind:value={transaction.amount} required />
        </div>

        {#if errorMessage}
          <p class="text-red-500">{errorMessage}</p>
        {/if}
      </form>
      <div class="flex place-content-between">
        {#if transaction.id !== 0}
          <Button
            variant="destructive"
            on:click={(e) => {
              e.preventDefault();
              $deleteTransactionMutation.mutate(transaction);
              dialogOpen = false;
            }}>Delete</Button>
        {/if}

        <div class="flex place-content-end gap-2">
          <Button
            variant="secondary"
            on:click={(e) => {
              e.preventDefault();
              dialogOpen = false;
            }}>Cancel</Button>

          {#if transaction.id === 0}
            <Button
              variant="default"
              on:click={() => {
                if (transaction.account_id === 0 || transaction.category_id === 0) {
                  errorMessage = 'Provide Account and Category';
                } else {
                  errorMessage = '';
                  $addTransactionMutation.mutate(transaction);
                  dialogOpen = false;
                }
              }}>Add</Button>
          {:else}
            <Button
              variant="default"
              on:click={() => {
                if (transaction.account_id === 0 || transaction.category_id === 0) {
                  errorMessage = 'Provide Account and Category';
                } else {
                  errorMessage = '';
                  $editTransactionMutation.mutate(transaction);
                  dialogOpen = false;
                }
              }}>Save</Button>
          {/if}
        </div>
      </div>
    </Dialog.Content>
  </Dialog.Root>
{/if}
