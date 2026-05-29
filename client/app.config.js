export default {
  expo: {
    name: "expenses-tracker",
    slug: "expenses-tracker",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "expensestracker",
    userInterfaceStyle: "automatic",

    android: {
      package: "com.anonymous.expensestracker",
      usesCleartextTraffic: true,
    },

    extra: {
      apiUrl: "http://192.168.179.23:5000/api",

      eas: {
        projectId: "a212c2a0-63ea-4a5f-8c47-d7931240facb",
      },
    },
  },
};