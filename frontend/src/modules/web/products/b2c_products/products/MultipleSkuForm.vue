<template>
  <form-dialog title="Generate SKU" class="multiple-sku modal-xl">
    <q-form>
      <div class="row justify-between q-col-gutter-md">
        <div class="col-sm-4">
          <div class="row justify-between q-col-gutter-md">
            <q-select
              outlined
              stack-label
              label="#1 Freshness"
              class="col-xs-6 field-input"
              multiple
              use-chips
              v-model="freshness"
              :options="ofreshness"
            />
            <q-select
              outlined
              stack-label
              label="#2 Product *"
              class="col-xs-6 field-input"
              clearable
              v-model="product"
              :options="oproduct"
            />
          </div>
          <div class="row justify-between q-col-gutter-md">
            <q-select
              outlined
              stack-label
              label="#3 Size"
              class="col-xs-6 field-input"
              multiple
              use-chips
              v-model="size"
              :options="osize"
            />
            <q-select
              outlined
              stack-label
              label="#4 Spec A"
              class="col-xs-6 field-input"
              multiple
              use-chips
              v-model="spec_a"
              :options="ospec_a"
            />
          </div>
          <div class="row justify-between q-col-gutter-md">
            <q-select
              outlined
              stack-label
              label="#5 Spec B"
              class="col-xs-6 field-input"
              multiple
              use-chips
              v-model="spec_b"
              :options="ospec_b"
            />
            <q-select
              outlined
              stack-label
              label="#6 Spec C"
              class="col-xs-6 field-input"
              multiple
              use-chips
              v-model="spec_c"
              :options="ospec_c"
            />
          </div>
          <div class="row justify-between q-col-gutter-md">
            <q-select
              outlined
              stack-label
              label="#7 Spec D"
              class="col-xs-6 field-input"
              multiple
              use-chips
              v-model="spec_d"
              :options="ospec_d"
            />
            <q-select
              outlined
              stack-label
              label="#8 Spec E"
              class="col-xs-6 field-input"
              multiple
              use-chips
              v-model="spec_e"
              :options="ospec_e"
            />
          </div>
          <div class="row justify-between q-col-gutter-md">
            <q-select
              outlined
              stack-label
              label="#9 Brand"
              class="col-xs-6 field-input"
              multiple
              use-chips
              v-model="brand"
              :options="obrand"
            />
            <q-select
              outlined
              stack-label
              label="#10 Origin"
              class="col-xs-6 field-input"
              multiple
              use-chips
              v-model="origin"
              :options="oorigin"
            />
          </div>
          <div class="row justify-between q-col-gutter-md">
            <q-select
              outlined
              stack-label
              label="#11 Packaging"
              class="col-xs-6 field-input"
              multiple
              use-chips
              v-model="packaging"
              :options="opackaging"
            />
            <q-select
              outlined
              stack-label
              label="#12 OOM*"
              class="col-xs-6 field-input"
              clearable
              v-model="oom"
              :options="ooom"
            />
          </div>
          <div class="row justify-between q-col-gutter-md">
            <q-select
              outlined
              stack-label
              label="#13 Halal"
              class="col-xs-6 field-input"
              clearable
              v-model="halal"
              :options="ohalal"
            />
            <q-select
              outlined
              stack-label
              label="#14 Perishable"
              class="col-xs-6 field-input"
              clearable
              v-model="perishable"
              :options="operishable"
            />
          </div>

          <div class="row justify-between q-col-gutter-md">
            <div class="col-xs-6 field-input">
              <q-btn label="Generate" class="btn-add" icon="eva-plus-outline" @click="getSKUS" />
            </div>
          </div>
        </div>
        <div class="col-xs-8">
          <q-table title="Previews" :columns="columns" :data="data" row-key="sku" />
        </div>
      </div>
    </q-form>
    <template v-slot:actions>
      <template v-if="submitLoading">
        <q-circular-progress indeterminate size="30px" color="primary" class="q-mr-md q-mb-md" />
      </template>
      <template v-else>
        <q-btn flat label="Cancel" class="btn-cancel q-mr-sm" v-close-popup />
        <q-btn flat label="Save" class="btn-save" type="submit" form="MultipleSkuForm" />
      </template>
    </template>
  </form-dialog>
</template>

