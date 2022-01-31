<template>
  <q-page padding>
    <div class="q-ma-md">
      <div class="row">
        <span class="text-title text-primary text-subtitle2 text-weight-medium">
          <span
            @click="gotoRoute('/main/users/hosts/approval')"
            class="link-btn text-weight-medium cursor-pointer"
            >Hosts</span
          >
          / {{ personalDetails.full_name }}
        </span>
        <div class="q-ml-md">
          <q-badge
            v-if="personalDetails.status_approval === 0"
            rounded
            color="orange-2"
            text-color="orange"
            label="Pending Approval"
          />
          <q-badge
            v-else-if="
              personalDetails.status_approval === 1 ||
              personalDetails.status_approval === 3 ||
              personalDetails.status_approval === 4
            "
            rounded
            color="green-2"
            text-color="green"
            label="Approved"
          />
          <q-badge v-else rounded color="red-2" text-color="red" label="Rejected" />
        </div>
        <q-space />
        <q-btn
          v-if="personalDetails.status_approval === 0 || personalDetails.status_approval === 2"
          rounded
          outline
          class="q-mr-xs"
          color="primary"
          text-color="primary"
          label="Approve"
          @click="showActionModal(true)"
        />
        <q-btn
          v-if="personalDetails.status_approval === 0"
          rounded
          outline
          color="red"
          text-color="red"
          label="Reject"
          @click="showActionModal(false)"
        />
      </div>
    </div>
    <div class="q-ma-md q-pa-md" style="border: 1px solid #dadce0; border-radius: 4px">
      <div class="row q-mb-lg full-width">
        <span class="text-title text-subtitle2 text-weight-bold"> Personal Details </span>
        <q-space />
        <span v-if="!personalInfoEdit" class="link-btn cursor-pointer" @click="editProfile">Edit</span>
      </div>
      <div class="row">
        <div class="col-md-2 col-sm-4 col-xs-12 q-mb-md">
          <div class="full-width justify-center flex q-mb-md">
            <q-avatar size="150px" style="height: auto">
              <img :src="photoProfile(personalDetails.image, 'advocate')" />
            </q-avatar>
          </div>
        </div>
        <div class="offset-md-1 col-md-8 col-sm-8 col-xs-12" v-if="!personalInfoEdit">
          <div class="row q-mb-sm">
            <div class="col-sm-3 col-xs-6">Name:</div>
            <div class="col-sm-3 col-xs-6">{{ personalDetails.full_name }}</div>
          </div>
          <div class="row q-mb-sm">
            <div class="col-sm-3 col-xs-6">Phone Number:</div>
            <div class="col-sm-3 col-xs-6">{{ phoneNumberFormat(replaceStar(personalDetails.mobile)) }}</div>
          </div>
          <div class="row q-mb-sm">
            <div class="col-sm-3 col-xs-6">Email:</div>
            <div class="col-sm-3 col-xs-6">{{ replaceStar(personalDetails.email) }}</div>
          </div>
          <div class="row q-mb-sm">
            <div class="col-sm-3 col-xs-6">Country:</div>
            <div class="col-sm-3 col-xs-6">
              {{ personalDetails.country ? personalDetails.country.description : 'N/A' }}
            </div>
          </div>
          <div class="row q-mb-sm">
            <div class="col-sm-3 col-xs-6">Referral Number:</div>
            <div class="col-sm-3 col-xs-6">{{ personalDetails.referred_number }}</div>
          </div>
        </div>
        <q-form
          class="offset-md-1 col-md-9 col-sm-8 col-xs-12 tdots-edit-form"
          v-else
          @submit.prevent="onProfileEditSubmit"
          id="editForm"
        >
          <div class="row q-mb-sm">
            <div class="q-mr-md q-mb-md col-md-4 col-sm-6 col-xs-12">
              <div class="q-mb-xs row">First Name</div>
              <q-input
                type="text"
                v-model="formUserData.first_name"
                stack-label
                outlined
                lazy-rules
                dense
                :rules="[(val) => !!val || 'Please type something']"
              />
            </div>
            <div class="q-mr-md col-md-4 col-sm-6 col-xs-12">
              <div class="q-mb-xs row">Last Name</div>
              <q-input
                type="text"
                v-model="formUserData.last_name"
                stack-label
                outlined
                dense
                lazy-rules
                :rules="[(val) => !!val || 'Please type something']"
              />
            </div>
          </div>
          <div class="row q-mb-sm">
            <div class="q-mr-md col-md-4 col-sm-6 col-xs-12">
              <div class="q-mb-xs row">Phone Number</div>
              <q-input
                type="text"
                prefix="+"
                v-model="formUserData.mobile"
                stack-label
                dense
                outlined
                lazy-rules
                :rules="[(val) => !!val || 'Please type something']"
              />
            </div>
          </div>
          <div class="row">
            <div class="q-mr-md q-mb-md col-md-4 col-sm-6 col-xs-12">
              <div class="q-mb-xs row">Email</div>
              <q-input
                type="text"
                v-model="formUserData.email"
                stack-label
                dense
                outlined
                lazy-rules
                :rules="emailRules"
              />
            </div>
          </div>
          <div class="row">
            <div class="q-mr-md q-mb-md col-md-4 col-sm-6 col-xs-12">
              <div class="q-mb-xs row">Country</div>
              <q-select
                v-model="selectedCountry"
                :options="countryOptions"
                stack-label
                dense
                outlined
                lazy-rules
                :rules="[(val) => !!val || 'Please choose something']"
                option-label="description"
                option-value="id"
                use-input
                input-debounce="0"
                behavior="menu"
                @filter="filterCountry"
              >
                <template v-slot:no-option>
                  <q-item>
                    <q-item-section class="text-grey"> No results </q-item-section>
                  </q-item>
                </template>
              </q-select>
            </div>
          </div>
          <div class="row">
            <div class="q-mr-md q-mb-md col-md-4 col-sm-6 col-xs-12">
              <div class="q-mb-xs row">Referral Number</div>
              <q-input
                type="text"
                v-model="formUserData.referred_number"
                dense
                stack-label
                outlined
                lazy-rules
                :rules="[(val) => !!val || 'Please type something']"
              />
            </div>
          </div>
          <div class="row">
            <q-btn
              class="q-mt-md q-px-md text-capitalize q-mr-md"
              color="primary"
              outline
              rounded
              type="submit"
              form="editForm"
              label="Save"
            />
            <q-btn
              class="q-mt-md q-px-md text-capitalize"
              text-color="grey-8"
              outline
              rounded
              label="Cancel"
              @click="personalInfoEdit = false"
            />
          </div>
        </q-form>
      </div>
    </div>
    <div class="q-ma-md q-pa-md" style="border: 1px solid #dadce0; border-radius: 4px">
      <div class="row q-mb-md full-width">
        <span class="text-title text-subtitle2 text-weight-bold"> Collection Points </span>
        <q-space />
        <span class="link-btn cursor-pointer" @click="openNewCP()">Add Collection Point</span>
      </div>
      <span v-if="collectionPointList.length === 0" class="q-mr-md text-weight-bold" style="color: #04565a">
        No Data
      </span>
      <q-list v-else>
        <q-item
          v-for="(collectionPoint, index) in collectionPointList"
          :key="collectionPoint.customer.id"
          style="padding: 8px 0"
        >
          <div class="q-pa-md full-width" style="border: 1px solid #dadce0; border-radius: 4px">
            <div class="row q-mb-md">
              <span class="q-mr-md text-weight-bold" style="color: #04565a">
                {{ collectionPoint.customer.name }}
              </span>
              <q-badge
                v-if="!collectionPoint.active"
                rounded
                class="text-center"
                color="blue-2"
                text-color="blue"
                label="Pending Verification"
              />
              <q-badge
                v-if="collectionPoint.active"
                rounded
                color="green-2"
                text-color="green"
                label="Verified"
              />
              <q-space />
              <span
                v-if="(!cpEdit || selectedCPEdit != index) && !collectionPoint.active"
                class="link-btn cursor-pointer"
                @click="
                  actionCPType = true;
                  selectedCPId = collectionPoint.customer.id;
                  showCPModal = true;
                "
                >Verify</span
              >
              <span v-if="(!cpEdit || selectedCPEdit != index) && !collectionPoint.active"
                >&nbsp;|&nbsp;</span
              >
              <span
                v-if="!cpEdit || selectedCPEdit != index"
                class="link-btn cursor-pointer"
                @click="openCPEdit(collectionPoint, index)"
                >Edit</span
              >
            </div>
            <div class="row" v-if="!cpEdit || selectedCPEdit != index">
              <div class="col-md-6 q-pr-sm">
                <div class="row q-mb-sm">
                  <div class="col-md-4 col-xs-6">
                    <div class="row q-mb-sm">Address:</div>
                  </div>
                  <div class="col-md-8 col-xs-6">
                    <div>
                      {{ collectionPoint.customer.address[0].state }},
                      {{ collectionPoint.customer.address[0].road }},
                      {{ collectionPoint.customer.address[0].building }},
                      {{ collectionPoint.customer.address[0].postal_code }}
                    </div>
                    <div>Unit {{ collectionPoint.customer.address[0].unit }}</div>
                    <div>Floor {{ collectionPoint.customer.address[0].floor_number }}</div>
                  </div>
                </div>
                <div class="row">
                  <div class="col-md-4 col-xs-6">
                    <div class="row q-mb-sm">Profile:</div>
                  </div>
                  <div class="col-md-8 col-xs-6">
                    <div>{{ collectionPoint.customer.profile }}</div>
                  </div>
                </div>
                <div class="row">
                  <div class="col-md-4 col-xs-6">
                    <div class="row q-mb-sm">Option:</div>
                  </div>
                  <div class="col-md-8 col-xs-6">
                    <q-badge
                      rounded
                      class="q-mr-sm"
                      color="deep-purple-1"
                      text-color="deep-purple-5"
                      label="Halal"
                      v-if="collectionPoint.customer.halal_products"
                    />
                    <q-badge
                      rounded
                      class="q-mr-sm"
                      color="blue-1"
                      text-color="blue-7"
                      label="No Beef"
                      v-if="collectionPoint.customer.beef_products"
                    />
                  </div>
                </div>
                <div class="row">
                  <div class="col-md-4 col-xs-6">
                    <div class="row q-mb-sm">Whatsapp Link:</div>
                  </div>
                  <div class="col-md-8 col-xs-6">
                    <a
                      :href="collectionPoint.customer.whatsapp_link"
                      class="text-cyan-3"
                      style="word-break: break-word"
                      >{{ collectionPoint.customer.whatsapp_link }}</a
                    >
                  </div>
                </div>
              </div>
              <div class="col-md-6">
                <gmap-map
                  ref="mapRef"
                  map-type-id="roadmap"
                  :center="collectionPoint.customer.address[0].latlng"
                  :zoom="zoom"
                  :draggable="true"
                  :clickable="true"
                  :style="mapSize"
                  :options="{
                    zoomControl: false,
                    scaleControl: false,
                    mapTypeControl: false,
                    fullscreenControl: false,
                    streetViewControl: false,
                    disableDefaultUi: false
                  }"
                >
                  <gmap-custom-marker :marker="collectionPoint.customer.address[0].latlng">
                    <div class="relative-position">
                      <q-img :src="gmarker" width="30px"></q-img>
                      <div
                        style="
                          position: absolute;
                          top: 4px;
                          left: 30px;
                          color: #c62828;
                          width: 150px;
                          font-weight: 600;
                        "
                      >
                        <p class="no-margin">{{ collectionPoint.customer.address[0].road }},</p>
                        <p class="no-margin">
                          {{ collectionPoint.customer.address[0].state }}
                          {{ collectionPoint.customer.address[0].postal_code }}
                        </p>
                      </div>
                    </div>
                  </gmap-custom-marker>
                </gmap-map>
              </div>
            </div>
            <q-separator class="q-my-md" v-if="!cpEdit || selectedCPEdit != index" />
            <div class="row" v-if="!cpEdit || selectedCPEdit != index">
              <div class="col-md-2 col-xs-12">
                <div class="row q-mb-sm">Suppliers:</div>
              </div>
              <div class="col-md-10 col-xs-12">
                <q-table
                  :data="collectionPoint.supplier.supplier_list"
                  :columns="columns"
                  class="tdots-table"
                  @request="onRequest"
                  :pagination.sync="collectionPoint.pagination"
                  hide-header
                >
                  <template v-slot:body-cell-supplier="props">
                    <q-td>
                      <q-img
                        :src="photoProfile(props.row.tenant.logo, 'supplier-logos')"
                        spinner-size="30px"
                        width="40px"
                        height="40px"
                        class="q-my-sm q-mr-sm"
                      >
                      </q-img>
                      <span>{{ props.row.tenant.tenant.name }}</span>
                    </q-td>
                  </template>
                  <template v-slot:bottom="props">
                    <div class="row col-12 t-bottom">
                      <div class="justify-center text-center items-center flex full-width">
                        <q-btn
                          icon="chevron_left"
                          color="grey-8"
                          round
                          dense
                          flat
                          :disable="props.isFirstPage"
                          @click="
                            cpIndex = index;
                            props.prevPage();
                          "
                        />
                        <span
                          >{{ props.pagination.page }} of
                          {{
                            Math.ceil(
                              (props.pagination.rowsNumber ? props.pagination.rowsNumber : 1) /
                                props.pagination.rowsPerPage
                            )
                          }}</span
                        >
                        <q-btn
                          icon="chevron_right"
                          color="grey-8"
                          round
                          dense
                          flat
                          :disable="props.isLastPage"
                          @click="
                            cpIndex = index;
                            props.nextPage();
                          "
                        />
                      </div>
                    </div>
                  </template>
                </q-table>
              </div>
            </div>
            <div class="row" v-if="cpEdit && selectedCPEdit == index">
              <q-form class="col-md-12 tdots-edit-form" @submit.prevent="onCPEditSubmit" id="editCPForm">
                <div class="row">
                  <div class="col-md-6">
                    <div class="row">
                      <div class="q-pr-md q-mb-sm col-md-6 col-xs-12 gmapAuto">
                        <div class="q-mb-xs">Search Address</div>
                        <gmap-autocomplete @place_changed="setPlace" :value="formCPData.gmapAutoValue">
                        </gmap-autocomplete>
                      </div>
                    </div>
                    <div class="row">
                      <div class="q-pr-md q-mb-sm col-md-6 col-xs-12">
                        <div class="q-mb-xs">Country</div>
                        <q-select
                          v-model="formCPData.country_id"
                          :options="countriesFiltered"
                          lazy-rules
                          :rules="[(val) => !!val || 'Please choose something']"
                          option-label="description"
                          option-value="id"
                          map-options
                          emit-value
                          hide-selected
                          dense
                          outlined
                          disable
                        />
                      </div>
                    </div>
                    <div class="row">
                      <div class="q-pr-md q-mb-sm col-md-6 col-xs-12">
                        <div class="q-mb-xs">State</div>
                        <q-input
                          v-model="formCPData.state"
                          lazy-rules
                          :rules="[(val) => !!val || 'Please type something']"
                          dense
                          outlined
                          disable
                        />
                      </div>
                      <div class="q-pr-md q-mb-sm col-md-6 col-xs-12">
                        <div class="q-mb-xs">City</div>
                        <q-input
                          v-model="formCPData.city"
                          lazy-rules
                          :rules="[(val) => !!val || 'Please type something']"
                          dense
                          outlined
                          disable
                        />
                      </div>
                    </div>
                    <div class="row">
                      <div class="q-pr-md q-mb-sm col-md-6 col-xs-12">
                        <div class="q-mb-xs">Street</div>
                        <q-input
                          v-model="formCPData.road"
                          lazy-rules
                          :rules="[(val) => !!val || 'Please type something']"
                          dense
                          outlined
                          :disable="!gmapValueEdit"
                        />
                      </div>
                      <div class="q-pr-md q-mb-sm col-md-6 col-xs-12">
                        <div class="q-mb-xs">Building Name</div>
                        <q-input v-model="formCPData.building" dense outlined stack-label />
                      </div>
                    </div>
                    <div class="row">
                      <div class="q-pr-md q-mb-sm col-md-6 col-xs-12">
                        <div class="q-mb-xs">Postal Code</div>
                        <q-input
                          v-model="formCPData.postal_code"
                          lazy-rules
                          :rules="[(val) => !!val || 'Please type something']"
                          dense
                          outlined
                          :disable="!gmapValueEdit"
                        />
                      </div>
                    </div>
                    <div class="row">
                      <div class="q-pr-md q-mb-sm col-md-6 col-xs-12">
                        <div class="q-mb-xs">Unit No.</div>
                        <q-input v-model="formCPData.unit" dense outlined stack-label />
                      </div>
                      <div class="q-pr-md q-mb-sm col-md-6 col-xs-12">
                        <div class="q-mb-xs">Floor No.</div>
                        <q-input v-model="formCPData.floor_number" dense outlined stack-label />
                      </div>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="flex">
                      <div
                        class="text-deep-orange q-px-sm q-py-xs q-mb-sm"
                        style="background-color: #fffaeb; border-radius: 16px"
                      >
                        <span
                          class="text-deep-orange q-pa-xs"
                          style="background-color: #ffffff; border-radius: 16px"
                        >
                          Note
                        </span>
                        Check your location. Click or Drag the map to adjust.
                      </div>
                    </div>
                    <gmap-map
                      ref="mapRef"
                      map-type-id="roadmap"
                      :center="formCPData.latlng"
                      :zoom="zoom"
                      :draggable="true"
                      :clickable="true"
                      @click="setGmapLocation"
                      :style="mapSize"
                      :options="{
                        zoomControl: false,
                        scaleControl: false,
                        mapTypeControl: false,
                        fullscreenControl: false,
                        streetViewControl: false,
                        disableDefaultUi: false
                      }"
                    >
                      <gmap-custom-marker :marker="formCPData.latlng">
                        <div class="relative-position">
                          <q-img :src="gmarker" width="30px"></q-img>
                          <div
                            style="
                              position: absolute;
                              top: 4px;
                              left: 30px;
                              color: #c62828;
                              width: 150px;
                              font-weight: 600;
                            "
                          >
                            <p class="no-margin">{{ formCPData.road }},</p>
                            <p class="no-margin">{{ formCPData.state }} {{ formCPData.postal_code }}</p>
                          </div>
                        </div>
                      </gmap-custom-marker>
                    </gmap-map>
                  </div>
                </div>
                <q-separator class="q-my-md" />
                <div class="row">
                  <div class="col-md-12">
                    <div class="row">
                      <div class="q-pr-md q-mb-sm col-sm-4 col-xs-12">
                        <div class="q-mb-xs row">Profile</div>
                        <q-select
                          v-model="formCPData.profile"
                          label="Profile"
                          outlined
                          dense
                          lazy-rules
                          :options="customerProfiles"
                          :rules="[(v) => !!v || 'Profile cannot be empty']"
                        />
                      </div>
                      <div class="q-pr-md q-mb-sm col-sm-4 col-xs-12">
                        <div class="q-mb-xs row">Whatsapp Link</div>
                        <q-input
                          v-model="formCPData.whatsapp_link"
                          dense
                          outlined
                          stack-label
                          :rules="[(val) => !!val || 'Please type something']"
                        />
                      </div>
                      <div class="q-pr-md q-mb-sm col-sm-2 col-xs-12">
                        <div class="q-mb-xs row">&nbsp;</div>
                        <span>Halal</span>
                        <q-toggle
                          v-model="formCPData.halal_products"
                          :true-value="true"
                          :false-value="false"
                          :label="formCPData.halal_products === true ? 'Yes' : 'No'"
                        />
                      </div>
                      <div class="q-pr-md q-mb-sm col-sm-2 col-xs-12">
                        <div class="q-mb-xs row">&nbsp;</div>
                        <span>No Beef</span>
                        <q-toggle
                          v-model="formCPData.beef_products"
                          :true-value="true"
                          :false-value="false"
                          :label="formCPData.beef_products === true ? 'Yes' : 'No'"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div class="row">
                  <div class="col-md-12">
                    <q-table
                      :data="formCPSupplierList"
                      :columns="formColumns"
                      class="tdots-table"
                      @request="onFormRequest"
                      :pagination.sync="formPagination"
                      :loading="isFormLoading"
                    >
                      <template v-slot:top-left>
                        <div class="row q-mb-md">
                          <span class="text-weight-bold">suppliers</span>
                        </div>
                        <div class="row full-width">
                          <q-select
                            v-model="selectedSupplier"
                            :options="supplierOptions"
                            label="Select Supplier"
                            stack-label
                            ref="selectSupplier"
                            dense
                            outlined
                            lazy-rules
                            :rules="[(val) => !!val || 'Please choose something']"
                            option-label="name"
                            option-value="id"
                            use-input
                            input-debounce="500"
                            behavior="menu"
                            @input-value="setInputValue"
                            @input="addSupplier()"
                            :loading="loadingSuppliers"
                            @keyup.enter.native="getAllSuppliers"
                          >
                            <template v-slot:no-option>
                              <q-item>
                                <q-item-section class="text-grey"> No results </q-item-section>
                              </q-item>
                            </template>
                          </q-select>
                        </div>
                      </template>
                      <template v-slot:body-cell-name="props">
                        <q-td>
                          <span>{{ props.row.tenant.tenant.name }}</span>
                        </q-td>
                      </template>
                      <template v-slot:body-cell-action="props">
                        <q-td class="text-right">
                          <q-icon
                            name="far fa-trash-alt"
                            size="sm"
                            color="red"
                            class="cursor-pointer"
                            @click="deleteSupplier(props.row.tenant.id)"
                          >
                            <q-tooltip>Delete</q-tooltip>
                          </q-icon>
                        </q-td>
                      </template>
                      <template v-slot:bottom="props">
                        <div class="row col-12 t-bottom">
                          <div class="justify-center text-center items-center flex full-width">
                            <q-btn
                              icon="chevron_left"
                              color="grey-8"
                              round
                              dense
                              flat
                              :disable="props.isFirstPage"
                              @click="props.prevPage"
                            />
                            <span
                              >{{ props.pagination.page }} of
                              {{
                                Math.ceil(
                                  (props.pagination.rowsNumber ? props.pagination.rowsNumber : 1) /
                                    props.pagination.rowsPerPage
                                )
                              }}</span
                            >
                            <q-btn
                              icon="chevron_right"
                              color="grey-8"
                              round
                              dense
                              flat
                              :disable="props.isLastPage"
                              @click="props.nextPage"
                            />
                          </div>
                        </div>
                      </template>
                    </q-table>
                  </div>
                </div>
                <div class="row">
                  <q-btn
                    class="q-mt-md q-px-md text-capitalize q-mr-md"
                    color="primary"
                    outline
                    rounded
                    type="submit"
                    form="editCPForm"
                    label="Save"
                  />
                  <q-btn
                    class="q-mt-md q-px-md text-capitalize"
                    text-color="grey-8"
                    outline
                    rounded
                    label="Cancel"
                    @click="
                      cpEdit = false;
                      formCPData = {};
                    "
                  />
                </div>
              </q-form>
            </div>
          </div>
        </q-item>
      </q-list>
      <div class="q-my-sm full-width" v-if="addNewCP">
        <span class="text-title text-subtitle2 text-weight-bold"> New Collection Point </span>
      </div>
      <q-item v-if="addNewCP" style="padding: 8px 0">
        <q-form class="col-md-12 tdots-edit-form" @submit.prevent="onCPNewSubmit" id="addCPForm">
          <div class="q-pa-md full-width" style="border: 1px solid #dadce0; border-radius: 4px">
            <div class="row">
              <div class="col-md-7">
                <div class="row">
                  <div class="q-pr-md q-mb-sm col-md-6 col-xs-12 gmapAuto">
                    <div class="q-mb-xs row">Search Address</div>
                    <gmap-autocomplete @place_changed="setPlace" :value="formCPData.gmapAutoValue">
                    </gmap-autocomplete>
                  </div>
                </div>
                <div class="row">
                  <div class="q-pr-md q-mb-sm col-md-6 col-xs-12">
                    <div class="q-mb-xs row">Country</div>
                    <q-select
                      v-model="formCPData.country_id"
                      :options="countriesFiltered"
                      lazy-rules
                      :rules="[(val) => !!val || 'Please choose something']"
                      option-label="description"
                      option-value="id"
                      placeholder="Country"
                      map-options
                      emit-value
                      dense
                      outlined
                      disable
                    />
                  </div>
                </div>
                <div class="row">
                  <div class="q-pr-md q-mb-sm col-md-6 col-xs-12">
                    <div class="q-mb-xs row">State</div>
                    <q-input
                      v-model="formCPData.state"
                      placeholder="State"
                      lazy-rules
                      :rules="[(val) => !!val || 'Please type something']"
                      dense
                      outlined
                      disable
                    />
                  </div>
                  <div class="q-pr-md q-mb-sm col-md-6 col-xs-12">
                    <div class="q-mb-xs row">City</div>
                    <q-input
                      v-model="formCPData.city"
                      placeholder="City"
                      lazy-rules
                      :rules="[(val) => !!val || 'Please type something']"
                      dense
                      outlined
                      disable
                    />
                  </div>
                </div>
                <div class="row">
                  <div class="q-pr-md q-mb-sm col-md-6 col-xs-12">
                    <div class="q-mb-xs row">Street</div>
                    <q-input
                      v-model="formCPData.road"
                      placeholder="Street"
                      lazy-rules
                      :rules="[(val) => !!val || 'Please type something']"
                      dense
                      outlined
                      :disable="!gmapValueEdit"
                    />
                  </div>
                  <div class="q-pr-md q-mb-sm col-md-6 col-xs-12">
                    <div class="q-mb-xs row">Building Name</div>
                    <q-input
                      v-model="formCPData.building"
                      placeholder="Building Name"
                      dense
                      outlined
                      stack-label
                      :disable="!gmapValueEdit"
                    />
                  </div>
                </div>
                <div class="row">
                  <div class="q-pr-md q-mb-sm col-md-6 col-xs-12">
                    <div class="q-mb-xs row">Postal Code</div>
                    <q-input
                      v-model="formCPData.postal_code"
                      lazy-rules
                      :rules="[(val) => !!val || 'Please type something']"
                      placeholder="Postal Code"
                      dense
                      outlined
                      :disable="!gmapValueEdit"
                    />
                  </div>
                </div>
                <div class="row">
                  <div class="q-pr-md q-mb-sm col-md-6 col-xs-12">
                    <div class="q-mb-xs row">Unit No.</div>
                    <q-input
                      v-model="formCPData.unit"
                      dense
                      outlined
                      stack-label
                      placeholder="Optional"
                      :disable="!gmapValueEdit"
                    />
                  </div>
                  <div class="q-pr-md q-mb-sm col-md-6 col-xs-12">
                    <div class="q-mb-xs row">Floor No.</div>
                    <q-input
                      v-model="formCPData.floor_number"
                      dense
                      outlined
                      stack-label
                      placeholder="Optional"
                      :disable="!gmapValueEdit"
                    />
                  </div>
                </div>
              </div>
              <div class="col-md-5">
                <gmap-map
                  ref="mapRef"
                  map-type-id="roadmap"
                  :center="formCPData.latlng"
                  :zoom="zoom"
                  :draggable="true"
                  :clickable="true"
                  @click="setGmapLocation"
                  :style="mapSize"
                  :options="{
                    zoomControl: false,
                    scaleControl: false,
                    mapTypeControl: false,
                    fullscreenControl: false,
                    streetViewControl: false,
                    disableDefaultUi: false
                  }"
                >
                  <gmap-custom-marker :marker="formCPData.latlng">
                    <div class="relative-position">
                      <q-img :src="gmarker" width="30px"></q-img>
                      <div
                        style="
                          position: absolute;
                          top: 4px;
                          left: 30px;
                          color: #c62828;
                          width: 150px;
                          font-weight: 600;
                        "
                      >
                        <p class="no-margin">{{ formCPData.road }},</p>
                        <p class="no-margin">{{ formCPData.state }} {{ formCPData.postal_code }}</p>
                      </div>
                    </div>
                  </gmap-custom-marker>
                </gmap-map>
              </div>
            </div>
            <q-separator class="q-my-md" />
            <div class="row">
              <div class="col-md-6">
                <div class="row">
                  <div class="q-pr-md q-mb-sm col-md-6 col-xs-12">
                    <div class="q-mb-xs row">Profile</div>
                    <q-select
                      v-model="formCPData.profile"
                      label="Profile"
                      outlined
                      dense
                      lazy-rules
                      :options="customerProfiles"
                      :rules="[(v) => !!v || 'Profile cannot be empty']"
                    />
                  </div>
                </div>
                <div class="row">
                  <div class="q-pr-md q-mb-sm col-md-6 col-xs-12">
                    <div class="q-mb-xs row">Whatsapp Link</div>
                    <q-input
                      v-model="formCPData.whatsapp_link"
                      dense
                      outlined
                      stack-label
                      placeholder="Enter Whatsapp Link"
                      :rules="[(val) => !!val || 'Please type something']"
                    />
                  </div>
                </div>
                <div class="row">
                  <div class="q-pr-md q-mb-sm col-md-6 col-xs-12">
                    <div class="q-mb-xs row">Halal</div>
                    <q-toggle
                      v-model="formCPData.halal_products"
                      :true-value="true"
                      :false-value="false"
                      :label="formCPData.halal_products === true ? 'Yes' : 'No'"
                    />
                  </div>
                </div>
                <div class="row">
                  <div class="q-pr-md q-mb-sm col-md-6 col-xs-12">
                    <div class="q-mb-xs row">No Beef</div>
                    <q-toggle
                      v-model="formCPData.beef_products"
                      :true-value="true"
                      :false-value="false"
                      :label="formCPData.beef_products === true ? 'Yes' : 'No'"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </q-form>
      </q-item>
      <div class="q-my-sm full-width" v-if="addNewCP">
        <q-btn
          class="q-mt-md q-px-lg text-capitalize q-mr-md"
          text-color="grey-8"
          outline
          rounded
          label="Cancel"
          @click="cancelNewCP()"
        />
        <q-btn
          class="q-mt-md q-px-lg text-capitalize"
          color="primary"
          outline
          rounded
          type="submit"
          form="addCPForm"
          label="Save"
        />
      </div>
    </div>
    <div class="q-ma-md q-pa-md" style="border: 1px solid #dadce0; border-radius: 4px">
      <div class="row q-mb-lg full-width">
        <span class="text-title text-subtitle2 text-weight-bold"> Bank Accounts </span>
        <q-space />
        <span class="link-btn cursor-pointer" @click="openNewBank()">Add Bank Account</span>
      </div>
      <span v-if="bankAccountList.length === 0" class="q-mr-md text-weight-bold" style="color: #04565a">
        No Data
      </span>
      <q-list v-else>
        <q-item v-for="(bankAccount, index) in bankAccountList" :key="bankAccount.id" style="padding: 8px 0">
          <div class="q-pa-md full-width" style="border: 1px solid #dadce0; border-radius: 4px">
            <div class="row q-mb-md">
              <span class="q-mr-md text-weight-bold" style="color: #04565a">
                {{ bankAccount.bank.bank_name }}
              </span>
              <q-badge
                v-if="!bankAccount.active"
                rounded
                class="text-center"
                color="deep-purple-2"
                text-color="deep-purple"
                label="Pending Verification"
              />
              <q-badge
                v-if="bankAccount.active"
                rounded
                color="green-2"
                text-color="green"
                label="Verified"
              />
              <q-space />
              <span
                v-if="(!bankEdit || selectedBankEdit != index) && !bankAccount.active"
                class="link-btn cursor-pointer"
                @click="
                  actionBankType = true;
                  selectedBankId = bankAccount.id;
                  showBankModal = true;
                "
                >Verify</span
              >
              <span v-if="(!bankEdit || selectedBankEdit != index) && !bankAccount.active"
                >&nbsp;|&nbsp;</span
              >
              <span
                v-if="!bankEdit || selectedBankEdit != index"
                class="link-btn cursor-pointer"
                @click="openBankEdit(bankAccount, index)"
                >Edit</span
              >
            </div>
            <div class="row" v-if="!bankEdit || selectedBankEdit != index">
              <div class="col-md-12">
                <div class="row q-mb-sm">
                  <div class="col-sm-2 col-xs-6">Bank Name:</div>
                  <div class="col-sm-5 col-xs-6">{{ bankAccount.bank.bank_name || `&nbsp;` }}</div>
                </div>
                <div class="row q-mb-sm">
                  <div class="col-sm-2 col-xs-6">Account Number:</div>
                  <div class="col-sm-5 col-xs-6">{{ bankAccount.account_number || `&nbsp;` }}</div>
                </div>
                <div class="row q-mb-sm">
                  <div class="col-sm-2 col-xs-6">Account Name:</div>
                  <div class="col-sm-5 col-xs-6">{{ bankAccount.account_name || `&nbsp;` }}</div>
                </div>
                <div class="row q-mb-sm">
                  <div class="col-sm-2 col-xs-6">Bank Code:</div>
                  <div class="col-sm-5 col-xs-6">{{ bankAccount.bank_code || `&nbsp;` }}</div>
                </div>
                <div class="row q-mb-sm">
                  <div class="col-sm-2 col-xs-6">Branch Code:</div>
                  <div class="col-sm-5 col-xs-6">{{ bankAccount.branch_code || `&nbsp;` }}</div>
                </div>
              </div>
            </div>
            <div class="row" v-if="bankEdit && selectedBankEdit == index">
              <q-form class="col-md-12 tdots-edit-form" @submit.prevent="onBankEditSubmit" id="editBankForm">
                <div class="row q-mb-sm">
                  <div class="q-mr-md col-sm-4 col-xs-12">
                    <div class="q-mb-xs">Bank Name</div>
                    <q-select
                      v-model="selectedEditBank"
                      label="Bank Name"
                      outlined
                      dense
                      lazy-rules
                      :options="bankOptions"
                      :rules="[(v) => !!v || 'Please choose something']"
                      option-label="bank_name"
                      option-value="id"
                    />
                  </div>
                </div>
                <div class="row q-mb-sm">
                  <div class="q-mr-md col-sm-4 col-xs-12">
                    <div class="q-mb-xs">Account Number</div>
                    <q-input
                      type="number"
                      v-model="formBankData.account_number"
                      stack-label
                      dense
                      outlined
                      lazy-rules
                      :rules="[(val) => !!val || 'Please type something']"
                    />
                  </div>
                  <div class="q-mr-md col-sm-4 col-xs-12">
                    <div class="q-mb-xs">Account Name</div>
                    <q-input
                      type="text"
                      v-model="formBankData.account_name"
                      stack-label
                      dense
                      outlined
                      lazy-rules
                      :rules="[(val) => !!val || 'Please type something']"
                    />
                  </div>
                </div>
                <div class="row q-mb-sm">
                  <div class="q-mr-md col-sm-4 col-xs-12">
                    <div class="q-mb-xs">Bank Code</div>
                    <q-input
                      type="text"
                      v-model="formBankData.bank_code"
                      dense
                      stack-label
                      outlined
                      lazy-rules
                      :rules="[(val) => !!val || 'Please type something']"
                    />
                  </div>
                  <div class="q-mr-md col-sm-4 col-xs-12">
                    <div class="q-mb-xs">Branch Code</div>
                    <q-input
                      type="text"
                      v-model="formBankData.branch_code"
                      dense
                      stack-label
                      outlined
                      lazy-rules
                      :rules="[(val) => !!val || 'Please type something']"
                    />
                  </div>
                </div>
                <div class="row">
                  <q-btn
                    class="q-mt-md q-px-md text-capitalize q-mr-md"
                    color="primary"
                    outline
                    rounded
                    type="submit"
                    form="editBankForm"
                    label="Save"
                  />
                  <q-btn
                    class="q-mt-md q-px-md text-capitalize"
                    text-color="grey-8"
                    outline
                    rounded
                    label="Cancel"
                    @click="
                      formBankData = {};
                      bankEdit = false;
                    "
                  />
                </div>
              </q-form>
            </div>
          </div>
        </q-item>
      </q-list>
      <div class="q-my-sm full-width" v-if="addNewBank">
        <span class="text-title text-subtitle2 text-weight-bold"> New Bank Account </span>
      </div>
      <q-item v-if="addNewBank" style="padding: 8px 0">
        <q-form class="col-md-12 tdots-edit-form" @submit.prevent="onBankNewSubmit" id="addBankForm">
          <div class="q-pa-md full-width" style="border: 1px solid #dadce0; border-radius: 4px">
            <div class="row">
              <div class="col-12">
                <div class="row q-mb-sm">
                  <div class="q-mr-md col-sm-4 col-xs-12">
                    <div class="q-mb-xs row">Bank Name</div>
                    <q-select
                      v-model="selectedAddBank"
                      :options="bankOptions"
                      stack-label
                      placeholder="Bank Name"
                      dense
                      outlined
                      lazy-rules
                      :rules="[(val) => !!val || 'Please choose something']"
                      option-label="bank_name"
                      option-value="id"
                    />
                  </div>
                </div>
                <div class="row q-mb-sm">
                  <div class="q-mr-md col-sm-4 col-xs-12">
                    <div class="q-mb-xs row">Account Number</div>
                    <q-input
                      type="number"
                      v-model="formBankData.account_number"
                      placeholder="Account Number"
                      stack-label
                      dense
                      outlined
                      lazy-rules
                      :rules="[(val) => !!val || 'Please type something']"
                    />
                  </div>
                  <div class="q-mr-md col-sm-4 col-xs-12">
                    <div class="q-mb-xs row">Account Name</div>
                    <q-input
                      type="text"
                      v-model="formBankData.account_name"
                      placeholder="Account Name"
                      stack-label
                      dense
                      outlined
                      lazy-rules
                      :rules="[(val) => !!val || 'Please type something']"
                    />
                  </div>
                </div>
                <div class="row q-mb-sm">
                  <div class="q-mr-md col-sm-4 col-xs-12">
                    <div class="q-mb-xs row">Bank Code</div>
                    <q-input
                      type="text"
                      v-model="formBankData.bank_code"
                      placeholder="Bank Code"
                      dense
                      stack-label
                      outlined
                      lazy-rules
                      :rules="[(val) => !!val || 'Please type something']"
                    />
                  </div>
                  <div class="q-mr-md col-sm-4 col-xs-12">
                    <div class="q-mb-xs row">Branch Code</div>
                    <q-input
                      type="text"
                      v-model="formBankData.branch_code"
                      placeholder="Branch Code"
                      dense
                      stack-label
                      outlined
                      lazy-rules
                      :rules="[(val) => !!val || 'Please type something']"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </q-form>
      </q-item>
      <div class="q-my-sm full-width" v-if="addNewBank">
        <q-btn
          class="q-mt-md q-px-lg text-capitalize q-mr-md"
          text-color="grey-8"
          outline
          rounded
          label="Cancel"
          @click="cancelNewBank()"
        />
        <q-btn
          class="q-mt-md q-px-lg text-capitalize"
          color="primary"
          outline
          rounded
          type="submit"
          form="addBankForm"
          label="Save"
        />
      </div>
    </div>
    <q-dialog v-model="showActModal">
      <advocate-action
        :userInfo="personalDetails"
        :actionType="actionType"
        @update="updateUser"
        @close="closePopUp(1)"
      />
    </q-dialog>
    <q-dialog v-model="showCPModal">
      <advocate-cp-action :actionType="actionCPType" @close="closePopUp(2)" @update="updateCP" />
    </q-dialog>
    <q-dialog v-model="showBankModal">
      <advocate-bank-action :actionType="actionBankType" @close="closePopUp(3)" @update="updateBank" />
    </q-dialog>
    <q-dialog v-model="showUpdateLocationModal">
      <advocate-update-location @close="closePopUp(4)" @update="updateLocation" />
    </q-dialog>
  </q-page>
