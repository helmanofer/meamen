import json
from sqlmodel import Session, select
from meamen.models.exercise import Exercise
from meamen.models.session_template import SessionTemplate
from meamen.crud.exercise import create_exercise
from meamen.crud.session_template import create_session_template


DEFAULT_EXERCISES = [
    # Chest Exercises
    {
        "name": "Push-ups",
        "description": "Classic bodyweight exercise for building chest, shoulder, and tricep strength",
        "category": "Strength",
        "muscle_groups": "Chest,Shoulders,Triceps,Core",
        "difficulty": "Beginner",
        "equipment": "None",
        "instructions": "Start in plank position with hands slightly wider than shoulders. Lower body until chest nearly touches floor, then push back up to starting position.",
        "tips": "Keep core tight and body in straight line. Don't let hips sag or pike up."
    },
    {
        "name": "Bench Press",
        "description": "Fundamental barbell exercise for building chest strength and mass",
        "category": "Strength",
        "muscle_groups": "Chest,Shoulders,Triceps",
        "difficulty": "Intermediate",
        "equipment": "Barbell,Bench",
        "instructions": "Lie on bench with feet flat on floor. Grip barbell slightly wider than shoulders. Lower bar to chest, then press up to full arm extension.",
        "tips": "Keep shoulder blades retracted and feet planted. Control the descent and drive through your heels."
    },
    {
        "name": "Dumbbell Flyes",
        "description": "Isolation exercise targeting the chest muscles",
        "category": "Strength",
        "muscle_groups": "Chest",
        "difficulty": "Intermediate",
        "equipment": "Dumbbells,Bench",
        "instructions": "Lie on bench holding dumbbells above chest. Lower weights in wide arc until you feel stretch in chest, then return to starting position.",
        "tips": "Keep slight bend in elbows throughout movement. Focus on squeezing chest muscles at the top."
    },

    # Back Exercises
    {
        "name": "Pull-ups",
        "description": "Bodyweight exercise for developing upper body pulling strength",
        "category": "Strength",
        "muscle_groups": "Back,Biceps,Shoulders",
        "difficulty": "Intermediate",
        "equipment": "Pull-up Bar",
        "instructions": "Hang from bar with palms facing away. Pull body up until chin clears bar, then lower with control.",
        "tips": "Start with assisted variations if needed. Focus on pulling with your back muscles, not just arms."
    },
    {
        "name": "Bent-over Rows",
        "description": "Compound exercise for building back thickness and strength",
        "category": "Strength",
        "muscle_groups": "Back,Biceps,Shoulders",
        "difficulty": "Intermediate",
        "equipment": "Barbell",
        "instructions": "Hinge at hips with knees slightly bent. Pull barbell to lower chest/upper abdomen, then lower with control.",
        "tips": "Keep back straight and core engaged. Squeeze shoulder blades together at the top."
    },
    {
        "name": "Lat Pulldowns",
        "description": "Machine exercise targeting the latissimus dorsi muscles",
        "category": "Strength",
        "muscle_groups": "Back,Biceps",
        "difficulty": "Beginner",
        "equipment": "Cable Machine",
        "instructions": "Sit with thighs secured under pads. Pull bar down to upper chest while leaning slightly back.",
        "tips": "Focus on pulling with your lats, not your arms. Avoid using momentum."
    },

    # Leg Exercises
    {
        "name": "Squats",
        "description": "Fundamental lower body exercise for building leg and glute strength",
        "category": "Strength",
        "muscle_groups": "Quadriceps,Glutes,Hamstrings,Core",
        "difficulty": "Beginner",
        "equipment": "None",
        "instructions": "Stand with feet shoulder-width apart. Lower body as if sitting back into a chair until thighs are parallel to floor, then stand back up.",
        "tips": "Keep chest up and knees tracking over toes. Go as deep as mobility allows with good form."
    },
    {
        "name": "Deadlifts",
        "description": "King of exercises for overall strength and muscle development",
        "category": "Strength",
        "muscle_groups": "Hamstrings,Glutes,Back,Core,Traps",
        "difficulty": "Advanced",
        "equipment": "Barbell",
        "instructions": "Stand with feet hip-width apart, bar over mid-foot. Hinge at hips and knees to grip bar, then drive through heels to stand up straight.",
        "tips": "Keep bar close to body throughout movement. Maintain neutral spine and engage core."
    },
    {
        "name": "Lunges",
        "description": "Unilateral leg exercise for building strength and stability",
        "category": "Strength",
        "muscle_groups": "Quadriceps,Glutes,Hamstrings,Calves",
        "difficulty": "Beginner",
        "equipment": "None",
        "instructions": "Step forward into lunge position, lowering back knee toward ground. Push off front foot to return to starting position.",
        "tips": "Keep front knee over ankle and torso upright. Alternate legs or complete all reps on one side first."
    },
    {
        "name": "Leg Press",
        "description": "Machine exercise for targeting leg muscles with heavy loads",
        "category": "Strength",
        "muscle_groups": "Quadriceps,Glutes,Hamstrings",
        "difficulty": "Beginner",
        "equipment": "Leg Press Machine",
        "instructions": "Sit in machine with back against pad. Place feet on platform and lower weight until knees reach 90 degrees, then press back up.",
        "tips": "Keep core engaged and avoid locking knees at the top. Control the descent."
    },

    # Shoulder Exercises
    {
        "name": "Overhead Press",
        "description": "Standing barbell press for building shoulder strength and stability",
        "category": "Strength",
        "muscle_groups": "Shoulders,Triceps,Core",
        "difficulty": "Intermediate",
        "equipment": "Barbell",
        "instructions": "Stand with feet hip-width apart. Press barbell from shoulder level to overhead, then lower with control.",
        "tips": "Keep core tight and avoid arching back excessively. Drive through heels for stability."
    },
    {
        "name": "Lateral Raises",
        "description": "Isolation exercise for building shoulder width",
        "category": "Strength",
        "muscle_groups": "Shoulders",
        "difficulty": "Beginner",
        "equipment": "Dumbbells",
        "instructions": "Hold dumbbells at sides. Raise arms out to sides until parallel to floor, then lower slowly.",
        "tips": "Use lighter weight and focus on form. Slight forward lean and internal rotation can help target side delts."
    },

    # Core Exercises
    {
        "name": "Plank",
        "description": "Isometric core exercise for building stability and endurance",
        "category": "Strength",
        "muscle_groups": "Core,Shoulders",
        "difficulty": "Beginner",
        "equipment": "None",
        "instructions": "Hold pushup position with forearms on ground. Maintain straight line from head to heels.",
        "tips": "Keep hips level and core engaged. Breathe normally throughout the hold."
    },
    {
        "name": "Crunches",
        "description": "Classic abdominal exercise for strengthening the rectus abdominis",
        "category": "Strength",
        "muscle_groups": "Core",
        "difficulty": "Beginner",
        "equipment": "None",
        "instructions": "Lie on back with knees bent. Lift shoulders off ground by contracting abs, then lower slowly.",
        "tips": "Don't pull on neck. Focus on lifting with your abs, not momentum."
    },
    {
        "name": "Russian Twists",
        "description": "Rotational core exercise for building oblique strength",
        "category": "Strength",
        "muscle_groups": "Core,Obliques",
        "difficulty": "Beginner",
        "equipment": "None",
        "instructions": "Sit with knees bent and feet off ground. Rotate torso side to side, touching ground beside hips.",
        "tips": "Keep chest up and core engaged. Add weight for increased difficulty."
    },

    # Cardio Exercises
    {
        "name": "Running",
        "description": "Classic cardiovascular exercise for improving endurance and burning calories",
        "category": "Cardio",
        "muscle_groups": "Legs,Core",
        "difficulty": "Beginner",
        "equipment": "None",
        "instructions": "Maintain steady pace appropriate for fitness level. Focus on consistent breathing and good running form.",
        "tips": "Start with walk-run intervals if new to running. Land midfoot and maintain upright posture."
    },
    {
        "name": "Burpees",
        "description": "Full-body cardio exercise combining squat, plank, and jump movements",
        "category": "Cardio",
        "muscle_groups": "Full Body",
        "difficulty": "Intermediate",
        "equipment": "None",
        "instructions": "From standing, squat down and place hands on floor. Jump feet back to plank, do pushup, jump feet forward, then jump up with arms overhead.",
        "tips": "Modify by stepping instead of jumping. Focus on maintaining good form even when tired."
    },
    {
        "name": "Mountain Climbers",
        "description": "High-intensity cardio exercise in plank position",
        "category": "Cardio",
        "muscle_groups": "Core,Shoulders,Legs",
        "difficulty": "Intermediate",
        "equipment": "None",
        "instructions": "Start in plank position. Alternate bringing knees toward chest in running motion.",
        "tips": "Keep hips level and core engaged. Start slow and build up speed with good form."
    },
    {
        "name": "Jumping Jacks",
        "description": "Simple full-body cardio exercise",
        "category": "Cardio",
        "muscle_groups": "Full Body",
        "difficulty": "Beginner",
        "equipment": "None",
        "instructions": "Jump feet apart while raising arms overhead, then jump back to starting position.",
        "tips": "Land softly on balls of feet. Modify by stepping side to side instead of jumping."
    },

    # Flexibility/Mobility
    {
        "name": "Cat-Cow Stretch",
        "description": "Gentle spine mobility exercise",
        "category": "Flexibility",
        "muscle_groups": "Back,Core",
        "difficulty": "Beginner",
        "equipment": "None",
        "instructions": "Start on hands and knees. Arch back and look up (cow), then round spine and tuck chin (cat).",
        "tips": "Move slowly and breathe deeply. Focus on moving one vertebra at a time."
    },
    {
        "name": "Downward Dog",
        "description": "Full-body stretch from yoga targeting multiple muscle groups",
        "category": "Flexibility",
        "muscle_groups": "Shoulders,Back,Hamstrings,Calves",
        "difficulty": "Beginner",
        "equipment": "None",
        "instructions": "Start on hands and knees, then lift hips up and back to form inverted V shape.",
        "tips": "Keep slight bend in knees if hamstrings are tight. Press through hands and lengthen spine."
    }
]


