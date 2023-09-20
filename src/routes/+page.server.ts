import { redirect } from '@sveltejs/kit';

export function load() {
  console.log('he');
  throw redirect(303, '/budget');
}
