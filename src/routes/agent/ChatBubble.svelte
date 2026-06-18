<script lang="ts">
  import { base } from "$app/paths";
  import { agentSettings } from "$lib/stores/agent-settings";
  import { DefaultProfileAvatars, type Talk } from "$lib/types/agent";
  import type { AgentSettings } from "$lib/types/agent-settings";
  import { onDestroy, onMount } from "svelte";

  let { talk, agents }: { talk: Talk; agents: string[] } = $props();

  let settings = $state<AgentSettings>();

  onMount(() => {
    const unsubscribe = agentSettings.subscribe((value) => {
      settings = value;
    });

    onDestroy(unsubscribe);
  });
</script>

  <div class="chat chat-start">
  {#if settings?.display.largeScale}
    {#if (() => {
      const avatarKey = talk.agent as keyof typeof DefaultProfileAvatars;
      return DefaultProfileAvatars[avatarKey] !== undefined || /^Agent\[\d+\]$/.test(talk.agent) || /^\d+$/.test(talk.agent);
    })()}
      <div class="chat-image avatar">
        <div class="w-20 rounded-full">
          <img
            src={
              ((): string => {
                // Resolve display name from agents list if talk.agent is an index placeholder
                let displayName = talk.agent;
                const m = talk.agent.match(/^Agent\[(\d+)\]$/);
                const numeric = talk.agent.match(/^(\d+)$/);
                const idx = m ? Number(m[1]) : numeric ? Number(talk.agent) : null;
                if (idx && agents && agents.length >= idx) {
                  displayName = agents[idx - 1];
                }

                const avatarKey = displayName as keyof typeof DefaultProfileAvatars;
                if (DefaultProfileAvatars[avatarKey]) {
                  return `${base}${DefaultProfileAvatars[avatarKey]}`;
                }

                if (idx) {
                  return `${base}/images/male/${idx.toString().padStart(2, "0")}.png`;
                }

                return "";
              })()
            }
            alt={talk.agent}
          />
        </div>
      </div>
      <pre class="chat-header text-lg">{(() => {
        const m = talk.agent.match(/^Agent\[(\d+)\]$/);
        const numeric = talk.agent.match(/^(\d+)$/);
        const idx = m ? Number(m[1]) : numeric ? Number(talk.agent) : null;
        if (idx && agents && agents.length >= idx) return agents[idx - 1];
        if (/^\d+$/.test(talk.agent)) return `Agent[${talk.agent.toString().padStart(2, "0")}]`;
        return talk.agent;
      })()}</pre>
    {:else}
      <div class="chat-image avatar">
        <div class="w-20 rounded-full"></div>
      </div>
      <pre class="chat-header text-lg">{talk.agent}</pre>
    {/if}
    {#if talk.over}
      <iconify-icon inline icon="mdi:skip-forward"></iconify-icon>
    {:else if talk.skip}
      <iconify-icon inline icon="mdi:arrow-u-down-right-bold"></iconify-icon>
    {:else}
      <div class="chat-bubble bg-base-100 text-xl text-pretty break-all">
        {talk.text}
      </div>
    {/if}
    <pre class="chat-footer opacity-50 text-sm">Idx: {talk.idx}</pre>
  {:else}
    {#if (() => {
      const avatarKey = talk.agent as keyof typeof DefaultProfileAvatars;
      return DefaultProfileAvatars[avatarKey] !== undefined || /^Agent\[\d+\]$/.test(talk.agent) || /^\d+$/.test(talk.agent);
    })()}
      <div class="chat-image avatar">
        <div class="w-10 rounded-full">
          <img
            src={
              ((): string => {
                // Resolve display name from agents list if talk.agent is an index placeholder
                let displayName = talk.agent;
                const m = talk.agent.match(/^Agent\[(\d+)\]$/);
                const numeric = talk.agent.match(/^(\d+)$/);
                const idx = m ? Number(m[1]) : numeric ? Number(talk.agent) : null;
                if (idx && agents && agents.length >= idx) {
                  displayName = agents[idx - 1];
                }

                const avatarKey = displayName as keyof typeof DefaultProfileAvatars;
                if (DefaultProfileAvatars[avatarKey]) {
                  return `${base}${DefaultProfileAvatars[avatarKey]}`;
                }

                if (idx) {
                  return `${base}/images/male/${idx.toString().padStart(2, "0")}.png`;
                }

                return "";
              })()
            }
            alt={talk.agent}
          />
        </div>
      </div>
      <pre class="chat-header">{(() => {
        const m = talk.agent.match(/^Agent\[(\d+)\]$/);
        const numeric = talk.agent.match(/^(\d+)$/);
        const idx = m ? Number(m[1]) : numeric ? Number(talk.agent) : null;
        if (idx && agents && agents.length >= idx) return agents[idx - 1];
        if (/^\d+$/.test(talk.agent)) return `Agent[${talk.agent.toString().padStart(2, "0")}]`;
        return talk.agent;
      })()}</pre>
    {:else}
      <div class="chat-image avatar">
        <div class="w-10 rounded-full"></div>
      </div>
      <pre class="chat-header">{talk.agent}</pre>
    {/if}
    {#if talk.over}
      <iconify-icon inline icon="mdi:skip-forward"></iconify-icon>
    {:else if talk.skip}
      <iconify-icon inline icon="mdi:arrow-u-down-right-bold"></iconify-icon>
    {:else}
      <div class="chat-bubble bg-base-100 text-pretty break-all">
        {talk.text}
      </div>
    {/if}
    <pre class="chat-footer opacity-50">Idx: {talk.idx}</pre>
  {/if}
</div>
