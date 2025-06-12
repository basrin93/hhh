// stores/shared/statusGroup.ts
import { ref } from 'vue'

export const currentStatusGroup = ref<'Active' | 'Archive'>('Active')