import Popup from "src/components/modules/popup/Popup.svelte";
import { mount } from "svelte";

import "@material/web/switch/switch";
import "@material/web/button/filled-button";
import "@material/web/button/elevated-button";

mount(Popup, { target: document.getElementById("app") as HTMLDivElement });
