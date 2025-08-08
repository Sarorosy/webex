// Give the service worker access to Firebase Messaging.
// Note that you can only use Firebase Messaging here. Other Firebase libraries
// are not available in the service worker.


// Replace 10.13.2 with latest version of the Firebase JS SDK.
importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker by passing in
// your app's Firebase config object.
// https://firebase.google.com/docs/web/setup#config-object
// firebase.initializeApp({
//     apiKey: "AIzaSyDwenDeM3il8TIiFMUPb0GpyjMGUn1eC_U",
//     authDomain: "dove0101.firebaseapp.com",
//     projectId: "dove0101",
//     storageBucket: "dove0101.firebasestorage.app",
//     messagingSenderId: "206783732985",
//     appId: "1:206783732985:web:f3e029c1664a39ee169628",
//     measurementId: "G-BZYDVEXFP1"
// });

firebase.initializeApp({
  apiKey: "AIzaSyBkq3ZrcwblJpOoQZ01cFo1E2TkEXBSAI0",
  authDomain: "ccpp-a9267.firebaseapp.com",
  projectId: "ccpp-a9267",
  storageBucket: "ccpp-a9267.firebasestorage.app",
  messagingSenderId: "737718191451",
  appId: "1:737718191451:web:90ea044b468d225a37067e",
  measurementId: "G-QZ52FV65DH"
});

// Retrieve an instance of Firebase Messaging so that it can handle background
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('Received background message: ', payload);

  const title = payload.data.sender_name;
  const options = {
    body: payload.data.message,
    icon: payload.data.profile_pic || `https://ui-avatars.com/api/?name=${payload.data.sender_name.charAt(0)}&background=random&color=fff&size=128`,
    data: payload.data
  };

  self.registration.showNotification(title, options);
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();

  const data = event.notification.data;

  const targetUrl = `https://rapidcollaborate.in/ccp/chat`;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes('/ccp/chat') && 'focus' in client) {
          client.postMessage({ type: 'open_chat', payload: data });
          return client.focus();
        }
      }

      return clients.openWindow(targetUrl).then((newClient) => {
        // wait a little for React to load
        setTimeout(() => {
          newClient?.postMessage({ type: 'open_chat', payload: data });
        }, 500);
      });
    })
  );
});

