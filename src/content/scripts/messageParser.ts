import Cipher from "src/utils/Cipher";
import Handshake from "src/components/modules/content/Handshake.svelte";
import { useConfig } from "src/hooks/useConfig";
import type { IStorage } from "src/utils/BrowserStorage";
import { changeTextNode } from "src/utils/changeTextNode";
import { findFirstTextNode, findTargetRecursive } from "src/utils/findMessageTarget";
import LocalStorage from "src/utils/LocalStorage";
import { url } from "src/store/url.store";
import { get } from "svelte/store";
import { mount } from "svelte";

export const parseMessage = async (messages: Element[], index: number, store: IStorage) => {
  const { getSelector } = useConfig();
  const contact = LocalStorage.getMap(store.localStorageKey as string, get(url).id);
  if (!store.privateKey) return;

  const targets = Array.from(messages[index].querySelectorAll(getSelector("innerMessageText")));
  const target = targets.find((el) => findTargetRecursive(el)) as HTMLElement | null;
  if (!target) return;

  const textNodeContent = findFirstTextNode(target);
  const words = textNodeContent.split(" ");

  // HandShakes Request
  if (words[0] === "سلام" && words.length === 21) {
    const isHandshake = target.getAttribute("handshake");
    if (isHandshake) return;
    const parent = document.createElement("div");
    changeTextNode(target, "");
    words.shift();
    mount(Handshake, { target: parent, props: { publicKey: words.join(" ") } });
    target.prepend(parent);
    target.setAttribute("handshake", "true");
    return;
  }

  if (!contact.publicKey) return;
  // Messages
  try {
    const isEncrypted = target.getAttribute("encrypted");
    const isHandshake = target.getAttribute("handshake");
    const errorTry = +(target.getAttribute("error-try") || "0");

    if (isEncrypted || isHandshake) return;
    if (errorTry === 4) return changeTextNode(target, "⛔ Error in decryption");

    const packet = await Cipher.decryptE2EPacket(store.privateKey, contact.publicKey, words.join(" "));
    if (!packet) return target.setAttribute("error-try", (errorTry + 1).toString());
    changeTextNode(target, packet, true);
    (target as any).dir = "auto";
    target.setAttribute("encrypted", "true");
  } catch (e) {
    console.log(e);
    changeTextNode(target, "⛔ Can't open, wrong public/private key");
  }
  return;
};
