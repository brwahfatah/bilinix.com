<script setup lang="ts">
import type { CreateTicketPayload, TicketDepartment, TicketPriority } from '../types/ticket'

const props = defineProps<{
  vpsOptions?: { value: string; label: string }[]
  loading?: boolean
}>()

const emit = defineEmits<{
  submit: [payload: CreateTicketPayload]
  cancel: []
}>()

const DEPARTMENT_OPTIONS = [
  { value: 'technical', label: 'Technical Support' },
  { value: 'billing',   label: 'Billing & Payments' },
  { value: 'sales',     label: 'Sales & Pre-sales' },
  { value: 'general',   label: 'General Enquiry' },
]

const PRIORITY_OPTIONS = [
  { value: 'low',    label: 'Low — general question' },
  { value: 'normal', label: 'Normal — service issue (non-critical)' },
  { value: 'high',   label: 'High — service degraded or inaccessible' },
  { value: 'urgent', label: 'Urgent — production down' },
]

const relatedVpsOptions = computed(() => [
  { value: '', label: 'Not related to a specific server' },
  ...(props.vpsOptions ?? []),
])

const form = ref({
  subject:             '',
  department:          'technical' as TicketDepartment,
  priority:            'normal' as TicketPriority,
  message:             '',
  relatedVpsId:        '',
})

const errors = ref({
  subject: '',
  message: '',
})

function validate(): boolean {
  errors.value.subject = form.value.subject.trim().length < 5
    ? 'Subject must be at least 5 characters.'
    : ''
  errors.value.message = form.value.message.trim().length < 20
    ? 'Message must be at least 20 characters.'
    : ''
  return !errors.value.subject && !errors.value.message
}

function handleSubmit() {
  if (!validate()) return

  const payload: CreateTicketPayload = {
    subject:    form.value.subject.trim(),
    department: form.value.department,
    priority:   form.value.priority,
    message:    form.value.message.trim(),
    ...(form.value.relatedVpsId
      ? { relatedServiceId: form.value.relatedVpsId, relatedServiceType: 'vps' as const }
      : {}),
  }
  emit('submit', payload)
}
</script>

<template>
  <form class="space-y-6" @submit.prevent="handleSubmit">

    <div class="grid gap-5 sm:grid-cols-2">
      <!-- Department -->
      <AppFormField for="department" label="Department" required>
        <AppSelect
          id="department"
          v-model="form.department"
          :options="DEPARTMENT_OPTIONS"
        />
      </AppFormField>

      <!-- Priority -->
      <AppFormField for="priority" label="Priority" required>
        <AppSelect
          id="priority"
          v-model="form.priority"
          :options="PRIORITY_OPTIONS"
        />
      </AppFormField>
    </div>

    <!-- Related VPS (optional) -->
    <AppFormField
      v-if="(vpsOptions?.length ?? 0) > 0"
      for="relatedVps"
      label="Related Server"
      hint="Optional — helps our team investigate faster."
    >
      <AppSelect
        id="relatedVps"
        v-model="form.relatedVpsId"
        :options="relatedVpsOptions"
      />
    </AppFormField>

    <!-- Subject -->
    <AppFormField for="subject" label="Subject" :error="errors.subject" required>
      <AppInput
        id="subject"
        v-model="form.subject"
        type="text"
        placeholder="Brief description of your issue"
        :error="!!errors.subject"
        @blur="validate"
      />
    </AppFormField>

    <!-- Message -->
    <AppFormField
      for="message"
      label="Message"
      :error="errors.message"
      hint="Include as much detail as possible — error messages, steps to reproduce, affected service IDs."
      required
    >
      <AppTextarea
        id="message"
        v-model="form.message"
        :rows="6"
        placeholder="Describe your issue in detail..."
        :error="!!errors.message"
      />
    </AppFormField>

    <!-- Actions -->
    <div class="flex items-center justify-end gap-3 border-t border-slate-100 pt-5 dark:border-slate-800">
      <AppButton type="button" variant="outline" @click="emit('cancel')">
        Cancel
      </AppButton>
      <AppButton type="submit" variant="primary" :loading="loading">
        {{ loading ? 'Submitting…' : 'Submit ticket' }}
      </AppButton>
    </div>

  </form>
</template>
