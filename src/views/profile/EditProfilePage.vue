<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import BaseButtonSecondary from "@/components/base/BaseButtonSecondary.vue";
import BaseButtonPrimary from "@/components/base/BaseButtonPrimary.vue";
import EditProfileForm from "@/components/profile/EditProfileForm.vue";
import ConfirmationModal from "@/components/modals/ConfirmModal.vue";
import ProfilePreviewPopUp from "@/components/modals/ProfilePreviewPopUp.vue";
import { deleteMyAccount } from "@/views/profile/profileApi";

const router = useRouter();
const isDeleteModalOpen = ref(false);
const isProfilePreviewOpen = ref(false);
const editProfileFormRef = ref(null);
const deleteError = ref("");
const deleting = ref(false);

function goToPreviewProfile() {
  if (window.matchMedia("(min-width: 1024px)").matches) {
    isProfilePreviewOpen.value = true;
    return;
  }
  router.push({ name: "preview-profile" });
}

function openDeleteModal() {
  isDeleteModalOpen.value = true;
}

function closeDeleteModal() {
  isDeleteModalOpen.value = false;
}

async function confirmDeleteAccount() {
  if (deleting.value) return;
  deleteError.value = "";
  deleting.value = true;
  try {
    const token = localStorage.getItem("token") ?? "";
    await deleteMyAccount(token);
    localStorage.removeItem("token");
    isDeleteModalOpen.value = false;
    router.push("/");
  } catch (e) {
    deleteError.value = e instanceof Error ? e.message : "Delete account failed";
    isDeleteModalOpen.value = false;
  } finally {
    deleting.value = false;
  }
}

function updateProfile() {
  editProfileFormRef.value?.submitUpdate?.();
}
</script>

<template>
  <main class="min-h-dvh bg-gray-100 px-4 pt-5 pb-12 lg:bg-white lg:px-10 lg:pt-10">
    <section class="mx-auto w-full max-w-[390px] flex flex-col gap-10 lg:max-w-[930px]">
      <p
        v-if="deleteError"
        class="rounded-lg border border-red-200 bg-red-100 px-3 py-2 body2 text-red-700"
        role="alert"
      >
        {{ deleteError }}
      </p>
      <div class="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
        <div class="flex flex-col gap-2">
          <p class="tagline-profile text-beige-700">PROFILE</p>
          <h1 class="headline3 text-purple-500 profile-let-make-profile">
            Let’s make profile <br />
            to let others know you
          </h1>
        </div>
        <div class="mt-5 hidden items-center justify-between gap-3 lg:mt-0 lg:flex lg:min-w-[320px] lg:justify-end">
          <BaseButtonSecondary show-arrow @click="goToPreviewProfile"
            >Preview Profile</BaseButtonSecondary
          >
          <BaseButtonPrimary @click="updateProfile">Update Profile</BaseButtonPrimary>
        </div>
      </div>
      <EditProfileForm ref="editProfileFormRef" @delete-account="openDeleteModal">
        <template #mobile-actions>
          <div class="flex items-center justify-between gap-3">
            <BaseButtonSecondary show-arrow @click="goToPreviewProfile"
              >Preview Profile</BaseButtonSecondary
            >
            <BaseButtonPrimary @click="updateProfile">Update Profile</BaseButtonPrimary>
          </div>
        </template>
      </EditProfileForm>
    </section>

    <ProfilePreviewPopUp
      :open="isProfilePreviewOpen"
      @close="isProfilePreviewOpen = false"
    />

    <ConfirmationModal
      :open="isDeleteModalOpen"
      title="Delete Confirmation"
      message="Do you sure to delete account?"
      confirm-text="Yes, I want to delete"
      cancel-text="No, I don’t"
      @close="closeDeleteModal"
      @confirm="confirmDeleteAccount"
    />
  </main>
</template>
