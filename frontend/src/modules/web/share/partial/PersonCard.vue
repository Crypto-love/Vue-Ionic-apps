<template>
  <q-card :class="isSelected ? 'bg-grey-2' : ''">
    <q-list>
      <q-item class="q-pa-md">
        <q-item-section top avatar>
          <q-avatar rounded size="70px">
            <img
              :src="avatarUrl || 'https://treedots-statics.s3-ap-southeast-1.amazonaws.com/images/man.png'"
              alt="profile"
            />
          </q-avatar>
          <div class="text-center full-width q-mt-sm">
            <div class="text-bold text-caption">{{ code }}</div>
            <div class="text-bold text-caption">{{ role }}</div>
          </div>
        </q-item-section>

        <q-item-section top>
          <q-item-label class="text-bold">{{ name }}</q-item-label>
          <q-list dense class="q-mt-sm list">
            <q-item class="my-q-item" v-for="d in data" :key="d.text">
              <q-item-section avatar class="my-q-icon-section">
                <q-icon color="primary" :name="d.icon" />
              </q-item-section>
              <q-item-section>{{ d.text }}</q-item-section>
            </q-item>
          </q-list>
          <div class="q-mt-sm row justify-end">
            <q-btn class="action-button" outline color="primary" @click="onEdit">Edit</q-btn>
            <q-btn class="action-button q-ml-sm" outline color="negative" @click="onDelete">Delete</q-btn>
          </div>
        </q-item-section>
      </q-item>
    </q-list>
  </q-card>
</template>

<script>
/**
 * sample value for props.data
 * [
 *  { icon: '', text: '' }
 * ]
 */
export default {
  props: {
    isSelected: {
      type: Boolean,
      default: false
    },
    avatarUrl: {
      type: String,
      default: null
    },
    code: {
      type: String,
      default: ''
    },
    role: {
      type: String,
      default: ''
    },
    name: {
      type: String,
      default: ''
    },
    data: {
      type: Array,
      default: []
    }
  },
  methods: {
    onEdit() {
      this.$emit('on-edit-click');
    },
    onDelete() {
      this.$emit('on-delete-click');
    }
  }
};
</script>

<style scoped>
.grid-style-transition {
  transition: transform 0.28s, background-color 0.28s;
}
.action-button {
  border-radius: 14px;
}
.list {
  min-height: 50px;
}
</style>
