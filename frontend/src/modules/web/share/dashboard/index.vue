<template>
  <q-page padding style="background: #f4f6f8">
    <div v-if="isSuperAdmin || isAdmin">
      <div class="text-h5 q-my-md">Dashboard</div>
      <div class="row q-mb-sm">
        <div class="col-md-3 col-sm-6 q-mb-sm">
          <div class="d-card">
            <h4 class="title">Sales</h4>
            <q-skeleton type="text" class="price" v-if="!infographicsData.cardsData.sales.loaded" />
            <div data-cy="dashboard-sales" class="price" v-if="infographicsData.cardsData.sales.loaded">
              {{
                infographicsData.cardsData.sales.value ? `$ ${infographicsData.cardsData.sales.value}` : '-'
              }}
            </div>
            <img
              class="icon"
              src="https://treedots-statics.s3-ap-southeast-1.amazonaws.com/images/wallet.png"
            />
          </div>
        </div>
        <div class="col-md-3 col-sm-6 q-mb-sm">
          <div class="d-card">
            <h4 class="title">Orders</h4>
            <q-skeleton type="text" class="price" v-if="!infographicsData.cardsData.orders.loaded" />
            <div data-cy="dashboard-orders" class="price" v-if="infographicsData.cardsData.orders.loaded">
              {{ infographicsData.cardsData.orders.value ? infographicsData.cardsData.orders.value : '-' }}
            </div>
            <img
              class="icon"
              src="https://treedots-statics.s3-ap-southeast-1.amazonaws.com/images/checklist.png"
            />
          </div>
        </div>
        <div class="col-md-3 col-sm-6 q-mb-sm">
          <div class="d-card">
            <h4 class="title">Customers</h4>
            <q-skeleton type="text" class="price" v-if="!infographicsData.cardsData.customers.loaded" />
            <div
              data-cy="dashboard-customers"
              class="price"
              v-if="infographicsData.cardsData.customers.loaded"
            >
              {{
                this.infographicsData.cardsData.customers.value
                  ? this.infographicsData.cardsData.customers.value
                  : '-'
              }}
            </div>
            <img
              class="icon"
              src="https://treedots-statics.s3-ap-southeast-1.amazonaws.com/images/group.png"
            />
          </div>
        </div>
        <div class="col-md-3 col-sm-6 q-mb-sm">
          <div class="d-card">
            <h4 class="title">Products</h4>
            <q-skeleton type="text" class="price" v-if="!infographicsData.cardsData.products.loaded" />
            <div data-cy="dashboard-products" class="price" v-if="infographicsData.cardsData.products.loaded">
              {{
                infographicsData.cardsData.products.value ? infographicsData.cardsData.products.value : '-'
              }}
            </div>
            <img
              class="icon"
              src="https://treedots-statics.s3-ap-southeast-1.amazonaws.com/images/inbound.png"
            />
          </div>
        </div>
      </div>
      <div class="row q-mb-md" v-if="isAdmin">
        <div class="col col-md-7 q-mb-sm">
          <div class="d-card">
            <div>
              <h4 class="roboto-medium chart-title">Sales</h4>
              <div class="roboto-regular chart-desc">Detailed income earned from the last 7 days.</div>
            </div>
            <q-skeleton height="450px" v-if="!infographicsData.chartsData.totalSales.loaded" square />
            <line-chart
              data-cy="dashboard-chart"
              v-if="infographicsData.chartsData.totalSales.loaded"
              :chartData="infographicsData.chartsData.totalSales.chartData"
              :options="infographicsData.chartsData.totalSales.chartOptions"
              :key="1"
            />
          </div>
        </div>
        <div class="col col-md-5 q-mb-sm">
          <div class="d-card">
            <div>
              <h4 class="roboto-medium announcement-title">Announcement</h4>
              <div class="roboto-regular announcement-desc">There are several announcement lists.</div>
              <div v-if="!announcementsData.loaded" class="list-skeleton">
                <ListSkeleton />
              </div>
              <q-list v-if="announcementsData.loaded" class="announcement-list">
                <q-item v-if="announcementsData.data.length === 0">
                  <q-item-section>
                    <q-item-label>No Announcement</q-item-label>
                  </q-item-section>
                </q-item>
                <q-item v-for="announcement in announcementsData.data" :key="announcement.id">
                  <q-item-section side>
                    <div class="text-center announcement-date">
                      <q-icon name="eva-calendar-outline" />
                      <q-item-label caption>{{
                        $dayjs(announcement.created_at).format('DD/MM')
                      }}</q-item-label>
                    </div>
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>{{ announcement.title }}</q-item-label>
                    <q-item-label caption lines="3">
                      {{ announcement.content }}
                    </q-item-label>
                    <span
                      class="read-more"
                      @click="
                        showDetailAnnouncement = true;
                        detailedAnnouncementData = announcement;
                      "
                    >
                      Read More
                    </span>
                  </q-item-section>
                </q-item>
              </q-list>
            </div>
          </div>
        </div>
      </div>
      <q-dialog class="announcement-details" v-model="showDetailAnnouncement" persistent>
        <q-card>
          <q-card-section class="row items-center q-pa-lg">
            <div class="text-h6">
              {{ detailedAnnouncementData.title ? detailedAnnouncementData.title : 'No Title' }}
            </div>
            <q-space />
            <q-btn icon="close" color="primary" flat round dense v-close-popup />
          </q-card-section>
          <q-card-section class="scroll q-pa-sm q-pb-lg">
            {{ detailedAnnouncementData.content ? detailedAnnouncementData.content : 'No Content' }}
          </q-card-section>
        </q-card>
      </q-dialog>
    </div>
    <div v-else>
      <div class="text-h5 q-my-md">&nbsp;</div>
      <div class="row q-mb-sm">
        <div class="text-h5 q-my-md">Welcome!</div>
      </div>
    </div>
  </q-page>
