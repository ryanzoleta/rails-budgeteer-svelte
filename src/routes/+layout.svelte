<script>
  import '../app.css';
  import { twMerge } from 'tailwind-merge';
  import { page } from '$app/stores';
  import '../app.css';
  import { browser } from '$app/environment';
  import { QueryClientProvider, QueryClient } from '@tanstack/svelte-query';

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        enabled: browser
      }
    }
  });
</script>

<svelte:head>
  <title>Budgeteer</title>
</svelte:head>
<QueryClientProvider client={queryClient}>
  <div class="flex min-h-screen place-content-center bg-black">
    <div class="flex flex-col gap-5 pt-5 xl:w-2/6">
      <div class="flex place-content-between place-items-center">
        <h1 class="text-4xl font-bold tracking-tight text-white">Budgeteer</h1>

        <div class="flex gap-5">
          <a
            href="/budget"
            class={twMerge(
              'underline-offset-4 transition-all duration-200 hover:underline',
              $page.url.pathname === '/budget' ? ' text-primary underline' : 'text-zinc-400'
            )}>Budget</a>
          <a
            href="/transactions"
            class={twMerge(
              'underline-offset-4 transition-all duration-200 hover:underline',
              $page.url.pathname === '/transactions' ? ' text-primary underline' : 'text-zinc-400'
            )}>Transactions</a>
          <a
            href="/accounts"
            class={twMerge(
              'underline-offset-4 transition-all duration-200 hover:underline',
              $page.url.pathname === '/accounts' ? ' text-primary underline' : 'text-zinc-400'
            )}>Accounts</a>
        </div>
      </div>

      <div class="rounded-lg bg-zinc-950 p-10">
        <slot />
      </div>
    </div>
  </div>
</QueryClientProvider>
