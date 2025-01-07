<script lang="ts">
  import { url } from "src/store/url.store";
  import BrowserStorage from "src/utils/BrowserStorage";
  import LocalStorage from "src/utils/LocalStorage";
  import { wait } from "src/utils/wait";
  import { onMount } from "svelte";
  import { get } from "svelte/store";

  const { publicKey }: { publicKey: string } = $props();

  let alreadyUsing = $state(false);

  const handleUseHandshake = async () => {
    const publicKeyArray = publicKey.split(" ");
    publicKeyArray.shift();
    const store = await BrowserStorage.get();
    LocalStorage.setMap(store.localStorageKey as string, get(url).id, {
      enable: true,
      publicKey: publicKeyArray.join(" "),
    });
  };
  const checkAlreadyUsing = async (localStorageKey: string) => {
    const publicKeyArray = publicKey.split(" ");
    publicKeyArray.shift();
    await wait(100);
    const contact = LocalStorage.getMap(localStorageKey as string, $url.id);
    if (!contact || contact.publicKey !== publicKeyArray.join(" ")) return (alreadyUsing = false);
    alreadyUsing = true;
  };
  onMount(async () => {
    const store = await BrowserStorage.get();
    checkAlreadyUsing(store.localStorageKey as string);
    LocalStorage.on(store.localStorageKey as string, () => checkAlreadyUsing(store.localStorageKey as string));
  });
</script>

<div class="container">
  {publicKey}
  <div class="button-wrapper">
    <button disabled={alreadyUsing} onclick={handleUseHandshake}>
      {#if alreadyUsing}
        Already using
      {:else}
        Use
      {/if}
    </button>
  </div>
</div>

<style lang="scss" module>
  $primary-color: #0072f7;
  $primary-color-dark: #0062d2;
  .container {
    width: 100%;
    display: flex;
    flex-direction: column;
  }
  p {
    margin: 0;
    padding: 0;
  }
  .button-wrapper {
    padding-block: 10px;
  }
  button {
    width: fit-content;
    background-color: $primary-color;
    padding: 4px 15px;
    border-radius: 20px;
    color: #fff;
    font-size: 15px;
    border: none;
    outline: none;
    cursor: pointer;
    &:disabled {
      opacity: 0.5;
      cursor: default;
    }
  }
</style>
