<template>
  <q-drawer v-model="show" show-if-above content-class="bg-grey-2" :width="265" :side="side">
    <div class="absolute-top" style="height: 150px">
      <div class="absolute-center bg-transparent row justify-center profile full-width text-center q-px-md">
        <div class="overlay" v-bind:class="[popActive ? popActiveClass : '']"></div>

        <div class="col-xs-12">
          <q-avatar size="56px" class="q-mb-sm noselect" @click="showPopover">
            <img :src="photoProfile(user.image)" alt="profile" />
          </q-avatar>
        </div>
        <div class="col-xs-12">
          <div
            class="text-weight-medium text-body1 cursor-pointer text-primary noselect"
            @click="showPopover"
          >
            {{ user.first_name }} {{ user.last_name }}
          </div>
        </div>
        <div class="col-xs-12 text-grey">{{ user.user_type }}</div>
      </div>
    </div>

    <!-- start popover -->
    <div class="q-popover" v-bind:class="[popActive ? popActiveClass : '']">
      <div class="popover-content">
        <div class="text-h6 q-mb-md text-left title">
          <span class="close cursor-pointer" @click="showPopover">
            <q-icon name="eva-close" />
          </span>
        </div>
        <div class="row no-wrap q-pa-md">
          <div class="col-xs-8">
            <div class="text-h6 text-left sub-title">Profile</div>
            <div class="form-group row">
              <div class="col-xs-5">
                <div class="text-label">Birth Date</div>
              </div>
              <div class="col-xs-7">
                <div class="text-value">
                  {{ user.birth_date ? $dayjs(user.birth_date).format('D MMMM YYYY') : '' }}
                </div>
              </div>
            </div>
            <div class="form-group row">
              <div class="col-xs-5">
                <div class="text-label">Gender</div>
              </div>
              <div class="col-xs-7">
                <div class="text-value">
                  {{ genderName(user.gender || '') }}
                </div>
              </div>
            </div>
            <div class="text-h6 text-left sub-title">Contact</div>
            <div class="form-group row">
              <div class="col-xs-5">
                <div class="text-label">Email</div>
              </div>
              <div class="col-xs-7">
                <div class="text-value">{{ user.email || '' }}</div>
              </div>
            </div>
            <div class="form-group row">
              <div class="col-xs-5">
                <div class="text-label">Phone Number</div>
              </div>
              <div class="col-xs-7">
                <div class="text-value">{{ user.mobile || '' }}</div>
              </div>
            </div>
            <div class="form-group q-mt-lg text-center">
              <q-btn
                flat
                icon="eva-edit-outline"
                label="Edit Profile"
                class="btn_action"
                @click="showEditForm = true"
              />
              <q-btn
                flat
                icon="lock_outline"
                label="Change Password"
                class="btn_action"
                @click="showChangePasswordForm = true"
              />
            </div>
          </div>
          <q-separator vertical class="separator" />
          <div class="col-xs-4">
            <div class="avatar-icon-container">
              <q-avatar class="avatar-icon">
                <img :src="photoProfile(user.image)" alt="profile" />
              </q-avatar>
            </div>
            <div class="text-fullname q-mt-md">{{ user.first_name || '' }} {{ user.last_name || '' }}</div>
            <div class="text-usertype q-mb-xs">{{ user.user_type || '' }}</div>
          </div>
        </div>
      </div>
    </div>
    <!-- /end popover -->

    <q-scroll-area
      class="bg-grey-2"
      style="height: calc(100% - 150px); margin-top: 150px"
      :thumb-style="thumbStyle"
      :content-style="contentStyle"
      :content-active-style="contentActiveStyle"
    >
      <q-list padding separator>
        <div v-for="menu in menus" :key="menu.label">
          <q-item clickable :to="menu.to" v-if="!menu.children">
            <q-item-section avatar>
              <q-icon :name="menu.icon" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ menu.label }}</q-item-label>
            </q-item-section>
          </q-item>
          <q-expansion-item expand-separator :icon="menu.icon" :label="menu.label" v-else>
            <q-item
              class="bg-grey-3"
              v-for="child in menu.children"
              clickable
              :to="child.to"
              :key="child.label"
            >
              <q-item-section avatar></q-item-section>
              <q-item-section>
                <q-item-label>{{ child.label }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-expansion-item>
        </div>
        <q-item clickable @click="confirmSignout">
          <q-item-section avatar>
            <q-icon name="eva-log-out" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Sign Out</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-scroll-area>
    <q-dialog v-model="showChangePasswordForm" persistent full-height>
      <change-password-form @add-complete="onChangePassword" />
    </q-dialog>
    <q-dialog v-model="showEditForm" persistent full-height>
      <edit-profile-form :item="user" @submit="onEdit" />
    </q-dialog>
  </q-drawer>
</template>

<script>
import ChangePasswordForm from '../account/ChangePasswordForm.vue';
import EditProfileForm from '../account/EditProfileForm.vue';
import ConfirmMessage from '../partial/ConfirmMessage.vue';
import { Api } from 'services';
import { aws_s3_bucket_public } from 'src/config';

export default {
  props: {
    value: {
      type: Boolean,
      default: false
    },
    side: {
      type: String,
      default: 'left'
    }
  },
  components: {
    ChangePasswordForm,
    EditProfileForm
  },
  data() {
    return {
      showChangePasswordForm: false,
      showEditForm: false,
      user: {},
      contentStyle: {
        backgroundColor: 'rgba(0,0,0,0)',
        color: '#555'
      },

      contentActiveStyle: {
        backgroundColor: '#eee',
        color: 'black'
      },

      thumbStyle: {
        right: '2px',
        borderRadius: '5px',
        backgroundColor: 'transparent',
        width: '5px',
        opacity: 0.75
      },
      mobileData: true,
      bluetooth: true,
      popActive: false,
      popActiveClass: 'active'
    };
  },
  mounted() {
    this.user = this.$store.state;
    // this.setMenus(this.user.id);
  },
  computed: {
    menus() {
      // last id
      return [
        {
          icon: 'eva-heart-outline',
          label: 'Users',
          name: 'users',
          to: null,
          children: [
            {
              label: 'Internal Users',
              name: 'internal_users',
              to: '/main/users/internal_users'
            },
            {
              label: 'Group Buy',
              name: 'groupBuy_users',
              to: '/main/users/groupbuy_users'
            },
            {
              label: 'Business',
              name: 'business_users',
              to: '/main/users/business_users'
            },
            {
              label: 'Hosts',
              name: 'hosts_approval',
              to: '/main/users/hosts/approval'
              // children: [
              //   {
              //     label: 'Host Approval',
              //     name: 'host_approval',
              //     to: '/main/users/hosts/approval'
              //   },
              //   {
              //     label: 'Business',
              //     name: 'business_users',
              //     to: '/main/users/hosts/all_hosts'
              //   }
              // ]
            }
          ]
        },
        {
          icon: 'eva-archive-outline',
          label: 'Supplier',
          name: 'supplier',
          to: null,
          children: [
            {
              label: 'All Supplier',
              name: 'all_tenants',
              to: '/main/supplier/all_supplier'
            },
            {
              label: 'Connect Supplier',
              name: 'connect_tenants',
              to: '/main/supplier/connects'
            }
          ]
        },
        {
          icon: 'eva-award-outline',
          label: 'Customers',
          name: 'all_customers',
          to: '/main/customers'
        },
        {
          icon: 'eva-cube-outline',
          label: 'Hubs',
          name: 'hubs',
          to: null,
          children: [
            {
              label: 'View Hubs',
              name: 'all_hubs',
              to: '/main/hubs/all_hubs'
            },
            {
              label: 'View Sprees',
              name: 'all_sprees',
              to: '/main/hubs/all_sprees'
            }
          ]
        },
        {
          icon: 'eva-shopping-bag-outline',
          label: 'Products',
          name: 'products',
          to: null,
          children: [
            {
              label: 'B2B Products',
              name: 'b2b_products',
              to: '/main/products/b2b_products'
            },
            {
              label: 'B2C Products',
              name: 'b2c_products',
              to: '/main/products/b2c_products'
            },
            {
              id: 12,
              label: 'Inventories',
              name: 'inventories',
              to: '/main/products/inventories'
            },
            {
              label: 'Master Products',
              name: 'master_products',
              to: '/main/products/master_products'
            },
            {
              label: '[Legacy] Stock Location',
              name: 'legacy_stock_location',
              to: '/main/products/legacy_stock_location'
            },
            {
              label: 'Admin Approval',
              name: 'approval_admin',
              to: '/main/products/approval_admin'
            },
            {
              label: 'Tenant Approval',
              name: 'approval_admin',
              to: '/main/products/approval_tenant'
            }
          ]
        },
        {
          icon: 'eva-shopping-cart-outline',
          label: 'Orders',
          name: 'orders',
          to: null,
          children: [
            {
              label: 'Merchant Orders',
              name: 'merchant_orders',
              to: '/main/orders/merchant_orders'
            },
            {
              label: 'Groupbuy Orders',
              name: 'groupbuy_orders',
              to: '/main/orders/groupbuy_orders'
            }
          ]
        },
        {
          icon: 'eva-car-outline',
          label: 'Logistics',
          name: 'orders',
          to: null,
          children: [
            {
              label: 'Consolidation',
              name: 'consolidation',
              to: '/main/logistics/consolidations'
            }
          ]
        },
        {
          icon: 'eva-calendar-outline',
          label: 'Quotations',
          name: 'quotations',
          children: [
            {
              label: 'Internal Approval',
              name: 'internal_approval',
              to: '/main/internal_approval'
            },
            {
              label: 'Customer Request',
              name: 'customer_request',
              to: '/main/customer_request'
            }
          ]
        },
        // {
        //   icon: 'eva-people-outline',
        //   label: 'Users',
        //   name: 'users_new',
        //   to: '/main/coming-soon' //later will update
        // },
        // {
        //   icon: 'eva-smiling-face-outline',
        //   label: 'Advocates',
        //   name: 'advocates',
        //   to: '/main/advocates'
        // },
        //settings
        {
          id: 18,
          to: null,
          icon: 'eva-settings-outline',
          name: 'settings',
          label: 'Settings',
          children: [
            // {
            //   id: 19,
            //   to: '/main/menus',
            //   icon: null,
            //   name: 'menus',
            //   role: {
            //     add: 1,
            //     edit: 1,
            //     view: 1,
            //     delete: 1
            //   },
            //   label: 'Menu'
            // },
            {
              id: 20,
              to: '/main/masters/countries',
              icon: null,
              name: 'countries',
              role: {
                add: 1,
                edit: 1,
                view: 1,
                delete: 1
              },
              label: 'Country'
            },
            {
              id: 21,
              to: '/main/masters/days',
              icon: null,
              name: 'days',
              role: {
                add: 1,
                edit: 1,
                view: 1,
                delete: 1
              },
              label: 'Days'
            },
            {
              id: 22,
              to: '/main/masters/zones',
              icon: null,
              name: 'zones',
              role: {
                add: 1,
                edit: 1,
                view: 1,
                delete: 1
              },
              label: 'Zones'
            },
            {
              id: 23,
              to: '/main/masters/user_types',
              icon: null,
              name: 'user_types',
              role: {
                add: 1,
                edit: 1,
                view: 1,
                delete: 1
              },
              label: 'User Type'
            },
            {
              id: 24,
              to: '/main/masters/user_sessions',
              icon: null,
              name: 'user_sessions',
              role: {
                add: 1,
                edit: 1,
                view: 1,
                delete: 1
              },
              label: 'User Session'
            },
            {
              id: 25,
              to: '/main/masters/customer_types',
              icon: null,
              name: 'customer_types',
              role: {
                add: 1,
                edit: 1,
                view: 1,
                delete: 1
              },
              label: 'Customer Type'
            },
            {
              id: 26,
              to: '/main/masters/collection_types',
              icon: null,
              name: 'collection_types',
              role: {
                add: 1,
                edit: 1,
                view: 1,
                delete: 1
              },
              label: 'Collection Type'
            },
            {
              id: 27,
              to: '/main/masters/groups',
              icon: null,
              name: 'groups',
              role: {
                add: 1,
                edit: 1,
                view: 1,
                delete: 1
              },
              label: 'Groups'
            },
            {
              id: 28,
              to: '/main/masters/address_types',
              icon: null,
              name: 'address_types',
              role: {
                add: 1,
                edit: 1,
                view: 1,
                delete: 1
              },
              label: 'Address Type'
            },
            {
              id: 30,
              to: '/main/masters/product_types',
              icon: null,
              name: 'product_types',
              role: {
                add: 1,
                edit: 1,
                view: 1,
                delete: 1
              },
              label: 'Product Type'
            },
            {
              id: 31,
              to: '/main/masters/main_categories',
              icon: null,
              name: 'main_categories',
              role: {
                add: 1,
                edit: 1,
                view: 1,
                delete: 1
              },
              label: 'Main Category'
            },
            {
              id: 32,
              to: '/main/masters/sub_categories',
              icon: null,
              name: 'sub_categories',
              role: {
                add: 1,
                edit: 1,
                view: 1,
                delete: 1
              },
              label: 'Sub Category'
            },
            {
              id: 33,
              to: '/main/masters/logistic_types',
              icon: null,
              name: 'logistic_types',
              role: {
                add: 1,
                edit: 1,
                view: 1,
                delete: 1
              },
              label: 'Logistic Type'
            },
            {
              id: 34,
              to: '/main/masters/uom',
              icon: null,
              name: 'uom',
              role: {
                add: 1,
                edit: 1,
                view: 1,
                delete: 1
              },
              label: 'Unit Of Measure'
            },
            {
              id: 35,
              to: '/main/masters/order_statuses',
              icon: null,
              name: 'order_statuses',
              role: {
                add: 1,
                edit: 1,
                view: 1,
                delete: 1
              },
              label: 'Order Status'
            }
          ]
        }
      ];
    },
    show: {
      get() {
        return this.value;
      },
      set(val) {
        this.$emit('input', val);
      }
    }
  },
  methods: {
    confirmSignout() {
      this.$q
        .dialog({
          parent: this,
          component: ConfirmMessage,
          title: 'Sign Out Confirmation',
          message: 'Are you sure?'
        })
        .onOk(() => {
          this.signout();
        })
        .onCancel(() => {
          this.selectedItem = null;
        });
    },

    signout() {
      this.$store.commit('clearStore');
      window.location.reload(true);
    },
    showPopover() {
      if (this.popActive == true) {
        this.popActive = false;
      } else {
        this.popActive = true;
      }
    },
    onChangePassword(payload) {
      this.showChangePasswordForm = false;
    },
    async onEdit(payload) {
      this.showEditForm = false;
      const res = await Api.update(
        'users',
        {
          first_name: payload.first_name,
          last_name: payload.last_name,
          mobile: payload.mobile,
          email: payload.email,
          gender: payload.gender,
          birth_date: payload.birth_date,
          image: payload.image
        },
        payload.id
      );
      this.$store.commit('setUser', payload);
      this.user = this.$store.state;
    },
    genderName(v) {
      return this.$helper.getGenderName(v);
    },
    photoProfile(photoName) {
      if (photoName) {
        return typeof photoName === 'string' && photoName.startsWith('http')
          ? photoName
          : `${aws_s3_bucket_public}/profile-pictures/${photoName}`;
      }
      return `${aws_s3_bucket_public}/profile-pictures/no_image.png`;
    }
    // async setMenus(id) {
    //   const res = await Api.get('v_user_menu_details', `user_id=${id}`);
    //   if (res.status && res.data.length > 0) {
    //     res.data[0].menus.forEach((fValue, fIndex) => {
    //       fValue.children.sort(this.compareValues('label'));
    //     });
    //     this.$store.commit('setMenus', res.data[0].menus);
    //   }
    // },
    // compareValues(key, order = 'asc') {
    //   return function innerSort(a, b) {
    //     if (!a.hasOwnProperty(key) || !b.hasOwnProperty(key)) {
    //       // property doesn't exist on either object
    //       return 0;
    //     }

    //     const varA = typeof a[key] === 'string' ? a[key].toUpperCase() : a[key];
    //     const varB = typeof b[key] === 'string' ? b[key].toUpperCase() : b[key];

    //     let comparison = 0;
    //     if (varA > varB) {
    //       comparison = 1;
    //     } else if (varA < varB) {
    //       comparison = -1;
    //     }
    //     return order === 'desc' ? comparison * -1 : comparison;
    //   };
    // }
  }
};
</script>

<style scoped>
/* ***************************************** */
.noselect {
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}
.q-popover {
  position: absolute;
  display: inline-block;
  z-index: 1033;
}
.q-popover .popover-content {
  display: none;
  width: 700px;
  height: 388px;
  background-color: #fff;
  color: #666;
  text-align: center;
  padding: 0.5rem 1rem;
  margin-top: 15px;
  border-radius: 12px;
  box-shadow: 0 0 10px 1px rgba(0, 0, 0, 0.25);
  position: absolute;
  z-index: 1033;
  left: 250px;
}
.q-popover .popover-content:after,
.q-popover .popover-content:before {
  right: 100%;
  top: 80px;
  border: solid transparent;
  content: ' ';
  height: 0;
  width: 0;
  position: absolute;
  pointer-events: none;
}
.q-popover .popover-content:after {
  border-color: rgba(136, 183, 213, 0);
  border-right-color: #ffffff;
  border-width: 15px;
  margin-top: -15px;
}
.q-popover .popover-content:before {
  border-color: rgba(194, 225, 245, 0);
  border-right-color: #f0f0f0;
  border-width: 16px;
  margin-top: -16px;
}
.q-popover .popover-content .title {
  display: block;
  width: 100%;
  position: relative;
}
.q-popover .popover-content .title .close {
  position: absolute;
  right: 0;
  top: 0;
}
.q-popover.active .popover-content {
  display: block;
}
.sub-title {
  font-weight: 400;
  font-size: 24px;
  margin-bottom: 1.5rem;
  color: #000000;
}
.form-group {
  padding-right: 2rem;
  margin-bottom: 0.75rem;
}
.form-group .text-label {
  text-align: left;
  color: #9e9e9e;
}
.form-group .text-value {
  text-align: right;
  color: #000000;
}
.avatar-icon-container {
  border: 1px solid #f5f5f5;
  box-shadow: inset 0 0 10px #f0f0f0;
  padding: 15px;
  border-radius: 50%;
  width: 175px;
  height: 175px;
  overflow: hidden;
  margin: 0 auto;
  margin-left: 15px;
}
.avatar-icon {
  width: 100%;
  height: auto;
  margin: 0 auto;
  overflow: hidden;
  border: 1px solid #f5f5f5;
  box-shadow: 0 0 5px 5px #f0f0f0;
  background: #ffffff;
}
.text-fullname {
  color: #000000;
  font-size: 16px;
  font-weight: 500;
}
.text-usertype {
  color: #9e9e9e;
  font-size: 14px;
}
.overlay .overlay-bg {
  visibility: hidden;
}
.overlay.active .overlay-bg {
  visibility: visible;
  position: absolute;
  background: rgba(0, 0, 0, 0.25);
}

.btn_action {
  text-transform: capitalize;
  color: #000000;
  border: 1px solid #e9e9e9;
  font-size: 13px;
  font-weight: 400;
  margin-left: 0.5rem;
}
@media (min-width: 600px) and (max-width: 1013px) {
  .q-popover .popover-content {
    left: 0;
    margin-top: 150px;
    width: 600px;
  }

  .q-popover .popover-content:after,
  .q-popover .popover-content:before {
    left: 120px;
    top: 0;
    border: solid transparent;
    content: ' ';
    height: 0;
    width: 0;
    position: absolute;
    pointer-events: none;
  }
  .q-popover .popover-content:after {
    border-color: rgba(136, 183, 213, 0);
    border-bottom-color: #ffffff;
    border-width: 15px;
    margin-top: -30px;
  }
  .q-popover .popover-content:before {
    border-color: rgba(194, 225, 245, 0);
    border-bottom-color: #f0f0f0;
    border-width: 15px;
    margin-top: -30px;
  }
}
@media (max-width: 599px) {
  .q-drawer--mobile .q-popover.active {
    display: block;
  }
  .q-drawer--mobile .q-popover {
    display: none;
    width: 96%;
    margin: 0 auto;
    position: relative;
    margin-top: 120px;
  }
  .q-drawer--mobile .popover-content {
    background: #ffffff;
    width: 100%;
    height: auto;
    left: 0;
    padding: 0;
  }
  .q-drawer--mobile .q-popover .popover-content:after,
  .q-drawer--mobile .q-popover .popover-content:before {
    right: calc(50% - 15px);
    top: 0;
    border: solid transparent;
    content: ' ';
    height: 0;
    width: 0;
    position: absolute;
    pointer-events: none;
  }
  .q-drawer--mobile .q-popover .popover-content:after {
    border-color: rgba(136, 183, 213, 0);
    border-bottom-color: #ffffff;
    border-width: 15px;
    margin-top: -30px;
  }
  .q-drawer--mobile .q-popover .popover-content:before {
    border-color: rgba(194, 225, 245, 0);
    border-bottom-color: #f0f0f0;
    border-width: 15px;
    margin-top: -30px;
  }
  .q-drawer--mobile .popover-content .title .close {
    right: 10px;
    top: 10px;
  }
  .q-drawer--mobile .popover-content .col-xs-8,
  .q-drawer--mobile .popover-content .col-xs-7,
  .q-drawer--mobile .popover-content .col-xs-5,
  .q-drawer--mobile .popover-content .col-xs-4 {
    display: block;
    width: 100%;
  }
  .q-drawer--mobile .no-wrap {
    flex-wrap: wrap;
  }
  .q-drawer--mobile .popover-content .text-label,
  .q-drawer--mobile .popover-content .text-value {
    display: block;
    text-align: left;
  }
  .q-drawer--mobile .popover-content .separator {
    border-bottom: 1px solid #ddd;
    width: 100%;
    display: block;
    margin-bottom: 1rem;
  }
  .q-drawer--mobile .popover-content .sub-title {
    font-size: 20px;
  }
  .q-drawer--mobile .form-group {
    padding-right: 0;
  }
  .q-drawer--mobile .q-pl-md {
    padding-left: 0;
    margin-left: 0;
  }
  .q-drawer--mobile .btn_action {
    width: 100%;
    display: block;
    margin-bottom: 0.5rem;
    margin-left: 0;
  }
}
/*
.q-drawer-container
  .q-drawer__opener
  ~ .q-drawer
  .q-drawer__content
  .q-popover {
  display: none;
}
*/

.q-drawer-container .no-pointer-events ~ .q-drawer .q-drawer__content .q-popover.active {
  display: none;
}
</style>
