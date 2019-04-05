<template>
  <div>
    <v-form>
      <v-layout wrap justify-space-between>
        <v-flex xs12 md6 pr-4>
          <v-text-field label="First name" type="text" v-model="profile.firstName"></v-text-field>
          <v-text-field label="Email" type="email" v-model="profile.email" :rules="[rules.email]"></v-text-field>
        </v-flex>
        <v-flex xs12 md6 pr-4>
          <v-text-field label="Last name" type="text" required v-model="profile.lastName"></v-text-field>
        </v-flex>
      </v-layout>
      <v-layout wrap justify-space-between>
        <v-flex xs12 md6 pr-4>
          <v-text-field label="Password" type="password" v-model="profile.password"></v-text-field>
        </v-flex>
        <v-flex xs12 md6 pr-4>
          <v-text-field
            label="Confirmation"
            type="password"
            v-model="profile.confirmation"
            :rules="[rules.passwordMatch]"
          ></v-text-field>
        </v-flex>
      </v-layout>
      <div class="button-box">
        <v-btn
          outline
          color="primary"
          :disabled="saving"
          @click="handleProfileSubmit"
          class="ml-0"
        >Save</v-btn>
      </div>
    </v-form>

    <div class="profile">
      <b-form @submit="handleProfileSubmit">
        <!-- <b-row>
          <b-col md="6" sm="12">
            <b-form-group label="First Name">
              <b-form-input type="text" v-model="profile.firstName"></b-form-input>
            </b-form-group>
          </b-col>

          <b-col md="6" sm="12">
            <b-form-group label="Last Name">
              <b-form-input type="text" v-model="profile.lastName"></b-form-input>
            </b-form-group>
          </b-col>
        </b-row>

        <b-row>
          <b-col md="6" sm="12">
            <b-form-group label="Email">
              <b-form-input type="email" required v-model="profile.email"></b-form-input>
            </b-form-group>
          </b-col>
        </b-row>

        <b-row>
          <b-col md="6" sm="12">
            <b-form-group label="Password">
              <b-form-input type="password" v-model="profile.password"></b-form-input>
            </b-form-group>
          </b-col>

          <b-col md="6" sm="12">
            <b-form-group label="Confrmation">
              <b-form-input type="password" v-model="profile.confirmation"></b-form-input>
            </b-form-group>
          </b-col>
        </b-row>

        <div class="button-box">
          <v-btn outline color="primary" :disabled="saving" type="submit">Save</v-btn>
        </div>-->

        <div class="api-key-invite form-inline float-right">
          <label>API key</label>
          <b-form-input readonly v-model="profile.apiKey"></b-form-input>

          <v-btn
            color="warning"
            outline
            small
            dark
            v-b-modal="modalId(1, 'regenerate-api-key')"
          >Regenerate</v-btn>

          <b-modal
            :id="modalId(1, 'regenerate-api-key')"
            button-size="sm"
            title="Generate new API key?"
            size="sm"
            centered
            ok-variant="warning"
            ok-title="Create new"
            @ok="handleRegenerageApiKey"
          >
            <p>All application that uses this API key wouldn't work until new key promoted to its instances.</p>
            <p>Are absolutely sure you want to create new API key?</p>
          </b-modal>

          <v-btn color="success" outline small dark v-b-modal.modal-invite>Invite link</v-btn>

          <b-modal
            id="modal-invite"
            class="invite-link-modal"
            title="Invite link generate"
            centered
            button-size="sm"
            :ok-only="true"
            ok-title="close"
          >
            <b-row>
              <b-col md="4" sm="4">
                <b-dropdown :text="invite.org.name" class="m-2" split size="sm" left>
                  <b-dropdown-item
                    v-for="org in organizations"
                    v-bind:key="org.id"
                    @click="handleInviteOrgChange(org)"
                  >{{ org.name }}</b-dropdown-item>
                </b-dropdown>
              </b-col>

              <b-col md="8" sm="8">
                <b-form-input v-model="invite.email" placeholder="E-Mail">></b-form-input>
              </b-col>
            </b-row>

            <b-row class="link-wrap">
              <b-col md="12" sm="12">
                <b-form-group label="Invitation link">
                  <b-form-input v-model="invite.link" readonly></b-form-input>
                </b-form-group>
              </b-col>
            </b-row>

            <div class="button-box">
              <b-button size="sm" variant="primary" @click="handleGenerateLink(false)">generate link</b-button>
              <b-button size="sm" variant="primary" @click="handleGenerateLink(true)">send link</b-button>
            </div>
          </b-modal>
        </div>
      </b-form>
    </div>
  </div>
</template>

