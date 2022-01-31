<template>
  <div class="row justify-center items-center">
    <div v-if="showInput === false">
      <q-btn
        flat
        round
        color="primary"
        @click="minOne"
        icon="eva-minus-circle"
        :disable="sample"
        style="display: inline-block"
      />
      <p @dblclick="onClick" style="display: inline-block">
        <strong>{{ num }}</strong>
      </p>
      <q-btn
        flat
        round
        color="primary"
        @click="addOne"
        icon="eva-plus-circle"
        :disable="sample || isB2CNotAbleToIncreaseQty"
        style="display: inline-block"
      />
    </div>
    <div v-else>
      <q-btn
        flat
        round
        color="primary"
        @click="cancelInput"
        icon="eva-close-circle"
        style="display: inline-block; color: red"
      />
      <q-input style="width: 60px; display: inline-block" type="number" v-model="tempvalue" dense autofocus />
      <q-btn
        flat
        round
        color="primary"
        @click="saveInput"
        icon="eva-checkmark-circle-2"
        style="display: inline-block"
      />
    </div>
  </div>
</template>

<script>
import debounce from 'lodash.debounce';
export default {
  props: {
    value: {
      type: Number,
      default: 0
    },
    /** we made a mistake when naming this props. it should be `disabled` */
    // TODO: Refactor this props and all components that use this to be `disabled`.
    sample: {
      type: Boolean,
      default: false
    },
    isB2CEdit: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      showInput: false,
      tempvalue: null,
      defaultQty: 0
    };
  },
  created() {
    this.defaultQty = this.value;
  },
  computed: {
    num: {
      get() {
        this.tempvalue = this.value;
        return this.value;
      },
      set(v) {
        this.tempvalue = v;
        this.$emit('input', v);
      }
    },
    isB2CNotAbleToIncreaseQty() {
      if (this.isB2CEdit && this.defaultQty === this.num) return true;
      else false;
    }
  },
  watch: {
    num: {
      handler: function (v) {
        this.$emit('change', v);
      }
    }
  },
  methods: {
    addOne() {
      this.num++;
    },
    minOne() {
      if (this.num <= 1) this.num = 1;
      else this.num--;
    },
    onClick() {
      this.showInput = true;
    },
    saveInput() {
      if (this.tempvalue && this.tempvalue != '') {
        let temp = Number(this.tempvalue);
        if (temp < 0) {
          this.num = 0;
        } else {
          this.num = temp;
        }
      } else {
        this.num = 0;
      }
      this.showInput = false;
    },
    cancelInput() {
      this.showInput = false;
    }
  }
};
</script>
