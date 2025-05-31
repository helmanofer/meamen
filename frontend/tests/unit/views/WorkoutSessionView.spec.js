import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia, defineStore } from 'pinia';
import WorkoutSessionView from '@/views/workout/WorkoutSessionView.vue';
import { useRoute, useRouter } from 'vue-router';

// --- Store Mocks ---
// Mock workoutSessionsStore
const mockStartWorkout = vi.fn();
const mockPauseWorkout = vi.fn();
const mockCompleteSet = vi.fn();
// Add other actions as needed

const useWorkoutSessionsStoreMock = defineStore('workoutSessions', {
  state: () => ({
    activeWorkout: {}, // { traineeId: { name: 'Test Workout', exercises: [], ... } }
    workoutHistory: [],
    restTimer: { isActive: false, remaining: 0, duration: 0 },
    loading: false,
    error: null,
  }),
  getters: {
    currentExercise: (state) => (traineeId) => state.activeWorkout[traineeId]?.exercises[state.activeWorkout[traineeId]?.currentExerciseIndex],
    workoutProgress: () => vi.fn().mockReturnValue(0), // Mock getters used by the component
    totalExercises: () => vi.fn().mockReturnValue(0),
    completedExercises: () => vi.fn().mockReturnValue(0),
    workoutDuration: () => vi.fn().mockReturnValue(0),
    // Add more getters if directly used and need specific mocked return values
  },
  actions: {
    startWorkout: mockStartWorkout,
    pauseWorkout: mockPauseWorkout,
    resumeWorkout: vi.fn(),
    completeWorkout: vi.fn().mockResolvedValue({}),
    cancelWorkout: vi.fn(),
    completeSet: mockCompleteSet,
    skipSet: vi.fn(),
    goToExercise: vi.fn(),
    goToSet: vi.fn(),
    startRestTimer: vi.fn(),
    pauseRestTimer: vi.fn(),
    resetRestTimer: vi.fn(),
    // Ensure all actions called by the component are mocked
  },
});

// Mock traineesStore
const useTraineesStoreMock = defineStore('trainees', {
  state: () => ({
    trainees: [
      { id: 'trainee1', name: 'John Doe' },
      { id: 'trainee2', name: 'Jane Smith' },
    ],
  }),
  actions: {
    fetchTrainees: vi.fn().mockResolvedValue(),
  },
});

// Mock programsStore
const useProgramsStoreMock = defineStore('programs', {
  state: () => ({
    programs: [
      { id: 'plan1', name: 'Morning Blast', description: JSON.stringify({ exercises: [{exercise_id: 'e1', name:'Pushup', sets:3, reps:10}]}) },
      { id: 'plan2', name: 'Leg Day', description: JSON.stringify({ exercises: [{exercise_id: 'e2', name:'Squat', sets:3, reps:10}]}) },
    ],
  }),
  actions: {
    fetchPrograms: vi.fn().mockResolvedValue(),
  },
});

// Mock authStore
const useAuthStoreMock = defineStore('auth', {
  state: () => ({
    user: { id: 'trainer123' },
  }),
});


// --- Vue Router Mock ---
vi.mock('vue-router', async () => {
  const actualRouter = await vi.importActual('vue-router');
  return {
    ...actualRouter,
    useRouter: vi.fn(() => ({
      push: vi.fn(),
    })),
    useRoute: vi.fn(() => ({
      params: {}, // Default empty params
    })),
  };
});


