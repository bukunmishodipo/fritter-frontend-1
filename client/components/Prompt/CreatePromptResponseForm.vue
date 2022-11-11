<!-- Form for creating prompt response (block style) -->

<script>
import BlockForm from '@/components/common/BlockForm.vue';

export default {
  name: 'CreatePromptResponseForm',
  mixins: [BlockForm],
  data() {
    return {
      url: '/api/prompts',
      method: 'POST',
      hasBody: true,
      fields: [
        {id: 'content', label: 'Content', value: ''}
      ],
      title: 'Prompt of the Week: Favorurite Song?',
      refreshPromptResponses: true,
      callback: () => {
        const message = 'Successfully created a prompt response!';
        this.$set(this.alerts, message, 'success');
        setTimeout(() => this.$delete(this.alerts, message), 3000);
      }
    };
  }
};
</script>
