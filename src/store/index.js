import Vue from "vue";
import Vuex from "vuex";
import createPersistedState from "vuex-persistedstate";
import SecureLS from "secure-ls";
import fire from "../plugins/fire";
import settings from "./modules/settings";
import app from "./modules/app";

let ls = new SecureLS({isCompression: false});

const fb = require("../../firebaseConfig");

Vue.use(Vuex);


fb.auth.onAuthStateChanged(user => {
    if (user) {
        store.commit("setUser", user);
        store.commit("setLoad", false);
        fire.getSettings(user).then();
        fire.getDone(user).then();
        fire.getTasks(user).then();
        setTimeout(() => store.commit("setLoad", true), 1000);
    } else {
        store.commit("setLoad", true);
    }
});

export const store = new Vuex.Store({
    state: {
        lang: undefined,
        user: null,
        load: false,
        tkn: ""
    },
    actions: {
        cleanData({commit}) {
            commit("setUser", null);
            commit("app/setTasks", []);
            commit("app/setDone", []);
            commit("settings/setSettings", {});
            localStorage.removeItem("vuex");
            localStorage.removeItem("_secure__ls__metadata");
        },
    },
    mutations: {
        setLang: (state, payload) => {
            state.lang = payload;
        },
        setUser: (state, payload) => {
            state.user = payload;
        },
        setLoad: (state, payload) => {
            state.load = payload;
        },
        setTkn: (state, payload) => {
            state.tkn = payload;
        }
    },
    modules: {
        app,
        settings
    },
    plugins: [createPersistedState({
        paths: ["lang", "user", "app.tasks", "app.done", "settings.settings"],
        storage: {
            getItem: (key) => ls.get(key),
            setItem: (key, value) => ls.set(key, value),
            removeItem: (key) => ls.remove(key),
        }
    })]
});

export default store;
