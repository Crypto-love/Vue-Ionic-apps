<template>
  <div class="q-pa-md">
    <q-table class="no-shadow" :data="data" :columns="columns" row-key="name" hide-bottom />
  </div>
</template>

<script>
export default {
  data() {
    return {
      columns: [
        {
          name: 'status',
          required: true,
          label: 'Status',
          align: 'left',
          field: (row) => row.status,
          format: (val) => `${val}`
        },
        { name: 'date', align: 'left', label: 'Date', field: 'date' },
        { name: 'user', align: 'left', label: 'User', field: 'user' },
        { name: 'details', align: 'left', label: 'Details', field: 'details' }
      ],
      data: [
        {
          status: 'PAID',
          date: '3 Jul 2020, 8.53 pm',
          user: 'Zhen Xuan New',
          details: 'Payment received from TPY Hub'
        },
        {
          status: 'APPROVED',
          date: '2 Jul 2020, 11.02 pm',
          user: 'System Generated',
          details: 'Received through the Xeori API from thetreedots'
        },
        {
          status: 'CREATED',
          date: '1 Jul 2020, 10.16 pm',
          user: 'System Generated',
          details: 'Received through the Xeori API from thetreedots'
        }
      ]
    };
  }
};
</script>
