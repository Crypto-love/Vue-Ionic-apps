<template>
  <div>
    <q-table
      :class="`${disabled && 'light-dimmed'} no-shadow`"
      :data="data"
      :columns="columns"
      row-key="name"
      dense
    >
      <template v-slot:top-left>
        <div class="text-weight-medium text-body1">People In Charge</div>
      </template>

      <template v-slot:top-right>
        <q-btn
          no-caps
          class="q-ml-md"
          size="11px"
          color="primary"
          @click="
            selectedItem = null;
            showForm = true;
          "
          :disable="disabled"
          >Add Person</q-btn
        >
      </template>
      <template v-slot:body-cell-name="props">
        <q-td :props="props">{{ props.row.first_name }} {{ props.row.last_name }}</q-td>
      </template>
      <template v-slot:body-cell-actions="props">
        <q-td :props="props">
          <q-icon
            name="eva-edit-outline"
            class="cursor-pointer"
            size="sm"
            @click="
              selectedItem = props.row;
              showForm = true;
            "
          />
        </q-td>
      </template>
      <template v-slot:body-cell-active="props">
        <q-td :props="props">
          <q-toggle
            :value="props.row.active"
            :true-value="1"
            :false-value="0"
            @input="toggleActive(props.row)"
          />
        </q-td>
      </template>
    </q-table>
    <q-dialog fixed v-model="showForm" persistent>
      <my-form :item="selectedItem" :keyContactExist="keyContactExist" @submit="onSubmit" />
    </q-dialog>
  </div>
</template>

<script>
import { Api, Notice } from 'services';
import MyForm from './PersonForm';
export default {
  components: {
    MyForm
  },
  props: {
    disabled: {
      type: Boolean,
      default: false
    },
    custId: {
      type: Number,
      default: null
    }
  },
  data() {
    return {
      showForm: false,
      selectedItem: null,
      data: [],
      keyContactExist: false,
      columns: [
        {
          name: 'name',
          label: 'PIC Name',
          align: 'left',
          field: 'name',
          sortable: true
        },
        {
          name: 'email',
          label: 'Email',
          align: 'left',
          field: 'email',
          sortable: true
        },
        {
          name: 'phone',
          label: 'Phone',
          align: 'left',
          field: 'phone',
          sortable: true
        },
        {
          name: 'actions',
          label: 'Actions',
          align: 'left',
          field: 'actions',
          sortable: true
        },
        {
          name: 'active',
          label: 'Active',
          align: 'left'
        }
      ]
    };
  },
  watch: {
    custId(v) {
      if (v) {
        this.getData();
      }
    }
  },
  methods: {
    async getData() {
      const res = await Api.get('persons', `customer_id = ${this.custId}`);
      this.data = [...res.data];

      this.checkKeyContact();
    },
    checkKeyContact() {
      this.keyContactExist = false;
      for (var person of this.data) {
        if (person.position == 'Key Contact') {
          this.keyContactExist = true;
          break;
        }
      }
    },
    async onSubmit(newData) {
      newData.customer_id = this.custId;

      this.$q.loading.show({
        message: newData.id ? 'Updating PIC...' : 'Creating PIC...'
      });

      const { status, message, data } = await Api.exec('p_add_person', [
        JSON.stringify(newData).replace(/'/g, '`')
      ]);

      this.$q.loading.hide();

      if (status) {
        /** Add or Update data to table */
        if (status && data.length > 0) {
          if (newData.id) {
            const idx = this.data.findIndex((v) => v.id === newData.id);
            this.$set(this.data, idx, data[0]);
          } else {
            this.data.push(data[0]);
          }
        }

        this.showForm = false;
        this.checkKeyContact();
      } else {
        Notice.fail(message);
      }
    },
    async toggleActive(row) {
      const newVal = row.active === 1 ? 0 : 1;
      try {
        const res = await Api.update('persons', { active: newVal }, row.id);
        row.active = newVal;
      } catch (error) {
        Notice.fail(error.message);
      }
    }
  }
};
</script>
