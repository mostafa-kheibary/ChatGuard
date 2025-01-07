<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import LocalStorage from "src/utils/LocalStorage";
  import { clickTo, typeTo } from "src/utils/userAction";
  import { url } from "src/store/url.store";
  import { chatStore } from "src/store/chat.store";
  import type { Contact } from "src/types/Config";
  import { wait } from "src/utils/wait";
  import Lock from "src/components/icon/Lock.svelte";
  import { useConfig } from "src/hooks/useConfig";
  import BrowserStorage from "src/utils/BrowserStorage";

  const { id }: { id: string } = $props();

  let status: "safe" | "unsafe" = $state("unsafe");
  let currentContact: null | Contact = $state(null);
  let isMenuOpen = $state(false);
  let openFromLeft = $state(false);
  let position = $state({ left: 0, top: 0 });

  const { getSelector } = useConfig();

  const checkStatus = async () => {
    const store = await BrowserStorage.get();
    const contact = LocalStorage.getMap(store.localStorageKey as string, $url.id);
    contact.publicKey ? (status = "safe") : (status = "unsafe");
    currentContact = contact;
  };
  url.subscribe(checkStatus);

  const handleCloseMenu = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    const isMenu = Boolean(target.getAttribute("data-menu-item"));
    if (!isMenu) isMenuOpen = false;
  };

  onMount(async () => {
    const store = await BrowserStorage.get();
    LocalStorage.on(store.localStorageKey as string, checkStatus);
    document.addEventListener("pointerdown", handleCloseMenu);
  });
  onDestroy(() => {
    document.removeEventListener("pointerdown", handleCloseMenu);
  });

  const handleMenuClicked = (e: MouseEvent) => {
    const leftDistance = document.getElementById(id)?.getBoundingClientRect().left || 0;
    if (leftDistance < window.innerWidth / 2) {
      openFromLeft = true;
    }
    if (openFromLeft) position.left = e.clientX;
    else {
      position.left = window.innerWidth - e.clientX;
    }
    position.top = e.clientY;
    isMenuOpen = !isMenuOpen;
  };
  const handleSendHandshake = async () => {
    const store = await BrowserStorage.get();
    let textFiled = document.querySelector(getSelector("textField")) as HTMLElement;
    textFiled.focus();
    if (!store.publicKey) return;
    typeTo(getSelector("textField"), "سلام " + store.publicKey);
    textFiled = document.querySelector(getSelector("textField")) as HTMLElement;
    textFiled.style.display = "none";
    await wait(50);
    chatStore.update((state) => ({ ...state, submit: true }));
    clickTo(getSelector("submitButton"));
    textFiled.style.display = "block";
    isMenuOpen = false;
  };
  const handleLoadPublicKey = async () => {
    const store = await BrowserStorage.get();
    const publicKey = prompt() as string;
    if (!publicKey) return;
    LocalStorage.setMap(store.localStorageKey as string, $url.id, {
      enable: true,
      publicKey: publicKey.trim(),
    });
  };
  const handleToggleConversation = async () => {
    const store = await BrowserStorage.get();
    const contact = LocalStorage.getMap(store.localStorageKey as string, $url.id);
    const newContact = { ...contact, enable: !contact.enable };
    LocalStorage.setMap(store.localStorageKey as string, $url.id, newContact);
    currentContact = newContact;
  };
  const handlePreventsAllInteraction = (callback?: (e: any) => void) => {
    return (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      callback?.(e);
    };
  };
  const handleStopPropagation = (callback?: (e: any) => void) => {
    return (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      callback?.(e);
    };
  };
</script>

<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions (because of reasons) -->
<div onclick={handlePreventsAllInteraction()} onmousedown={handlePreventsAllInteraction()} {id} class="ctc_wrapper">
  <button
    aria-label="click"
    class="ctc_button"
    data-menu-item="true"
    class:active={status === "safe" && currentContact?.enable}
    onclick={handlePreventsAllInteraction(handleMenuClicked)}>
  </button>
  <div
    onclick={handleStopPropagation()}
    class="ctc_menu"
    style="{openFromLeft ? 'left' : 'right'}:{position.left}px;top:{position.top}px;"
    class:open={isMenuOpen}
    class:fromLeft={openFromLeft}>
    {#if status === "safe"}
      <div onclick={handleStopPropagation(handleToggleConversation)} data-menu-item="true" class="ctc_menu__item">
        <div class="ctc_radio" class:enable={currentContact?.enable}></div>
        <span>Encrypt messages</span>
      </div>
    {/if}
    <div onclick={handlePreventsAllInteraction(handleSendHandshake)} data-menu-item="true" class="ctc_menu__item">
      <Lock />
      <span>Send public key</span>
    </div>
  </div>
</div>

<style lang="scss">
  .ctc_wrapper {
    position: relative;
    .ctc_button {
      position: relative;
      margin: 0 10px;
      width: 28px;
      height: 28px;
      border-radius: 100%;
      border: solid 5px rgb(255, 48, 48);
      background-color: transparent;
      opacity: 0.8;
      cursor: pointer;
      transition: all 200ms;
      outline: none;
      &.active {
        border: solid 5px #0f7dff;
      }
      &:hover {
        opacity: 1;
      }
    }
    .ctc_menu {
      display: flex;
      flex-direction: column;
      position: fixed;
      width: fit-content;
      background-color: #fff;
      box-shadow: 0 4px 32px #00000028;
      color: #000;
      transform: scale(0);
      text-align: left;
      transform-origin: top right;
      transition: transform 200ms ease;
      padding: 8px;
      border-radius: 8px;
      z-index: 10000000;
      &.fromLeft {
        transform-origin: top left;
        .ctc_menu__item {
          justify-content: end;
          flex-direction: row-reverse;
        }
      }
      &.open {
        transform: scale(1);
      }
      .ctc_menu__item {
        position: relative;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        cursor: pointer;
        padding: 6px 12px;
        border-radius: 8px;
        span,
        svg {
          color: #000 !important;
          font-size: 14px !important;
        }

        &::after {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }
        &:hover {
          background-color: rgb(232, 232, 232);
        }
      }
      .ctc_radio {
        position: relative;
        width: 16px;
        height: 16px;
        margin: 2px;
        border-radius: 100%;
        border: 2px solid #0f7dff;
        &.enable {
          &::after {
            background-color: #0f7dff;
          }
        }
        &::after {
          content: "";
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 10px;
          height: 10px;
          border-radius: 100%;
        }
      }
    }
  }
</style>
