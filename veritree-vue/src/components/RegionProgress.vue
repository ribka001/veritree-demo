<template>
  <div class="card p-4">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h5 class="mb-0">Order Summary</h5>
    </div>

    <div v-for="region in regions" :key="region.region" class="mb-4">
      <div class="d-flex justify-content-between">
        <div>
          <strong>{{ region.region }}</strong>
          <div class="text-muted small"></div>
        </div>
        <div class="text-end text-muted small">
          {{ region.planted.toLocaleString() }} / {{ region.ordered.toLocaleString() }}
        </div>
      </div>

      <div class="progress mt-2" style="height: 20px;">
        <div
          class="progress-bar bg-success"
          role="progressbar"
          :style="{ width: region.percentage + '%' }"
          :aria-valuenow="region.percentage"
          aria-valuemin="0"
          aria-valuemax="100"
        >
          {{ region.percentage }}%
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  data: { type: Array, required: true }
})

const regions = computed(() =>
  props.data.map(r => ({
    region: r.region,
    country: r.region.split(', ')[1] || '',
    planted: r.planted,
    ordered: r.ordered,
    percentage: r.ordered ? ((r.planted / r.ordered) * 100).toFixed(2) : '0.00'
  }))
)
</script>
