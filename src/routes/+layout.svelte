<script>
  import '../app.css';
  import { twMerge } from 'tailwind-merge';
  import { page } from '$app/stores';
</script>

<svelte:head>
  <title>Budgeteer</title>
</svelte:head>

<div class="flex min-h-screen place-content-center">
  <div class="flex w-2/5 flex-col gap-5 pt-5">
    <div class="flex place-content-between place-items-center">
      <h1 class="text-4xl font-bold">Budgeteer</h1>

      <div class="flex gap-5">
        <a
          href="/budget"
          class={twMerge(
            'underline-offset-4 hover:underline',
            $page.url.pathname === '/budget' ? 'underline' : ''
          )}>Budget</a>
        <a
          href="/expenses"
          class={twMerge(
            'underline-offset-4 hover:underline',
            $page.url.pathname === '/expenses' ? 'underline' : ''
          )}>Expenses</a>
        <a
          href="/accounts"
          class={twMerge(
            'underline-offset-4 hover:underline',
            $page.url.pathname === '/accounts' ? 'underline' : ''
          )}>Accounts</a>
      </div>
    </div>

    <div>
      <slot />
    </div>
  </div>
</div>
