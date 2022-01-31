<template>
  <q-page padding>
    <div class="d_header q-mb-md q-ml-md q-mt-lg">
      <div class="row">
        <div class="col-xs-12">
          <div class="text-title text-h7">
            <span class="text-primary text-weight-medium">
              <span
                @click="gotoRoute('/main/supplier/all_supplier')"
                class="link-btn text-weight-regular cursor-pointer"
                >All Suppliers</span
              >
              / {{ getTenantData.name }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <q-tabs v-model="main_tab" dense no-caps class="bg-grey-3" align="justify" narrow-indicator>
      <q-tab name="profile" label="Profile" />
      <q-tab name="group_buy" label="Group Buy" />
      <q-tab name="business" label="Business" />
      <q-tab name="payments" label="Payments" />
    </q-tabs>

    <q-separator />
    <q-separator />
    <q-tab-panels v-model="main_tab" animated>
      <q-tab-panel name="profile">
        <q-splitter v-model="splitterModel" unit="px" disable :separator-style="{ width: '0px' }">
          <template v-slot:before>
            <q-tabs v-model="tab1" vertical dense class="text-black" active-color="primary">
              <q-tab class="text-capitalize text-left" name="basic_info" label="Basic Information" />
              <q-tab class="text-capitalize text-left" name="opening_hours" label="Opening Hours" />
              <q-tab class="text-capitalize text-left" name="delivery_hours" label="Delivery Hours" />
              <q-tab class="text-capitalize text-left" name="list_states" label="List of States" />
              <q-tab class="text-capitalize text-left" name="internal_users" label="Internal Users" />
            </q-tabs>
          </template>
          <template v-slot:after>
            <q-scroll-area ref="scrollArea" style="height: 65vh">
              <q-form @submit.prevent="submitTab1" id="tab1Form" class="tdots-edit-form">
                <div
                  class="q-mx-md q-pa-md q-mb-md"
                  style="border: 1px solid #dadce0; border-radius: 4px"
                  id="basic_info"
                >
                  <div class="row q-mb-lg full-width">
                    <span class="text-title text-subtitle2 text-weight-bold"> Basic Information </span>
                  </div>
                  <div class="row">
                    <div class="col-md-2 col-sm-4 col-xs-12 q-mb-md">
                      <div class="full-width justify-center flex q-mb-md">
                        <div class="col-auto column justify-center items-center">
                          <q-img
                            class="col-auto q-mt-md"
                            placeholder-src="https://cdn3.iconfinder.com/data/icons/outline-style-1/512/profile-512.png"
                            :src="formSupplierData.base64_image"
                            style="height: 130px; width: 130px; border-radius: 50%"
                          >
                            <div
                              style="border-radius: 50%; border: 4px solid #dadce0"
                              class="absolute-full bg-transparent text-subtitle2 flex flex-center"
                            />
                          </q-img>
                          <template v-if="editState.profile">
                            <div style="text-align: center">
                              <q-btn
                                dense
                                fab-mini
                                text-color="#DADCE0"
                                icon="eva-image-outline"
                                @click="() => $refs.photoInput.pickFiles()"
                                style="transform: translate(32px, -36px); background-color: #dadce0"
                              />
                              <q-uploader
                                ref="photoInput"
                                @added="onPhotoChanged"
                                accept="image/*"
                                style="display: none"
                              />
                            </div>
                          </template>
                        </div>
                      </div>
                    </div>
                    <div class="offset-md-1 col-md-8 col-sm-8 col-xs-12">
                      <template v-if="editState.profile">
                        <div class="row q-mb-sm">
                          <div class="q-pr-md q-mb-md col-sm-6 col-xs-12">
                            <div class="q-mb-xs row">Company Name</div>
                            <q-input
                              type="text"
                              v-model="formSupplierData.name"
                              placeholder="Company Name"
                              stack-label
                              outlined
                              lazy-rules
                              dense
                              :rules="[(val) => !!val || 'Please type something']"
                            />
                          </div>
                          <div class="q-pr-md col-sm-6 col-xs-12">
                            <div class="q-mb-xs row">Registration Number</div>
                            <q-input
                              type="text"
                              v-model="formSupplierData.registration_number"
                              placeholder="Registration Number"
                              stack-label
                              outlined
                              dense
                              lazy-rules
                              :rules="[(val) => !!val || 'Please type something']"
                            />
                          </div>
                        </div>
                        <div class="row q-mb-sm">
                          <div class="q-pr-md q-mb-md col-md-6 col-sm-6 col-xs-12">
                            <div class="q-mb-xs row">Tax Registration Number</div>
                            <q-input
                              type="text"
                              v-model="formSupplierData.tax_registration_number"
                              placeholder="Tax Registration Number"
                              stack-label
                              outlined
                              lazy-rules
                              dense
                              :rules="[(val) => !!val || 'Please type something']"
                            />
                          </div>
                        </div>
                        <div class="row q-mb-sm">
                          <div class="q-pr-md q-mb-md col-sm-6 col-xs-12">
                            <div class="q-mb-xs row">Email</div>
                            <q-input
                              type="text"
                              v-model="formSupplierData.email"
                              placeholder="Email"
                              stack-label
                              outlined
                              lazy-rules
                              dense
                              :rules="[(val) => !!val || 'Please type something']"
                            />
                          </div>
                          <div class="q-pr-md col-sm-6 col-xs-12">
                            <div class="q-mb-xs row">Profile Type</div>
                            <q-select
                              v-model="formSupplierData.profile"
                              label="Select Profile Type"
                              outlined
                              dense
                              lazy-rules
                              :options="customerProfiles"
                              :rules="[(v) => !!v || 'Profile cannot be empty']"
                            />
                          </div>
                        </div>
                        <div class="row q-mb-sm">
                          <div class="q-mr-md q-mb-md col-md-3 col-sm-4 col-xs-12">
                            <div class="q-mb-xs">
                              Email Notification
                              <q-icon name="help_outline" class="q-ml-xs text-grey-6">
                                <template v-slot:default>
                                  <q-tooltip anchor="bottom middle" self="top middle">
                                    Allow email notifications to be sent to the provided email
                                  </q-tooltip>
                                </template>
                              </q-icon>
                            </div>
                            <q-toggle
                              v-model="formSupplierData.email_notification"
                              :true-value="1"
                              :false-value="0"
                              :label="formSupplierData.email_notification === 1 ? 'Yes' : 'No'"
                            />
                          </div>
                          <div class="q-mr-md q-mb-md col-md-3 col-sm-4 col-xs-12">
                            <div class="q-mb-xs">
                              Halal Certified
                              <q-icon name="help_outline" class="q-ml-xs text-grey-6">
                                <template v-slot:default>
                                  <q-tooltip anchor="bottom middle" self="top middle">
                                    Business has the Halal Certification
                                  </q-tooltip>
                                </template>
                              </q-icon>
                            </div>
                            <q-toggle
                              v-model="formSupplierData.halal_products"
                              :true-value="true"
                              :false-value="false"
                              :label="formSupplierData.halal_products === true ? 'Yes' : 'No'"
                            />
                          </div>
                          <div class="q-mr-md q-mb-md col-md-3 col-sm-4 col-xs-12">
                            <div class="q-mb-xs">Active</div>
                            <q-toggle
                              v-model="formSupplierData.active"
                              :true-value="true"
                              :false-value="false"
                              :label="formSupplierData.active === true ? 'Yes' : 'No'"
                            />
                          </div>
                        </div>
                      </template>
                      <template v-if="!editState.profile">
                        <div class="row">
                          <div class="col-sm-6 col-xs-12">Company Name</div>
                          <div class="col-sm-6 col-xs-12">{{ formSupplierData.name }}</div>
                        </div>
                        <div class="row">
                          <div class="q-pr-md col-sm-6 col-xs-12">Tenant ID</div>
                          <div class="q-pr-md col-sm-6 col-xs-12">{{ supplierId }}</div>
                        </div>
                        <div class="row">
                          <div class="q-pr-md col-sm-6 col-xs-12">Registration Number</div>
                          <div class="q-pr-md col-sm-6 col-xs-12">
                            {{ formSupplierData.registration_number }}
                          </div>
                        </div>
                        <div class="row">
                          <div class="q-pr-md col-sm-6 col-xs-12">Tax Registration Number</div>
                          <div class="q-pr-md col-sm-6 col-xs-12">
                            {{ formSupplierData.tax_registration_number }}
                          </div>
                        </div>
                        <div class="row">
                          <div class="q-pr-md col-sm-6 col-xs-12">Email</div>
                          <div class="q-pr-md col-sm-6 col-xs-12">{{ formSupplierData.email }}</div>
                        </div>
                        <div class="row">
                          <div class="q-pr-md col-sm-6 col-xs-12">Profile</div>
                          <div class="q-pr-md col-sm-6 col-xs-12">{{ formSupplierData.profile }}</div>
                        </div>
                        <div class="row">
                          <div class="q-pr-md col-sm-6 col-xs-12">Email Notification</div>
                          <div class="q-pr-md col-sm-6 col-xs-12">
                            {{ formSupplierData.email_notification ? 'Yes' : 'No' }}
                          </div>
                        </div>
                        <div class="row">
                          <div class="q-pr-md col-sm-6 col-xs-12">Halal Certified</div>
                          <div class="q-pr-md col-sm-6 col-xs-12">
                            {{ formSupplierData.halal_products ? 'Yes' : 'No' }}
                          </div>
                        </div>
                        <div class="row">
                          <div class="q-pr-md col-sm-6 col-xs-12">Active</div>
                          <div class="q-pr-md col-sm-6 col-xs-12">
                            {{ formSupplierData.active ? 'Yes' : 'No' }}
                          </div>
                        </div>
                      </template>
                    </div>
                  </div>
                </div>
                <q-table
                  :data="formOpeningData"
                  :columns="columnsOrder"
                  class="tdots-table q-ma-md"
                  :hide-pagination="true"
                  :rows-per-page-options="[0]"
                  :pagination.sync="paginationOpen"
                  id="opening_hours"
                >
                  <template v-slot:top>
                    <span class="text-weight-bold">Opening Hours</span>
                  </template>
                  <template v-slot:body-cell-day="props">
                    <q-td>
                      <span>{{ weekArray[props.row.day_id - 1] }}</span>
                    </q-td>
                  </template>
                  <template v-slot:body-cell-startTime="props">
                    <q-td>
                      <span>{{ props.row.open_hour + ':' + props.row.open_minute }}</span>
                    </q-td>
                  </template>
                  <template v-slot:body-cell-endTime="props">
                    <q-td>
                      <span>{{ props.row.close_hour + ':' + props.row.close_minute }}</span>
                    </q-td>
                  </template>
                  <template v-if="editState.profile" v-slot:body-cell-noOrder="props">
                    <q-td>
                      <q-checkbox
                        v-model="props.row.active"
                        label="Not open"
                        @input="resetOpenHour(props.row)"
                      ></q-checkbox>
                    </q-td>
                  </template>
                  <template v-if="editState.profile" v-slot:body-cell-actions="props">
                    <q-td class="text-right">
                      <q-icon
                        name="eva-edit-outline"
                        size="sm"
                        color="grey"
                        class="cursor-pointer"
                        @click="editOrder(props.row)"
                      >
                        <q-tooltip>Edit</q-tooltip>
                      </q-icon>
                    </q-td>
                  </template>
                </q-table>
                <q-table
                  :data="formDeliveryData"
                  :columns="columnsOrder"
                  class="tdots-table q-ma-md"
                  :hide-pagination="true"
                  :rows-per-page-options="[0]"
                  :pagination.sync="paginationDelivery"
                  id="delivery_hours"
                >
                  <template v-slot:top>
                    <span class="text-weight-bold">Delivery Hours</span>
                  </template>
                  <template v-slot:body-cell-day="props">
                    <q-td>
                      <span>{{ weekArray[props.row.day_id - 1] }}</span>
                    </q-td>
                  </template>
                  <template v-slot:body-cell-startTime="props">
                    <q-td>
                      <span>{{ props.row.open_hour + ':' + props.row.open_minute }}</span>
                    </q-td>
                  </template>
                  <template v-slot:body-cell-endTime="props">
                    <q-td>
                      <span>{{ props.row.close_hour + ':' + props.row.close_minute }}</span>
                    </q-td>
                  </template>
                  <template v-if="editState.profile" v-slot:body-cell-noOrder="props">
                    <q-td>
                      <q-checkbox
                        v-model="props.row.active"
                        label="No Delivery"
                        @input="resetDeliveryHour(props.row)"
                      ></q-checkbox>
                    </q-td>
                  </template>
                  <template v-if="editState.profile" v-slot:body-cell-actions="props">
                    <q-td class="text-right">
                      <q-icon
                        name="eva-edit-outline"
                        size="sm"
                        color="grey"
                        class="cursor-pointer"
                        @click="editDelivery(props.row)"
                      >
                        <q-tooltip>Edit</q-tooltip>
                      </q-icon>
                    </q-td>
                  </template>
                </q-table>
                <q-table
                  :data="formStateData"
                  :columns="columnsState"
                  class="tdots-table q-ma-md tdots-bottom"
                  :hide-pagination="true"
                  :loading="isLoadingState"
                  :filter="filterState"
                  id="list_states"
                >
                  <template v-slot:top>
                    <span class="text-weight-bold"
                      >List Of States
                      <q-icon name="help_outline" class="q-ml-xs text-grey-6">
                        <template v-slot:default>
                          <q-tooltip anchor="bottom middle" self="top middle">
                            Supplier will only be visible to users in states that they operate in
                          </q-tooltip>
                        </template>
                      </q-icon>
                    </span>
                    <!-- <search-top-right v-model="filterState" label="Search State / City" /> -->
                  </template>
                  <template v-slot:body-cell-country="props">
                    <q-td>
                      <span>{{ props.row.country }}</span>
                    </q-td>
                  </template>
                  <template v-slot:body-cell-state="props">
                    <q-td>
                      <span>{{ props.row.stateLabel }}</span>
                    </q-td>
                  </template>
                  <template v-if="editState.profile" v-slot:body-cell-actions="props">
                    <q-td class="text-right">
                      <q-icon
                        name="far fa-trash-alt"
                        size="sm"
                        color="red"
                        class="cursor-pointer"
                        @click="deleteState(props.row.stateId)"
                      >
                        <q-tooltip>Delete</q-tooltip>
                      </q-icon>
                    </q-td>
                  </template>
                  <template v-if="editState.profile" v-slot:bottom>
                    <q-tr>
                      <q-td colspan="100%">
                        <q-btn
                          flat
                          color="grey-6"
                          @click="showAddNewCityModal = true"
                          icon="add"
                          label="New State"
                        />
                      </q-td>
                    </q-tr>
                  </template>
                  <template v-slot:no-data>
                    <div class="full-width row items-center q-py-sm justify-center">
                      <span></span>
                    </div>
                    <template v-if="editState.profile">
                      <div class="full-width row items-center q-py-sm bordered-top">
                        <q-btn flat @click="showAddNewCityModal = true" icon="add" label="New State" />
                      </div>
                    </template>
                  </template>
                </q-table>
                <q-table
                  :data="formInternalUserData"
                  :columns="columnsInternalUsers"
                  class="tdots-table q-ma-md"
                  :pagination="paginationInternalUsers"
                  :loading="isLoadingInternalUsers"
                  id="internal_users"
                >
                  <template v-slot:top>
                    <span class="text-weight-bold">Internal Users</span>
                    <q-space />
                    <template v-if="editState.profile">
                      <q-btn
                        no-caps
                        flat
                        color="grey-7"
                        label="New Internal Users"
                        icon="add"
                        @click="
                          selectedInternalUser = null;
                          showAddInternalUserModal = true;
                        "
                      />
                    </template>
                  </template>
                  <template v-slot:body-cell-name="props">
                    <q-td>
                      <span>{{ props.row.first_name + ' ' + props.row.last_name }}</span>
                    </q-td>
                  </template>
                  <template v-slot:body-cell-email="props">
                    <q-td>
                      <span>{{ props.row.email }}</span>
                    </q-td>
                  </template>
                  <template v-slot:body-cell-mobile="props">
                    <q-td>
                      <span>{{ phoneNumberFormat(props.row.mobile) }}</span>
                    </q-td>
                  </template>
                  <template v-slot:body-cell-country="props">
                    <q-td>
                      <span>{{ getCountryName(props.row.country_id) }}</span>
                    </q-td>
                  </template>
                  <template v-slot:body-cell-active="props">
                    <q-td>
                      <q-toggle
                        v-model="props.row.active"
                        :true-value="true"
                        :false-value="false"
                        :label="props.row.active === true ? 'Yes' : 'No'"
                      />
                    </q-td>
                  </template>
                  <template v-if="editState.profile" v-slot:body-cell-action="props">
                    <q-td>
                      <q-icon
                        name="eva-edit-2-outline"
                        class="cursor-pointer q-mr-xs"
                        size="sm"
                        @click="editInternal(props.row)"
                      >
                        <q-tooltip>Edit</q-tooltip>
                      </q-icon>
                      <q-icon
                        name="far fa-trash-alt"
                        size="sm"
                        color="red"
                        class="cursor-pointer"
                        @click="deleteInternal(props.row)"
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
                          {{ Math.ceil(formInternalUserData.length / props.pagination.rowsPerPage) }}</span
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
                  <template v-slot:no-data>
                    <div class="col-md-12 text-center"></div>
                  </template>
                </q-table>
                <div class="q-ma-md flex">
                  <template v-if="!editState.profile">
                    <q-btn
                      class="q-px-lg text-capitalize"
                      text-color="grey-8"
                      outline
                      rounded
                      label="Edit"
                      @click="editState.profile = true"
                    />
                  </template>
                  <template v-if="editState.profile">
                    <q-btn
                      class="q-px-lg text-capitalize"
                      rounded
                      color="primary"
                      label="Save"
                      @click="submitTab1()"
                      form="tab1Form"
                    />
                    <q-btn
                      class="q-px-lg text-capitalize"
                      text-color="grey-8"
                      outline
                      rounded
                      label="Cancel"
                      @click="editState.profile = false"
                    />
                  </template>
                </div>
              </q-form>
            </q-scroll-area>
          </template>
        </q-splitter>
      </q-tab-panel>

      <q-tab-panel name="group_buy">
        <q-splitter v-model="splitterModel" unit="px" disable :separator-style="{ width: '0px' }">
          <template v-slot:before>
            <q-tabs v-model="tab2" vertical dense class="text-black" active-color="primary">
              <q-tab class="text-capitalize text-left" name="group_buy" label="Group Buy Settings" />
              <q-tab class="text-capitalize text-left" name="cp" label="Collection Points" />
            </q-tabs>
          </template>
          <template v-slot:after>
            <q-scroll-area ref="scrollArea" style="height: 65vh">
              <q-form @submit.prevent="submitTab2" id="tab2Form" class="tdots-edit-form">
                <div
                  class="q-mx-md q-pa-md q-mb-md"
                  style="border: 1px solid #dadce0; border-radius: 4px"
                  id="group_buy"
                >
                  <div class="row q-mb-lg full-width">
                    <span class="text-title text-subtitle2 text-weight-bold"> Group Buy Settings </span>
                  </div>
                  <template v-if="editState.group_buy">
                    <div class="row q-mb-sm full-wdith">
                      <div class="q-pr-md col-sm-4 col-xs-12">
                        <div class="q-mb-xs row">Minimum Orders ($)</div>
                        <q-input
                          type="text"
                          v-model="formGroupBuyData.minimum_order"
                          placeholder="Minimum Orders"
                          stack-label
                          outlined
                          lazy-rules
                          dense
                          :rules="[(val) => !!val || 'Please type something']"
                        />
                      </div>
                      <div class="q-pr-md col-sm-4 col-xs-12">
                        <div class="q-mb-xs row">Lead Days (Days)</div>
                        <q-input
                          type="number"
                          v-model.number="formGroupBuyData.lead_days"
                          placeholder="Lead Days"
                          stack-label
                          outlined
                          dense
                          lazy-rules
                          :rules="[(val) => !!val || 'Please type something']"
                        />
                      </div>
                      <div class="q-pr-md col-sm-4 col-xs-12">
                        <div class="q-mb-xs row">Commission Rate (%)</div>
                        <q-input
                          type="text"
                          v-model="formGroupBuyData.commission_rate"
                          placeholder="Commission Rate %"
                          stack-label
                          outlined
                          dense
                          lazy-rules
                          :rules="[(val) => !!val || 'Please type something']"
                        />
                      </div>
                    </div>
                  </template>
                  <template v-if="!editState.group_buy">
                    <div class="row q-mb-sm full-wdith">
                      <div class="q-pr-md col-sm-4 col-xs-12">Minimum Order</div>
                      <div class="q-pr-md col-sm-8 col-xs-12">{{ formGroupBuyData.minimum_order }}</div>
                    </div>
                    <div class="row q-mb-sm full-wdith">
                      <div class="q-pr-md col-sm-4 col-xs-12">Lead Days</div>
                      <div class="q-pr-md col-sm-8 col-xs-12">{{ formGroupBuyData.lead_days }}</div>
                    </div>
                    <div class="row q-mb-sm full-wdith">
                      <div class="q-pr-md col-sm-4 col-xs-12">Commission Rate</div>
                      <div class="q-pr-md col-sm-8 col-xs-12">{{ formGroupBuyData.commission_rate }}</div>
                    </div>
                  </template>
                </div>
                <q-table
                  :data="formCPData"
                  :columns="columnsCP"
                  class="tdots-table q-ma-md"
                  :pagination="paginationCP"
                  :loading="isLoadingCP"
                  :filter="filterCP"
                  id="cp"
                >
                  <template v-slot:top>
                    <div class="full-width row q-mb-md">
                      <span class="text-weight-bold">List of Collection Points</span>
                    </div>
                    <div class="full-width row">
                      <template v-if="editState.group_buy">
                        <q-select
                          v-model="selectedCPItem"
                          label="Select Collection Points"
                          outlined
                          dense
                          style="width: 250px"
                          :options="cpOptions"
                          option-label="name"
                          option-value="id"
                          stack-label
                          ref="selectCP"
                          use-input
                          input-debounce="500"
                          behavior="menu"
                          :loading="loadingCP"
                          @input="addCP()"
                          @keyup.enter.native="getAllCP"
                        />
                      </template>
                      <q-space />
                      <search-top-right v-model="filterCP" label="Search Name / Address" />
                    </div>
                  </template>
                  <template v-slot:body-cell-host="props">
                    <q-td>
                      <span>{{ props.row.host }}</span>
                    </q-td>
                  </template>
                  <template v-slot:body-cell-cpName="props">
                    <q-td>
                      <span>{{ props.row.cpName }}</span>
                    </q-td>
                  </template>
                  <template v-slot:body-cell-cpAddress="props">
                    <q-td>
                      <span>{{ props.row.cpAddress }}</span>
                    </q-td>
                  </template>
                  <template v-if="editState.group_buy" v-slot:body-cell-actions="props">
                    <q-td class="text-right">
                      <q-icon
                        name="far fa-trash-alt"
                        size="sm"
                        color="red"
                        class="cursor-pointer"
                        @click="deleteCP(props.row)"
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
                          {{ Math.ceil(formCPData.length / props.pagination.rowsPerPage) }}</span
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
                  <template v-if="editState.group_buy" v-slot:no-data>
                    <div class="col-md-12 text-center">Please add at least one state</div>
                  </template>
                </q-table>
                <div class="q-ma-md flex">
                  <template v-if="!editState.group_buy">
                    <q-btn
                      class="q-px-lg text-capitalize"
                      text-color="grey-8"
                      outline
                      rounded
                      label="Edit"
                      @click="editState.group_buy = true"
                    />
                  </template>
                  <template v-if="editState.group_buy">
                    <q-btn
                      class="q-px-lg text-capitalize"
                      rounded
                      color="primary"
                      label="Save"
                      type="submit"
                      @click="submitTab2()"
                      form="tab2Form"
                    />
                    <q-btn
                      class="q-px-lg text-capitalize"
                      text-color="grey-8"
                      outline
                      rounded
                      label="Cancel"
                      @click="editState.group_buy = false"
                    />
                  </template>
                </div>
              </q-form>
            </q-scroll-area>
          </template>
        </q-splitter>
      </q-tab-panel>

      <q-tab-panel name="business">
        <q-splitter v-model="splitterModel" unit="px" disable :separator-style="{ width: '0px' }">
          <template v-slot:before>
            <q-tabs v-model="tab3" vertical dense class="text-black" active-color="primary">
              <q-tab class="text-capitalize text-left" name="business_setting" label="Business Settings" />
              <q-tab class="text-capitalize text-left" name="state_account" label="Statement Of Account" />
              <q-tab class="text-capitalize text-left" name="merchants" label="Merchants" />
            </q-tabs>
          </template>
          <template v-slot:after>
            <q-scroll-area ref="scrollArea" style="height: 65vh">
              <q-form @submit.prevent="submitTab3" id="tab3Form" class="tdots-edit-form">
                <div
                  class="q-mx-md q-pa-md q-mb-md"
                  style="border: 1px solid #dadce0; border-radius: 4px"
                  id="business_setting"
                >
                  <div class="row q-mb-lg full-width">
                    <span class="text-title text-subtitle2 text-weight-bold"> Business Settings </span>
                  </div>
                  <template v-if="editState.business">
                    <div class="row q-mb-sm full-wdith">
                      <div class="q-pr-md col-sm-4 col-xs-12">
                        <div class="q-mb-xs row items-center">
                          Direct Price
                          <q-icon name="help_outline" class="q-ml-xs text-grey-6">
                            <template v-slot:default>
                              <q-tooltip anchor="bottom middle" self="top middle">
                                Business users are able to buy at the direct price, without a need for a
                                quotation
                              </q-tooltip>
                            </template>
                          </q-icon>
                        </div>
                        <q-toggle
                          v-model="formBusinessData.direct_price"
                          :true-value="true"
                          :false-value="false"
                          :label="formBusinessData.direct_price === true ? 'Yes' : 'No'"
                        />
                      </div>
                      <div class="q-pr-md col-sm-4 col-xs-12">
                        <div class="q-mb-xs row items-center">
                          Automatic Connection Approval
                          <q-icon name="help_outline" class="q-ml-xs text-grey-6">
                            <template v-slot:default>
                              <q-tooltip anchor="bottom middle" self="top middle">
                                Automatically approves any connection requests from B2B users. Users can to
                                browse your products after the connection.
                              </q-tooltip>
                            </template>
                          </q-icon>
                        </div>
                        <q-toggle
                          v-model="formBusinessData.automatic_connection_approval"
                          :true-value="true"
                          :false-value="false"
                          :label="formBusinessData.automatic_connection_approval === true ? 'Yes' : 'No'"
                        />
                      </div>
                      <div class="q-pr-md col-sm-4 col-xs-12">
                        <div class="q-mb-xs row items-center">
                          Discoverable
                          <q-icon name="help_outline" class="q-ml-xs text-grey-6">
                            <template v-slot:default>
                              <q-tooltip anchor="bottom middle" self="top middle">
                                Allows your profile to be discovered by B2B users.
                              </q-tooltip>
                            </template>
                          </q-icon>
                        </div>
                        <q-toggle
                          v-model="formBusinessData.discoverable"
                          :true-value="true"
                          :false-value="false"
                          :label="formBusinessData.discoverable === true ? 'Yes' : 'No'"
                        />
                      </div>
                    </div>
                  </template>
                  <template v-if="!editState.business">
                    <div class="row q-mb-sm full-wdith">
                      <div class="q-pr-md col-sm-4 col-xs-12">Direct Price</div>
                      <div class="q-pr-md col-sm-8 col-xs-12">
                        {{ formBusinessData.direct_price ? 'Yes' : 'No' }}
                      </div>
                    </div>
                    <div class="row q-mb-sm full-wdith">
                      <div class="q-pr-md col-sm-4 col-xs-12">Automatic Connection Approval</div>
                      <div class="q-pr-md col-sm-8 col-xs-12">
                        {{ formBusinessData.automatic_connection_approval ? 'Yes' : 'No' }}
                      </div>
                    </div>
                    <div class="row q-mb-sm full-wdith">
                      <div class="q-pr-md col-sm-4 col-xs-12">Discoverable</div>
                      <div class="q-pr-md col-sm-8 col-xs-12">
                        {{ formBusinessData.discoverable ? 'Yes' : 'No' }}
                      </div>
                    </div>
                  </template>
                </div>
                <div
                  class="q-mx-md q-pa-md q-mb-md"
                  style="border: 1px solid #dadce0; border-radius: 4px"
                  id="state_account"
                >
                  <div class="row q-mb-lg full-width">
                    <span class="text-title text-subtitle2 text-weight-bold"> Statement Of Account </span>
                  </div>
                  <div class="row">
                    <div class="q-pr-md col-sm-4 col-xs-12">
                      <div class="q-mb-xs row items-center">Send Statement On Regular Basis</div>
                      <q-toggle
                        v-model="formBusinessData.send_statement_on_regular_basis"
                        :true-value="true"
                        :false-value="false"
                        :label="formBusinessData.send_statement_on_regular_basis === true ? 'Yes' : 'No'"
                      />
                    </div>
                  </div>
                  <template v-if="editState.business">
                    <div class="row q-mb-sm">
                      <div class="col-sm-3 col-xs-6">Cash On Delivery</div>
                      <div class="col-sm-3 col-xs-6 q-pr-md">
                        <q-select
                          v-model="formStatementData.cod.frequency"
                          :options="statement_options"
                          stack-label
                          dense
                          outlined
                          option-label="name"
                          option-value="id"
                          @input="changeFrequency('cod')"
                        />
                      </div>
                      <div
                        class="col-sm-3 col-xs-6 q-pr-md"
                        v-if="[2, 3].includes(formStatementData.cod.frequency.id)"
                      >
                        <q-select
                          v-model="formStatementData.cod.value"
                          :options="formStatementData.cod.frequency.id === 2 ? weekArray : dayArray"
                          stack-label
                          dense
                          outlined
                        />
                      </div>
                    </div>
                    <div class="row q-mb-sm">
                      <div class="col-sm-3 col-xs-6">7 Days</div>
                      <div class="col-sm-3 col-xs-6 q-pr-md">
                        <q-select
                          v-model="formStatementData._7day.frequency"
                          :options="statement_options"
                          stack-label
                          dense
                          outlined
                          option-label="name"
                          option-value="id"
                          @input="changeFrequency('_7day')"
                        />
                      </div>
                      <div
                        class="col-sm-3 col-xs-6 q-pr-md"
                        v-if="[2, 3].includes(formStatementData._7day.frequency.id)"
                      >
                        <q-select
                          v-model="formStatementData._7day.value"
                          :options="formStatementData._7day.frequency.id === 2 ? weekArray : dayArray"
                          stack-label
                          dense
                          outlined
                        />
                      </div>
                    </div>
                    <div class="row q-mb-sm">
                      <div class="col-sm-3 col-xs-6">15 Days</div>
                      <div class="col-sm-3 col-xs-6 q-pr-md">
                        <q-select
                          v-model="formStatementData._15day.frequency"
                          :options="statement_options"
                          stack-label
                          dense
                          outlined
                          option-label="name"
                          option-value="id"
                          @input="changeFrequency('_15day')"
                        />
                      </div>
                      <div
                        class="col-sm-3 col-xs-6 q-pr-md"
                        v-if="[2, 3].includes(formStatementData._15day.frequency.id)"
                      >
                        <q-select
                          v-model="formStatementData._15day.value"
                          :options="formStatementData._15day.frequency.id === 2 ? weekArray : dayArray"
                          stack-label
                          dense
                          outlined
                        />
                      </div>
                    </div>
                    <div class="row q-mb-sm">
                      <div class="col-sm-3 col-xs-6">30 Days</div>
                      <div class="col-sm-3 col-xs-6 q-pr-md">
                        <q-select
                          v-model="formStatementData._30day.frequency"
                          :options="statement_options"
                          stack-label
                          dense
                          outlined
                          option-label="name"
                          option-value="id"
                          @input="changeFrequency('_30day')"
                        />
                      </div>
                      <div
                        class="col-sm-3 col-xs-6 q-pr-md"
                        v-if="[2, 3].includes(formStatementData._30day.frequency.id)"
                      >
                        <q-select
                          v-model="formStatementData._30day.value"
                          :options="formStatementData._30day.frequency.id === 2 ? weekArray : dayArray"
                          stack-label
                          dense
                          outlined
                        />
                      </div>
                    </div>
                    <div class="row q-mb-sm">
                      <div class="col-sm-3 col-xs-6">60 Days</div>
                      <div class="col-sm-3 col-xs-6 q-pr-md">
                        <q-select
                          v-model="formStatementData._60day.frequency"
                          :options="statement_options"
                          stack-label
                          dense
                          outlined
                          option-label="name"
                          option-value="id"
                          @input="changeFrequency('_60day')"
                        />
                      </div>
                      <div
                        class="col-sm-3 col-xs-6 q-pr-md"
                        v-if="[2, 3].includes(formStatementData._60day.frequency.id)"
                      >
                        <q-select
                          v-model="formStatementData._60day.value"
                          :options="formStatementData._60day.frequency.id === 2 ? weekArray : dayArray"
                          stack-label
                          dense
                          outlined
                        />
                      </div>
                    </div>
                  </template>
                  <template v-if="!editState.business">
                    <div class="row q-mb-sm full-wdith">
                      <div class="q-pr-md col-sm-3 col-xs-12">Cash On Delivery</div>
                      <div class="q-pr-md col-sm-9 col-xs-12">
                        <div class="row">
                          <div class="q-pr-md col-sm-4 col-xs-12">Frequency</div>
                          <div class="q-pr-md col-sm-4 col-xs-12">Day</div>
                        </div>
                        <div class="row">
                          <div class="q-pr-md col-sm-4 col-xs-12">
                            {{ formStatementData.cod.frequency.name }}
                          </div>
                          <div class="q-pr-md col-sm-4 col-xs-12">{{ formStatementData.cod.value }}</div>
                        </div>
                      </div>
                    </div>
                    <div class="row q-mb-sm full-wdith">
                      <div class="q-pr-md col-sm-3 col-xs-12">7 Days</div>
                      <div class="q-pr-md col-sm-9 col-xs-12">
                        <div class="row">
                          <div class="q-pr-md col-sm-4 col-xs-12">Frequency</div>
                          <div class="q-pr-md col-sm-4 col-xs-12">Day</div>
                        </div>
                        <div class="row">
                          <div class="q-pr-md col-sm-4 col-xs-12">
                            {{ formStatementData._7day.frequency.name }}
                          </div>
                          <div class="q-pr-md col-sm-4 col-xs-12">{{ formStatementData._7day.value }}</div>
                        </div>
                      </div>
                    </div>
                    <div class="row q-mb-sm full-wdith">
                      <div class="q-pr-md col-sm-3 col-xs-12">15 Days</div>
                      <div class="q-pr-md col-sm-9 col-xs-12">
                        <div class="row">
                          <div class="q-pr-md col-sm-4 col-xs-12">Frequency</div>
                          <div class="q-pr-md col-sm-4 col-xs-12">Day</div>
                        </div>
                        <div class="row">
                          <div class="q-pr-md col-sm-4 col-xs-12">
                            {{ formStatementData._15day.frequency.name }}
                          </div>
                          <div class="q-pr-md col-sm-4 col-xs-12">{{ formStatementData._15day.value }}</div>
                        </div>
                      </div>
                    </div>
                    <div class="row q-mb-sm full-wdith">
                      <div class="q-pr-md col-sm-3 col-xs-12">30 Days</div>
                      <div class="q-pr-md col-sm-9 col-xs-12">
                        <div class="row">
                          <div class="q-pr-md col-sm-4 col-xs-12">Frequency</div>
                          <div class="q-pr-md col-sm-4 col-xs-12">Day</div>
                        </div>
                        <div class="row">
                          <div class="q-pr-md col-sm-4 col-xs-12">
                            {{ formStatementData._30day.frequency.name }}
                          </div>
                          <div class="q-pr-md col-sm-4 col-xs-12">{{ formStatementData._30day.value }}</div>
                        </div>
                      </div>
                    </div>
                    <div class="row q-mb-sm full-wdith">
                      <div class="q-pr-md col-sm-3 col-xs-12">60 Days</div>
                      <div class="q-pr-md col-sm-9 col-xs-12">
                        <div class="row">
                          <div class="q-pr-md col-sm-4 col-xs-12">Frequency</div>
                          <div class="q-pr-md col-sm-4 col-xs-12">Day</div>
                        </div>
                        <div class="row">
                          <div class="q-pr-md col-sm-4 col-xs-12">
                            {{ formStatementData._60day.frequency.name }}
                          </div>
                          <div class="q-pr-md col-sm-4 col-xs-12">{{ formStatementData._60day.value }}</div>
                        </div>
                      </div>
                    </div>
                  </template>
                </div>
                <q-table
                  :data="formMerchantsData"
                  :columns="columnsMerchants"
                  class="tdots-table q-ma-md"
                  :pagination="paginationMerchants"
                  :loading="isLoadingMerchants"
                  id="merchants"
                >
                  <template v-slot:top>
                    <div class="row q-mb-md">
                      <span class="text-weight-bold">Merchants</span>
                    </div>
                    <div class="row full-width">
                      <template v-if="editState.business">
                        <q-select
                          v-model="selectedMerchants"
                          :options="merchantsOptions"
                          stack-label
                          dense
                          outlined
                          ref="selectMerchants"
                          lazy-rules
                          label="Select Merchants"
                          option-label="name"
                          option-value="id"
                          use-input
                          input-debounce="500"
                          behavior="menu"
                          :loading="loadingMerchants"
                          @input="addMerchants()"
                          @keyup.enter.native="getAllMerchants"
                        >
                          <template v-slot:no-option>
                            <q-item>
                              <q-item-section class="text-grey"> No results </q-item-section>
                            </q-item>
                          </template>
                        </q-select>
                      </template>
                    </div>
                  </template>
                  <template v-slot:body-cell-name="props">
                    <q-td>
                      <span>{{ props.row.name }}</span>
                    </q-td>
                  </template>
                  <template v-slot:body-cell-email="props">
                    <q-td>
                      <span>{{ props.row.email }}</span>
                    </q-td>
                  </template>
                  <template v-slot:body-cell-phoneNumber="props">
                    <q-td class="text-right">
                      <span>{{ phoneNumberFormat(props.row.phoneNumber) }}</span>
                    </q-td>
                  </template>
                  <template v-slot:body-cell-country="props">
                    <q-td>
                      <span>{{ props.row.country }}</span>
                    </q-td>
                  </template>
                  <template v-if="editState.business" v-slot:body-cell-active="props">
                    <q-td>
                      <q-toggle
                        v-model="props.row.active"
                        :true-value="true"
                        :false-value="false"
                        :label="props.row.active === true ? 'Yes' : 'No'"
                      />
                    </q-td>
                  </template>
                  <template v-if="editState.business" v-slot:body-cell-action="props">
                    <q-td>
                      <q-icon
                        name="far fa-trash-alt"
                        size="sm"
                        color="red"
                        class="cursor-pointer"
                        @click="deleteMerchants(props.row)"
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
                          {{ Math.ceil(formMerchantsData.length / props.pagination.rowsPerPage) }}</span
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
                  <template v-slot:no-data>
                    <div class="col-md-12 text-center"></div>
                  </template>
                </q-table>
                <div class="q-ma-md flex">
                  <template v-if="!editState.business">
                    <q-btn
                      class="q-px-lg text-capitalize"
                      text-color="grey-8"
                      outline
                      rounded
                      label="Edit"
                      @click="editState.business = true"
                    />
                  </template>
                  <template v-if="editState.business">
                    <q-btn
                      class="q-px-lg text-capitalize"
                      rounded
                      color="primary"
                      label="Save"
                      type="submit"
                      form="tab3Form"
                    />
                    <q-btn
                      class="q-px-lg text-capitalize"
                      text-color="grey-8"
                      outline
                      rounded
                      label="Cancel"
                      @click="editState.business = false"
                    />
                  </template>
                </div>
              </q-form>
            </q-scroll-area>
          </template>
        </q-splitter>
      </q-tab-panel>

      <q-tab-panel name="payments">
        <q-splitter v-model="splitterModel" unit="px" disable :separator-style="{ width: '0px' }">
          <template v-slot:before>
            <q-tabs v-model="tab4" vertical dense class="text-black" active-color="primary">
              <q-tab class="text-capitalize text-left" name="default_setting" label="Default Settings" />
              <q-tab class="text-capitalize text-left" name="customer_payment" label="Customer's Payments" />
              <q-tab
                class="text-capitalize text-left"
                name="credit_term"
                label="Credit Term at App Checkout"
              />
            </q-tabs>
          </template>
          <template v-slot:after>
            <q-scroll-area ref="scrollArea" style="height: 65vh">
              <q-form @submit.prevent="submitTab4" id="tab4Form" class="tdots-edit-form">
                <div
                  class="q-mx-md q-pa-md q-mb-md"
                  style="border: 1px solid #dadce0; border-radius: 4px"
                  id="default_setting"
                >
                  <div class="row q-mb-lg full-width">
                    <span class="text-title text-subtitle2 text-weight-bold"> Default Settings </span>
                  </div>
                  <template v-if="editState.payments">
                    <div class="row q-mb-sm">
                      <div class="q-pr-md q-mb-md col-md-4 col-sm-6 col-xs-12">
                        <div class="q-mb-xs row">Tax Rate (%)</div>
                        <q-input
                          type="text"
                          v-model="formBillingData.tax_rate"
                          placeholder="Tax Rate (%)"
                          stack-label
                          outlined
                          lazy-rules
                          dense
                          :rules="[(val) => !!val || 'Please type something']"
                        />
                      </div>
                      <div class="q-pr-md col-md-4 col-sm-6 col-xs-12">
                        <div class="q-mb-xs row">Credit Terms</div>
                        <q-select
                          v-model="formBillingData.credit_term"
                          :options="credit_terms_options"
                          stack-label
                          dense
                          outlined
                          option-label="label"
                          option-value="state"
                        />
                      </div>
                    </div>
                    <div class="row q-mb-sm">
                      <div class="q-pr-md col-md-4 col-sm-6 col-xs-12 gmapAuto">
                        <div class="q-mb-xs text-weight-bold">Billing Address 1</div>
                        <q-input
                          v-model="formBillingData.road"
                          :rules="[(val) => !!val || 'Please type something']"
                          lazy-rules
                          dense
                        />
                      </div>
                    </div>

                    <div class="row q-mb-sm">
                      <div class="q-pr-md col-md-4 col-sm-6 col-xs-12 gmapAuto">
                        <div class="q-mb-xs text-weight-bold">Billing Address 2</div>
                        <q-input
                          v-model="formBillingData.unit"
                          :rules="[(val) => !!val || 'Please type something']"
                          lazy-rules
                          dense
                        />
                      </div>
                    </div>
                    <div class="row">
                      <div class="q-pr-md col-md-4 col-sm-6 col-xs-12">
                        <div class="q-mb-xs row">City</div>
                        <q-input
                          v-model="formBillingData.city"
                          lazy-rules
                          :rules="[(val) => !!val || 'Please type something']"
                          dense
                          outlined
                        />
                      </div>
                      <div class="q-pr-md col-md-4 col-sm-6 col-xs-12">
                        <div class="q-mb-xs row">State</div>
                        <q-input
                          v-model="formBillingData.state"
                          lazy-rules
                          :rules="[(val) => !!val || 'Please type something']"
                          dense
                          outlined
                        />
                      </div>
                      <div class="q-pr-md col-md-4 col-sm-6 col-xs-12">
                        <div class="q-mb-xs row">Postal Code</div>
                        <q-input
                          v-model="formBillingData.postal_code"
                          lazy-rules
                          :rules="[(val) => !!val || 'Please type something']"
                          dense
                          outlined
                        />
                      </div>
                    </div>
                    <div class="row q-mb-sm">
                      <div class="q-pr-md col-md-4 col-sm-6 col-xs-12">
                        <div class="q-mb-xs row">Country</div>
                        <q-input
                          v-model="formBillingData.country"
                          lazy-rules
                          :rules="[(val) => !!val || 'Please choose something']"
                          placeholder="Country"
                          dense
                          outlined
                        />
                      </div>
                    </div>
                  </template>
                  <template v-if="!editState.payments">
                    <div class="row q-mb-sm full-wdith">
                      <div class="q-pr-md col-sm-4 col-xs-12">Tax Rate</div>
                      <div class="q-pr-md col-sm-8 col-xs-12">
                        <div class="row">{{ formBillingData.tax_rate }}%</div>
                      </div>
                    </div>
                    <div class="row q-mb-sm full-wdith">
                      <div class="q-pr-md col-sm-4 col-xs-12">Credit Terms</div>
                      <div class="q-pr-md col-sm-8 col-xs-12">
                        <div class="row">{{ formBillingData.credit_term.label }}</div>
                      </div>
                    </div>
                    <div class="row q-mb-sm full-wdith">
                      <div class="q-pr-md col-sm-4 col-xs-12">Billing Address</div>
                      <div class="q-pr-md col-sm-8 col-xs-12">
                        <div class="row">{{ formBillingData.road }}</div>
                        <div class="row">
                          {{ formBillingData.unit }}-{{ formBillingData.floor_number }},
                          {{ formBillingData.building }}
                        </div>
                        <div class="row">{{ formBillingData.city }}, {{ formBillingData.state }}</div>
                        <div class="row">{{ formBillingData.country }}</div>
                      </div>
                    </div>
                  </template>
                </div>
                <div
                  class="q-mx-md q-pa-md q-mb-md"
                  style="border: 1px solid #dadce0; border-radius: 4px"
                  id="customer_payment"
                >
                  <div class="row q-mb-lg full-width">
                    <span class="text-title text-subtitle2 text-weight-bold"> Customer's Payments </span>
                  </div>
                  <div class="q-pa-md q-mb-md bg-indigo-1">
                    <div class="row q-mb-lg full-width">
                      <span class="text-title text-subtitle2 text-weight-bold"> Pre Payment Method </span>
                    </div>
                    <div class="row q-mb-md">
                      <q-checkbox
                        toggle-indeterminate
                        color="grey-5"
                        disable
                        value="null"
                        label="Debit / Credit Card (To Be Available Soon)"
                      ></q-checkbox>
                    </div>
                    <div class="row">
                      <q-checkbox
                        toggle-indeterminate
                        color="grey-5"
                        disable
                        value="null"
                        label="Customer Balance (To Be Available Soon)"
                      ></q-checkbox>
                    </div>
                  </div>

                  <template v-if="editState.payments">
                    <div class="q-pa-md q-mb-md bg-yellow-1">
                      <div class="row q-mb-lg full-width">
                        <span class="text-title text-subtitle2 text-weight-bold"> Post Payment Method </span>
                      </div>
                      <div class="row q-mb-md">
                        <div class="q-pr-md col-sm-4 col-xs-12">
                          <q-checkbox v-model="formPaymentData.paynow" label="Paynow"></q-checkbox>
                        </div>
                        <div class="col-sm-8 col-xs-12">
                          <div class="row">
                            <div class="col-12">
                              <q-radio
                                v-model="formPaymentData.paynow_with_UEN_phone"
                                val="1"
                                label="With UEN Number"
                              ></q-radio>
                              <q-radio
                                v-model="formPaymentData.paynow_with_UEN_phone"
                                val="2"
                                label="With Phone Number"
                              ></q-radio>
                            </div>
                          </div>
                          <div class="row">
                            <div class="q-pr-md col-sm-6 col-xs-12">
                              <div class="q-mb-xs row">
                                {{
                                  formPaymentData.paynow_with_UEN_phone == '1' ? 'UEN Number' : 'Phone Number'
                                }}
                              </div>
                              <q-input
                                v-if="formPaymentData.paynow_with_UEN_phone == '1'"
                                v-model="formPaymentData.paynow_UEN_number"
                                lazy-rules
                                :rules="[
                                  (val) => (formPaymentData.paynow ? !!val : true) || 'Please type something'
                                ]"
                                dense
                                outlined
                              />
                              <q-input
                                v-if="formPaymentData.paynow_with_UEN_phone == '2'"
                                v-model="formPaymentData.paynow_phone_number"
                                lazy-rules
                                :rules="[
                                  (val) => (formPaymentData.paynow ? !!val : true) || 'Please type something'
                                ]"
                                dense
                                outlined
                              />
                            </div>
                            <div class="q-pr-md col-sm-6 col-xs-12">
                              <div class="q-mb-xs row">
                                {{
                                  formPaymentData.paynow_with_UEN_phone == '1'
                                    ? 'Company Name'
                                    : 'Account Name'
                                }}
                              </div>
                              <q-input
                                v-model="formPaymentData.paynow_name"
                                lazy-rules="ondemand"
                                :rules="[
                                  (val) => (formPaymentData.paynow ? !!val : true) || 'Please type something'
                                ]"
                                dense
                                outlined
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      <div class="row q-mb-md">
                        <div class="q-pr-md col-sm-4 col-xs-12">
                          <q-checkbox
                            v-model="formPaymentData.interbank"
                            label="Interbank Fund Transfer"
                          ></q-checkbox>
                        </div>
                        <div class="col-sm-8 col-xs-12">
                          <div class="row q-mb-md">
                            <div class="q-pr-md col-sm-6 col-xs-12">
                              <div class="q-mb-xs row">Bank Name</div>
                              <q-select
                                v-model="selectedBank"
                                :options="bankOptions"
                                stack-label
                                dense
                                outlined
                                lazy-rules
                                :disable="bankOptions.length == 0"
                                :hint="bankOptions.length == 0 ? 'Please choose country' : ''"
                                :rules="[
                                  (val) =>
                                    (formPaymentData.interbank ? !!val : true) || 'Please choose something'
                                ]"
                                option-label="bank_name"
                                option-value="id"
                              />
                            </div>
                            <div class="q-pr-md col-sm-6 col-xs-12">
                              <div class="q-mb-xs row">Account number</div>
                              <q-input
                                v-model="formPaymentData.interbank_account_number"
                                type="number"
                                lazy-rules
                                :rules="[
                                  (val) =>
                                    (formPaymentData.interbank ? !!val : true) || 'Please type something'
                                ]"
                                dense
                                outlined
                              />
                            </div>
                          </div>
                          <div class="row">
                            <div class="q-pr-md col-sm-6 col-xs-12">
                              <div class="q-mb-xs row">Account Name</div>
                              <q-input
                                v-model="formPaymentData.interbank_account_name"
                                type="text"
                                lazy-rules
                                :rules="[
                                  (val) =>
                                    (formPaymentData.interbank ? !!val : true) || 'Please type something'
                                ]"
                                dense
                                outlined
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      <div class="row q-mb-md">
                        <div class="q-pr-md col-sm-4 col-xs-12">
                          <q-checkbox v-model="formPaymentData.cheque" label="Cheque"></q-checkbox>
                        </div>
                        <div class="col-sm-8 col-xs-12">
                          <div class="row">
                            <div class="q-pr-md col-sm-6 col-xs-12">
                              <div class="q-mb-xs row">Account Name</div>
                              <q-input
                                v-model="formPaymentData.cheque_account_name"
                                type="text"
                                lazy-rules
                                :rules="[
                                  (val) => (formPaymentData.cheque ? !!val : true) || 'Please type something'
                                ]"
                                dense
                                outlined
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      <div class="row q-mb-md">
                        <div class="q-pr-md col-sm-4 col-xs-12">
                          <q-checkbox
                            v-model="formPaymentData.cash_on_delivery"
                            label="Cash On Delivery"
                          ></q-checkbox>
                        </div>
                      </div>
                    </div>
                  </template>

                  <template v-if="!editState.payments">
                    <div class="q-pa-md q-mb-md bg-yellow-1">
                      <div class="row q-mb-lg full-width">
                        <span class="text-title text-subtitle2 text-weight-bold"> Post Payment Method </span>
                      </div>
                      <div class="row q-mb-md">
                        <div class="q-pr-md col-sm-4 col-xs-12">
                          <q-checkbox v-model="formPaymentData.paynow" label="Paynow"></q-checkbox>
                        </div>
                        <div class="col-sm-8 col-xs-12">
                          <div class="row">
                            <div class="col-12">
                              <q-radio
                                v-model="formPaymentData.paynow_with_UEN_phone"
                                val="1"
                                label="With UEN Number"
                              ></q-radio>
                              <q-radio
                                v-model="formPaymentData.paynow_with_UEN_phone"
                                val="2"
                                label="With Phone Number"
                              ></q-radio>
                            </div>
                          </div>
                          <div class="row">
                            <div class="col-sm-4 col-xs-12">
                              {{
                                formPaymentData.paynow_with_UEN_phone == '1' ? 'UEN Number' : 'Phone Number'
                              }}
                            </div>
                            <div class="col-sm-8 col-xs-12">
                              {{
                                formPaymentData.paynow_with_UEN_phone == '1'
                                  ? formPaymentData.paynow_UEN_number
                                  : formPaymentData.paynow_phone_number
                              }}
                            </div>
                          </div>
                          <div class="row">
                            <div class="col-sm-4 col-xs-12">
                              {{
                                formPaymentData.paynow_with_UEN_phone == '1' ? 'Company Name' : 'Account Name'
                              }}
                            </div>
                            <div class="col-sm-8 col-xs-12">{{ formPaymentData.paynow_name }}</div>
                          </div>
                        </div>
                      </div>
                      <div class="row q-mb-md">
                        <div class="q-pr-md col-sm-4 col-xs-12">
                          <q-checkbox
                            v-model="formPaymentData.interbank"
                            label="Interbank Fund Transfer"
                          ></q-checkbox>
                        </div>
                        <div class="col-sm-8 col-xs-12">
                          <div class="row">
                            <div class="col-sm-4 col-xs-12">Bank Name</div>
                            <div class="col-sm-8 col-xs-12">{{ selectedBank }}</div>
                          </div>
                          <div class="row">
                            <div class="col-sm-4 col-xs-12">Account Number</div>
                            <div class="col-sm-8 col-xs-12">
                              {{ formPaymentData.interbank_account_number }}
                            </div>
                          </div>
                          <div class="row">
                            <div class="col-sm-4 col-xs-12">Account Name</div>
                            <div class="col-sm-8 col-xs-12">{{ formPaymentData.interbank_account_name }}</div>
                          </div>
                        </div>
                      </div>
                      <div class="row q-mb-md">
                        <div class="q-pr-md col-sm-4 col-xs-12">
                          <q-checkbox v-model="formPaymentData.cheque" label="Cheque"></q-checkbox>
                        </div>
                        <div class="col-sm-8 col-xs-12">
                          <div class="row">
                            <div class="col-sm-4 col-xs-12">Account Name</div>
                            <div class="col-sm-8 col-xs-12">{{ formPaymentData.cheque_account_name }}</div>
                          </div>
                        </div>
                      </div>
                      <div class="row q-mb-md">
                        <div class="q-pr-md col-sm-4 col-xs-12">
                          <q-checkbox
                            v-model="formPaymentData.cash_on_delivery"
                            label="Cash On Delivery"
                          ></q-checkbox>
                        </div>
                      </div>
                    </div>
                  </template>
                </div>
                <div
                  class="q-mx-md q-pa-md q-mb-md"
                  style="border: 1px solid #dadce0; border-radius: 4px"
                  id="credit_term"
                >
                  <div class="row q-mb-lg full-width">
                    <span class="text-title text-subtitle2 text-weight-bold">
                      Credit Term at App Checkout
                    </span>
                    <q-space />
                    <q-btn label="Advance Settings" flat size="md" class="q-mr-sm" color="primary">
                      <q-menu style="min-width: 360px; overflow: hidden" ref="advance_setting">
                        <q-list>
                          <q-item style="padding-bottom: 0">
                            <q-item-section class="text-weight-bold text-subtitle1 text-title"
                              >Advance Settings</q-item-section
                            >
                          </q-item>
                          <q-item>
                            <q-item-section>
                              <q-option-group
                                v-model="formCreditTermData.advanceSetting"
                                :options="advanceSettingOptions"
                                color="primary"
                              />
                            </q-item-section>
                          </q-item>
                          <q-item>
                            <q-btn
                              class="q-px-lg text-capitalize"
                              text-color="grey-8"
                              outline
                              rounded
                              label="Cancel"
                              @click="$refs.advance_setting.hide()"
                            />
                            <q-btn
                              class="q-px-lg q-ml-md text-capitalize"
                              rounded
                              color="primary"
                              label="Save"
                              :disable="!formCreditTermData.advanceSetting"
                              @click="$refs.advance_setting.hide()"
                            />
                          </q-item>
                        </q-list>
                      </q-menu>
                    </q-btn>
                  </div>
                  <div class="row full-width">
                    <div class="q-pr-md col-md-4 col-sm-6 col-xs-12">
                      <div class="q-mb-xs row items-center">
                        Offer Credit Term at app checkout
                        <q-icon name="help_outline" class="q-ml-xs text-grey-6">
                          <template v-slot:default>
                            <q-tooltip class="center" anchor="bottom middle" self="top middle">
                              Default credit term will be used if customer has not been assigned a credit term
                            </q-tooltip>
                          </template>
                        </q-icon>
                      </div>
                      <template v-if="editState.payments">
                        <q-toggle
                          v-model="formCreditTermData.credit"
                          :true-value="true"
                          :false-value="false"
                          :label="formCreditTermData.credit === true ? 'Yes' : 'No'"
                        />
                      </template>
                      <template v-if="!editState.payments">
                        <div class="row">{{ formCreditTermData.credit === true ? 'Yes' : 'No' }}</div>
                      </template>
                    </div>
                  </div>
                </div>
                <div class="q-ma-md flex">
                  <template v-if="!editState.payments">
                    <q-btn
                      class="q-px-lg text-capitalize"
                      text-color="grey-8"
                      outline
                      rounded
                      label="Edit"
                      @click="editState.payments = true"
                    />
                  </template>
                  <template v-if="editState.payments">
                    <q-btn
                      class="q-px-lg text-capitalize"
                      rounded
                      color="primary"
                      label="Save"
                      type="submit"
                      form="tab4Form"
                    />
                    <q-btn
                      class="q-px-lg text-capitalize"
                      text-color="grey-8"
                      outline
                      rounded
                      label="Cancel"
                      @click="editState.payments = false"
                    />
                  </template>
                </div>
              </q-form>
            </q-scroll-area>
          </template>
        </q-splitter>
      </q-tab-panel>
    </q-tab-panels>

    <q-dialog v-model="showAddNewCityModal">
      <add-new-city-modal :country="selectedCountry" @close="closePopUp(1)" @addState="addNewState" />
    </q-dialog>
    <q-dialog v-model="showEditOrderHoursModal">
      <edit-order-hours-modal
        @close="closePopUp(2)"
        @update="updateOrderHours"
        :item="selectedOrderItem"
        :mode="true"
      />
    </q-dialog>
    <q-dialog v-model="showEditDeliveryHoursModal">
      <edit-order-hours-modal
        @close="closePopUp(3)"
        @update="updateDeliveryHours"
        :item="selectedDeliveryItem"
        :mode="false"
      />
    </q-dialog>
    <q-dialog v-model="showAddInternalUserModal">
      <add-internal-user-modal
        @close="closePopUp(4)"
        @addUser="editInternalUser"
        :user="selectedInternalUser"
      />
    </q-dialog>
    <q-dialog v-model="showExitModal">
      <exit-confirm-modal @close="closePopUp(4)" @goback="goBack()" />
    </q-dialog>
    <q-dialog v-model="showCropBox" persistent full-height @hide="onHideDialog">
      <crop-box :src="src" v-if="showCropBox" @submit="onCrop" />
    </q-dialog>
  </q-page>
