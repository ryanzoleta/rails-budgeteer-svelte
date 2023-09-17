<script lang="ts">
  import AccountTypes from '$lib/components/AccountTypes.svelte';
  import Accounts from '$lib/components/Accounts.svelte';

  export let data;
</script>

<div class="flex flex-col gap-10">
  <Accounts apiHost={data.apiHost} />
  <AccountTypes apiHost={data.apiHost} />
</div>
