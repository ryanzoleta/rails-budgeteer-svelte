<script lang="ts">
  import Button from '$lib/components/ui/button/button.svelte';
  import * as Dialog from '$lib/components/ui/dialog';
  import type { Account, Category, Transaction } from '$lib/types';
  import { Input } from '$lib/components/ui/input';
  import Label from '$lib/components/ui/label/label.svelte';
  import { createQuery, useQueryClient } from '@tanstack/svelte-query';
  import axios from 'axios';
  import { formatDate, generateMutation } from '$lib/utils.js';

  export let data;

  let dialogAddTransactionIsOpen = false;

  let transaction: Transaction = {
    id: 0,
    date: formatDate(new Date()),
    account_id: 0,
    amount: 0,
    category_id: 0,
    created_at: new Date(),
    updated_at: new Date()
  };

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
      transactions.push(transaction);
      return transactions;
    }
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

{#if $categoriesQuery.data && $accountsQuery.data}
  <div class="flex flex-col gap-5">
    <div class="flex place-content-between place-items-center">
      <h1 class="text-xl font-bold">Transactions</h1>
      <Button
        class="h-fit"
        on:click={() => {
          dialogAddTransactionIsOpen = true;
        }}>Add</Button>
    </div>

    <div class="inline-grid auto-cols-auto grid-cols-[1fr_1fr_1fr_1fr]">
      {#if $transactionsQuery.data}
        {#each $transactionsQuery.data as transaction}
          <div>
            {transaction.date}
          </div>
          <div>
            {transaction.account?.name}
          </div>
          <div>
            {transaction.category?.name}
          </div>
          <div>
            {transaction.amount ?? 0}
          </div>
        {/each}
      {/if}
    </div>
  </div>

  <Dialog.Root bind:open={dialogAddTransactionIsOpen}>
    <Dialog.Content>
      <Dialog.Header>
        <Dialog.Title>Add Transaction</Dialog.Title>
      </Dialog.Header>
      <form
        class="flex flex-col gap-3"
        on:submit={() => {
          $addTransactionMutation.mutate(transaction);
          dialogAddTransactionIsOpen = false;
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
      </form>
      <div class="flex place-content-end gap-2">
        <Button
          variant="secondary"
          on:click={(e) => {
            e.preventDefault();
            dialogAddTransactionIsOpen = false;
          }}>Cancel</Button>

        <Button
          variant="default"
          on:click={() => {
            $addTransactionMutation.mutate(transaction);
            dialogAddTransactionIsOpen = false;
          }}>Add</Button>
      </div>
    </Dialog.Content>
  </Dialog.Root>
{/if}