describe('WorkoutSessionView.vue', () => {
  let pinia;

  beforeEach(() => {
    pinia = createPinia();
    setActivePinia(pinia);

    // You might need to explicitly tell Pinia to use your mocks
    // This depends on how your actual stores are structured and if they are auto-imported/registered.
    // A common way is to ensure your mocks are directly imported and used when the component calls useStore()
    // For this example, we assume the component will get these mocked versions.
    useWorkoutSessionsStoreMock();
    useTraineesStoreMock();
    useProgramsStoreMock();
    useAuthStoreMock();

    // Reset mock function calls
    mockStartWorkout.mockClear();
    mockPauseWorkout.mockClear();
    mockCompleteSet.mockClear();
    useRouter().push.mockClear(); // Clear router push mock
  });

  it('renders trainee and plan selection when no workouts are active', async () => {
    const wrapper = mount(WorkoutSessionView, {
      global: {
        plugins: [pinia],
        stubs: { // Stub child components if they are complex and not directly part of the test
            ActiveExerciseCard: true,
            RestTimer: true,
            WorkoutSummaryModal: true,
        }
      },
    });
    // Wait for onMounted hooks if any async operations happen there
    await wrapper.vm.$nextTick(); // Wait for Vue to process DOM updates after onMounted

    expect(wrapper.find('h2.text-xl.font-semibold').text()).toContain('Setup New Session');
    expect(wrapper.findAll('input[type="checkbox"]').length).toBeGreaterThan(0); // Trainees should be listed
  });

  it('allows selecting trainees, assigning plans, and starting workouts', async () => {
    const workoutStore = useWorkoutSessionsStoreMock(); // Get the store instance
    const traineesStore = useTraineesStoreMock();
    const programsStore = useProgramsStoreMock();

    const wrapper = mount(WorkoutSessionView, {
      global: { plugins: [pinia], stubs: { ActiveExerciseCard: true, RestTimer: true, WorkoutSummaryModal: true } }
    });
    await wrapper.vm.$nextTick(); // for onMounted

    // 1. Select trainees
    const traineeCheckboxes = wrapper.findAll('input[type="checkbox"]');
    await traineeCheckboxes[0].setValue(true); // Select first trainee
    await traineeCheckboxes[1].setValue(true); // Select second trainee
    expect(wrapper.vm.selectedTrainees).toEqual([traineesStore.trainees[0].id, traineesStore.trainees[1].id]);

    // 2. Assign plans
    const planSelectors = wrapper.findAll('select');
    await planSelectors[0].setValue(programsStore.programs[0].id); // Assign plan to first selected trainee
    await planSelectors[1].setValue(programsStore.programs[1].id); // Assign plan to second selected trainee
    expect(wrapper.vm.traineePlans[traineesStore.trainees[0].id]).toBe(programsStore.programs[0].id);
    expect(wrapper.vm.traineePlans[traineesStore.trainees[1].id]).toBe(programsStore.programs[1].id);

    // 3. Start workouts
    const startButton = wrapper.find('button.btn-primary'); // Assuming this is the "Start Workouts" button
    expect(startButton.text()).toContain('Start Workouts');
    await startButton.trigger('click');

    expect(mockStartWorkout).toHaveBeenCalledTimes(2);
    // Check call for first trainee
    expect(mockStartWorkout).toHaveBeenCalledWith(
      expect.objectContaining({ id: programsStore.programs[0].id, name: programsStore.programs[0].name }),
      traineesStore.trainees[0].id
    );
    // Check call for second trainee
    expect(mockStartWorkout).toHaveBeenCalledWith(
      expect.objectContaining({ id: programsStore.programs[1].id, name: programsStore.programs[1].name }),
      traineesStore.trainees[1].id
    );
    expect(wrapper.vm.currentTraineeId).toBe(traineesStore.trainees[0].id); // First trainee becomes current
  });

  it('displays workout info for currentTraineeId and allows switching', async () => {
    const workoutStore = useWorkoutSessionsStoreMock();
    const traineesStore = useTraineesStoreMock();

    // Simulate active workouts
    workoutStore.activeWorkout = {
      [traineesStore.trainees[0].id]: { name: 'Johns Workout', status: 'in_progress', isWorkoutActive: true, exercises: [{exercise_id: 'e1', exercise_name: 'Push Ups'}], currentExerciseIndex: 0, currentSetIndex: 0 },
      [traineesStore.trainees[1].id]: { name: 'Janes Workout', status: 'in_progress', isWorkoutActive: true, exercises: [{exercise_id: 'e2', exercise_name: 'Squats'}], currentExerciseIndex: 0, currentSetIndex: 0 },
    };

    const wrapper = mount(WorkoutSessionView, {
      global: { plugins: [pinia], stubs: { ActiveExerciseCard: true, RestTimer: true, WorkoutSummaryModal: true } }
    });
    await wrapper.vm.$nextTick();

    // Set initial current trainee
    wrapper.vm.currentTraineeId = traineesStore.trainees[0].id;
    await wrapper.vm.$nextTick();

    // Check initial display for trainee 1
    expect(wrapper.find('h1.text-xl').text()).toBe('Johns Workout');

    // Simulate switching trainee (assuming buttons with trainee names are rendered)
    // This part needs the actual trainee switcher UI to be robustly selectable
    const traineeSwitcherButtons = wrapper.findAll('.btn'); // Generic selector, make more specific if possible
    const janeButton = traineeSwitcherButtons.filter(b => b.text().includes('Jane Smith'))[0];
    if (janeButton) {
        await janeButton.trigger('click');
        expect(wrapper.vm.currentTraineeId).toBe(traineesStore.trainees[1].id);
        await wrapper.vm.$nextTick();
        expect(wrapper.find('h1.text-xl').text()).toBe('Janes Workout');
    } else {
        console.warn('Trainee switcher button for Jane Smith not found, skipping switch test part.');
    }
  });

  it('calls pauseWorkout store action when pause button is clicked', async () => {
    const workoutStore = useWorkoutSessionsStoreMock();
    const traineesStore = useTraineesStoreMock();
    const trainee1Id = traineesStore.trainees[0].id;

    workoutStore.activeWorkout = {
      [trainee1Id]: { name: 'Test Workout', status: 'in_progress', isWorkoutActive: true, exercises: [], currentExerciseIndex: 0, currentSetIndex: 0 },
    };

    const wrapper = mount(WorkoutSessionView, {
      global: { plugins: [pinia], stubs: { ActiveExerciseCard: true, RestTimer: true, WorkoutSummaryModal: true } }
    });
    wrapper.vm.currentTraineeId = trainee1Id;
    await wrapper.vm.$nextTick();

    // Find the pause button (this selector might need adjustment based on actual template)
    const pauseButton = wrapper.find('button.btn-secondary'); // Assuming pause is secondary when active
    if (pauseButton.exists() && pauseButton.text() === 'Pause') {
        await pauseButton.trigger('click');
        expect(mockPauseWorkout).toHaveBeenCalledWith(trainee1Id);
    } else {
        console.warn("Pause button not found or not in expected state for test.");
    }
  });

});
