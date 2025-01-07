<script lang="ts">
  import { goto } from "svelte-pathfinder";
  import Switch from "./Switch.svelte";
  import BrowserStorage from "src/utils/BrowserStorage";
  import { refreshPage } from "src/utils/refreshPage";
  import { onMount } from "svelte";
  import lockIcon from "../../../assets/icons/lock.svg";
  import infoIcon from "../../../assets/icons/info.svg";
  import githubLogo from "../../../assets/icons/github.svg";
  import xLogo from "../../../assets/icons/x.svg";
  import logo from "src/assets/icons/icon128.png";
  import "@material/web/button/outlined-button";
  import "@material/web/iconbutton/icon-button";
  import { openLink } from "src/utils/openLink";

  let enable: string = "on";
  let mounted: boolean = false;

  onMount(async () => {
    const store = await BrowserStorage.get();
    enable = store.enable ? "on" : "off";
    mounted = true;
  });
  const handleCheckbox = async (en: string) => {
    const user = await BrowserStorage.get();
    await BrowserStorage.set({ ...user, enable: en === "on" ? true : false });
  };
  const handleChangeCheckbox = () => {
    refreshPage();
  };

  $: mounted && handleCheckbox(enable);
</script>

<div class="wrapper">
  <div class="header">
    <div class="header__left">
      <img width="20px" src={infoIcon} alt="" />
      <p
        >How to use ? <span
          class="link"
          on:pointerup={() => openLink("https://chat-guard.vercel.app/getting-started/how-to-use")}>Check here</span
        ></p>
    </div>
    <div class="header__rigth">
      <md-icon-button on:pointerup={() => goto("/advanced-setting")}>
        <img src={lockIcon} alt="" />
      </md-icon-button>
    </div>
  </div>

  <div class="main">
    <img width="80px" height="80px" src={logo} alt="logo" />
    <h1 class="title">Chat Guard</h1>
    <Switch bind:value={enable} onchange={handleChangeCheckbox} />
  </div>

  <div class="footer">
    <img
      class="link"
      on:pointerup={() => openLink("https://github.com/PrivacyForge/ChatGuard")}
      src={githubLogo}
      alt="" />
    <span class="version">v0.9.6</span>
    <img class="link" on:pointerup={() => openLink("https://twitter.com/chatguard_proj")} src={xLogo} alt="" />
  </div>
</div>

<style lang="scss" module>
  $primary-color: #0072f7;
  .link {
    text-decoration: underline;
    color: $primary-color;
    cursor: pointer;
  }
  .wrapper {
    height: 100%;
    display: flex;
    flex-direction: column;
    .header {
      padding: 0.8rem 1rem;
    }
    .header,
    .header__left {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 0.5rem;

      .header__left {
        font-size: 0.8rem;
        a {
          color: $primary-color;
        }
      }
    }
    .main {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      margin-top: 2rem;
      .title {
        font-family: Kranky;
        font-size: 1.7rem;
        margin-bottom: 1rem;
      }
    }
    .footer {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: center;
      color: #fff;
      padding: 0.6rem 1rem;
      background-color: $primary-color;
      border-radius: 1.5rem 1.5rem 0 0;
      .version {
        opacity: 0.8;
        text-align: center;
      }
    }
  }
</style>
