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
  <div class="flex min-h-screen place-content-center">
    <div class="flex w-2/5 flex-col gap-5 pt-5">
      <div class="flex place-content-between place-items-center">
        <h1 class="text-4xl font-bold tracking-tight text-cyan-500">Budgeteer</h1>

        <div class="flex gap-5">
          <a
            href="/budget"
            class={twMerge(
              'underline-offset-4 transition-all duration-200 hover:underline',
              $page.url.pathname === '/budget' ? 'text-cyan-400 underline' : 'text-zinc-400'
            )}>Budget</a>
          <a
            href="/expenses"
            class={twMerge(
              'underline-offset-4 transition-all duration-200 hover:underline',
              $page.url.pathname === '/expenses' ? 'text-cyan-400 underline' : 'text-zinc-400'
            )}>Expenses</a>
          <a
            href="/accounts"
            class={twMerge(
              'underline-offset-4 transition-all duration-200 hover:underline',
              $page.url.pathname === '/accounts' ? 'text-cyan-400 underline' : 'text-zinc-400'
            )}>Accounts</a>
        </div>
      </div>

      <div>
        <slot />
      </div>
    </div>
  </div>
</QueryClientProvider>
