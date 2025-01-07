<script lang="ts">
  import BrowserStorage, { type IStorage } from "src/utils/BrowserStorage";
  import Cipher from "src/utils/Cipher";
  import { refreshPage } from "src/utils/refreshPage";
  import { onMount } from "svelte";

  let error = "";
  let browserStore: IStorage | null = null;

  onMount(async () => {
    const store = await BrowserStorage.get();
    browserStore = store;
  });

  const resetChatGuardConfig = async () => {
    const isOK = confirm("Are you sure you want to reset your config");
    if (!isOK) return;

    const store = await BrowserStorage.get();
    const { privateKey, publicKey } = await Cipher.generateKeys();
    const browserData = {
      ...store,
      enable: true,
      user: {
        publicKey,
        privateKey,
      },
    };
    browserStore = browserData;
    await BrowserStorage.set(browserData);
    refreshPage();
  };
  const exportChatGuardConfig = async () => {
    const store = await BrowserStorage.get();
    const config = JSON.stringify({ privateKey: store.privateKey, publicKey: store.publicKey });
    const a = document.createElement("a");
    const file = new Blob([config], { type: "text/plain" });
    a.href = URL.createObjectURL(file);
    a.download = "chatguard.conf";
    a.click();
    URL.revokeObjectURL(a.href);
  };
  const handleImportChatGuardConfig = () => {
    document.getElementById("import-upload")?.click();
  };
  const exportUserPublicKey = async () => {
    const store = await BrowserStorage.get();
    if (!store.publicKey) return;
    const config = store.publicKey;
    const a = document.createElement("a");
    const file = new Blob([config], { type: "text/plain" });
    a.href = URL.createObjectURL(file);
    a.download = "publicKey.txt";
    a.click();
    URL.revokeObjectURL(a.href);
  };
  const exportUserPrivateKey = async () => {
    const store = await BrowserStorage.get();
    if (!store.privateKey) return;
    const config = store.privateKey;
    const a = document.createElement("a");
    const file = new Blob([config], { type: "text/plain" });
    a.href = URL.createObjectURL(file);
    a.download = "private.txt";
    a.click();
    URL.revokeObjectURL(a.href);
  };
  const importChatGuardConfig = async (e: Event) => {
    const store = await BrowserStorage.get();
    const target = e.target as HTMLInputElement;
    const fr = new FileReader();
    fr.onload = async function () {
      if (typeof fr.result !== "string") return (error = "Invalid config file");

      const configText = fr.result || "";
      try {
        const config = JSON.parse(configText);
        if (!config.privateKey || !config.publicKey) return (error = "Invalid config file");
        await BrowserStorage.set({ ...store, ...config });
        browserStore = { ...store, privateKey: config.privateKey, publicKey: config.publicKey };
        refreshPage();
        error = "";
      } catch (e) {
        error = "Invalid config file";
      }
    };
    fr.readAsText((target as any).files[0]);
  };
</script>

<div class="wrapper">
  <div class="config">
    <h2 class="title">My credentials</h2>
    <md-outlined-button role="button" on:pointerup={resetChatGuardConfig} class="reset-button">
      <img slot="icon" width="18px" src={""} alt="" />
      Reset Everything
    </md-outlined-button>
    {#if error}
      <p class="error">
        {error}
      </p>
    {/if}
  </div>
</div>

<style lang="scss" module>
  .wrapper {
    height: 100%;
    overflow-y: auto;
    padding: 2rem;

    .config {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      .title {
        font-weight: 500;
      }
      .description {
        display: flex;
        flex-direction: column;
        font-size: 0.8rem;
        font-weight: 400;
        gap: 0.5rem;
        margin-bottom: 1rem;
        .extra {
          color: gray;
        }
      }
      .config-buttons {
        display: flex;
        gap: 0.5rem;
        align-items: center;
        margin-top: 0.5rem;
      }
      .reset-button {
        --md-sys-color-primary: red;
        width: 100%;
        font-size: 0.8rem;
      }
      .button {
        width: 50%;
        font-size: 0.8rem;
      }
      .fullwidth {
        width: 100%;
      }
      .label {
        pointer-events: none;
        visibility: hidden;
      }
      .error {
        color: red;
        font-size: 0.8rem;
      }
    }
  }
</style>
