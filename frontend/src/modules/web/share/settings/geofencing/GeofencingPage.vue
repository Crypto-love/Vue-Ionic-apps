<template>
  <q-page>
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
        <gmap-polygon
          v-if="paths.length > 0"
          :paths="paths"
          :editable="true"
          @click="onPolygonClick($event)"
          @paths_changed="onPathsChanged($event)"
          ref="polygon"
        >
        </gmap-polygon>

        <gmap-drawing-manager
          v-if="mapMode === 'edit'"
          :position="toolbarPosition"
          :polygon-options="polygonOptions"
          :shapes="shapes"
        >
          <template v-slot="on">
            <drawing-toolbar
              @drawingmode_changed="on.setDrawingMode($event)"
              @delete_selection="on.deleteSelection()"
            />
          </template>
        </gmap-drawing-manager>
      </template>
    </gmap-map>
    <q-dialog v-model="showForm" persistent>
      <my-form
        :item="item"
        :polygonPaths="polygonPaths"
        @add-complete="onAddComplete"
        @edit-complete="onEditComplete"
      />
    </q-dialog>
  </q-page>
</template>

<script>
import { gmapApi } from 'gmap-vue';
import MyForm from './Form.vue';
import DrawingToolbar from './DrawingToolbar';
import { Api, Notice } from 'services';

export default {
  data: function () {
    return {
      item: null,
      showForm: false,
      center: { lat: 1.355257, lng: 103.86788 },
      mapCenter: { lat: 4.5, lng: 99 },
      mapMode: null,
      toolbarPosition: 'TOP_CENTER',
      mapDraggable: true,
      mapCursor: null,
      paths: [],
      shapes: [],
      polygonPaths: [],
      zones: [],
      polygonOptions: {
        fillColor: '#777',
        fillOpacity: 0.4,
        strokeWeight: 2,
        strokeColor: '#999',
        draggable: true,
        editable: true,
        clickable: true
      }
    };
  },

  watch: {
    mapMode(newMode, oldMode) {
      if (newMode === 'ready') {
        if (oldMode === 'edit') {
          this.mapDraggable = true;
          this.mapCursor = null;
          return;
        }
      }

      if (newMode === 'edit') {
        this.mapDraggable = false;
        this.mapCursor = 'default';
      }
    },
    shapes(newshapes, oldshapes) {
      if (newshapes.length >= 1) {
        const shape = newshapes[newshapes.length - 1];

        const vertices = shape.overlay.getPath();

        const polygonPaths = [];
        // Iterate over the vertices.
        for (let i = 0; i < vertices.getLength(); i++) {
          const xy = vertices.getAt(i);
          polygonPaths.push({ lat: xy.lat(), lng: xy.lng() });
        }
        this.item = null;
        this.polygonPaths = polygonPaths;
        this.showForm = true;
      }
    }
  },

  async mounted() {
    await this.$gmapApiPromiseLazy();
    this.mapMode = 'edit';
    this.getData();
  },

  components: {
    gmapApi,
    MyForm,
    DrawingToolbar
  },

  methods: {
    async getData() {
      const { data } = await Api.get('v_geofence_zones');
      this.paths = data.map((item) => item.paths);
      this.zones = data;
    },
    async onAddComplete(newData) {
      const res = await Api.add('geofence_zones', newData);
      if (res.status) {
        Notice.ok('New geofence zone added');
        const shape = this.shapes[0];
        shape.overlay.setMap(null);
        this.shapes = [];
        this.getData();
        this.showForm = false;
      } else {
        Notice.fail(res.message);
      }
    },
    async onEditComplete(updateData) {
      const res = await this.$api.update('geofence_zones', updateData, updateData.id);
      if (res.status) {
        Notice.ok('Geofence zone updated');
        this.getData();
        this.showForm = false;
      } else {
        Notice.fail(res.message);
      }
    },
    onPolygonClick(event) {
      if (Number.isInteger(event.path)) {
        this.item = this.zones[event.path];
        this.polygonPaths = this.paths[event.path];
        this.showForm = true;
      }
    },
    onPathsChanged(mvcArray) {
      const paths = [];
      for (let i = 0; i < mvcArray.getLength(); i++) {
        const path = [];
        for (let j = 0; j < mvcArray.getAt(i).getLength(); j++) {
          const point = mvcArray.getAt(i).getAt(j);
          path.push({ lat: point.lat(), lng: point.lng() });
        }
        paths.push(path);
      }
      this.paths = paths;
    }
  }
};
</script>
