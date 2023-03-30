<template>
    <v-row justify="center">
        <v-dialog v-model="dialog" persistent>
            <template v-slot:activator="{ props }">
                <v-btn size="x-small" color="blue" v-bind="props" block>Edit</v-btn>
            </template>
            <v-card>
                <v-card-title>
                    <span class="text-h5">Edit Employee</span>
                </v-card-title>
                <v-card-text>
                    <v-container>
                        <v-row>
                            <v-col cols="12">
                                <v-text-field label="Email*" v-model="email" clearable required />
                            </v-col>
                            <v-col cols="12">
                                <v-text-field label="Name*" type="text" v-model="name" clearable required />
                            </v-col>
                            <v-col cols="12">
                                <v-text-field label="Photo URL*" type="text" v-model="photoURL" clearable required />
                            </v-col>
                        </v-row>
                    </v-container>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="blue-darken-1" variant="text" @click="dialog = false">
                        Close
                    </v-btn>
                    <v-btn color="blue-darken-1" variant="text" @click="editEmployee(this.employee, this.jobId)">
                        Update
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-row>
</template>

<script>
import axios from "axios";

export default {

    props: {
        employee: {
            type: Object,
            required: true,
            id: {
                type: String,
                required: true
            },
            email: {
                type: String,
                required: true
            },
            photoURL: {
                type: String,
                required: true
            },
            name: {
                type: String,
                required: true
            }
        },
        jobId: {
            type: Object,
            required: true
        },
        token: {
            type: String,
            required: true
        }
    },
    data() {
        return {
            dialog: false,
            email: '',
            name: '',
            photoURL: ''
        };
    },
    created() {
        this.email = this.employee.email;
        this.name = this.employee.name;
        this.photoURL = this.employee.photoURL;
    },
    methods: {
        async editEmployee(employee, jobId) {

            try {
                const response = await axios.put("http://localhost:3030/jobs/" + this.jobId.id + "/employees/" + employee.id, { "email": this.email, "name": this.name, "photoURL": this.photoURL }, {
                    headers: {
                        "authorization": this.token
                    }
                });
            } catch (error) {
                console.error(error);
            }

            this.$emit('updateInfo');

            this.dialog = false;
        },
        updateEmail(value) {
            this.email = value;
        },
        updateName(value) {
            this.name = value;
        },
        updatePhotoURL(value) {
            this.photoURL = value;
        }
    }
}
</script>