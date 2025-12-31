import { Injectable, Logger } from '@nestjs/common';
import {
  TimetableInputData,
  RoutineEntry,
  DayOfWeek,
} from './interfaces/timetable.interface';

interface Gene {
  sectionId: string;
  day: DayOfWeek;
  timeSlotId: string;
  subjectId: string;
  teacherId: string;
  roomId: string;
}

interface Schedule {
  genes: Gene[];
  fitness: number;
}

@Injectable()
export class GeneticAlgorithmService {
  private readonly logger = new Logger(GeneticAlgorithmService.name);
  private readonly POPULATION_SIZE = 50;
  private readonly MAX_GENERATIONS = 100;
  private readonly MUTATION_RATE = 0.1;

  generate(data: TimetableInputData): RoutineEntry[] {
    this.logger.log('Starting genetic algorithm generation...');
    let population = this.initializePopulation(this.POPULATION_SIZE, data);

    for (let generation = 0; generation < this.MAX_GENERATIONS; generation++) {
      // Calculate fitness for all
      population.forEach((individual) => {
        individual.fitness = this.calculateFitness(individual, data);
      });

      // Sort by fitness (descending)
      population.sort((a, b) => b.fitness - a.fitness);

      // Log progress
      if (generation % 10 === 0) {
        this.logger.debug(
          `Generation ${generation}: Best Fitness = ${population[0].fitness}`,
        );
      }

      // Check for perfect score (optional termination)
      // if (population[0].fitness >= PERFECT_SCORE) break;

      // Selection & Evolution
      const newPopulation: Schedule[] = [];

      // Elitism: Keep top 10%
      const eliteCount = Math.floor(this.POPULATION_SIZE * 0.1);
      newPopulation.push(...population.slice(0, eliteCount));

      // Fill rest
      while (newPopulation.length < this.POPULATION_SIZE) {
        const parent1 = this.tournamentSelection(population);
        const parent2 = this.tournamentSelection(population);
        let child = this.crossover(parent1, parent2);

        if (Math.random() < this.MUTATION_RATE) {
          child = this.mutate(child, data);
        }
        newPopulation.push(child);
      }
      population = newPopulation;
    }

    // Final sort
    population.forEach(ind => ind.fitness = this.calculateFitness(ind, data));
    population.sort((a, b) => b.fitness - a.fitness);

    return population[0].genes;
  }

  private initializePopulation(size: number, data: TimetableInputData): Schedule[] {
    const population: Schedule[] = [];
    for (let i = 0; i < size; i++) {
      population.push(this.createRandomSchedule(data));
    }
    return population;
  }

  private createRandomSchedule(data: TimetableInputData): Schedule {
    const genes: Gene[] = [];
    // For every section, every day, every timeslot, try to assign a subject
    // This is a simplified "Slot-based" gene generation.
    // A better approach for "Weekly Sessions" is to iterate subjects and place them.

    // Strategy: For each section, fulfill the required sessions for each subject
    for (const section of data.sections) {
      const sectionSubjects = data.subjects.filter(s => section.subjectIds.includes(s.id));

      const availableSlots: { day: DayOfWeek; slotId: string }[] = [];
      for (const day of data.workDays) {
        for (const slot of data.timeSlots) {
          availableSlots.push({ day, slotId: slot.id });
        }
      }
      // Shuffle slots to randomize placement
      this.shuffleArray(availableSlots);

      let slotIndex = 0;
      for (const subject of sectionSubjects) {
        for (let i = 0; i < subject.weeklySessions; i++) {
          if (slotIndex >= availableSlots.length) break; // No more slots

          const { day, slotId } = availableSlots[slotIndex];
          slotIndex++;

          // Randomly assign valid teacher for this subject
          const validTeachers = data.teachers.filter(t => t.subjectIds.includes(subject.id));
          const teacher = validTeachers.length > 0
            ? validTeachers[Math.floor(Math.random() * validTeachers.length)]
            : data.teachers[0]; // Fallback (should handle gracefully)

          // Randomly assign room
          const room = data.rooms[Math.floor(Math.random() * data.rooms.length)];

          genes.push({
            sectionId: section.id,
            subjectId: subject.id,
            day,
            timeSlotId: slotId,
            teacherId: teacher?.id || 'unassigned',
            roomId: room?.id || 'unassigned',
          });
        }
      }
    }
    return { genes, fitness: 0 };
  }

  private calculateFitness(schedule: Schedule, data: TimetableInputData): number {
    let score = 1000;

    // Map to track usage
    const teacherUsage = new Set<string>(); // "teacherId-day-slotId"
    const roomUsage = new Set<string>();    // "roomId-day-slotId"
    const sectionUsage = new Set<string>(); // "sectionId-day-slotId"

    for (const gene of schedule.genes) {
      const timeKey = `${gene.day}-${gene.timeSlotId}`;

      // HARD CONSTRAINT: Teacher Conflict
      const teacherKey = `${gene.teacherId}-${timeKey}`;
      if (teacherUsage.has(teacherKey)) {
        score -= 100; // Penalty
      } else {
        teacherUsage.add(teacherKey);
      }

      // HARD CONSTRAINT: Room Conflict
      const roomKey = `${gene.roomId}-${timeKey}`;
      if (roomUsage.has(roomKey)) {
        score -= 100;
      } else {
        roomUsage.add(roomKey);
      }

      // HARD CONSTRAINT: Section double booking (logic ensures usually, but safe to check)
      const sectionKey = `${gene.sectionId}-${timeKey}`;
      if (sectionUsage.has(sectionKey)) {
        score -= 100;
      } else {
        sectionUsage.add(sectionKey);
      }
    }

    return score;
  }

  private tournamentSelection(population: Schedule[]): Schedule {
    // Select k individuals
    const k = 5;
    let best = population[Math.floor(Math.random() * population.length)];

    for (let i = 0; i < k; i++) {
      const ind = population[Math.floor(Math.random() * population.length)];
      if (ind.fitness > best.fitness) {
        best = ind;
      }
    }
    return best; // Return clone if needed, but for read-only parents strictly ok
  }

  private crossover(parent1: Schedule, parent2: Schedule): Schedule {
    // Single Point Crossover
    const cutPoint = Math.floor(Math.random() * parent1.genes.length);

    const childGenes = [
      ...parent1.genes.slice(0, cutPoint),
      ...parent2.genes.slice(cutPoint)
    ];

    // Note: Simple crossover might duplicate/missing sessions for a class.
    // A smarter crossover preserves the "set of sessions" but swaps time slots.
    // For Phase 3 basic requirement, strict structure maintenance is complex.
    // We will stick to simple gene splicing and rely on the fact that
    // both parents have roughly same structure of sessions (if initialized same way).

    return { genes: childGenes, fitness: 0 };
  }

  private mutate(schedule: Schedule, data: TimetableInputData): Schedule {
    const newGenes = [...schedule.genes];

    // Pick a random gene
    const index = Math.floor(Math.random() * newGenes.length);
    const gene = { ...newGenes[index] };

    // Mutation Type 1: Change Time Slot
    const randomDay = data.workDays[Math.floor(Math.random() * data.workDays.length)];
    const randomSlot = data.timeSlots[Math.floor(Math.random() * data.timeSlots.length)];

    gene.day = randomDay;
    gene.timeSlotId = randomSlot.id;

    // Mutation Type 2: Change Room
    const randomRoom = data.rooms[Math.floor(Math.random() * data.rooms.length)];
    gene.roomId = randomRoom.id;

    newGenes[index] = gene;

    return { genes: newGenes, fitness: 0 };
  }

  private shuffleArray(array: any[]) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }
}
