<script lang="ts">
  import type { MdSwitch } from "@material/web/switch/switch";

  let { value = $bindable(), onchange } = $props();

  let checked = $state(true);

  function handleChange(event: InputEvent) {
    checked = (event.target as MdSwitch).selected;
    value = checked ? "on" : "off";
    onchange("change", value);
  }

  $effect(() => {
    value === "on" ? (checked = true) : (checked = false);
  });
</script>

<div class="switch-container">
  <span>OFF</span>
  <md-switch role="switch" aria-checked={checked} selected={checked} onchange={handleChange}> </md-switch>
  <span>ON</span>
</div>

<style module>
  .switch-container {
    display: flex;
    justify-content: center;
    gap: 0.8rem;
    align-items: center;
  }
</style>
