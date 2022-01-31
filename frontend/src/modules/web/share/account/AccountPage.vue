<template>
  <q-page padding>
    <div class="row justify-center">
      <q-card class="my-card">
        <q-card-section>
          <div class="row">
            <div class="text-h5">Account Profile</div>
            <q-space></q-space>
            <div>
              <q-btn color="primary" @click="showEditForm = true">Edit Profile</q-btn>
            </div>
          </div>
        </q-card-section>
        <q-card-section>
          <div class="row">
            <div class="col-4 q-mr-lg">
              <q-card class="text-center avatar-container">
                <q-card-section>
                  <img
                    v-if="!data.image"
                    src="https://treedots-statics.s3-ap-southeast-1.amazonaws.com/images/man.png"
                    alt="profile"
                  />
                  <img v-else :src="data?.image?.large" alt="profile" />
                </q-card-section>
                <q-card-section>
                  <div class="text-primary text-bold">
                    {{ data.first_name || '' }} {{ data.last_name || '' }}
                  </div>
                  <div class="text-caption text-grey">
                    {{ data.user_type || '' }}
                  </div>
                </q-card-section>
              </q-card>
            </div>
            <div class="col-7">
              <div>
                <div id="myprofiledesc"></div>
                <table class="profile-table" aria-describedby="myprofiledesc">
                  <tr>
                    <th scope="col" colspan="2">
                      <div class="text-body1 text-weight-medium q-mb-sm">Profile</div>
                    </th>
                  </tr>
                  <tr>
                    <td class="profile-table-info">Birth Date</td>
                    <td>
                      {{ data.birth_date ? $dayjs(data.birth_date).format('D MMMM YYYY') : '' }}
                    </td>
                  </tr>
                  <tr>
                    <td>Gender</td>
                    <td>{{ genderName(data.gender || '') }}</td>
                  </tr>
                </table>
              </div>
              <div class="q-mt-md">
                <div id="myprofiledesc2"></div>
                <table class="profile-table" aria-describedby="myprofiledesc2">
                  <tr>
                    <th scope="col" colspan="2">
                      <div class="text-body1 text-weight-medium q-mb-sm">Contact</div>
                    </th>
                  </tr>
                  <tr>
                    <td class="profile-table-info">Email</td>
                    <td>{{ data.email || '' }}</td>
                  </tr>
                  <tr>
                    <td>Phone Number</td>
                    <td>{{ data.mobile || '' }}</td>
                  </tr>
                </table>
              </div>
              <div class="q-mt-lg">
                <q-btn
                  outline
                  icon="eva-unlock-outline"
                  label="Change Password"
                  @click="showChangePasswordForm = true"
                />
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>
    <q-dialog v-model="showChangePasswordForm" persistent>
      <change-password-form @add-complete="onChangePassword" />
    </q-dialog>
    <q-dialog v-model="showEditForm" persistent full-height>
      <edit-profile-form :item="data" @submit="onEdit" />
    </q-dialog>
  </q-page>
</template>

<script>
import ChangePasswordForm from '../../components/dashboard/account/ChangePasswordForm';
import EditProfileForm from '../../components/dashboard/account/EditProfileForm';
import { getGenderName } from '../../libraries/share/enum';
import { Api } from '../../boot/services';
export default {
  components: {
    ChangePasswordForm,
    EditProfileForm
  },
  data() {
    return {
      showChangePasswordForm: false,
      showEditForm: false,
      data: {}
    };
  },
  mounted() {
    this.data = this.$store.state;
  },
  methods: {
    onChangePassword(payload) {
      this.showChangePasswordForm = false;
    },
    async onEdit({ user_type, ...payload }) {
      this.showEditForm = false;
      const res = await Api.update('users', payload, payload.id);
      this.$store.commit('setUser', { user_type, ...payload });
    },
    genderName(v) {
      return getGenderName(v);
    }
  }
};
</script>

<style scoped>
.my-card {
  width: 600px;
}
.avatar-container {
  background-color: #e4e4e4;
}
.profile-table,
th,
td {
  border: 0px;
}

.profile-table .profile-table-info {
  min-width: 150px;
}

@media only screen and (max-width: 768px) {
  .my-card {
    width: 100%;
  }
}
</style>
