<script setup lang="ts">
import { XIcon } from 'lucide-vue-next';
import type { PropType } from 'vue';

const props = defineProps({
    selectedCategories: {
        type: Array as PropType<string[]>,
        required: true
    },
    categories: {
        type: Array as PropType<{ id: string; name: string; active: boolean }[]>,
        required: true
    }
});

defineEmits(['update:selectedCategories']);

const emit = defineEmits(['update:selectedCategories']);

const toggleCategory = (categoryId: string) => {
    const currentSelected = props.selectedCategories;
    const index = currentSelected.indexOf(categoryId);

    if (index === -1) {
        emit('update:selectedCategories', [...currentSelected, categoryId]);
    } else {
        emit('update:selectedCategories', currentSelected.filter(id => id !== categoryId));
    }
};
</script>