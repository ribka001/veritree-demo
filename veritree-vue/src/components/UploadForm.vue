<template>
  <div class="card shadow-sm">
    <div class="card-body">
      <h5 class="card-title">Upload Image</h5>
      <form @submit.prevent="submitForm">
        <div class="mb-3">
          <label for="region" class="form-label">Region</label>
          <select v-model="region" id="region" class="form-select">
            <option value="">-- Select Region --</option>
            <option v-for="r in regions" :key="r" :value="r">{{ r }}</option>
          </select>
        </div>

        <div class="mb-3">
          <label for="file" class="form-label">Image</label>
          <input type="file" id="file" class="form-control" @change="onFileChange" />
        </div>

        <button type="submit" class="btn btn-primary" :disabled="uploading">
          {{ uploading ? 'Uploading...' : 'Upload' }}
        </button>
      </form>

      <div v-if="message" class="alert alert-info mt-3">{{ message }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useStore } from 'vuex'

const store = useStore()
const file = ref(null)
const region = ref('')
const message = ref('')
const uploading = ref(false)

const regions = ['Mahabana', 'Kafrine', 'Sunshine Co.', 'Kwale']

function onFileChange(e) {
  file.value = e.target.files[0]
}

async function submitForm() {
  if (!file.value) {
    message.value = 'Please select a file.'
    return
  }
  uploading.value = true
  try {
    await store.dispatch('uploadImage', { file: file.value, region: region.value })
    message.value = 'Upload successful!'
  } catch (err) {
    console.error(err)
    message.value = 'Upload failed.'
  } finally {
    uploading.value = false
  }
}
</script>

<style scoped>
.upload-form {
  border: 1px solid #ccc;
  padding: 1rem;
  margin-top: 2rem;
}
</style>