</template>

<script>
import LineChart from './Chart.js';
import ListSkeleton from './ListSkeleton';
import { Api } from 'services';

export default {
  components: {
    ListSkeleton,
    LineChart
  },
  data() {
    return {
      showDetailAnnouncement: false,
      detailedAnnouncementData: {
        title: null,
        content: null
      },
      infographicsData: {
        cardsData: {
          sales: {
            loaded: false,
            value: null
          },
          orders: {
            loaded: false,
            value: null
          },
          customers: {
            loaded: false,
            value: null
          },
          products: {
            loaded: false,
            value: null
          }
        },
        chartsData: {
          totalSales: {
            loaded: false,
            chartData: {
              labels: null,
              datasets: [
                {
                  label: 'Total Sales ($) ',
                  data: null,
                  fill: false,
                  borderColor: '#04565a',
                  radius: 5,
                  pointStyle: 'circle',
                  lineTension: 0
                }
              ]
            },
            chartOptions: {
              position: 'relative',
              height: `300px`,
              responsive: true,
              maintainAspectRatio: false,
              legend: false,
              scales: {
                yAxes: [
                  {
                    ticks: {
                      callback: (value, index, values) => {
                        return `$ ${value}`;
                      },
                      padding: 10,
                      fontColor: '#000'
                    },
                    gridLines: {
                      drawTicks: false
                    }
                  }
                ]
              }
            }
          }
        }
      },
      announcementsData: {
        data: null,
        loaded: false
      }
    };
  },
  mounted() {
    this.getDashboardData();
  },
  computed: {
    isSuperAdmin() {
      return this.$store.state.user_type_id === 1;
    },
    isAdmin() {
      return this.$store.state.user_type_id === 2;
    }
  },
  watch: {},
  methods: {
    async getDashboardData() {
      const tenantID = this.$store.state.tenant_id;
      const dataToSend = {};
      dataToSend.tenant_id = tenantID;
      dataToSend.start_date = null;
      dataToSend.end_date = null;
      try {
        const res = await this.$api.exec(
          'p_dashboard_infographic_products',
          [JSON.stringify(dataToSend).replace(/'/g, '`')],
          'read'
        );
        this.infographicsData.cardsData.products.value = res.data[0].value;
        this.infographicsData.cardsData.products.loaded = true;
      } catch (error) {}
      try {
        const res = await this.$api.exec(
          'p_dashboard_infographic_sales',
          [JSON.stringify(dataToSend).replace(/'/g, '`')],
          'read'
        );
        this.infographicsData.cardsData.sales.value = res.data[0].value;
        this.infographicsData.cardsData.sales.loaded = true;
      } catch (error) {}
      try {
        const res = await this.$api.exec('p_dashboard_infographic_orders', [
          JSON.stringify(dataToSend).replace(/'/g, '`')
        ]);
        this.infographicsData.cardsData.orders.value = res.data[0].value;
        this.infographicsData.cardsData.orders.loaded = true;
      } catch (error) {}
      try {
        const res = await this.$api.exec(
          'p_dashboard_infographic_customers',
          [JSON.stringify(dataToSend).replace(/'/g, '`')],
          'read'
        );
        this.infographicsData.cardsData.customers.value = res.data[0].value;
        this.infographicsData.cardsData.customers.loaded = true;
      } catch (error) {}
      try {
        const currentDate = this.$dayjs();
        const lastWeekDate = this.$dayjs().subtract(7, 'day');
        dataToSend.start_date = this.$dayjs(lastWeekDate).format('YYYY-MM-DD HH:mm:ss');
        dataToSend.end_date = this.$dayjs(currentDate).format('YYYY-MM-DD HH:mm:ss');
        const res = await this.$api.exec(
          'p_dashboard_infographic_sales_chart',
          [JSON.stringify(dataToSend).replace(/'/g, '`')],
          'read'
        );
        const responseData = res.data;
        const arrayOfLabels = responseData.map(({ date }) => this.$dayjs(date).format('DD MMMM YYYY'));
        const arrayOfValue = responseData.map(({ value }) => Number(value));
        this.infographicsData.chartsData.totalSales.chartData.labels = arrayOfLabels;
        this.infographicsData.chartsData.totalSales.chartData.datasets[0].data = arrayOfValue;
        this.infographicsData.chartsData.totalSales.loaded = true;
      } catch (error) {}
      try {
        const { data } = await Api.get('v_dashboard_announcement', null, null, 'id desc', 4);
        this.announcementsData.data = data;
        this.announcementsData.loaded = true;
      } catch (error) {}
    }
  }
};
</script>
<style scoped>
.d-card {
  position: relative;
  background: #ffffff;
  padding: 1rem;
  border-radius: 0.5rem;
}
.d-card .title {
  font-size: 1rem;
  font-weight: 500;
  color: #04001a;
  line-height: normal;
  margin: 0;
  margin-bottom: 10px;
}
.d-card .price {
  font-weight: 500;
  font-size: 1.5rem;
}
.d-card .icon {
  position: absolute;
  right: 10px;
  top: 10px;
  width: 38px;
  height: auto;
}
.td-chartjs {
  background: #ffffff;
}
#line-chart {
  height: 300px !important;
}
.chart-title {
  font-size: 1.125rem;
  line-height: normal;
  padding: 0 0 0 1rem;
  margin: 0 0 0.135rem 0;
}
.chart-desc {
  color: #010219;
  font-size: 1rem;
  padding: 0 0 0 1rem;
  margin: 0 0 1rem 0;
}
.announcement-title {
  font-size: 1.125rem;
  line-height: normal;
  padding: 0;
  margin: 0 0 0.135rem 0;
}
.announcement-desc {
  color: #010219;
  font-size: 1rem;
  padding: 0;
  margin: 0 0 1rem 0;
}

.announcement-date {
  background-color: #f6f8fb;
  color: #010219;
  padding: 0.25rem;
}
.list-skeleton {
  height: 450px;
  overflow-y: auto;
}
.announcement-list {
  height: 400px;
  overflow-y: auto;
}
.announcement-list .read-more {
  color: #04565a;
}

.announcement-details .scroll {
  max-height: 50vh;
}

.row {
  margin-right: -10px;
  margin-left: -10px;
}
.col,
.col-1,
.col-2,
.col-3,
.col-4,
.col-5,
.col-6,
.col-7,
.col-8,
.col-9,
.col-10,
.col-11,
.col-12,
.col-auto,
.col-lg,
.col-lg-1,
.col-lg-2,
.col-lg-3,
.col-lg-4,
.col-lg-5,
.col-lg-6,
.col-lg-7,
.col-lg-8,
.col-lg-9,
.col-lg-10,
.col-lg-11,
.col-lg-12,
.col-lg-auto,
.col-md,
.col-md-1,
.col-md-2,
.col-md-3,
.col-md-4,
.col-md-5,
.col-md-6,
.col-md-7,
.col-md-8,
.col-md-9,
.col-md-10,
.col-md-11,
.col-md-12,
.col-md-auto,
.col-sm,
.col-sm-1,
.col-sm-2,
.col-sm-3,
.col-sm-4,
.col-sm-5,
.col-sm-6,
.col-sm-7,
.col-sm-8,
.col-sm-9,
.col-sm-10,
.col-sm-11,
.col-sm-12,
.col-sm-auto,
.col-xl,
.col-xl-1,
.col-xl-2,
.col-xl-3,
.col-xl-4,
.col-xl-5,
.col-xl-6,
.col-xl-7,
.col-xl-8,
.col-xl-9,
.col-xl-10,
.col-xl-11,
.col-xl-12,
.col-xl-auto {
  padding-right: 10px;
  padding-left: 10px;
}
</style>
