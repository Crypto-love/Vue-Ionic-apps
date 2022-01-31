<template>
  <q-page>
    <q-tabs
      v-model="tab"
      dense
      class="bg-grey-3 text-grey-7"
      active-color="primary"
      indicator-color="purple"
      align="justify"
    >
      <q-tab name="tableView" label="Allocation Table" />
      <q-tab name="mapView" label="View on Map" />
    </q-tabs>

    <q-tab-panels v-model="tab" animated class="text-white">
      <q-tab-panel name="tableView">
        <q-form ref="form">
          <q-table
            class="q-mt-md tdots-table"
            :data="zones"
            :columns="columns"
            :loading="isLoading"
            virtual-scroll
            table-style="max-height: 400px"
            :pagination.sync="pagination"
            :rows-per-page-options="[0]"
          >
            <template v-slot:body-cell-driver="props">
              <q-td :props="props">
                <q-select
                  v-model="props.row.user_id"
                  @input="onValueChange()"
                  clearable
                  dense
                  outlined
                  :options="drivers"
                  option-label="name"
                  option-value="id"
                  map-options
                  emit-value
                  label="Select Driver"
                />
              </q-td>
            </template>
          </q-table>
        </q-form>
      </q-tab-panel>

      <q-tab-panel name="mapView">
        <gmap-map
          ref="gmap"
          map-type-id="roadmap"
          :center="center"
          :zoom="12"
          style="width: 100vw; height: 100vh"
          :options="{
            zoomControl: true,
            scaleControl: false,
            mapTypeControl: false,
            fullscreenControl: false,
            streetViewControl: false,
            disableDefaultUi: true,
            draggable: true,
            draggableCursor: true
          }"
        >
          <template #visible>
            <gmap-polygon v-if="paths.length > 0" :paths="paths" :editable="false" ref="polygon">
            </gmap-polygon>

            <gmap-marker
              v-for="(m, index) in markers"
              :key="index"
              :position="m"
              :clickable="true"
              :draggable="false"
            />
          </template>
        </gmap-map>
      </q-tab-panel>
    </q-tab-panels>
  </q-page>
</template>

<script>
import { gmapApi } from 'gmap-vue';
import { Api } from 'services';

export default {
  props: {
    value: {
      type: Object,
      required: true
    }
  },
  data: function () {
    return {
      isLoading: false,
      pagination: {
        rowsPerPage: 0
      },
      drivers: [],
      columns: [
        {
          name: 'zone',
          label: 'Zone',
          align: 'left',
          field: 'zone',
          sortable: true,
          style: 'width: 50px'
        },
        {
          name: 'points',
          label: 'Zone Points',
          align: 'left',
          field: 'points',
          sortable: true,
          style: 'width: 50px'
        },
        {
          name: 'items',
          label: 'Items',
          align: 'left',
          field: 'items',
          sortable: true,
          style: 'width: 50px'
        },
        {
          name: 'driver',
          label: 'Driver',
          align: 'left',
          field: 'driver',
          sortable: true
        }
      ],
      tab: 'tableView',
      markers: [],
      item: null,
      center: { lat: 1.355257, lng: 103.86788 },
      mapCenter: { lat: 4.5, lng: 99 },
      mapMode: null,
      toolbarPosition: 'TOP_CENTER',
      mapDraggable: true,
      mapCursor: null,
      paths: [],
      polygons: [],
      zones: []
    };
  },
  watch: {
    zones(v) {}
  },

  computed: {
    data: {
      get() {
        return this.value;
      },
      set(v) {
        this.$emit('input', v);
      }
    },
    date: {
      get() {
        return this.data.date;
      },
      set(v) {
        this.$set(this.data, 'date', v);
      }
    },
    mysqlDate() {
      return this.$dayjs(this.date).format('YYYY-MM-DD');
    },
    group_id() {
      return this.data.group_id;
    },
    tenant_id() {
      return this.data.tenant_id;
    }
  },

  async mounted() {
    await this.$gmapApiPromiseLazy();
    this.mapMode = 'edit';
    this.date = this.date || this.$dayjs().format('YYYY/MM/DD');
    this.getData();
  },

  components: {
    gmapApi
  },

  methods: {
    onValueChange() {
      const orders = [];
      this.zones.forEach((zone) => {
        zone.orders.forEach((order) => {
          orders.push({
            group_id: order.group_id,
            order_id: order.id,
            items_id: order.items_id,
            user_id: zone.user_id
          });
        });
      });

      const allocations = [];
      orders.forEach((order) => {
        order.items_id.forEach((id) => {
          allocations.push({
            order_item_id: id,
            user_id: order.user_id
          });
        });
      });
      this.$set(this.data, 'allocations', allocations);
    },
    async getData() {
      this.isLoading = true;
      await Promise.all([this.getGeoZones(), this.getOrders(), this.getDrivers()]);

      this.matchOrderToGeoZone();
      this.isLoading = false;
    },
    async getGeoZones() {
      const { data } = await Api.get('v_geofence_zones');
      this.paths = data.map((item) => item.paths);
      this.polygons = data;
    },
    async getOrders() {
      const { data } = await Api.get(
        'v_geo_consolidation_driver_allocation',
        `delivery_date = '${this.mysqlDate}' and group_id = ${this.group_id} and tenant_id=${this.tenant_id}`,
        null,
        'id'
      );
      this.orders = data;
      this.markers = this.orders.map((order) => order.latlng);
    },
    async getDrivers() {
      try {
        const { data } = await Api.get('v_users', `user_type_id = 9 and tenant_id=${this.tenant_id}`);
        this.drivers = data.map((v) => ({
          id: v.id,
          name: `${v.first_name} ${v.last_name}`
        }));
      } catch (error) {}
    },
    matchOrderToGeoZone() {
      this.orders.forEach((order) => {
        const { latlng } = order;
        if (latlng == null) {
          this.zones.push({
            index: null,
            zone: 'N/A',
            points: 1,
            items: order.items,
            orders: [order],
            user_id: null
          });
          return;
        }
        const point = new google.maps.LatLng(latlng.lat, latlng.lng);

        const zoneIndex = this.paths.findIndex((path) => {
          const polygon = new window.google.maps.Polygon({
            paths: path
          });
          return window.google.maps.geometry.poly.containsLocation(point, polygon);
        });
        if (zoneIndex === -1) {
          this.zones.push({
            index: null,
            zone: 'N/A',
            points: 1,
            items: order.items,
            orders: [order],
            user_id: null
          });
          return;
        }

        if (this.zones.length > 0 && this.zones.findIndex((zone) => zone.index === zoneIndex) !== -1) {
          const index = this.zones.findIndex((zone) => zone.index === zoneIndex);
          const zone = this.zones[index];
          const orders = zone.orders;
          const sameOrder = orders.findIndex((o) => o.customer_buyer_id === order.customer_buyer_id);
          orders.push(order);
          this.zones[index] = {
            ...zone,
            points: sameOrder === -1 ? zone.points + 1 : zone.points,
            items: zone.items + order.items,
            orders
          };
        } else {
          this.zones.push({
            index: zoneIndex,
            zone: this.polygons[zoneIndex].name,
            points: 1,
            items: order.items,
            orders: [order],
            user_id: null
          });
        }
      });
    }
  }
};
</script>