</template>

<script>
import { Notice } from 'services';
import { aws_s3_bucket_public } from 'src/config';
import AlertMessage from 'web/share/partial/AlertMessage.vue';
import AdvocateAction from './advocates/AdvocateAction.vue';
import AdvocateBankAction from './advocates/AdvocateBankAction.vue';
import AdvocateCpAction from './advocates/AdvocateCpAction.vue';
import AdvocateUpdateLocation from './advocates/AdvocateUpdateLocation.vue';
import { gmapApi } from 'gmap-vue';
import GmapCustomMarker from 'vue2-gmap-custom-marker';
import gmarker from 'assets/images/gmarker.svg';
import { allCountries } from 'treeGQL';
import {
  getAllAdvocates,
  advocateApproval,
  getCollectionPointByUserId,
  updateAdvocateDetails,
  getBankListByUserId,
  verifyCollectionPoint,
  verifyBankAccount,
  updateCollectionPointDetails,
  updateBankAccountDetails,
  addNewBankAccount,
  addNewCollectionPoint,
  getAllBanks,
  getAllSuppliersAdvocate,
  getAllSupplierByCPId,
  linkCollectionPointSupplier,
  unLinkCollectionPointSupplier
} from 'treeGQL';
import { isEmailValid } from 'services';

export default {
  components: {
    AdvocateAction,
    AdvocateCpAction,
    AdvocateBankAction,
    AdvocateUpdateLocation,
    GmapCustomMarker
  },
  props: {
    id: {
      type: [String, Number],
      default: null
    }
  },
  data() {
    return {
      center: { lat: 45.508, lng: -73.587 },
      mapSize: 'width: 360px; height: 200px',
      zoom: 20,
      states: [],
      actionType: null,
      actionCPType: null,
      actionBankType: null,
      showActModal: false,
      showCPModal: false,
      showBankModal: false,
      showUpdateLocationModal: false,
      personalDetails: {},
      collectionPointList: [],
      formCPSupplierList: [],
      formPagination: {
        rowsPerPage: 5,
        rowsNumber: 10,
        page: 1
      },
      supplierOptions: [],
      isFormLoading: false,
      selectedSupplier: null,
      bankAccountList: [],
      addressVerify: false,
      markers: [],
      currentPlace: null,
      mapByKeyIn: false,
      locationIsLoading: false,
      loadingSuppliers: false,
      selectInputValue: null,
      personalInfoEdit: false,
      cpEdit: false,
      selectedEditBank: null,
      selectedAddBank: null,
      bankEdit: false,
      selectedBankEdit: null,
      selectedCPEdit: null,
      selectedCountry: null,
      countryOptions: [],
      selectedBankId: null,
      selectedCPId: null,
      gmapValueEdit: false,
      addNewCP: false,
      addNewBank: false,
      countries: [],
      countriesFiltered: [],
      markers: [],
      formBankData: {},
      gmarker: gmarker,
      customerProfiles: this.$helper.getCustomerProfiles(),
      emailRules: [
        (v) => {
          if (!v) return 'Please input email';
          if (v && isEmailValid(v)) return true;
          return 'Must be a valid email';
        }
      ],
      formCPData: {
        id: undefined,
        country_id: undefined,
        state: undefined,
        city: undefined,
        road: undefined,
        street_number: undefined,
        building: undefined,
        floor_number: undefined,
        unit: undefined,
        stall: undefined,
        postal_code: undefined,
        latlng: {
          lat: 1.3743588,
          lng: 103.8626313
        },
        street: undefined,
        profile: undefined,
        whatsapp_link: undefined,
        halal_products: false,
        beef_products: false
      },
      formUserData: {
        first_name: null,
        last_name: null,
        full_name: null,
        id: null,
        image: null,
        mobile: null,
        referred_number: null,
        email: null,
        active: null,
        country: {
          description: null,
          id: null,
          name: null
        },
        status_approval: null,
        user_type_id: null
      },
      bankOptions: [],
      cpIndex: null
    };
  },
  computed: {
    google: gmapApi,
    columns() {
      const res = [
        {
          name: 'supplier',
          align: 'left',
          label: '',
          field: 'supplier'
        }
      ];
      return res;
    },
    formColumns() {
      const res = [
        {
          name: 'name',
          align: 'left',
          label: 'Name',
          field: 'name'
        },
        {
          name: 'action',
          align: 'right',
          label: '',
          field: 'action'
        }
      ];
      return res;
    }
  },
  async mounted() {
    await this.getCountries();
    this.getData();
  },
  watch: {
    selectedCountry(v) {
      this.formUserData.country.id = v.id;
      this.formUserData.country.name = v.name;
      this.formUserData.country.description = v.description;
    },
    // selectedSupplier(v) {
    //   // this.formCPdata. = v.id;
    // },
    selectedEditBank(v) {
      this.formBankData.bank_id = v.id;
    },
    selectedAddBank(v) {
      this.formBankData.bank_id = v.id;
    },
    'formCPData.country_id'(v) {
      if (v === 193) {
        this.formCPData.state = 'Singapore';
        this.formCPData.city = 'Singapore';
      }
    },
    'formCPData.state': function (val) {
      this.formCPData.state = val ? val.removeSpecialCharacter() : '';
    },
    'formCPData.city': function (val) {
      this.formCPData.city = val ? val.removeSpecialCharacter() : '';
    },
    'formCPData.building': function (val) {
      this.formCPData.building = val ? val.removeSpecialCharacter() : '';
    },
    'formCPData.road': function (val) {
      this.formCPData.road = val ? val.removeSpecialCharacter() : '';
    },
    'formCPData.unit': function (val) {
      this.formCPData.unit = val ? val.removeSpecialCharacter() : '';
    }
  },
  methods: {
    async getData() {
      this.personalDetails = await this.getPersonalDetailsById();
      let arrName = this.personalDetails.full_name.split(' ');
      this.formUserData = {
        first_name: arrName.length > 0 ? arrName[0] : '',
        last_name: arrName.length > 1 ? arrName.pop() : '',
        full_name: this.personalDetails.full_name,
        id: this.personalDetails.id,
        image: this.personalDetails.image,
        mobile: this.replaceStar(this.personalDetails.mobile),
        referred_number: this.personalDetails.referred_number,
        email: this.replaceStar(this.personalDetails.email),
        active: this.personalDetails.active,
        country: {
          description: this.personalDetails.country.description,
          id: this.personalDetails.country.id,
          name: this.personalDetails.country.name
        },
        status_approval: this.personalDetails.status_approval,
        user_type_id: this.personalDetails.user_type_id
      };
      this.selectedCountry = this.countries.find((v) => v.id === this.personalDetails.country.id);
      let tempList = await this.getCollectionPointList();
      const supplierDatas = await Promise.all(
        tempList.map((v) =>
          this.getSupplierListByCPId({
            ...v,
            pagination: {
              perPage: 5,
              page: 1
            }
          })
        )
      );
      tempList.forEach((v, index) => {
        v.pagination = {
          perPage: 5,
          page: 1
        };
        v.supplier = supplierDatas[index];
        v.pagination.rowsNumber = supplierDatas[index].total_rows;
      });
      this.collectionPointList = tempList;
      this.bankAccountList = await this.getBankAccountList();
      this.bankOptions = await this.getBankList();
    },
    async getAllSuppliers() {
      this.loadingSuppliers = true;
      const data = await new Promise(async (resolve, reject) => {
        return this.$apollo
          .query({
            query: getAllSuppliersAdvocate,
            variables: {
              countryId: this.formCPData.country_id,
              keyword: this.selectInputValue,
              collectionPointId: this.formCPData.id
            }
          })
          .then((res) => {
            resolve(res?.data?.getAllSuppliers);
          })
          .catch((err) => {
            this.$q.dialog({
              parent: this,
              component: AlertMessage,
              title: 'failed',
              message: this.$helper.getGraphqlErrorMessage(err),
              buttonText: 'close'
            });
            reject(err);
          });
      });
      this.supplierOptions = data;
      this.loadingSuppliers = false;
      this.$refs.selectSupplier[0].showPopup();
    },
    async getCountries() {
      const data = await new Promise(async (resolve, reject) => {
        return this.$apollo
          .query({
            query: allCountries,
            variables: {
              active: true
            }
          })
          .then((res) => {
            resolve(res?.data?.allCountries);
          })
          .catch((err) => {
            this.$q.dialog({
              parent: this,
              component: AlertMessage,
              title: 'failed',
              message: this.$helper.getGraphqlErrorMessage(err),
              buttonText: 'close'
            });
            reject(err);
          });
      });
      this.countries = data;
      this.countryOptions = data;
      this.countriesFiltered = data;
    },
    async onProfileEditSubmit() {
      if (this.personalInfoEdit) {
        try {
          await this.$apollo
            .mutate({
              mutation: updateAdvocateDetails,
              variables: {
                jsonData: JSON.stringify({
                  id: this.formUserData.id,
                  image: this.formUserData.image,
                  first_name: this.formUserData.first_name,
                  last_name: this.formUserData.last_name,
                  email: this.formUserData.email,
                  mobile: this.formUserData.mobile,
                  country: {
                    id: this.formUserData.country.id,
                    name: this.formUserData.country.name,
                    description: this.formUserData.country.description
                  },
                  user_type_id: this.formUserData.user_type_id,
                  referred_number: this.formUserData.referred_number,
                  status_approval: this.formUserData.status_approval,
                  active: this.formUserData.active
                })
              }
            })
            .then(() => {
              Notice.ok('Successfully updated!');
              this.getData();
              this.personalInfoEdit = false;
            });
        } catch (error) {
          Notice.ok('Failed to update!');
        }
      }
    },
    async getPersonalDetailsById() {
      try {
        return await this.$apollo
          .query({
            query: getAllAdvocates,
            variables: {
              advocateId: parseInt(this.id)
            }
          })
          .then((res) => {
            return res?.data?.getAllAdvocates.advocate_users?.[0];
          })
          .catch((err) => {
            this.$q.dialog({
              parent: this,
              component: AlertMessage,
              title: this.$t('failed'),
              message: this.$helper.getGraphqlErrorMessage(err),
              buttonText: this.$t('close')
            });
          });
      } catch (err) {
        this.$q.dialog({
          parent: this,
          component: AlertMessage,
          title: 'Failed',
          message: err
        });
      }
    },
    async getCollectionPointList() {
      try {
        return await this.$apollo
          .query({
            query: getCollectionPointByUserId,
            variables: {
              userId: parseInt(this.id)
            }
          })
          .then((res) => {
            return res?.data?.getCollectionPointByUserId;
          })
          .catch((err) => {
            this.$q.dialog({
              parent: this,
              component: AlertMessage,
              title: this.$t('failed'),
              message: this.$helper.getGraphqlErrorMessage(err),
              buttonText: this.$t('close')
            });
          });
      } catch (err) {
        this.$q.dialog({
          parent: this,
          component: AlertMessage,
          title: 'Failed',
          message: err
        });
      }
    },
    async getSupplierListByCPId(cp, page) {
      try {
        return await this.$apollo
          .query({
            query: getAllSupplierByCPId,
            variables: {
              CollectionPointId: cp.customer.id,
              page: page ? page : cp.pagination.page,
              perPage: 5
            }
          })
          .then((res) => {
            return res?.data?.getAllSupplierByCPId;
          })
          .catch((err) => {
            this.$q.dialog({
              parent: this,
              component: AlertMessage,
              title: this.$t('failed'),
              message: this.$helper.getGraphqlErrorMessage(err),
              buttonText: this.$t('close')
            });
          });
      } catch (err) {
        this.$q.dialog({
          parent: this,
          component: AlertMessage,
          title: 'Failed',
          message: err
        });
      }
    },
    async getFormSupplierListByCPId(page) {
      try {
        return await this.$apollo
          .query({
            query: getAllSupplierByCPId,
            variables: {
              CollectionPointId: this.formCPData.id,
              page: page,
              perPage: 5
            }
          })
          .then((res) => {
            return res?.data?.getAllSupplierByCPId;
          })
          .catch((err) => {
            this.$q.dialog({
              parent: this,
              component: AlertMessage,
              title: this.$t('failed'),
              message: this.$helper.getGraphqlErrorMessage(err),
              buttonText: this.$t('close')
            });
          });
      } catch (err) {
        this.$q.dialog({
          parent: this,
          component: AlertMessage,
          title: 'Failed',
          message: err
        });
      }
    },
    async onRequest(props) {
      let pagination = {
        page: props.pagination.page,
        rowsPerPage: props.pagination.rowsPerPage,
        perPage: 5,
        rowsNumber: props.pagination.rowsNumber
      };
      this.collectionPointList[this.cpIndex] = {
        ...this.collectionPointList[this.cpIndex],
        pagination: pagination
      };
      let supplierData = await this.getSupplierListByCPId(this.collectionPointList[this.cpIndex]);
      const newItem = {
        ...this.collectionPointList[this.cpIndex],
        pagination: pagination,
        supplier: supplierData
      };
      const collectionPointList = this.collectionPointList.slice();
      collectionPointList.splice(this.cpIndex, 1, newItem);
      this.collectionPointList = collectionPointList;
    },
    async onFormRequest(props) {
      const { page } = props.pagination;
      const data = await this.getFormSupplierListByCPId(page);
      this.formCPSupplierList = data.supplier_list;
      this.formPagination.page = page;
    },
    async deleteSupplier(supplierId) {
      this.isFormLoading = true;
      await new Promise((resolve, reject) => {
        return this.$apollo
          .mutate({
            mutation: unLinkCollectionPointSupplier,
            variables: {
              collectionPointId: this.formCPData.id,
              supplierId: supplierId
            }
          })
          .then((res) => {
            return resolve(res?.data?.unLinkCollectionPointSupplier);
          })
          .catch((err) => {
            return reject(err?.message);
          });
      });
      const data = await this.getFormSupplierListByCPId(this.formPagination.page);
      this.formCPSupplierList = data.supplier_list;
      this.isFormLoading = false;
    },
    async addSupplier() {
      this.isFormLoading = true;
      await new Promise((resolve, reject) => {
        return this.$apollo
          .mutate({
            mutation: linkCollectionPointSupplier,
            variables: {
              collectionPointId: this.formCPData.id,
              supplierId: this.selectedSupplier.tenant_id
            }
          })
          .then((res) => {
            return resolve(res?.data?.linkCollectionPointSupplier);
          })
          .catch((err) => {
            return reject(err?.message);
          });
      });
      const data = await this.getFormSupplierListByCPId(this.formPagination.page);
      this.formCPSupplierList = data.supplier_list;
      this.supplierOptions = [];
      this.isFormLoading = false;
    },
    setInputValue(val) {
      this.selectInputValue = val;
    },
    async getBankAccountList() {
      try {
        return await this.$apollo
          .query({
            query: getBankListByUserId,
            variables: {
              userId: parseInt(this.id)
            }
          })
          .then((res) => {
            return res?.data?.getBankListByUserId;
          })
          .catch((err) => {
            this.$q.dialog({
              parent: this,
              component: AlertMessage,
              title: this.$t('failed'),
              message: this.$helper.getGraphqlErrorMessage(err),
              buttonText: this.$t('close')
            });
          });
      } catch (err) {
        this.$q.dialog({
          parent: this,
          component: AlertMessage,
          title: 'Failed',
          message: err
        });
      }
    },
    async getBankList() {
      try {
        return await this.$apollo
          .query({
            query: getAllBanks,
            variables: {
              countryId: this.personalDetails.country.id
            }
          })
          .then((res) => {
            return res?.data?.getAllBanks;
          })
          .catch((err) => {
            this.$q.dialog({
              parent: this,
              component: AlertMessage,
              title: this.$t('failed'),
              message: this.$helper.getGraphqlErrorMessage(err),
              buttonText: this.$t('close')
            });
          });
      } catch (err) {
        this.$q.dialog({
          parent: this,
          component: AlertMessage,
          title: 'Failed',
          message: err
        });
      }
    },
    photoProfile(photoName, parentUrl) {
      if (photoName) {
        return typeof photoName === 'string' && photoName.startsWith('http')
          ? photoName
          : `${aws_s3_bucket_public}/${parentUrl}/${photoName}`;
      }
      return `${aws_s3_bucket_public}/${parentUrl}/no_image.png`;
    },
    phoneNumberFormat(number) {
      return this.$helper.getPhoneString(number);
    },
    gotoRoute(path) {
      this.$router.push(path);
    },
    showActionModal(type) {
      this.actionType = type;
      this.showActModal = true;
    },
    async updateUser() {
      let statusApproval;
      if (this.actionType) {
        //approve
        statusApproval = 1;
      } else {
        //reject
        statusApproval = 2;
      }

      await new Promise((resolve, reject) => {
        return this.$apollo
          .mutate({
            mutation: advocateApproval,
            variables: {
              listId: [this.personalDetails.id],
              statusApproval: statusApproval
            }
          })
          .then((res) => {
            return resolve(res?.data?.advocateApproval);
          })
          .catch((err) => {
            return reject(err?.message);
          });
      });
      this.showActModal = false;
      this.getData();
    },
    async updateCP() {
      await new Promise((resolve, reject) => {
        return this.$apollo
          .mutate({
            mutation: verifyCollectionPoint,
            variables: {
              userId: this.collectionPointList.user_id,
              collectionPointId: this.selectedCPId
            }
          })
          .then((res) => {
            return resolve(res?.data?.verifyCollectionPoint);
          })
          .catch((err) => {
            return reject(err?.message);
          });
      });
      this.showCPModal = false;
      this.selectedCPId = null;
      this.getData();
    },
    async updateBank() {
      await new Promise((resolve, reject) => {
        return this.$apollo
          .mutate({
            mutation: verifyBankAccount,
            variables: {
              bankDetailId: this.selectedBankId
            }
          })
          .then((res) => {
            return resolve(res?.data?.verifyBankAccount);
          })
          .catch((err) => {
            return reject(err?.message);
          });
      });
      this.showBankModal = false;
      this.selectedBankId = null;
      this.getData();
    },
    closePopUp(type) {
      if (type == 1) this.showActModal = false;
      else if (type == 2) this.showCPModal = false;
      else if (type == 3) this.showBankModal = false;
      else if (type == 4) this.showUpdateLocationModal = false;
    },
    openBankEdit(bankAccount, index) {
      if (!this.bankEdit && !this.addNewBank) {
        this.formBankData = bankAccount;
        this.selectedBankEdit = index;
        this.bankEdit = true;
      } else {
        Notice.warn('You already opened New or Edit Bank form.');
      }
    },
    async onBankEditSubmit() {
      if (this.bankEdit) {
        try {
          this.$q.loading.show({
            message: 'Please wait...'
          });
          await this.$apollo
            .mutate({
              mutation: updateBankAccountDetails,
              variables: {
                jsonData: JSON.stringify({
                  id: this.formBankData.id,
                  bank_name: this.formBankData.bank.bank_name,
                  account_number: this.formBankData.account_number,
                  account_name: this.formBankData.account_name,
                  bank_code: this.formBankData.bank_code,
                  branch_code: this.formBankData.branch_code,
                  country_id: this.formBankData.bank_id
                })
              }
            })
            .then(() => {
              Notice.ok('Successfully updated!');
              this.formBankData = {};
              this.bankEdit = false;
              this.selectedBankEdit = null;
              this.getData();
            });
        } catch (error) {
          Notice.fail('Failed to update!');
        } finally {
          this.$q.loading.hide();
        }
      }
    },
    async getAddressFromLatLng(latlng) {
      this.locationIsLoading = true;
      const geocoder = new google.maps.Geocoder();
      const getDetails = await new Promise((resolve, reject) => {
        geocoder
          .geocode({ location: latlng })
          .then((response) => {
            if (response.results[0]) {
              resolve(response.results[0]);
            }
          })
          .catch((err) => {
            this.$q.dialog({
              parent: this,
              component: AlertMessage,
              title: 'location error',
              message: err.message,
              buttonText: 'close'
            });
            this.locationIsLoading = false;
            reject(err.message);
          });
      });
      this.locationIsLoading = false;
      return getDetails;
    },
    filterCountry(val, update, abort) {
      if (val === '') {
        update(() => {
          this.countryOptions = this.countries;
        });
        return;
      }
      update(() => {
        const needle = val.toLowerCase();
        this.countryOptions = this.countries.filter((v) => v.description.toLowerCase().indexOf(needle) > -1);
      });
    },
    setPlace(place) {
      this.currentPlace = place;
      this.addMarker();
    },
    setGmapLocation(place) {
      this.currentPlace = place;
      this.showUpdateLocationModal = true;
    },
    updateLocation() {
      this.showUpdateLocationModal = false;
      this.addMarker();
    },
    replaceStar(str) {
      return str?.replaceAll('*', '');
    },
    async openCPEdit(collectionPoint, index) {
      if (!this.cpEdit && !this.addNewCP) {
        this.formCPData = {
          id: collectionPoint.customer?.id || null,
          country_id: collectionPoint.customer?.address[0]?.country?.id || null,
          state: collectionPoint.customer?.address[0]?.state || null,
          city: collectionPoint.customer?.address[0]?.city || null,
          road: collectionPoint.customer?.address[0]?.road || null,
          street_number: null,
          building: collectionPoint.customer?.address[0]?.building || null,
          floor_number: collectionPoint.customer?.address[0]?.floor_number || null,
          unit: collectionPoint.customer?.address[0]?.unit || null,
          stall: collectionPoint.customer?.address[0]?.stall || null,
          postal_code: collectionPoint.customer?.address[0]?.postal_code || null,
          latlng: {
            lat: collectionPoint.customer?.address[0]?.latlng?.lat || null,
            lng: collectionPoint.customer?.address[0]?.latlng?.lng || null
          },
          street: null,
          gmapAutoValue: collectionPoint.customer?.address[0]?.road || null,
          halal_products: collectionPoint.customer?.halal_products || false,
          beef_products: collectionPoint.customer?.beef_products || false,
          whatsapp_link: collectionPoint.customer?.whatsapp_link || null,
          profile: collectionPoint.customer?.profile || null
        };
        this.formPagination.page = 1;
        const data = await this.getFormSupplierListByCPId(this.formPagination.page);
        this.formCPSupplierList = data.supplier_list;
        this.formPagination.rowsNumber = collectionPoint.pagination.rowsNumber;
        this.selectedCPEdit = index;
        this.cpEdit = true;
      } else {
        Notice.warn('You already opened New or Edit CP form.');
      }
    },
    async onCPEditSubmit() {
      if (this.cpEdit) {
        try {
          this.$q.loading.show({
            message: 'Please wait...'
          });
          await this.$apollo
            .mutate({
              mutation: updateCollectionPointDetails,
              variables: {
                jsonAddressDetails: JSON.stringify({
                  id: this.formCPData.id,
                  country_id: this.formCPData.country_id,
                  state: this.formCPData.state,
                  city: this.formCPData.city,
                  road: this.formCPData.road,
                  street_number: this.formCPData.street_number,
                  building: this.formCPData.building,
                  floor_number: this.formCPData.floor_number,
                  unit: this.formCPData.unit,
                  stall: this.formCPData.stall,
                  postal_code: this.formCPData.postal_code,
                  latlng: this.formCPData.latlng,
                  profile: this.formCPData.profile,
                  halal_products: this.formCPData.halal_products,
                  beef_products: this.formCPData.beef_products,
                  whatsapp_link: this.formCPData.whatsapp_link
                })
              }
            })
            .then(() => {
              Notice.ok('Successfully updated!');
              this.formCPData = {
                latlng: {
                  lat: 1.3743588,
                  lng: 103.8626313
                },
                halal_products: false,
                beef_products: false
              };
              this.cpEdit = false;
              this.selectedCPEdit = null;
              this.gmapValueEdit = false;
              this.getData();
            });
        } catch (error) {
          Notice.fail('Failed to update!');
        } finally {
          this.$q.loading.hide();
        }
      }
    },
    async onCPNewSubmit() {
      if (this.addNewCP) {
        try {
          this.$q.loading.show({
            message: 'Please wait...'
          });
          await this.$apollo
            .mutate({
              mutation: addNewCollectionPoint,
              variables: {
                jsonData: JSON.stringify({
                  user_id: Number.parseInt(this.id),
                  // supplier_id: this.formCPData.supplier_id,
                  country_id: this.formCPData.country_id,
                  state: this.formCPData.state,
                  city: this.formCPData.city,
                  road: this.formCPData.road,
                  street_number: this.formCPData.street_number,
                  building: this.formCPData.building,
                  floor_number: this.formCPData.floor_number,
                  unit: this.formCPData.unit,
                  stall: this.formCPData.stall,
                  postal_code: this.formCPData.postal_code,
                  latlng: this.formCPData.latlng,
                  profile: this.formCPData.profile,
                  halal_products: this.formCPData.halal_products,
                  beef_products: this.formCPData.beef_products,
                  whatsapp_link: this.formCPData.whatsapp_link
                })
              }
            })
            .then(() => {
              Notice.ok('Successfully updated!');
              this.formCPData = {
                latlng: {
                  lat: 1.3743588,
                  lng: 103.8626313
                },
                halal_products: false,
                beef_products: false
              };
              this.addNewCP = false;
              this.gmapValueEdit = false;
              this.getData();
            });
        } catch (error) {
          Notice.fail('Failed to update!');
        } finally {
          this.$q.loading.hide();
        }
      }
    },
    openNewCP() {
      if (!this.cpEdit && !this.addNewCP) {
        this.gmapValueEdit = false;
        this.formCPData = {
          latlng: {
            lat: 1.3743588,
            lng: 103.8626313
          },
          halal_products: false,
          beef_products: false
        };
        this.addNewCP = true;
      } else {
        Notice.warn('You already opened New or Edit CP form.');
      }
    },
    cancelNewCP() {
      this.formCPData = {
        latlng: {
          lat: 1.3743588,
          lng: 103.8626313
        },
        halal_products: false,
        beef_products: false
      };
      this.addNewCP = false;
      this.gmapValueEdit = false;
    },
    openNewBank() {
      if (!this.bankEdit && !this.addNewBank) {
        this.formBankData = {};
        this.addNewBank = true;
      } else {
        Notice.warn('You already opened New or Edit Bank form.');
      }
    },
    async onBankNewSubmit() {
      if (this.addNewBank) {
        try {
          this.$q.loading.show({
            message: 'Please wait...'
          });
          await this.$apollo
            .mutate({
              mutation: addNewBankAccount,
              variables: {
                jsonData: JSON.stringify({
                  user_id: parseInt(this.id),
                  bank_id: this.formBankData.bank_id,
                  account_number: this.formBankData.account_number,
                  account_name: this.formBankData.account_name,
                  bank_code: this.formBankData.bank_code,
                  branch_code: this.formBankData.branch_code
                })
              }
            })
            .then(() => {
              Notice.ok('Successfully added!');
              this.addNewBank = false;
              this.formBankData = {};
              this.selectedAddBank = null;
              this.getData();
            });
        } catch (error) {
          Notice.fail('Failed to add!');
        } finally {
          this.$q.loading.hide();
        }
      }
    },
    cancelNewBank() {
      this.formBankData = {};
      this.addNewBank = false;
      this.selectedBankEdit = null;
    },
    setRoad(data) {
      let country = data.filter((x) => x.types[0] === 'country');
      country = country.length > 0 ? country[0].long_name : null;
      this.formCPData.country_id = this.countriesFiltered?.filter((x) => x.description === country)?.[0]?.id;

      let city = data.filter((x) => ['locality', 'administrative_area_level_2'].includes(x.types[0]));
      this.formCPData.city = city.length > 0 ? city[0].long_name : null;

      let state = data.filter((x) => x.types[0] === 'administrative_area_level_1'); //singapore dont have state jusr return singapore as state and city
      this.formCPData.state =
        country === 'Singapore' ? country : state.length > 0 ? state[0].long_name : null;

      let street = data.filter((x) => x.types[0] === 'street_number');
      street = street.length > 0 ? street[0].short_name : null;

      let route = data.filter((x) => x.types[0] === 'route');
      route = route.length > 0 ? route[0].short_name : 'N/A';
      return street ? street.concat(' ', route) : route;
    },
    async addMarker() {
      if (this.currentPlace) {
        const marker = {
          lat: this.currentPlace.latLng
            ? this.currentPlace.latLng.lat()
            : this.currentPlace.geometry.location.lat(),
          lng: this.currentPlace.latLng
            ? this.currentPlace.latLng.lng()
            : this.currentPlace.geometry.location.lng()
        };
        this.markers = [{ position: marker }];
        this.formCPData.latlng = marker;
        if (!this.currentPlace?.latLng && this.currentPlace?.geometry?.location) {
          this.center = marker;
          this.setRoad(this.currentPlace.address_components);
          this.formCPData.road = this.setRoad(this.currentPlace.address_components);
          this.formCPData.gmapAutoValue = this.formCPData.road;
          this.formCPData.postal_code = this.currentPlace?.address_components?.filter(
            (x) => x.types[0] === 'postal_code'
          );
          this.formCPData.postal_code =
            this.formCPData.postal_code.length > 0 ? this.formCPData.postal_code[0].short_name : 'N/A';
        } else {
          this.currentPlace = !this.locationIsLoading
            ? await this.getAddressFromLatLng(marker)
            : this.currentPlace;
          // this.formCPData.road = this.formCPData.road ? this.formCPData.road : this.setRoad(this.currentPlace.address_componentsl);
          this.mapByKeyIn = this.formCPData.road && this.mapByKeyIn ? true : false;
          this.formCPData.road = this.mapByKeyIn
            ? this.formCPData.road
            : this.setRoad(this.currentPlace.address_components);
          this.formCPData.postal_code = this.currentPlace.address_components.filter(
            (x) => x.types[0] === 'postal_code'
          );
          this.formCPData.postal_code =
            this.formCPData.postal_code.length > 0 ? this.formCPData.postal_code[0].short_name : 'N/A';
        }
        this.currentPlace = null;
        this.gmapValueEdit = true;
      }
    },
    editProfile() {
      this.personalInfoEdit = true;
    }
  }
};
</script>
<style scoped>
.link-btn {
  color: #a2acb5;
  text-decoration: underline;
}
.link-btn:hover {
  color: var(--q-color-primary);
}
</style>
