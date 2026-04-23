importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: 'AIzaSyC0eg29GmVYPbiZhcKeCIUExGKKxy-ScYI',
  authDomain: 'facture-app-16fc1.firebaseapp.com',
  projectId: 'facture-app-16fc1',
  storageBucket: 'facture-app-16fc1.firebasestorage.app',
  messagingSenderId: '187446502095',
  appId: '1:187446502095:web:78ffcdfd390a3fd0278dba'
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const { title, body } = payload.notification;
  self.registration.showNotification(title, { body, icon: '/vite.svg' });
});