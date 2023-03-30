<template>
  <v-app id="inspire">
    <v-system-bar>
      <v-spacer></v-spacer>

    </v-system-bar>

    <v-app-bar>
      <LoginDialog @loggedIn="onLogIn" />
    </v-app-bar>

    <v-main class="bg-grey-lighten-2">
      <v-container>
        <v-row align="center">
          <v-col class="mt-2" cols="12">
              <strong>token: {{ token }}</strong>
            </v-col>
          <template v-for="job in jobs" :key="job.id">
            <v-col class="mt-2" cols="12">
              <strong>Job {{ job.title }}</strong>
            </v-col>

            <v-col v-for="employee in job.employees" :key="employee.id" cols="6" md="2">
              <v-hover v-slot="{ isHovering, props }">
                <v-card class="mx-auto" max-width="100" rounded v-bind="props" :elevation="isHovering ? 24 : 6">
                  <v-avatar color="grey" size="100" rounded>
                    <v-img :src="employee.photoURL"></v-img>
                  </v-avatar>
                  <v-card-text class="text-blue text-center">{{ employee.name }}</v-card-text>
                  <v-card-actions class="justify-center">
                    <UpdateEmployeeForm  :jobId="job" :employee="employee" :token="this.token" @updateInfo="fetchJobs" UpdateEmployeeForm/>
                    <v-btn size="x-small" color="red" @click="deleteEmployee(job.id, employee.id)">Delete</v-btn>
                  </v-card-actions>
                </v-card>
              </v-hover>
            </v-col>
            <v-col cols="6" md="2">
              <CreateEmployeeForm :jobId="job" :token="this.token" @updateInfo="fetchJobs" CreateEmployeeForm/>
            </v-col>
          </template>
        </v-row>
      </v-container>
    </v-main>

    <div>
      <child @loggedIn="onLogIn"></child>
    </div>
  </v-app>
</template>

<script>
import axios from "axios";
import LoginDialog from "@/components/LoginDialog";
import UpdateEmployeeForm from "./UpdateEmployeeForm.vue";
import CreateEmployeeForm from "./CreateEmployeeForm.vue";

export default {
  components: { LoginDialog, UpdateEmployeeForm, CreateEmployeeForm },
  data() {
    return {
      jobs: [],
      dialog: false,
      token: null
    };
  },
  created() {
    this.fetchJobs();
  },
  methods: {
    onLogIn(token) {
      this.token = token;
    },

    async fetchJobs() {
      try {
        const response = await axios.get("http://localhost:3030/jobs");
        this.jobs = response.data;
      } catch (error) {
        console.error(error);
      }
    },

    async deleteEmployee(jobId, employeeId) {
      try {
        const response = await axios.delete("http://localhost:3030/jobs/" + jobId + "/employees/" + employeeId, {
          headers: {
            "authorization": this.token
          }
        });

        this.fetchJobs();

      } catch (error) {
        console.error(error);
      }
    },
  }
}



</script>

