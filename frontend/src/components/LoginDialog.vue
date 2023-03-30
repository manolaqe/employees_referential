<template>
    <v-row justify="center">
        <v-dialog v-model="dialog" persistent>
            <template v-slot:activator="{ props }">
                <v-btn flat color="blue" v-bind="props">
                    Log In
                </v-btn>
            </template>
            <v-card>
                <v-card-title>
                    <span class="text-h5">Log In</span>
                </v-card-title>
                <v-card-text>
                    <v-container>
                        <v-row>
                            
                            <v-col cols="12">
                                <v-text-field label="Email*" v-model= "email" clearable required></v-text-field>
                            </v-col>
                            <v-col cols="12">
                                <v-text-field label="Password*" type="password" v-model= "password" clearable required></v-text-field>
                            </v-col>
                           
                        </v-row>
                    </v-container>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="blue-darken-1" variant="text" @click="dialog = false">
                        Close
                    </v-btn>
                    <v-btn color="blue-darken-1" variant="text" @click="logIn">
                        Log in
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-row>
</template>

<script>
import axios from "axios";

export default {
    data: () => ({
        dialog: false,
        email: null,
        password: null,
    }),
    methods: {
         async logIn() {
           
            try {
                const response = await axios.post("http://localhost:3030/login", {"emailAddress":this.email, "password":this.password});

                const token = response.data.token;
                
                this.$emit('loggedIn', token);

            } catch (error) {
                console.error(error);
                alert("The email address and/or the password are not correct!");
            }

            this.dialog = false;
           
            this.email = null;
            this.password = null;
         }
    }
}
</script>