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



<!-- <template>
  <div class="container my-4">
    <div class="row g-4">
      <div class="col-md-6 col-lg-4">
        <div class="card shadow-sm">
          <div class="card-body">
            <TotalPieChart :totals="summary?.totals || {}" />
            <OrderProgress :totals="summary?.totals || {}" />

            <h5 class="card-title">Total Ordered</h5>
            <p class="display-6">{{ summary?.totals?.total_ordered || 0 }}</p>
            <div class="progress">
              <div class="progress-bar bg-success" role="progressbar"
                   :style="{ width: completion + '%' }">
                {{ completion }}%
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="col-md-6 col-lg-8">
        <div class="card shadow-sm">
          <div class="card-body">
            <h5 class="card-title">Order Summary by Region</h5>
            <RegionBarChart :data="regionData" />
          </div>
        </div>
      </div>

      <div class="col-md-6">
        <div class="card shadow-sm">
          <div class="card-body">
            <h5 class="card-title">Social Impact (Kenya)</h5>
            <p class="fw-bold">54 Full-time Female Staff</p>
            <p class="text-muted">We hire local women to plant trees and kelp, providing fair wages and consistent employment.</p>
          </div>
        </div>
      </div>

      <div class="col-md-6">
        <div class="card shadow-sm">
          <div class="card-body">
            <h5 class="card-title">Environmental Metrics</h5>
            <ul class="list-group list-group-flush">
              <li class="list-group-item">Trees CO₂ sequestered: {{ metrics?.trees_co2_sequestered_t }} t</li>
              <li class="list-group-item">Area restored: {{ metrics?.area_restored_ha }} ha</li>
              <li class="list-group-item">Food security change: {{ metrics?.food_security_change_percent }}%</li>
              <li class="list-group-item">Ocean area restored: {{ metrics?.ocean_area_restored_sqft }} sq ft</li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <UploadForm @uploaded="refresh" class="mt-4" />
  </div>
</template>

<script setup>
import { onMounted, computed } from 'vue';
import { useStore } from 'vuex';
import RegionBarChart from './RegionBarChart.vue';
import TotalPieChart from './TotalPieChart.vue';
import OrderProgress from './OrderProgress.vue';
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
</script> -->