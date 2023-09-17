import { env } from '$env/dynamic/private';

export async function load() {
  return {
    apiHost: env.API_HOST
  };
}