<script>
import FormDialog from '../FormDialog';
import ImageUpload from '../ImageUpload';
import ImageChooser from '../ImageChooser';
import { Api } from 'services';
export default {
  components: {
    FormDialog,
    ImageUpload,
    ImageChooser
  },
  data() {
    return {
      submitLoading: false,
      data: [],
      columns: [
        {
          name: 'sku',
          required: true,
          label: 'Product/SKU',
          align: 'left',
          field: (row) => row.sku,
          format: (val) => `${val}`,
          sortable: true
        },
        {
          name: 'oom',
          label: 'OOM',
          align: 'right',
          field: 'oom',
          format: (val) => `${val}`,
          sortable: true
        },
        {
          name: 'halal',
          label: 'Is Halal',
          align: 'right',
          field: 'halal',
          format: (val) => `${val === true ? 'Yes' : 'No'}`,
          sortable: true
        },
        {
          name: 'halal',
          label: 'Is Perishable',
          align: 'right',
          field: 'perishable',
          format: (val) => `${val === true ? 'Yes' : 'No'}`,
          sortable: true
        }
      ],
      freshness: [],
      product: null,
      size: [],
      spec_a: [],
      spec_b: [],
      spec_c: [],
      spec_d: [],
      spec_e: [],
      brand: [],
      origin: [],
      packaging: [],
      oom: null,
      halal: null,
      perishable: null,
      ofreshness: ['Frozen', 'Fresh', 'Chilled', 'Cooked'],
      oproduct: [
        'Alaska Pollock Fillet',
        'Asari Clam',
        'Batang Steak',
        'Beef Chunk Tender',
        'Beef Cube',
        'Beef Lung',
        'Black Chicken',
        'Black Pomfret',
        'Black Tilapia Wholeround',
        'Boiled Scallop',
        'Broccoli',
        'Cauliflower',
        'Chicken 2-Inch Cuts',
        'Chicken Bone',
        'Chicken Breast',
        'Chicken Drumsticks',
        'Chicken Fats',
        'Chicken Feet',
        'Chicken Fillet',
        'Chicken Gizzard Cleaned',
        'Chicken Heart Cleaned',
        'Chicken Hotdogs',
        'Chicken Karaage',
        'Chicken Leg',
        'Chicken Leg Boneless Slice',
        'Chicken Leg Cube',
        'Chicken Leg Quarters',
        'Chicken Liver Cleaned',
        'Chicken Middle Wing',
        'Chicken Minced',
        'Chicken Nuggets',
        'Chicken Thigh',
        'Chicken Whole Leg',
        'Chicken Wing',
        'Chicken Wingsticks / Drumette',
        'Cooked Shrimps',
        'Crawfish (Baby Lobsters)',
        'Crayfish',
        'Dory Fillet',
        'Fries',
        'Golden Pomfret',
        'Hashbrown Patties',
        'Hot & Spicy Mid Joint Wings',
        'Icefish',
        'Japanese Scallop',
        'Kampong Spring Chicken',
        'King Threadfin Bream Steak',
        'Pork Loin',
        'Mutton Bone',
        'Mutton Leg C.WT',
        'Mutton Leg cube',
        'Old Fowl',
        'Onion Ring',
        'Pork Back Rib C.WT',
        'Pork Belly 5009A C.WT',
        'Pork Belly Cube',
        'Pork Belly Slice',
        'Pork Big Bone',
        'Pork Chop',
        'Pork Collar',
        'Pork Cube',
        'Pork Fat Cube',
        'Pork Knuckle',
        'Pork Liver',
        'Pork Meat Ball',
        'Pork Minced',
        'Pork Sliced',
        'Pork Stomach',
        'Ram Carcass',
        'Red Snapper Head',
        'Saba Wholeround',
        'Salmon Fillet',
        'Sea Bass Fillet',
        'Seaweed Chicken',
        'Shoulder Lean',
        'Soft Bone',
        'Spicy Popcorn Chicken',
        'Whole Squid',
        'Squid Ring',
        'Stingray',
        'Sweet Corn',
        'Tiger Prawn',
        'Tilapia Fillet',
        'Turkey',
        'White Prawn',
        'Whole Black Chicken',
        'Whole Chicken',
        'Whole Round Batang',
        'Whole Spring Chicken',
        'Yellow Fin Sole Fillet',
        'Squid Flower Cut',
        'Red Snapper Fillet',
        'Prawn Head',
        'Pacific Cod',
        'Mixed Vegetables',
        'Minced Beef',
        'Sotong Paste',
        'Whole Duck Leg',
        'Beef Tenderloin C.WT',
        'Arrowtooth Flounder Fillet',
        'Beef Slice',
        'Tioman Fillet (Snakehead)',
        'Tioman Slice (Snakehead)',
        'Whole Duck Leg',
        'Whole Duck'
      ],
      osize: [
        '120-140g',
        '320g',
        '500-600g',
        '50/100',
        '300/500',
        '200g up',
        '90-120g',
        '240 - 260g',
        '280-300g',
        '300-350g',
        '250-280g',
        '220-240g',
        '5mm',
        '3mm',
        '8mm',
        '30g up',
        '240-260g',
        '260-280g',
        '200-220g',
        '300g',
        '180-200g',
        '160-180g',
        '100 - 120g',
        '100g up',
        '70g up',
        '80-100g',
        '31/40',
        '16/20',
        '21/25',
        '26/30',
        '100/150',
        '170 - 220g',
        '400 - 600g',
        '150/200',
        '200/300',
        '80/150',
        '600 - 700g',
        '180-225g',
        '1.2kg',
        '400g',
        '400/600',
        '3-4 lbs',
        '200/230',
        '60-80',
        '13/15',
        '8/10',
        '220g - 240g',
        '5.8kg',
        '5.4kg',
        '31/35',
        '61/70',
        '41/50',
        '51/60',
        '21/30',
        '100/200',
        '1.1KG',
        '1.3KG',
        '1.4KG',
        '1.6KG',
        '1KG',
        '1.9KG',
        '2KG',
        '1.8KG',
        '1.5KG',
        '1.7KG',
        '2.2KG',
        '1.3-1.5kg',
        '2.1KG',
        '2.83KG',
        '350g',
        '220-300g',
        '700g',
        '800g',
        '900g',
        '8/10"',
        '6/10"',
        '10" up',
        '450g',
        ' 50g',
        ' 150g',
        ' 250g',
        ' 350g',
        ' 450g',
        ' 550g',
        ' 650g',
        ' 750g',
        ' 850g',
        ' 950g',
        '2.5kg',
        '3.5kg',
        '4.5kg',
        '5.5kg',
        '0.5kg',
        '150g'
      ],
      ospec_a: [
        'No Head / No Feet',
        'Mixed Part',
        'Thigh Only',
        'Skinless',
        'Boneless',
        'Straight Cut',
        'Crinkle',
        'Shoestring',
        'Loin Sliced',
        'Bone-In',
        '12-Cut',
        '4-Cut',
        '2-Cut S3',
        'Whole',
        'Uncut',
        'Cut',
        'Thick',
        'HOSO',
        'PDTO',
        'PD',
        '24-Cut',
        '8-Cut',
        '18-Cut',
        '16-Cut',
        '10-Cut',
        '9-Cut',
        '20-Cut',
        '6-Cut',
        '2-Cut',
        '30-Cut',
        'White',
        'Brown / Others',
        'Vegetarian'
      ],
      ospec_b: ['2-Cut', 'Skinless', 'Skin On', 'w/ Wing and Legs'],
      ospec_c: ['No Head / No Feet', 'With Head / Feet'],
      ospec_d: ['Marinated'],
      ospec_e: [],
      obrand: [
        'Kilcoy',
        'Ido',
        'Seara',
        'Gold Phoenix',
        'Tyson',
        'Wayne Farm',
        'Wayne Farm / Tyson',
        'Frangosul',
        'NAT',
        'Tyson / AJC / Keystone',
        'Keystone',
        'Pilgrim Pride',
        'Tyson / Seara',
        'Golden Phoenix',
        'Mondelle',
        'Garden Maid',
        'Del Campo',
        'Le Duc',
        'Portn',
        'Danish Crown',
        'Mabella',
        'Supreme',
        'Costa',
        'Norbest',
        'Sakura'
      ],
      oorigin: ['Brazil', 'USA', 'Malaysia', 'Australian', 'Norway'],
      opackaging: [
        '10 X 1 KG',
        '10 KG',
        'KG',
        '2 X 5 KG',
        '18 KG',
        '6 X 2 KG',
        '20.8 KG',
        'PC',
        '5 KG',
        '15 KG',
        '12 KG',
        '28 PKT',
        '20 X 500 G',
        '12 X 1 KG',
        '13.61 KG',
        '7 KG',
        '12.2 KG',
        '12 X 1.28 KG',
        '5 X 2 KG',
        '17 KG',
        '25 KG',
        '6 X 1 KG',
        '23 KG',
        '28 KG',
        '13 KG',
        'PKT',
        '16 KG',
        '4.54 KG',
        '4 PC',
        '14 KG',
        '11 KG',
        '8 KG',
        '9 KG',
        '0.05 KG',
        '0.15 KG',
        '0.25 KG',
        '0.35 KG',
        '0.45 KG',
        '0.55 KG',
        '0.65 KG',
        '0.75 KG',
        '0.85 KG',
        '0.95 KG',
        '1.5 KG',
        '2.5 KG',
        '3.5 KG',
        '4.5 KG',
        '5.5 KG',
        '0.5 KG'
      ],
      ooom: ['KG', 'PC', 'UNIT'],
      ohalal: ['Yes', 'No'],
      operishable: ['Yes', 'No']
    };
  },
  methods: {
    getSKUS() {
      let specs = [
        this.freshness.map((x) => `freshness:${x}`).join(','),
        `product:${this.product}`,
        this.size.map((x) => `size:${x}`).join(','),
        this.spec_a.map((x) => `spec_a:${x}`).join(','),
        this.spec_b.map((x) => `spec_b:${x}`).join(','),
        this.spec_c.map((x) => `spec_c:${x}`).join(','),
        this.spec_d.map((x) => `spec_d:${x}`).join(','),
        this.spec_e.map((x) => `spec_e:${x}`).join(','),
        this.brand.map((x) => `brand:${x}`).join(','),
        this.origin.map((x) => `origin:${x}`).join(','),
        this.packaging.map((x) => `packaging:${x}`).join(','),
        `oom:${this.oom}`,
        `halal:${this.halal}`,
        `perishable:${this.perishable}`
      ];
      const result = this.generateSKU(specs);
      this.data = result;
    },
    generateSKU(specs) {
      var arrSpecs = specs.filter((x) => x != null && x != '').map((x) => x.split(','));
      var r = [],
        max = arrSpecs.length - 1;
      function skus(arr, i) {
        for (var j = 0, l = arrSpecs[i].length; j < l; j++) {
          var a = arr.slice(0);
          a.push(arrSpecs[i][j]);
          if (i == max) r.push(a);
          else skus(a, i + 1);
        }
      }
      skus([], 0);
      /* transform string array into object array */
      var temp = r.map((x) => {
        var obj = {};
        x.map((y) => {
          var item = y.split(':');
          obj[item[0]] = item[1];
        });
        return obj;
      });
      /* transform object to fit skus table */
      var sku = temp.map((x) => {
        var productskus = {};
        productskus.sku = (
          `${x.freshness ? x.freshness + ' ' : ''}${x.product ? x.product + ' ' : ''}${
            x.size ? x.size + ' ' : ''
          }` +
          `${x.spec_a ? x.spec_a + ' ' : ''}${x.spec_b ? x.spec_b + ' ' : ''}${
            x.spec_c ? x.spec_c + ' ' : ''
          }` +
          `${x.spec_d ? x.spec_d + ' ' : ''}${x.spec_e ? x.spec_e + ' ' : ''}${
            x.brand ? x.brand + ' ' : ''
          }` +
          `${x.origin ? x.origin + ' ' : ''}${x.packaging ? '(' + x.packaging + ') ' : ''}`
        ).trim();
        productskus.oom = x.oom;
        productskus.halal = !x.halal ? false : x.halal.toLowerCase() === 'yes' ? true : false;
        productskus.perishable = !x.perishable ? false : x.perishable.toLowerCase() === 'yes' ? true : false;
        return productskus;
      });
      return sku;
    },
    onSubmit() {
      this.$emit('on-add', this.data);
    }
  }
};
</script>

<style scoped>
.multiple-sku-old {
  height: 780px !important;
  width: 100% !important;
  max-width: unset !important;
  overflow: hidden;
}
.multiple-sku .field-input {
  padding-bottom: 20px;
}
.btn-save {
  color: #ffffff;
  background: #04565a;
  padding: 0 1rem;
  text-transform: capitalize;
  font-size: 0.875rem;
}
.btn-add {
  color: #ffffff;
  background: #26a69a;
  padding: 0 1rem;
  text-transform: capitalize;
  font-size: 0.875rem;
}
.btn-cancel {
  color: #666666;
  background: #e4e4e4;
  padding: 0 1rem;
  text-transform: capitalize;
  font-size: 0.875rem;
}
.list-header {
  color: #444444;
  padding: 16px;
  font-size: 0.875rem;
  background: #f0f0f0;
  border-bottom: 1px solid #ddd;
  font-weight: 600;
}
.text-category-main {
  margin-right: 2rem;
}
.pre-halal {
  width: 24px;
}
.pre-perishable {
  font-size: 20px;
  font-weight: 500;
}
</style>
<style lang="sass">
.q-field__bottom
  padding: 0 !important;
  margin: 0 !important;
</style>
