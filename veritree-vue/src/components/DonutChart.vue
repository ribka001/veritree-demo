<template>
  <div class="text-center">
    <h5>Total Ordered</h5>
    <h2>{{ ordered.toLocaleString() }}</h2>
    <div style="max-width: 300px; margin: auto;">
      <Doughnut :data="chartData" :options="chartOptions" />
      <div class="center-text">{{ percentage }}%</div>
    </div>
  </div>
</template>

<script setup>
import { Doughnut } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, ArcElement)

const props = defineProps({
  ordered: Number,
  planted: Number
})

const percentage = ((props.planted / props.ordered) * 100).toFixed(2)

const chartData = {
  labels: ['Planted', 'Remaining'],
  datasets: [
    {
      data: [props.planted, props.ordered - props.planted],
      backgroundColor: ['#4CAF50', '#e0e0e0'],
      borderWidth: 0
    }
  ]
}

const chartOptions = {
  cutout: '70%',
  plugins: {
    legend: { display: false },
    tooltip: { enabled: false }
  }
}
</script>

<style scoped>
.center-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 1.5rem;
  font-weight: bold;
}
</style>