DEFAULT_SESSION_TEMPLATES = [
    {
        "name": "Beginner Full Body",
        "description": "A comprehensive full-body workout perfect for beginners. Focuses on fundamental movement patterns and building base strength.",
        "category": "Full Body",
        "difficulty": "Beginner",
        "duration_minutes": 45,
        "equipment_needed": "Dumbbells,Bench",
        "workout_structure": json.dumps([
            {"exercise": "Squats", "sets": 3, "reps": "12-15", "rest_seconds": 60},
            {"exercise": "Push-ups", "sets": 3, "reps": "8-12", "rest_seconds": 60},
            {"exercise": "Bent-over Rows", "sets": 3, "reps": "10-12", "rest_seconds": 60},
            {"exercise": "Overhead Press", "sets": 3, "reps": "8-10", "rest_seconds": 60},
            {"exercise": "Plank", "sets": 3, "reps": "30-45 seconds", "rest_seconds": 60},
            {"exercise": "Lunges", "sets": 2, "reps": "10 each leg", "rest_seconds": 60}
        ]),
        "notes": "Rest 2-3 minutes between exercises. Focus on proper form over weight."
    },
    {
        "name": "Upper Body Strength",
        "description": "Focused upper body strength training targeting chest, back, shoulders, and arms.",
        "category": "Strength",
        "difficulty": "Intermediate",
        "duration_minutes": 60,
        "equipment_needed": "Barbell,Dumbbells,Bench,Pull-up Bar",
        "workout_structure": json.dumps([
            {"exercise": "Bench Press", "sets": 4, "reps": "6-8", "rest_seconds": 120},
            {"exercise": "Pull-ups", "sets": 4, "reps": "6-10", "rest_seconds": 120},
            {"exercise": "Overhead Press", "sets": 3, "reps": "8-10", "rest_seconds": 90},
            {"exercise": "Bent-over Rows", "sets": 3, "reps": "8-10", "rest_seconds": 90},
            {"exercise": "Dumbbell Flyes", "sets": 3, "reps": "10-12", "rest_seconds": 60},
            {"exercise": "Lateral Raises", "sets": 3, "reps": "12-15", "rest_seconds": 60}
        ]),
        "notes": "Focus on progressive overload. Increase weight when you can complete all reps with good form."
    },
    {
        "name": "Lower Body Power",
        "description": "Intensive lower body workout focusing on building leg strength and power.",
        "category": "Strength",
        "difficulty": "Intermediate",
        "duration_minutes": 55,
        "equipment_needed": "Barbell,Leg Press Machine",
        "workout_structure": json.dumps([
            {"exercise": "Squats", "sets": 4, "reps": "6-8", "rest_seconds": 150},
            {"exercise": "Deadlifts", "sets": 4, "reps": "5-6", "rest_seconds": 180},
            {"exercise": "Leg Press", "sets": 3, "reps": "10-12", "rest_seconds": 90},
            {"exercise": "Lunges", "sets": 3, "reps": "12 each leg", "rest_seconds": 90},
            {"exercise": "Calf Raises", "sets": 4, "reps": "15-20", "rest_seconds": 60}
        ]),
        "notes": "Heavy compound movements first. Maintain proper form especially on deadlifts."
    },
    {
        "name": "HIIT Cardio Blast",
        "description": "High-intensity interval training session for cardiovascular fitness and fat burning.",
        "category": "Cardio",
        "difficulty": "Intermediate",
        "duration_minutes": 30,
        "equipment_needed": "None",
        "workout_structure": json.dumps([
            {"exercise": "Jumping Jacks", "sets": 4, "reps": "30 seconds", "rest_seconds": 30},
            {"exercise": "Burpees", "sets": 4, "reps": "20 seconds", "rest_seconds": 40},
            {"exercise": "Mountain Climbers", "sets": 4, "reps": "30 seconds", "rest_seconds": 30},
            {"exercise": "High Knees", "sets": 4, "reps": "20 seconds", "rest_seconds": 40},
            {"exercise": "Push-ups", "sets": 4, "reps": "15 seconds", "rest_seconds": 45}
        ]),
        "notes": "Work at maximum intensity during work periods. Cool down with light stretching."
    },
    {
        "name": "Core & Flexibility",
        "description": "Dedicated core strengthening and flexibility session to improve stability and mobility.",
        "category": "Flexibility",
        "difficulty": "Beginner",
        "duration_minutes": 35,
        "equipment_needed": "None",
        "workout_structure": json.dumps([
            {"exercise": "Plank", "sets": 3, "reps": "45-60 seconds", "rest_seconds": 60},
            {"exercise": "Russian Twists", "sets": 3, "reps": "20 each side", "rest_seconds": 45},
            {"exercise": "Crunches", "sets": 3, "reps": "15-20", "rest_seconds": 45},
            {"exercise": "Cat-Cow Stretch", "sets": 2, "reps": "10 each", "rest_seconds": 30},
            {"exercise": "Downward Dog", "sets": 3, "reps": "30 seconds hold", "rest_seconds": 30},
            {"exercise": "Child's Pose", "sets": 1, "reps": "60 seconds hold", "rest_seconds": 0}
        ]),
        "notes": "Focus on controlled movements and deep breathing. Hold stretches without bouncing."
    },
    {
        "name": "Push/Pull Split",
        "description": "Upper body workout focusing on pushing movements (chest, shoulders, triceps).",
        "category": "Strength",
        "difficulty": "Advanced",
        "duration_minutes": 70,
        "equipment_needed": "Barbell,Dumbbells,Bench,Cable Machine",
        "workout_structure": json.dumps([
            {"exercise": "Bench Press", "sets": 4, "reps": "4-6", "rest_seconds": 180},
            {"exercise": "Overhead Press", "sets": 4, "reps": "6-8", "rest_seconds": 150},
            {"exercise": "Incline Dumbbell Press", "sets": 3, "reps": "8-10", "rest_seconds": 120},
            {"exercise": "Lateral Raises", "sets": 4, "reps": "12-15", "rest_seconds": 60},
            {"exercise": "Tricep Dips", "sets": 3, "reps": "10-12", "rest_seconds": 90},
            {"exercise": "Close-Grip Push-ups", "sets": 3, "reps": "8-12", "rest_seconds": 60}
        ]),
        "notes": "Heavy compound movements first, isolation exercises last. Progressive overload is key."
    },
    {
        "name": "Athletic Conditioning",
        "description": "Sport-specific conditioning workout combining strength and agility movements.",
        "category": "Full Body",
        "difficulty": "Advanced",
        "duration_minutes": 50,
        "equipment_needed": "None",
        "workout_structure": json.dumps([
            {"exercise": "Burpees", "sets": 4, "reps": "8-10", "rest_seconds": 90},
            {"exercise": "Jump Squats", "sets": 4, "reps": "10-12", "rest_seconds": 90},
            {"exercise": "Push-ups", "sets": 4, "reps": "12-15", "rest_seconds": 60},
            {"exercise": "Mountain Climbers", "sets": 4, "reps": "20 each leg", "rest_seconds": 60},
            {"exercise": "Plank to Push-up", "sets": 3, "reps": "8-10", "rest_seconds": 90},
            {"exercise": "Bear Crawls", "sets": 3, "reps": "20 steps", "rest_seconds": 60}
        ]),
        "notes": "Focus on explosive movements and maintaining good form under fatigue."
    },
    {
        "name": "Recovery & Mobility",
        "description": "Gentle recovery session focusing on mobility, flexibility, and active recovery.",
        "category": "Flexibility",
        "difficulty": "Beginner",
        "duration_minutes": 25,
        "equipment_needed": "None",
        "workout_structure": json.dumps([
            {"exercise": "Cat-Cow Stretch", "sets": 2, "reps": "10 slow reps", "rest_seconds": 30},
            {"exercise": "Downward Dog", "sets": 3, "reps": "45 seconds hold", "rest_seconds": 30},
            {"exercise": "Hip Circles", "sets": 2, "reps": "10 each direction", "rest_seconds": 30},
            {"exercise": "Arm Circles", "sets": 2, "reps": "10 each direction", "rest_seconds": 30},
            {"exercise": "Gentle Twists", "sets": 2, "reps": "10 each side", "rest_seconds": 30},
            {"exercise": "Deep Breathing", "sets": 1, "reps": "5 minutes", "rest_seconds": 0}
        ]),
        "notes": "Perfect for rest days or after intense workouts. Focus on relaxation and gentle movement."
    }
]


