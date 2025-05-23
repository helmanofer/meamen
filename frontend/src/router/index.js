import { createRouter, createWebHistory } from "vue-router";

const routes = [
  {
    path: "/",
    redirect: "/dashboard",
  },
  {
    path: "/login",
    name: "Login",
    component: () => import("../views/auth/LoginView.vue"),
    meta: {
      layout: "auth",
      requiresAuth: false,
    },
  },
  {
    path: "/register",
    name: "Register",
    component: () => import("../views/auth/RegisterView.vue"),
    meta: {
      layout: "auth",
      requiresAuth: false,
    },
  },
  {
    path: "/forgot-password",
    name: "ForgotPassword",
    component: () => import("../views/auth/ForgotPasswordView.vue"),
    meta: {
      layout: "auth",
      requiresAuth: false,
    },
  },
  {
    path: "/dashboard",
    name: "Dashboard",
    component: () => import("../views/DashboardView.vue"),
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: "/trainees",
    name: "Trainees",
    component: () => import("../views/trainees/TraineesView.vue"),
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: "/trainees/:id",
    name: "TraineeDetail",
    component: () => import("../views/trainees/TraineeDetailView.vue"),
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: "/exercises",
    name: "Exercises",
    component: () => import("../views/exercises/ExercisesView.vue"),
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: "/exercises/:id",
    name: "ExerciseDetail",
    component: () => import("../views/exercises/ExerciseDetailView.vue"),
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: "/programs",
    name: "Programs",
    component: () => import("../views/programs/ProgramsView.vue"),
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: "/programs/builder",
    name: "ProgramBuilder",
    component: () => import("../views/programs/ProgramBuilderView.vue"),
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: "/programs/builder/:id",
    name: "ProgramBuilderEdit",
    component: () => import("../views/programs/ProgramBuilderView.vue"),
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: "/programs/:id",
    name: "ProgramDetail",
    component: () => import("../views/programs/ProgramDetailView.vue"),
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: "/workout",
    name: "Workout",
    component: () => import("../views/workout/WorkoutSessionView.vue"),
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: "/workout/:templateId",
    name: "WorkoutFromTemplate",
    component: () => import("../views/workout/WorkoutSessionView.vue"),
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: "/sessions",
    name: "Sessions",
    component: () => import("../views/sessions/SessionsView.vue"),
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: "/calendar",
    name: "Calendar",
    component: () => import("../views/CalendarView.vue"),
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: "/messages",
    name: "Messages",
    component: () => import("../views/MessagesView.vue"),
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: "/analytics",
    name: "Analytics",
    component: () => import("../views/AnalyticsView.vue"),
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: "/settings",
    name: "Settings",
    component: () => import("../views/SettingsView.vue"),
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    component: () => import("../views/NotFoundView.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

router.beforeEach((to, from, next) => {
  const isAuthenticated = !!localStorage.getItem("token");

  if (to.meta.requiresAuth && !isAuthenticated) {
    next("/login");
  } else {
    next();
  }
});

export default router;
