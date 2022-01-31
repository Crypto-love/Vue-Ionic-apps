<template>
  <q-drawer v-model="show" content-class="bg-white" :width="288" side="right">
    <q-scroll-area
      class="bg-white"
      style="height: 100%; border-right: 1px solid #ddd"
      :thumb-style="scrollThumbStyle"
      :content-style="scrollContentStyle"
      :content-active-style="scrollContentActiveStyle"
    >
      <div class="row q-px-md q-py-xl">
        <div class="my-col col-12">
          <stats-card
            icon="mdi-finance"
            color="green"
            title="Average Profit"
            subtitle="This Month"
            val="$80.00"
          />
          <stats-card
            icon="mdi-account-group"
            color="red"
            title="Total Buyers"
            subtitle="This Month"
            val="50"
          />
          <stats-card
            icon="mdi-ticket"
            color="magenta"
            title="Total Transactions"
            subtitle="This Month"
            val="$80.00"
          />
        </div>
      </div>
    </q-scroll-area>
  </q-drawer>
</template>

<script>
import StatsCard from './StatsCard';
export default {
  props: {
    value: {
      type: Boolean,
      default: false
    }
  },
  components: {
    StatsCard
  },
  data() {
    return {
      scrollContentStyle: {
        backgroundColor: 'rgba(0,0,0,0)',
        color: '#555'
      },
      scrollContentActiveStyle: {
        backgroundColor: '#ffffff',
        color: 'black'
      },
      scrollThumbStyle: {
        right: '2px',
        borderRadius: '5px',
        backgroundColor: 'white',
        width: '5px',
        opacity: 0.75
      },
      menus: [
        {
          label: 'Dashboard',
          icon: 'mdi-view-dashboard',
          to: '/main/dashboard'
        },
        {
          label: 'Products',
          icon: 'eva-archive-outline',
          to: null,
          children: [
            {
              label: 'All Products',
              to: '/main/products'
            },
            {
              label: 'Tag Products to Supplier',
              to: '/main/products/supplier-inventory'
            }
          ]
        },
        {
          label: 'Orders',
          icon: 'eva-shopping-bag-outline',
          to: '/main/orders'
        }
      ]
    };
  },
  computed: {
    show: {
      get() {
        return this.value;
      },
      set(val) {
        this.$emit('input', val);
      }
    }
  }
};
</script>