def seed_default_exercises(session: Session) -> None:
    """Seed the database with default exercises if none exist."""
    # Check if any exercises already exist
    statement = select(Exercise)
    result = session.exec(statement)
    existing_exercises = result.all()

    if existing_exercises:
        print(f"Database already contains {len(existing_exercises)} exercises. Skipping seed.")
        return

    print("Seeding database with default exercises...")

    # Create all default exercises
    for exercise_data in DEFAULT_EXERCISES:
        # Create exercise with explicit field mapping to avoid type checker issues
        exercise = Exercise(
            name=exercise_data["name"],
            description=exercise_data.get("description"),
            category=exercise_data.get("category"),
            muscle_groups=exercise_data.get("muscle_groups"),
            difficulty=exercise_data.get("difficulty"),
            equipment=exercise_data.get("equipment"),
            instructions=exercise_data.get("instructions"),
            tips=exercise_data.get("tips")
        )
        create_exercise(session, exercise)

    print(f"Successfully seeded {len(DEFAULT_EXERCISES)} default exercises.")


def seed_default_session_templates(session: Session) -> None:
    """Seed the database with default session templates if none exist."""
    # Check if any session templates already exist
    statement = select(SessionTemplate)
    result = session.exec(statement)
    existing_templates = result.all()

    if existing_templates:
        print(f"Database already contains {len(existing_templates)} session templates. Skipping seed.")
        return

    print("Seeding database with default session templates...")

    # Create all default session templates
    for template_data in DEFAULT_SESSION_TEMPLATES:
        template = SessionTemplate(**template_data)  #  type: ignore
        create_session_template(session, template)

    print(f"Successfully seeded {len(DEFAULT_SESSION_TEMPLATES)} default session templates.")
