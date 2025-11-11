import { createStore } from 'vuex';
import axios from 'axios';

export default createStore({
  state: { summary: null, uploading: false },
  actions: {
    async fetchSummary({ commit }) {
      const { data } = await axios.get(import.meta.env.VITE_API_BASE + '/summary');
      commit('setSummary', data);
    },
    async uploadImage({ dispatch }, { file, region }) {
      const form = new FormData();
      form.append('image', file);
      if (region) form.append('region', region);
        await axios.post(import.meta.env.VITE_API_BASE + '/upload', form)
      await dispatch('fetchSummary');
    }
  },
  mutations: {
    setSummary(state, s) { state.summary = s; },
    setUploading(state, v) { state.uploading = v; }
  }
});
