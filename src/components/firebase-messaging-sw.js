// Give the service worker access to Firebase Messaging.
// Note that you can only use Firebase Messaging here. Other Firebase libraries
// are not available in the service worker.
// Replace 10.13.2 with latest version of the Firebase JS SDK.
importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker by passing in
// your app's Firebase config object.
// https://firebase.google.com/docs/web/setup#config-object
firebase.initializeApp({
    apiKey: "AIzaSyDwenDeM3il8TIiFMUPb0GpyjMGUn1eC_U",
    authDomain: "dove0101.firebaseapp.com",
    projectId: "dove0101",
    storageBucket: "dove0101.firebasestorage.app",
    messagingSenderId: "206783732985",
    appId: "1:206783732985:web:f3e029c1664a39ee169628",
    measurementId: "G-BZYDVEXFP1"
});

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log('Received background message: ', payload);
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: payload.notification.image
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});
