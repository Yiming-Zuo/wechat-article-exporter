<script setup lang="ts">
import dayjs from 'dayjs';
import type { PropType } from 'vue';
import type { Preferences } from '~/types/preferences';

const props = defineProps({
  syncDateRange: {
    type: String as PropType<Preferences['syncDateRange']>,
    required: true,
  },
  syncDatePoint: {
    type: Number,
    required: true,
  },
});

const emit = defineEmits<{
  confirm: [{ syncDateRange: Preferences['syncDateRange']; syncDatePoint: number }];
  cancel: [];
}>();

const modal = useModal();
const { getActualDateRange, getSelectOptions } = useSyncDeadline();

const currentRange = ref<Preferences['syncDateRange']>(props.syncDateRange);
const currentPoint = ref<number>(props.syncDatePoint);

const durationOptions = getSelectOptions();
const actualDateRange = computed(() =>
  getActualDateRange({
    syncDateRange: currentRange.value,
    syncDatePoint: currentPoint.value,
  })
);

function closeModal() {
  modal.close();
}

function onCancel() {
  emit('cancel');
  closeModal();
}

function onConfirm() {
  emit('confirm', {
    syncDateRange: currentRange.value,
    syncDatePoint: currentPoint.value,
  });
  closeModal();
}

function formatDate() {
  return dayjs.unix(currentPoint.value).format('YYYY-MM-DD');
}
</script>

<template>
  <UModal prevent-close>
    <UCard>
      <template #header>
        <h2 class="text-lg font-semibold">选择本次同步范围</h2>
        <UButton
          square
          variant="link"
          color="gray"
          icon="i-lucide:x"
          class="absolute right-3 top-3"
          @click="onCancel"
        />
      </template>

      <div class="space-y-4">
        <p class="text-sm text-slate-500">本次选择仅作用于当前同步，不会修改默认同步范围。</p>
        <p class="text-sm text-blue-500 font-medium">本次同步范围: {{ actualDateRange }}</p>

        <div class="flex gap-3">
          <USelectMenu
            class="w-1/2"
            v-model="currentRange"
            :options="durationOptions"
            value-attribute="value"
            option-attribute="label"
          />
          <UPopover v-if="currentRange === 'point'" :popper="{ placement: 'bottom-start' }">
            <UButton color="gray" icon="i-heroicons-calendar-days-20-solid" :label="formatDate()" />

            <template #panel="{ close }">
              <BaseDatePicker v-model="currentPoint" is-required @close="close" />
            </template>
          </UPopover>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end space-x-3">
          <UButton color="white" class="px-3" @click="onCancel">取消</UButton>
          <UButton color="black" class="px-3" @click="onConfirm">开始同步</UButton>
        </div>
      </template>
    </UCard>
  </UModal>
</template>