</template>

<script>
import { Notice, fileToBase64 } from 'services';
import AlertMessage from 'web/share/partial/AlertMessage.vue';
import {
  getSupplierBasicInfo,
  getSupplierStatementAccount,
  getSupplierPostPaymentMethod,
  allCountries,
  updateSupplierBasicInfo,
  updateSupplierOpeningHours,
  updateSupplierDeliveryHours,
  getSupplierUsers,
  updateSupplierUser,
  deleteSupplierUsers,
  getSupplierStates,
  createSupplierStates,
  deleteSupplierState,
  addGroupBuySettings,
  addBusinessSettings,
  addDefaultSettings,
  updateSupplierDefaultSettings,
  getAllBanks,
  getAllSupplierFrequencyTypes,
  getAllCustomers,
  linkCollectionPointSupplier,
  unLinkCollectionPointSupplier
} from 'treeGQL';
import SearchTopRight from 'web/share/partial/SearchTopRight.vue';
import { aws_s3_bucket_public } from 'src/config';
import AddNewCityModal from './tenants/AddNewCityModal.vue';
import EditOrderHoursModal from './tenants/EditOrderHoursModal.vue';
import AddInternalUserModal from './tenants/AddInternalUserModal.vue';
import ExitConfirmModal from './tenants/ExitConfirmModal.vue';
import { gmapApi } from 'gmap-vue';
import CropBox from 'web/share/partial/CropBox.vue';
import { cipher } from 'services';
import internal from 'stream';
export default {
  props: {
    supplierId: {
      type: Number,
      default: null
    }
  },
  components: {
    SearchTopRight,
    AddNewCityModal,
    EditOrderHoursModal,
    AddInternalUserModal,
    ExitConfirmModal,
    CropBox
  },
  data() {
    return {
      customerTenantId: null,
      editState: {
        profile: false,
        group_buy: false,
        business: false,
        payments: false
      },
      splitterModel: 150,
      selectedCountry: null,
      encrypt: cipher(),
      formSupplierData: {
        base64_image: undefined,
        name: undefined,
        registration_number: undefined,
        email: undefined,
        tax_registration_number: undefined,
        profile: undefined,
        email_notification: 1,
        halal_products: true,
        active: true
      },
      formBillingData: {
        credit_term: {
          state: 1,
          label: '5 Days'
        },
        tax_rate: undefined,
        billing_address: undefined,
        gmapAutoValue: undefined,
        state: undefined,
        city: undefined,
        country: undefined,
        country_id: undefined,
        road: undefined,
        building: undefined,
        postal_code: undefined,
        unit: undefined,
        floor_number: undefined
      },
      formCPData: [],
      formStateData: [],
      formOpeningData: [
        {
          day_id: 1,
          open_hour: '',
          open_minute: '',
          close_hour: '',
          close_minute: '',
          active: true
        },
        {
          day_id: 2,
          open_hour: '',
          open_minute: '',
          close_hour: '',
          close_minute: '',
          active: true
        },
        {
          day_id: 3,
          open_hour: '',
          open_minute: '',
          close_hour: '',
          close_minute: '',
          active: true
        },
        {
          day_id: 4,
          open_hour: '',
          open_minute: '',
          close_hour: '',
          close_minute: '',
          active: true
        },
        {
          day_id: 5,
          open_hour: '',
          open_minute: '',
          close_hour: '',
          close_minute: '',
          active: true
        },
        {
          day_id: 6,
          open_hour: '',
          open_minute: '',
          close_hour: '',
          close_minute: '',
          active: true
        },
        {
          day_id: 7,
          open_hour: '',
          open_minute: '',
          close_hour: '',
          close_minute: '',
          active: true
        }
      ],
      formDeliveryData: [
        {
          day_id: 1,
          open_hour: '',
          open_minute: '',
          close_hour: '',
          close_minute: '',
          active: true
        },
        {
          day_id: 2,
          open_hour: '',
          open_minute: '',
          close_hour: '',
          close_minute: '',
          active: true
        },
        {
          day_id: 3,
          open_hour: '',
          open_minute: '',
          close_hour: '',
          close_minute: '',
          active: true
        },
        {
          day_id: 4,
          open_hour: '',
          open_minute: '',
          close_hour: '',
          close_minute: '',
          active: true
        },
        {
          day_id: 5,
          open_hour: '',
          open_minute: '',
          close_hour: '',
          close_minute: '',
          active: true
        },
        {
          day_id: 6,
          open_hour: '',
          open_minute: '',
          close_hour: '',
          close_minute: '',
          active: true
        },
        {
          day_id: 7,
          open_hour: '',
          open_minute: '',
          close_hour: '',
          close_minute: '',
          active: true
        }
      ],
      weekArray: ['Monday', 'Tuesday', 'Wednsday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      dayArray: [],
      formInternalUserData: [],
      formMerchantsData: [],
      formGroupBuyData: {
        minimum_order: null,
        lead_days: null,
        commission_rate: null
      },
      formBusinessData: {
        direct_price: true,
        automatic_connection_approval: true,
        discoverable: true,
        send_statement_on_regular_basis: true
      },
      formStatementData: {
        cod: {
          frequency_type_id: 4,
          value: 'None',
          frequency: undefined
        },
        _7day: {
          frequency_type_id: 4,
          value: 'None',
          frequency: undefined
        },
        _15day: {
          frequency_type_id: 4,
          value: 'None',
          frequency: undefined
        },
        _30day: {
          frequency_type_id: 4,
          value: 'None',
          frequency: undefined
        },
        _60day: {
          frequency_type_id: 4,
          value: 'None',
          frequency: undefined
        }
      },
      formPaymentData: {
        prepay_debit: null,
        prepay_customer: null,
        paynow: true,
        paynow_with_UEN_phone: '1',
        paynow_UEN_number: undefined,
        paynow_phone_number: undefined,
        paynow_name: undefined,
        interbank: true,
        interbank_bank_id: undefined,
        interbank_bank_number: undefined,
        interbank_account_name: undefined,
        cheque: true,
        cheque_account_name: undefined,
        cash_on_delivery: true
      },
      formCreditTermData: {
        credit: true,
        advanceSetting: undefined
      },
      main_tab: 'profile',
      tab1: 'basic_info',
      tab2: 'group_buy',
      tab3: 'business_setting',
      tab4: 'default_setting',
      cpOptions: [],
      advanceSettingOptions: [
        {
          label: 'Always offer credit term',
          value: 1
        },
        {
          label: 'Do not offer when user has a credit card',
          value: 2
        },
        {
          label: 'Offer only when pre payment method fails',
          value: 3
        }
      ],
      statement_options: [],
      credit_terms_options: [
        {
          state: 1,
          label: '5 Days'
        },
        {
          state: 2,
          label: '7 Days'
        },
        {
          state: 3,
          label: '15 Days'
        }
      ],
      selectedCPItem: null,
      inception: false,
      File: null,
      selectedOrderItem: null,
      selectedDeliveryItem: null,
      selectedInternalUser: null,
      filter: null,
      filterCP: null,
      filterState: null,
      selected: [],
      currentPlace: null,
      countries: [],
      gampBillingEdit: false,
      gampDeliveryEdit: false,
      isLoadingCP: false,
      isLoadingState: false,
      isLoadingInternalUsers: false,
      isLoadingMerchants: false,
      loadingMerchants: false,
      loadingCP: false,
      rowsPerPageArrayState: [3, 5],
      paginationCP: {
        rowsPerPage: 3,
        page: 1
      },
      paginationState: {
        rowsPerPage: 3,
        page: 1
      },
      paginationOpen: {
        rowsPerPage: 0,
        page: 1
      },
      paginationDelivery: {
        rowsPerPage: 0,
        page: 1
      },
      paginationInternalUsers: {
        rowsPerPage: 3,
        page: 1
      },
      paginationMerchants: {
        rowsPerPage: 3,
        page: 1
      },
      merchantsOptions: [],
      selectedMerchants: null,
      showAddNewCityModal: false,
      showEditOrderHoursModal: false,
      showEditDeliveryHoursModal: false,
      showAddInternalUserModal: false,
      showExitModal: false,
      data: [],
      step: 1,
      src: null,
      showCropBox: false,
      selectedBank: null,
      bankOptions: [],
      customerProfiles: this.$helper.getCustomerProfiles()
    };
  },
  computed: {
    google: gmapApi,
    columnsCP() {
      const res = [
        {
          name: 'host',
          align: 'left',
          label: 'Host',
          field: 'host',
          sortable: false
        },
        {
          name: 'cpName',
          align: 'left',
          label: 'Collection Point Name',
          field: 'cpName',
          sortable: false
        },
        {
          name: 'cpAddress',
          align: 'left',
          label: 'Collection Point Address',
          field: 'cpAddress',
          sortable: false
        },
        {
          name: 'actions',
          align: 'right',
          label: '',
          field: 'actions',
          sortable: false
        }
      ];
      return res;
    },
    columnsState() {
      const res = [
        {
          name: 'country',
          align: 'left',
          label: 'Country',
          field: 'country',
          sortable: false
        },
        {
          name: 'state',
          align: 'left',
          label: 'State',
          field: 'state',
          sortable: false
        },
        {
          name: 'actions',
          align: 'right',
          label: '',
          field: 'actions',
          sortable: false
        }
      ];
      return res;
    },
    columnsOrder() {
      const res = [
        {
          name: 'day',
          align: 'left',
          label: 'Day',
          field: 'day',
          sortable: false
        },
        {
          name: 'startTime',
          align: 'left',
          label: 'Start Time',
          field: 'startTime',
          sortable: false
        },
        {
          name: 'endTime',
          align: 'left',
          label: 'End Time',
          field: 'endTime',
          sortable: false
        },
        {
          name: 'noOrder',
          align: 'left',
          label: '',
          field: 'noOrder',
          sortable: false
        },
        {
          name: 'actions',
          align: 'right',
          label: '',
          field: 'actions',
          sortable: false
        }
      ];
      return res;
    },
    columnsInternalUsers() {
      const res = [
        {
          name: 'name',
          align: 'left',
          label: 'Name',
          field: 'name',
          sortable: false
        },
        {
          name: 'email',
          align: 'left',
          label: 'Email',
          field: 'email',
          sortable: false
        },
        {
          name: 'mobile',
          align: 'left',
          label: 'Phone Number',
          field: 'mobile',
          sortable: false
        },
        {
          name: 'country',
          align: 'left',
          label: 'Country',
          field: 'country',
          sortable: false
        },
        {
          name: 'active',
          align: 'left',
          label: 'Active',
          field: 'active',
          sortable: false
        },
        {
          name: 'action',
          align: 'right',
          label: '',
          field: 'actoin',
          sortable: false
        }
      ];
      return res;
    },
    columnsMerchants() {
      const res = [
        {
          name: 'name',
          align: 'left',
          label: 'Name',
          field: 'name',
          sortable: false
        },
        {
          name: 'email',
          align: 'left',
          label: 'Email',
          field: 'email',
          sortable: false
        },
        {
          name: 'phoneNumber',
          align: 'left',
          label: 'Phone Number',
          field: 'phoneNumber',
          sortable: false
        },
        {
          name: 'country',
          align: 'left',
          label: 'Country',
          field: 'country',
          sortable: false
        }
      ];
      return res;
    },
    getTenantData() {
      return this.$store.state.tenantData;
    }
  },
  async mounted() {
    await this.getCountries();
    this.getAllFrequencyTypes();
    for (var i = 1; i < 31; i++) {
      this.dayArray.push(i.toString(10));
    }
    this.getBasicInfo(this.supplierId);
    this.getCPList();
    this.getMerchants();
    this.getStatementAccount(this.supplierId);
    this.getPostPaymentMethod(this.supplierId);
  },
  watch: {
    tab1(val) {
      this.scrollToElement(val);
    },
    tab2(val) {
      this.scrollToElement(val);
    },
    tab3(val) {
      this.scrollToElement(val);
    },
    tab4(val) {
      this.scrollToElement(val);
    },
    'formBillingData.country_id'(v) {
      if (v === 193) {
        this.formBillingData.state = 'Singapore';
        this.formBillingData.city = 'Singapore';
      }
      this.getBanks();
    },
    'formBillingData.state': function (val) {
      this.formBillingData.state = val ? val.removeSpecialCharacter() : '';
    },
    'formBillingData.city': function (val) {
      this.formBillingData.city = val ? val.removeSpecialCharacter() : '';
    },
    'formBillingData.building': function (val) {
      this.formBillingData.building = val ? val.removeSpecialCharacter() : '';
    },
    'formBillingData.road': function (val) {
      this.formBillingData.road = val ? val.removeSpecialCharacter() : '';
    },
    'formBillingData.unit': function (val) {
      this.formBillingData.unit = val ? val.removeSpecialCharacter() : '';
    },

    selectedBank(val) {
      this.formPaymentData.interbank_bank_id = val.id;
    }
  },
  methods: {
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
    },
    async getBasicInfo(supplierId) {
      try {
        this.isLoading = true;
        let supplier = [];
        supplier = await this.getSupplierBasicInfo(supplierId);
        supplier = supplier?.data?.getSupplierBasicInfo;
        this.customerTenantId = supplier.tenant.id;
        this.formSupplierData.name = supplier.tenant.name;
        this.formSupplierData.registration_number = supplier.registration_number;
        this.formSupplierData.email = supplier.email;
        this.formSupplierData.tax_registration_number = supplier.tax_registration_number;
        this.formSupplierData.profile = supplier.tenant.profile;
        this.formSupplierData.email_notification = supplier.email_notification;
        this.formSupplierData.halal_products = supplier.tenant.halal_products;
        this.formSupplierData.active = supplier.tenant.active;

        this.formBillingData.credit_term = this.credit_terms_options[supplier.default_credit_card_term];
        this.formCreditTermData.credit = supplier.offer_credit_term_at_app_checkout;
        this.formCreditTermData.advanceSetting = supplier.offer_credit_term_type_id + 1; //index =? value ?

        this.formBillingData.tax_rate = supplier.tax_rate;
        this.formBillingData.state = supplier.tenant.defaultAddress?.state;
        this.formBillingData.city = supplier.tenant.defaultAddress?.city;
        this.formBillingData.country = supplier.tenant.defaultAddress?.country.name;
        this.formBillingData.country_id = supplier.tenant.defaultAddress?.country.id;
        this.formBillingData.road = supplier.tenant.defaultAddress?.road;
        this.formBillingData.building = supplier.tenant.defaultAddress?.building;
        this.formBillingData.unit = supplier.tenant.defaultAddress?.unit;
        this.formBillingData.floor_number = supplier.tenant.defaultAddress?.floor_number;

        let _open = supplier?.tenant?.hours;
        for (let i = 1; i <= 7; i++) {
          let item = _open.filter((item) => item.day.id == i);
          if (item.length > 0) {
            this.formOpeningData[i - 1].open_hour = item[0].open_hour;
            this.formOpeningData[i - 1].open_minute = item[0].open_minute;
            this.formOpeningData[i - 1].close_hour = item[0].close_hour;
            this.formOpeningData[i - 1].close_minute = item[0].close_minute;
            this.formOpeningData[i - 1].active = item[0].active == false;

            // if (
            //   this.isValidTime(item[0].open_hour, item[0].open_minute) &&
            //   this.isValidTime(item[0].close_hour, item[0].close_minute)
            // ) {
            //   item[0].active = true;
            // } else {
            //   item[0].active = false;
            // }
          }
        }

        let _delivery = supplier?.tenant?.DeliveryDay;
        for (let i = 1; i <= 7; i++) {
          let item = _delivery.filter((item) => item.day.id == i);
          if (item.length > 0) {
            this.formDeliveryData[i - 1].open_hour = item[0].open_hour;
            this.formDeliveryData[i - 1].open_minute = item[0].open_minute;
            this.formDeliveryData[i - 1].close_hour = item[0].close_hour;
            this.formDeliveryData[i - 1].close_minute = item[0].close_minute;
            this.formDeliveryData[i - 1].active = item[0].active == false;

            // if (
            //   this.isValidTime(item[0].open_hour, item[0].open_minute) &&
            //   this.isValidTime(item[0].close_hour, item[0].close_minute)
            // ) {
            //   item[0].active = true;
            // } else {
            //   item[0].active = false;
            // }
          }
        }
        const states = supplier.tenant.SupplierState;
        for (const state_list of states) {
          this.formStateData.push({
            active: state_list.state.active,
            country: state_list.state.country.description,
            stateId: state_list.state.id,
            stateLabel: state_list.state.name
          });
        }

        let _data = await this.getSupplierUsers(this.customerTenantId);
        this.formInternalUserData = _data.data.getSupplierUsers.supplier_users;

        this.formGroupBuyData.minimum_order = supplier?.tenant?.minimum_order;
        this.formGroupBuyData.lead_days = supplier?.lead_days;
        this.formGroupBuyData.commission_rate = supplier?.commission_rate;

        this.formBusinessData.direct_price = supplier?.direct_price;
        this.formBusinessData.automatic_connection_approval = supplier?.automatic_connection_approval;
        this.formBusinessData.discoverable = supplier?.discoverable;
        this.formBusinessData.send_statement_on_regular_basis = supplier?.send_statement_on_regular_basis;
      } catch (error) {
        Notice.fail(error.message);
      } finally {
        this.isLoading = false;
      }
    },
    async getStatementAccount(supplierId) {
      try {
        this.isLoading = true;
        let _data = await this.getSupplierStatementAccount(supplierId);
        let _ind = ['cod', '_7day', '_15day', '_30day', '_60day'];
        for (const state_data of _data?.data?.getSupplierStatementAccount) {
          if (parseInt(state_data.statement_type_id) > 4) continue;
          let index = _ind[parseInt(state_data.statement_type_id)];
          this.formStatementData[index].frequency_type_id = state_data.frequency_type_id;
          this.formStatementData[index].value = state_data.value;
          this.formStatementData[index].frequency = state_data.frequency_type;
        }
      } catch (error) {
        Notice.fail(error.message);
      } finally {
        this.isLoading = false;
      }
    },
    async getPostPaymentMethod(supplierId) {
      try {
        this.isLoading = true;
        this.formPaymentData.paynow = false;
        this.formPaymentData.interbank = false;
        this.formPaymentData.cheque = false;
        this.formPaymentData.cash_on_delivery = false;
        let _data = await this.getSupplierPostPaymentMethod(supplierId);
        for (const pay_data of _data?.data?.getSupplierPostPaymentMethod) {
          switch (pay_data.supplier_payment_method_option.id) {
            case 1:
              this.formPaymentData.paynow = true;
              this.formPaymentData.paynow_UEN_number = pay_data.supplier_payment_method_detail.uen_number;
              this.formPaymentData.paynow_phone_number = pay_data.supplier_payment_method_detail.phone_number;
              this.formPaymentData.company_name = pay_data.supplier_payment_method_detail.company_name;
              if (this.formPaymentData.paynow_phone_number != '')
                this.formPaymentData.paynow_with_UEN_phone = '2';
              else this.formPaymentData.paynow_with_UEN_phone = '1';
              break;
            case 2:
              this.formPaymentData.interbank = true;
              this.formPaymentData.interbank_bank_id = pay_data.supplier_payment_method_detail.bank_id;
              this.formPaymentData.interbank_account_number =
                pay_data.supplier_payment_method_detail.account_number;
              this.formPaymentData.interbank_account_name =
                pay_data.supplier_payment_method_detail.account_name;
              break;
            case 3:
              this.formPaymentData.cheque = true;
              this.formPaymentData.cheque_account_name = pay_data.supplier_payment_method_detail.account_name;
              break;
            case 4:
              this.formPaymentData.cash_on_delivery = true;
              break;
          }
        }
      } catch (error) {
        Notice.fail(error.message);
      } finally {
        this.isLoading = false;
      }
    },
    async getSupplierBasicInfo(supplierId) {
      try {
        return await this.$apollo
          .query({
            query: getSupplierBasicInfo,
            variables: {
              supplierId: supplierId
            }
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
    async getSupplierStatementAccount(supplierId) {
      try {
        return await this.$apollo
          .query({
            query: getSupplierStatementAccount,
            variables: {
              supplierId: supplierId
            }
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
    async getSupplierPostPaymentMethod(supplierId) {
      try {
        return await this.$apollo
          .query({
            query: getSupplierPostPaymentMethod,
            variables: {
              supplierId: supplierId
            }
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
    async getSupplierUsers(supplierId = 0, page = 1, perPage = 10, keyword = undefined) {
      try {
        return await this.$apollo
          .query({
            query: getSupplierUsers,
            variables: {
              supplierId: supplierId,
              userType: 2,
              page: page,
              perPage: perPage,
              keyword: keyword //function search name
            }
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
      const { page, rowsPerPage } = props.pagination;
      await this.getData(page, rowsPerPage, props.filter);
      this.pagination.page = page;
      this.pagination.rowsPerPage = rowsPerPage;
    },
    logo(logoName) {
      if (logoName) {
        return typeof logoName === 'string' && logoName.startsWith('http')
          ? logoName
          : `${aws_s3_bucket_public}/supplier-logos/${logoName}`;
      }
      return `${aws_s3_bucket_public}/supplier-logos/no_image.png`;
    },
    phoneNumberFormat(number) {
      return number;
      // return this.$helper.getPhoneString(number);
    },
    isValidTime(hour, minute) {
      if (
        (hour == null || hour == undefined || hour == '') &&
        (minute == null || minute == undefined || minute == '')
      )
        return false;
      if (parseInt(hour) == 0 && parseInt(minute) == 0) return false;
      return true;
    },
    photoProfile(photoName) {
      if (photoName) {
        return typeof photoName === 'string' && photoName.startsWith('http')
          ? photoName
          : `${aws_s3_bucket_public}/profile-pictures/${photoName}`;
      }
      return `${aws_s3_bucket_public}/profile-pictures/no_image.png`;
    },
    async resetOpenHour(row) {
      let item = this.formOpeningData.filter((item) => item.day_id == row.day_id);
      if (item.length > 0) {
        item[0].open_hour = 0;
        item[0].open_minute = 0;
        item[0].close_hour = 0;
        item[0].close_minute = 0;
        if (item[0].active == false) return;
        try {
          this.$q.loading.show({
            message: 'Please wait...'
          });
          await this.$apollo
            .mutate({
              mutation: updateSupplierOpeningHours,
              variables: {
                supplierId: this.supplierId,
                operatingHoursJsonData: JSON.stringify([
                  {
                    ...item[0],
                    active: false
                  }
                ])
              }
            })
            .then((res) => {});
        } catch (error) {
          Notice.fail('Failed to create!');
        } finally {
          this.$q.loading.hide();
        }
      }
    },
    async resetDeliveryHour(row) {
      let item = this.formDeliveryData.filter((item) => item.day_id == row.day_id);
      if (item.length > 0) {
        item[0].open_hour = 0;
        item[0].open_minute = 0;
        item[0].close_hour = 0;
        item[0].close_minute = 0;
        if (item[0].active == false) return;
        try {
          this.$q.loading.show({
            message: 'Please wait...'
          });
          await this.$apollo
            .mutate({
              mutation: updateSupplierDeliveryHours,
              variables: {
                supplierId: this.supplierId,
                deliveryHoursJsonData: JSON.stringify([
                  {
                    ...item[0],
                    active: false
                  }
                ])
              }
            })
            .then((res) => {});
        } catch (error) {
          Notice.fail('Failed to create!');
        } finally {
          this.$q.loading.hide();
        }
      }
    },
    gotoRoute(path) {
      this.$router.push(path);
    },
    async getStates() {
      try {
        return await this.$apollo
          .query({
            query: getSupplierStates,
            variables: {
              customer_id: this.customerTenantId
            }
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
    addNewState(stateItem) {
      this.formStateData.push(stateItem);
      this.selectedCountry = stateItem.country;
      this.showAddNewCityModal = false;
      const states = this.formStateData.map((item) => {
        return item.stateId;
      });

      this.$apollo
        .mutate({
          mutation: createSupplierStates,
          variables: {
            supplier_id: this.customerTenantId,
            states: states
          }
        })
        .then((data) => {
          if (data.data.createSupplierStates) {
            this.$q.notify('Succesfully added supplier states!');
          } else {
            this.$q.notify('Failed to add supplier states!');
          }
        })
        .catch((error) => {
          this.$q.notify('Failed to add supplier states!');
        });
    },
    deleteState(stateId) {
      const stateTempList = this.formStateData.filter((item) => item.stateId !== stateId);
      this.formStateData = stateTempList;

      this.$apollo
        .mutate({
          mutation: deleteSupplierState,
          variables: {
            supplier_id: this.customerTenantId,
            state_id: stateId
          }
        })
        .then(() => {
          this.$q.notify('Succesfully deleted a state!');
        })
        .catch((error) => {
          this.$q.notify('Failed to delete the state!');
        });
    },
    deleteCP(cpItem) {
      const cpTempList = this.formCPData.filter((item) => item.name !== cpItem.name);
      this.formCPData = cpTempList;
    },
    closePopUp(type) {
      if (type == 1) {
        this.showAddNewCityModal = false;
      } else if (type == 2) {
        this.selectedOrderItem = null;
        this.showEditOrderHoursModal = false;
      } else if (type == 3) {
        this.selectedDeliveryItem = null;
        this.showEditDeliveryHoursModal = false;
      } else if (type == 4) {
        this.showAddInternalUserModal = false;
      } else if (type == 5) {
        this.showExitModal = false;
      }
    },
    editOrder(orderItem) {
      this.selectedOrderItem = {
        day_id: orderItem.day_id,
        open_hour: orderItem.open_hour,
        open_minute: orderItem.open_minute,
        close_hour: orderItem.close_hour,
        close_minute: orderItem.close_minute
      };
      this.showEditOrderHoursModal = true;
    },
    editDelivery(deliveryItem) {
      this.selectedDeliveryItem = {
        day_id: deliveryItem.day_id,
        open_hour: deliveryItem.open_hour,
        open_minute: deliveryItem.open_minute,
        close_hour: deliveryItem.close_hour,
        close_minute: deliveryItem.close_minute
      };
      this.showEditDeliveryHoursModal = true;
    },
    scrollToElement(el) {
      const ele = document.getElementById(el);
      const offset = ele.offsetTop;
      this.$refs.scrollArea.setScrollPosition(offset, 300);
    },
    editInternal(internalUser) {
      this.selectedInternalUser = internalUser;
      this.showAddInternalUserModal = true;
    },
    async editInternalUser(internalUser) {
      let item = this.formInternalUserData.filter((item) => item.id === internalUser.id);
      if (item.length > 0) {
        item[0] = internalUser;
        try {
          this.$q.loading.show({
            message: 'Please wait...'
          });
          await this.$apollo
            .mutate({
              mutation: updateSupplierUser,
              variables: {
                jsonData: JSON.stringify(internalUser)
              }
            })
            .then(() => {
              Notice.ok('Successfully changed');
            });
        } catch (error) {
          Notice.fail('Failed to change!');
        } finally {
          this.$q.loading.hide();
        }
      }
      this.showAddInternalUserModal = false;
    },
    setBillingPlace(place) {
      this.currentPlace = place;
      this.addBillingMarker();
    },
    setDeliveryPlace(place) {
      this.currentPlace = place;
      this.addDeliveryMarker();
    },
    async addBillingMarker() {
      if (this.currentPlace) {
        // this.setBillingRoad(this.currentPlace.address_components);
        this.formBillingData.road = this.setBillingRoad(this.currentPlace.address_components);
        this.formBillingData.gmapAutoValue = this.formBillingData.road;
        this.formBillingData.postal_code = this.currentPlace?.address_components?.filter(
          (x) => x.types[0] === 'postal_code'
        );
        this.formBillingData.postal_code =
          this.formBillingData.postal_code.length > 0
            ? this.formBillingData.postal_code[0].short_name
            : 'N/A';
        this.currentPlace = null;
        this.gampBillingEdit = true;
      }
    },
    setBillingRoad(data) {
      let country = data.filter((x) => x.types[0] === 'country');
      country = country.length > 0 ? country[0].long_name : null;
      this.formBillingData.country_id = this.countries?.filter((x) => x.description === country)?.[0]?.id;
      this.formBillingData.country = this.countries?.filter(
        (x) => x.description === country
      )?.[0]?.description;

      let city = data.filter((x) => ['locality', 'administrative_area_level_2'].includes(x.types[0]));
      this.formBillingData.city = city.length > 0 ? city[0].long_name : null;

      let state = data.filter((x) => x.types[0] === 'administrative_area_level_1'); //singapore dont have state jusr return singapore as state and city
      this.formBillingData.state =
        country === 'Singapore' ? country : state.length > 0 ? state[0].long_name : null;

      let street = data.filter((x) => x.types[0] === 'street_number');
      street = street.length > 0 ? street[0].short_name : null;

      let route = data.filter((x) => x.types[0] === 'route');
      route = route.length > 0 ? route[0].short_name : 'N/A';
      return street ? street.concat(' ', route) : route;
    },
    async submitTab1() {
      try {
        this.$q.loading.show({
          message: 'Please wait...'
        });
        await this.$apollo
          .mutate({
            mutation: updateSupplierBasicInfo,
            variables: {
              supplierId: this.supplierId,
              basicInfoJsonData: JSON.stringify(this.formSupplierData)
            }
          })
          .then((res) => {
            this.editState.profile = false;
          });
      } catch (error) {
        Notice.fail('Failed to create!');
      } finally {
        this.$q.loading.hide();
      }
    },
    async submitTab2() {
      try {
        this.$q.loading.show({
          message: 'Please wait...'
        });
        await this.$apollo
          .mutate({
            mutation: addGroupBuySettings,
            variables: {
              supplierId: this.supplierId,
              groupBuySettingJson: JSON.stringify(this.formGroupBuyData)
            }
          })
          .then(() => {
            this.editState.group_buy = false;
          });
      } catch (error) {
        Notice.fail('Failed to create!');
      } finally {
        this.$q.loading.hide();
      }
    },
    async submitTab3() {
      try {
        this.$q.loading.show({
          message: 'Please wait...'
        });

        await this.$apollo
          .mutate({
            mutation: addBusinessSettings,
            variables: {
              supplierId: this.supplierId,
              businessDataJson: JSON.stringify(this.formBusinessData),
              statementDataJson: JSON.stringify(this.formStatementData)
            }
          })
          .then(() => {
            this.editState.business = false;
          });
      } catch (error) {
        Notice.fail('Failed to create!');
      } finally {
        this.$q.loading.hide();
      }
    },
    async submitTab4() {
      try {
        this.$q.loading.show({
          message: 'Please wait...'
        });
        await this.$apollo
          .mutate({
            mutation: updateSupplierDefaultSettings,
            variables: {
              supplierId: this.supplierId,
              defaultSettingJson: JSON.stringify({
                tax_rate: this.formBillingData.tax_rate,
                paynow: this.formPaymentData.paynow,
                interbank_fund_transfer: this.formPaymentData.interbank,
                cheque: this.formPaymentData.cheque,
                cash_on_delivery: this.formPaymentData.cash_on_delivery,
                default_credit_card_term: this.formBillingData.credit_term.state
              }),
              billingAddressJson: JSON.stringify({
                country_id: this.formBillingData.country_id,
                state: this.formBillingData.state,
                city: this.formBillingData.city,
                street_number: this.formBillingData.street_number,
                building: this.formBillingData.building,
                postal_code: this.formBillingData.postal_code,
                floor_number: this.formBillingData.floor_number,
                unit: this.formBillingData.unit,
                address_type_id: 2,
                active: true,
                is_default: true,
                created_by: this.$store.state.id
              }),
              postPaymentMethodJson: JSON.stringify({
                paynow: {
                  uen_number: this.formPaymentData.paynow_UEN_number,
                  phone_number: this.formPaymentData.paynow_phone_number,
                  company_name: this.formPaymentData.paynow_name
                },
                interbank_transfer: {
                  bank_id: this.formPaymentData.interbank_bank_id,
                  account_number: this.formPaymentData.interbank_account_number,
                  account_name: this.formPaymentData.interbank_account_name
                },
                cheque: {
                  account_name: this.formPaymentData.cheque_account_name
                }
              })
            }
          })
          .then(() => {
            this.editState.payments = false;
          });
      } catch (error) {
        Notice.fail('Failed to create!');
      }

      try {
        await this.$apollo
          .mutate({
            mutation: updateSupplierBasicInfo,
            variables: {
              supplierId: this.supplierId,
              basicInfoJsonData: JSON.stringify({
                offer_credit_term_at_app_checkout: this.formCreditTermData.credit,
                offer_credit_term_type_id: this.formCreditTermData.advanceSetting
              })
            }
          })
          .then(() => {
            this.editState.payments = false;
          });
      } catch (error) {
        Notice.fail('Failed to create!');
      } finally {
        this.$q.loading.hide();
      }
    },
    async updateOrderHours(updateItem) {
      let item = this.formOpeningData.filter((item) => item.day_id === updateItem.day_id);
      if (item.length > 0) {
        item[0].open_hour = updateItem.open_hour;
        item[0].open_minute = updateItem.open_minute;
        item[0].close_hour = updateItem.close_hour;
        item[0].close_minute = updateItem.close_minute;
        item[0].active = false;
      }
      this.showEditOrderHoursModal = false;
      this.selectedOrderItem = null;
      let _data = [];
      for (const _row of this.formOpeningData) {
        if (_row.day_id != updateItem.day_id) continue;
        _data.push({
          day_id: _row.day_id,
          active: !_row.active,
          open_hour: parseInt(_row.open_hour),
          open_minute: parseInt(_row.open_minute),
          close_hour: parseInt(_row.close_hour),
          close_minute: parseInt(_row.close_minute)
        });
      }

      try {
        this.$q.loading.show({
          message: 'Please wait...'
        });
        await this.$apollo
          .mutate({
            mutation: updateSupplierOpeningHours,
            variables: {
              supplierId: this.supplierId,
              operatingHoursJsonData: JSON.stringify(_data)
            }
          })
          .then((res) => {});
      } catch (error) {
        Notice.fail('Failed to create!');
      } finally {
        this.$q.loading.hide();
      }
    },
    async updateDeliveryHours(updateItem) {
      let item = this.formDeliveryData.filter((item) => item.day_id === updateItem.day_id);
      if (item.length > 0) {
        item[0].open_hour = updateItem.open_hour;
        item[0].open_minute = updateItem.open_minute;
        item[0].close_hour = updateItem.close_hour;
        item[0].close_minute = updateItem.close_minute;
        item[0].active = false;
      }
      this.showEditDeliveryHoursModal = false;
      this.selectedDeliveryItem = null;
      let _data = [];
      for (const _row of this.formDeliveryData) {
        _data.push({
          day_id: _row.day_id,
          active: !_row.active,
          open_hour: parseInt(_row.open_hour),
          open_minute: parseInt(_row.open_minute),
          close_hour: parseInt(_row.close_hour),
          close_minute: parseInt(_row.close_minute)
        });
      }

      try {
        this.$q.loading.show({
          message: 'Please wait...'
        });
        await this.$apollo
          .mutate({
            mutation: updateSupplierDeliveryHours,
            variables: {
              supplierId: this.supplierId,
              deliveryHoursJsonData: JSON.stringify(_data)
            }
          })
          .then((res) => {});
      } catch (error) {
        Notice.fail('Failed to create!');
      } finally {
        this.$q.loading.hide();
      }
    },
    goBack() {
      this.showExitModal = false;
      this.gotoRoute('/main/supplier/all_supplier');
    },
    onCrop(results) {
      this.formSupplierData.base64_image = results.large;
      this.onHideDialog();
    },
    onHideDialog() {
      this.src = null;
      this.showCropBox = false;

      // Reset queue so we can choose file again
      this.$refs.photoInput.reset();
      this.$refs.photoInput.removeQueuedFiles();
    },
    async onPhotoChanged(val) {
      if (val.length == 0) return;

      if (!val[0].type.includes('image')) {
        this.showDialog('Failed', 'File type must be image');
        return;
      }

      this.src = await fileToBase64(val[0]);
      this.showCropBox = true;
    },
    getCountryName(id) {
      return this.countries.filter((item) => item.id === id)[0].description;
    },
    async getBanks() {
      const data = await new Promise(async (resolve, reject) => {
        return this.$apollo
          .query({
            query: getAllBanks,
            variables: {
              countryId: this.formBillingData.country_id
            }
          })
          .then((res) => {
            resolve(res?.data?.getAllBanks);
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
      this.bankOptions = data;
    },
    async getAllFrequencyTypes() {
      const data = await new Promise(async (resolve, reject) => {
        return this.$apollo
          .query({
            query: getAllSupplierFrequencyTypes
          })
          .then((res) => {
            resolve(res?.data?.getAllSupplierFrequencyTypes);
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
      this.statement_options = data;
      this.formStatementData.cod.frequency = this.statement_options[this.statement_options.length - 1];
      this.formStatementData._7day.frequency = this.statement_options[this.statement_options.length - 1];
      this.formStatementData._15day.frequency = this.statement_options[this.statement_options.length - 1];
      this.formStatementData._30day.frequency = this.statement_options[this.statement_options.length - 1];
      this.formStatementData._60day.frequency = this.statement_options[this.statement_options.length - 1];
    },
    async getAllMerchants() {
      if (this.$refs.selectMerchants.inputValue.length < 3) return;
      this.loadingMerchants = true;
      const data = await new Promise(async (resolve, reject) => {
        return this.$apollo
          .query({
            query: getAllCustomers,
            variables: {
              countryId: this.selectedCountry,
              customer_type_id: 2,
              active: true,
              keyword: this.$refs.selectMerchants.inputValue,
              hub: false
            }
          })
          .then((res) => {
            resolve(res?.data?.getAllCustomers);
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
      this.merchantsOptions = data;
      this.loadingMerchants = false;
      this.$refs.selectMerchants.showPopup();
    },
    async addMerchants() {
      this.isLoadingMerchants = true;
      await new Promise((resolve, reject) => {
        return this.$apollo
          .mutate({
            mutation: linkCollectionPointSupplier,
            variables: {
              collectionPointId: this.selectedMerchants.id,
              supplierId: this.customerTenantId
            }
          })
          .then((res) => {
            return resolve(res?.data?.linkCollectionPointSupplier);
          })
          .catch((err) => {
            return reject(err?.message);
          });
      });
      await this.getMerchants();
      this.selectedMerchants = null;
      // this.merchantsOptions = [];
      this.isLoadingMerchants = false;
    },
    async deleteMerchants(item) {
      this.isLoadingMerchants = true;
      await new Promise((resolve, reject) => {
        return this.$apollo
          .mutate({
            mutation: unLinkCollectionPointSupplier,
            variables: {
              collectionPointId: item.id,
              supplierId: this.customerTenantId
            }
          })
          .then((res) => {
            return resolve(res?.data?.unLinkCollectionPointSupplier);
          })
          .catch((err) => {
            return reject(err?.message);
          });
      });
      await this.getMerchants();
      this.isLoadingMerchants = false;
    },
    async getMerchants() {
      const data = await new Promise(async (resolve, reject) => {
        return this.$apollo
          .query({
            query: getAllCustomers,
            variables: {
              tenantId: this.customerTenantId,
              hub: false
            }
          })
          .then((res) => {
            resolve(res?.data?.getAllCustomers);
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
      this.formMerchantsData = data;
    },
    async getAllCP() {
      if (this.$refs.selectCP.inputValue.length < 3) return;
      this.loadingCP = true;
      const data = await new Promise(async (resolve, reject) => {
        return this.$apollo
          .query({
            query: getAllCustomers,
            variables: {
              countryId: this.selectedCountry,
              customer_type_id: 2,
              active: true,
              keyword: this.$refs.selectCP.inputValue,
              hub: true
            }
          })
          .then((res) => {
            resolve(res?.data?.getAllCustomers);
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
      this.cpOptions = data;
      this.loadingCP = false;
      this.$refs.selectCP.showPopup();
    },
    async addCP() {
      this.isLoadingCP = true;
      await new Promise((resolve, reject) => {
        return this.$apollo
          .mutate({
            mutation: linkCollectionPointSupplier,
            variables: {
              collectionPointId: this.selectedCPItem.id,
              supplierId: this.customerTenantId
            }
          })
          .then((res) => {
            return resolve(res?.data?.linkCollectionPointSupplier);
          })
          .catch((err) => {
            return reject(err?.message);
          });
      });
      await this.getCPList();
      this.selectedCPItem = null;
      // this.cpOptions = [];
      this.isLoadingCP = false;
    },
    async deleteCP(item) {
      this.isLoadingCP = true;
      await new Promise((resolve, reject) => {
        return this.$apollo
          .mutate({
            mutation: unLinkCollectionPointSupplier,
            variables: {
              collectionPointId: item.id,
              supplierId: this.customerTenantId
            }
          })
          .then((res) => {
            return resolve(res?.data?.unLinkCollectionPointSupplier);
          })
          .catch((err) => {
            return reject(err?.message);
          });
      });
      await this.getCPList();
      this.isLoadingCP = false;
    },
    async getCPList() {
      const data = await new Promise(async (resolve, reject) => {
        return this.$apollo
          .query({
            query: getAllCustomers,
            variables: {
              tenantId: this.customerTenantId,
              hub: true
            }
          })
          .then((res) => {
            resolve(res?.data?.getAllCustomers);
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
      this.formCPData = data;
    },
    async deleteInternal(internalItem) {
      const filteredInternal = this.formInternalUserData.filter((item) => item.email !== internalItem.email);
      this.formInternalUserData = filteredInternal;

      try {
        this.$q.loading.show({
          message: 'Please wait...'
        });
        await this.$apollo.mutate({
          mutation: deleteSupplierUsers,
          variables: {
            userIdList: [internalItem.id]
          }
        });
      } catch (error) {
        Notice.fail('Failed to remove!');
      } finally {
        this.$q.loading.hide();
      }
    },
    changeFrequency(val) {
      this.formStatementData[val].frequency_type_id = this.formStatementData[val].frequency.id;
      if ([1, 4].includes(this.formStatementData[val].frequency.id)) {
        this.formStatementData[val].value = 'None';
      } else if (this.formStatementData[val].frequency.id == 2) {
        this.formStatementData[val].value = this.weekArray[0];
      } else if (this.formStatementData[val].frequency.id == 3) {
        this.formStatementData[val].value = this.dayArray[0];
      }
    }
  }
};
</script>
<style scoped>
@media (max-width: 990px) {
  .d_header .text-title {
    text-align: center;
  }
  .d_header .btn-add {
    flex: 10000 1 0%;
    width: auto;
    min-width: 0;
    max-width: 100%;
  }
}
</style>
