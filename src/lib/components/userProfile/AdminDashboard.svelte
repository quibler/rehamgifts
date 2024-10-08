<script lang="ts">
  import { onMount } from "svelte";
  import {
    getAllVideos,
    createVideo,
    updateVideo,
    deleteVideo,
  } from "$lib/videoFirebase";
  import { logoutUser } from "$lib/services/auth";
  import { invalidateAll } from "$app/navigation";
  import type { Video, VideoWithId } from "$lib/types";

  let videos: VideoWithId[] = [];
  let showAddForm = false;
  let editingVideo: VideoWithId | null = null;

  let newVideo: Video = {
    title: "",
    description: "",
    url: "",
    thumbnail: "",
  };

  onMount(async () => {
    videos = await getAllVideos();
  });

  async function handleAddVideo() {
    try {
      const addedVideo = await createVideo(newVideo);
      videos = [addedVideo, ...videos];
      showAddForm = false;
      newVideo = { title: "", description: "", url: "", thumbnail: "" };
    } catch (error) {
      console.error("Error adding video:", error);
      alert("Failed to add video. Please try again.");
    }
  }

  async function handleUpdateVideo() {
    if (editingVideo) {
      try {
        await updateVideo(editingVideo.id, {
          title: editingVideo.title,
          description: editingVideo.description,
          url: editingVideo.url,
          thumbnail: editingVideo.thumbnail,
        });
        const index = videos.findIndex((v) => v.id === editingVideo?.id);
        if (index !== -1) {
          videos[index] = editingVideo;
          videos = [...videos]; // Trigger reactivity
        }
        editingVideo = null;
      } catch (error) {
        console.error("Error updating video:", error);
        alert("Failed to update video. Please try again.");
      }
    }
  }

  async function handleDeleteVideo(id: string) {
    if (confirm("Are you sure you want to delete this video?")) {
      try {
        await deleteVideo(id);
        videos = videos.filter((v) => v.id !== id);
      } catch (error) {
        console.error("Error deleting video:", error);
        alert("Failed to delete video. Please try again.");
      }
    }
  }

  async function handleLogout() {
    try {
      await logoutUser();
      invalidateAll();
    } catch (error) {
      console.error("Error logging out:", error);
      alert("Failed to log out. Please try again.");
    }
  }
</script>

<div class="container mx-auto p-4">
  <div class="flex justify-between items-center mb-6">
    <h1 class="text-3xl font-bold">Video Management</h1>
    <button class="btn btn-secondary" on:click={handleLogout}>Logout</button>
  </div>

  <button
    class="btn btn-primary mb-4"
    on:click={() => (showAddForm = !showAddForm)}
  >
    {showAddForm ? "Cancel" : "Add New Video"}
  </button>

  {#if showAddForm}
    <div class="card bg-base-200 shadow-xl mb-4">
      <div class="card-body">
        <h2 class="card-title">Add New Video</h2>
        <form on:submit|preventDefault={handleAddVideo} class="space-y-4">
          <input
            class="input input-bordered w-full"
            bind:value={newVideo.title}
            placeholder="Title"
            required
          />
          <input
            class="input input-bordered w-full"
            bind:value={newVideo.description}
            placeholder="Description"
            required
          />
          <input
            class="input input-bordered w-full"
            type="url"
            bind:value={newVideo.url}
            placeholder="Video URL"
            required
          />
          <input
            class="input input-bordered w-full"
            type="url"
            bind:value={newVideo.thumbnail}
            placeholder="Thumbnail URL"
            required
          />
          <button type="submit" class="btn btn-primary">Add Video</button>
        </form>
      </div>
    </div>
  {/if}

  <div class="overflow-x-auto">
    <table class="table w-full">
      <thead>
        <tr>
          <th>Title</th>
          <th>Description</th>
          <th>Video URL</th>
          <th>Thumbnail URL</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {#each videos as video (video.id)}
          <tr>
            <td>
              {#if editingVideo?.id === video.id}
                <input
                  class="input input-bordered w-full"
                  bind:value={editingVideo.title}
                />
              {:else}
                {video.title}
              {/if}
            </td>
            <td>
              {#if editingVideo?.id === video.id}
                <input
                  class="input input-bordered w-full"
                  bind:value={editingVideo.description}
                />
              {:else}
                {video.description}
              {/if}
            </td>
            <td>
              {#if editingVideo?.id === video.id}
                <input
                  class="input input-bordered w-full"
                  type="url"
                  bind:value={editingVideo.url}
                />
              {:else}
                <a href={video.url} target="_blank" class="link link-primary"
                  >{video.url}</a
                >
              {/if}
            </td>
            <td>
              {#if editingVideo?.id === video.id}
                <input
                  class="input input-bordered w-full"
                  type="url"
                  bind:value={editingVideo.thumbnail}
                />
              {:else}
                <a
                  href={video.thumbnail}
                  target="_blank"
                  class="link link-secondary">{video.thumbnail}</a
                >
              {/if}
            </td>
            <td>
              {#if editingVideo?.id === video.id}
                <button
                  class="btn btn-sm btn-success mr-2"
                  on:click={handleUpdateVideo}>Save</button
                >
                <button
                  class="btn btn-sm btn-ghost"
                  on:click={() => (editingVideo = null)}>Cancel</button
                >
              {:else}
                <button
                  class="btn btn-sm btn-info mr-2"
                  on:click={() => (editingVideo = { ...video })}>Edit</button
                >
                <button
                  class="btn btn-sm btn-error"
                  on:click={() => handleDeleteVideo(video.id)}>Delete</button
                >
              {/if}
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>
