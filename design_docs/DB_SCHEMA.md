erDiagram
    %% Core User Management
    TRAINER {
        uuid id PK
        string email UK
        string hashed_password
        string name
        string phone
        string address
        boolean is_active
        datetime created_at
        datetime updated_at
    }

    TRAINEE {
        uuid id PK
        uuid trainer_id FK
        string name
        string email
        string phone
        date date_of_birth
        string gender
        string address
        string emergency_contact
        decimal height
        decimal current_weight
        decimal body_fat_percentage
        integer resting_heart_rate
        string fitness_level
        json goals
        json injuries
        string medical_notes
        json measurement_history
        json progress_photos
        datetime created_at
        datetime updated_at
    }

    %% Session Templates (Blueprints)
    SESSION_TEMPLATE {
        uuid id PK
        uuid trainer_id FK
        string name
        text description
        string category
        string difficulty
        integer duration_minutes
        json equipment_needed
        text notes
        boolean is_default
        datetime created_at
        datetime updated_at
    }

    %% Exercise Templates (Part of Session Templates)
    EXERCISE_TEMPLATE {
        uuid id PK
        uuid session_template_id FK
        string exercise_name
        text exercise_description
        string category
        json muscle_groups
        string difficulty
        json equipment
        integer order_index
        integer target_sets
        integer target_reps
        decimal target_weight
        integer rest_between_sets
        text instructions
        text tips
        text notes
        datetime created_at
        datetime updated_at
    }

    %% Program Management (Set of Training Sessions)
    PROGRAM {
        uuid id PK
        uuid trainer_id FK
        string name
        text description
        string difficulty
        integer duration_weeks
        json goals
        datetime created_at
        datetime updated_at
    }

    %% Training Sessions (Part of Programs)
    TRAINING_SESSION {
        uuid id PK
        uuid program_id FK
        uuid session_template_id FK "nullable"
        uuid trainer_id FK
        string name
        text description
        string session_type
        string focus_area
        integer estimated_duration
        json warmup
        json cooldown
        integer week_number
        integer session_number
        datetime created_at
        datetime updated_at
    }

    %% Training Session Records (Actual Executed Sessions)
    TRAINING_SESSION_RECORD {
        uuid id PK
        uuid training_session_id FK "nullable"
        uuid trainee_id FK
        uuid trainer_id FK
        date session_date
        datetime start_time
        datetime end_time
        string location
        boolean completed
        boolean is_live
        string status
        text trainer_notes
        json trainee_feedback
        json session_metadata
        datetime created_at
        datetime updated_at
    }

    %% Exercise Records (Actual Performed Exercises)
    EXERCISE_RECORD {
        uuid id PK
        uuid session_record_id FK
        uuid exercise_template_id FK "nullable"
        string exercise_name
        text exercise_description
        string category
        json muscle_groups
        string difficulty
        json equipment
        integer order_index
        json sets
        text notes
        integer perceived_exertion
        integer form_rating
        boolean completed
        boolean skipped
        text modification_notes
        datetime started_at
        datetime completed_at
        datetime created_at
        datetime updated_at
    }

    %% Relationships - Core User Management
    TRAINER ||--o{ TRAINEE : "manages"
    TRAINER ||--o{ PROGRAM : "creates"
    TRAINER ||--o{ SESSION_TEMPLATE : "creates"
    TRAINER ||--o{ TRAINING_SESSION : "creates"
    TRAINER ||--o{ TRAINING_SESSION_RECORD : "conducts"

    %% Relationships - Template Structure
    SESSION_TEMPLATE ||--o{ EXERCISE_TEMPLATE : "contains"
    EXERCISE_TEMPLATE ||--o{ EXERCISE_RECORD : "blueprints"

    %% Relationships - Program Structure
    PROGRAM ||--o{ TRAINING_SESSION : "contains"
    SESSION_TEMPLATE ||--o{ TRAINING_SESSION : "blueprints"

    %% Relationships - Session Assignment & Execution
    TRAINEE ||--o{ TRAINING_SESSION : "assigned_to"
    TRAINING_SESSION ||--o{ TRAINING_SESSION_RECORD : "executed_as"
    TRAINEE ||--o{ TRAINING_SESSION_RECORD : "attends"
    TRAINING_SESSION_RECORD ||--o{ EXERCISE_RECORD : "contains"
