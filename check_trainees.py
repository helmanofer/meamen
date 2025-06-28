from sqlmodel import create_engine, Session, select
from meamen.models.trainee import Trainee, TraineeProgramAssignment
from meamen.models.trainer import Trainer
from meamen.models.session_template import SessionTemplate
from meamen.models.exercise_template import ExerciseTemplate
from meamen.models.program import Program
import os

DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(DATABASE_URL)

def check_trainees():
    with Session(engine) as session:
        print(f"Checking database: {DATABASE_URL}")
        
        # Check for trainers
        trainers = session.exec(select(Trainer)).all()
        print(f"Found {len(trainers)} trainers:")
        for trainer in trainers:
            print(f"  - ID: {trainer.id}, Name: {trainer.name}, Email: {trainer.email}")

        # Check for trainees
        trainees = session.exec(select(Trainee)).all()
        print(f"Found {len(trainees)} trainees:")
        for trainee in trainees:
            print(f"  - ID: {trainee.id}, Name: {trainee.name}, Email: {trainee.email}, Trainer ID: {trainee.trainer_id}")
        
        # Check for session templates (programs)
        programs = session.exec(select(SessionTemplate)).all()
        print(f"\nFound {len(programs)} programs:")
        for program in programs:
            print(f"  - ID: {program.id}, Name: {program.name}, Trainer ID: {program.trainer_id}")
        
        # Check for program assignments
        assignments = session.exec(select(TraineeProgramAssignment)).all()
        print(f"\nFound {len(assignments)} program assignments:")
        for assignment in assignments:
            print(f"  - Trainee ID: {assignment.trainee_id}, Program ID: {assignment.program_id}, Status: {assignment.status}")

if __name__ == "__main__":
    check_trainees()
