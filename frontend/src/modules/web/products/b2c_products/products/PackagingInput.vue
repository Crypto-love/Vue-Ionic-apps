<template>
  <div class="form-group q-mb-sm">
    <div class="form-label">
      {{ label }}
      <span class="require">*</span>
    </div>
    <div class="row">
      <div class="col">
        <q-input v-model="a" outlined dense lazy-rules :rules="[...numericRule, ...greaterRule]" />
      </div>
      <span style="margin-top: 8px; margin-left: 5px; margin-right: 5px">x</span>
      <div class="col">
        <q-input v-model="b" outlined dense lazy-rules :rules="[...numericRule, ...greaterRule]" />
      </div>
      <span style="margin-left: 5px; margin-right: 5px"></span>
      <div class="col">
        <q-select
          v-model="uom"
          :options="uoms"
          l
          lazy-rules
          :rules="[(v) => !!v || 'Please choose something']"
          outlined
          dense
        />
      </div>
    </div>
  </div>
</template>

<script>
import { Api, numeric, greaterThan } from 'services';
export default {
  props: {
    label: {
      type: String,
      default: 'Packaging'
    },
    value: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      a: null,
      b: null,
      uom: null,
      uoms: [],
      numericRule: numeric(),
      greaterRule: greaterThan(0)
    };
  },
  computed: {
    packaging: {
      get() {
        return this.value || '';
      },
      set(v) {
        this.$emit('input', v);
      }
    },
    formattedPackaging() {
      if (this.uom) {
        if (this.a && !this.b) {
          return `(${this.a} ${this.uom})`;
        }
        if (!this.a && this.b) {
          return `(${this.b} ${this.uom})`;
        }
        if (this.a && this.b) {
          return `(${this.a} x ${this.b} ${this.uom})`;
        }
        return `(${this.uom})`;
      }
      return null;
    }
  },
  watch: {
    formattedPackaging(v) {
      this.packaging = v;
    }
  },
  mounted() {
    this.getUoms().then(() => this.extractModel());
  },
  methods: {
    extractModel() {
      const regex = /[\(\)]|x\s/g;
      const res = this.packaging.replace(regex, '').split(' ');
      switch (res.length) {
        case 3:
          this.a = res[0] || null;
          this.b = res[1] || null;
          this.uom = res[2] || null;
          break;
        case 2:
          this.a = res[0] || null;
          this.uom = res[1] || null;
          break;
        case 1:
          this.uom = res[0] || null;
          break;
      }
    },
    async getUoms() {
      const { data } = await Api.get('uom', 'active = 1');
      this.uoms = data.map((v) => v.name);
    }
  }
};
</script>
