<script setup>
import { onMounted, computed } from 'vue';
import { useStore } from 'vuex';
import DonutChart from './DonutChart.vue';
import RegionProgress from './RegionProgress.vue';
import UploadForm from './UploadForm.vue';

const store = useStore();
onMounted(() => store.dispatch('fetchSummary'));

const summary = computed(() => store.state.summary);
const metrics = computed(() => summary.value?.metrics);
const completion = computed(() => {
  const tot = summary.value?.totals;
  if (!tot) return 0;
  const planted = tot.total_planted || 0;
  const ordered = tot.total_ordered || 1;
  return Math.round((planted / ordered) * 100);
});
const regionData = computed(() => (summary.value?.byRegion || []).map(r => ({
  region: r.region,
  planted: r.planted,
  ordered: r.ordered
})));
function refresh() { store.dispatch('fetchSummary'); }
</script>

<template>
  <div class="container py-5">
    <div class="row g-4">
      <!-- Left: Donut Chart -->
      <div class="col-md-5">
        <div class="card p-4 text-center">
          <DonutChart
            v-if="summary?.totals"
            :ordered="summary.totals.ordered"
            :planted="summary.totals.planted"
          />
        </div>
      </div>

      <!-- Right: Region Progress -->
      <div class="col-md-7">
        <RegionProgress :data="regionData" />
      </div>
    </div>
    <UploadForm @uploaded="refresh" class="mt-4" />
  </div>
</template>