<script>
import { doLogout } from "@/utils";
import _get from "lodash/get";
export default {
  name: "Profile",
  props: ["organizations"],
  data() {
    return {
      profile: {},
      invite: {
        org: { name: "Organization" },
        email: null,
        link: null
      },
      passwordMatch: false,
      emailValidate: false,
      rules: {
        email: value => {
          const pattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
          if (pattern.test(value)) {
            this.emailValidate = true;
            return true;
          } else {
            this.emailValidate = false;
            return "Invalid e-mail";
          }
        },
        passwordMatch: value => {
          if (value === this.profile.password) {
            this.passwordMatch = true;
            return true;
          } else {
            this.passwordMatch = false;
            return "Password dont match";
          }
        }
      },
      saving: false
    };
  },
  async mounted() {
    await this.loadProfile();
  },

  computed: {},

  methods: {
    modalId(i, postfix) {
      return `modal-${i}-${postfix}`;
    },

    async handleProfileSubmit(event) {
      event.preventDefault();

      // if (this.profile.password !== this.profile.confirmation) {
      //   return this.$notify({
      //     group: "error",
      //     type: "warn",
      //     text: "Password and confirmation does'n match"
      //   });
      // }

      // if (this.profile.hasOwnProperty("email") && !this.profile.email) {
      //   return this.$notify({
      //     group: "error",
      //     type: "warn",
      //     text: "Email cannot be empty"
      //   });
      // }

      if (!this.passwordMatch || !this.emailValidate) {
        return;
      }

      this.$loading(false);
      this.saving = true;

      try {
        const response = await this.axios.put("/api/user", {
          firstName: this.profile.firstName,
          lastName: this.profile.lastName,
          email: this.profile.email,
          password: this.profile.password,
          confirmation: this.profile.confirmation
        });

        const success = _get(response, "data.success");
        if (!success) throw new Error(_get(response, "data.message"));

        this.$notify({
          group: "app",
          type: "success",
          text: "Profile updated"
        });

        const shouldLogout = _get(response, "data.doLogout");
        if (shouldLogout) {
          doLogout(this);
        }
      } catch (error) {
        return this.$errorMessage.show(error);
      } finally {
        this.saving = false;
        this.$loading(false);
      }
    },

    async handleRegenerageApiKey() {
      this.$loading(true);

      try {
        const response = await this.axios.post("/api/user/apikey");
        const success = _get(response, "data.success");
        if (!success) throw new Error(`Unable to generate new api key.`);

        this.profile.apiKey = _get(response, "data.apiKey");
        return this.$notify({
          group: "error",
          type: "success",
          text:
            "New API key was created. Do not forget to update it everywhere."
        });
      } catch (error) {
        return this.$errorMessage.show(error);
      } finally {
        this.$loading(false);
      }
    },
    handleInviteOrgChange(org) {
      this.invite.org = org;
    },

    async handleGenerateLink(send) {
      if (!this.invite.org.orgId) {
        return this.$notify({
          group: "error",
          type: "error",
          text: "Organization not selected"
        });
      }

      if (!this.invite.email) {
        return this.$notify({
          group: "error",
          type: "error",
          text: "Email must be provided"
        });
      }

      try {
        const response = await this.axios.post(
          `/api/org/${this.invite.org.orgId}/invitelink`,
          {
            email: this.invite.email,
            send
          }
        );
        const success = _get(response, "data.success");
        if (!success) throw new Error("Unable to invite user");

        this.invite.link = _get(response, "data.confirmUrl");

        this.$notify({
          group: "app",
          type: "success",
          text: send ? "Email sent" : "Link created"
        });
      } catch (error) {
        return this.$errorMessage.show(error);
      } finally {
        this.$loading(false);
      }
    },

    async loadProfile() {
      this.$loading(true);

      try {
        let response = await this.axios.get("/api/user");

        let success = _get(response, "data.success");
        if (!success) {
          this.$errorMessage.show("Unable to load current user profile");
        }

        let data = _get(response, "data.user");
        data.apiKey = "";
        this.profile = data;
        response = await this.axios.get("/api/user/apikey");
        success = _get(response, "data.success");

        if (success) this.profile.apiKey = _get(response, "data.apikey");
      } catch (error) {
        return this.$errorMessage.show(error);
      } finally {
        this.$loading(false);
      }

      this.$loading(false);
    }
  },

  components: {}
};
</script>

<style lang="scss">
.profile {
  .api-key-invite {
    label {
      margin-right: 10px;
    }

    .form-control {
      margin-right: 10px;
      padding-bottom: 4px;
      padding-top: 4px;
      height: 27px;
      // width: 300px;
    }

    & > button {
      margin-left: 10px;
    }

    .invite-link-modal {
      input {
        width: 100%;
        height: 35px;
      }

      .link-wrap {
        margin-top: 20px;
      }
    }
  }
}
</style>
