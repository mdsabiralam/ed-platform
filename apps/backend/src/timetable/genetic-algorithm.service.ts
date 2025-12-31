import { Injectable } from '@nestjs/common';

export interface TimeSlot {
  id: string;
  day: string;
  time: string;
}

export interface Teacher {
  id: string;
  name: string;
  subjects: string[]; // Subject IDs they can teach
}

export interface ClassGroup {
  id: string;
  name: string;
  subjects: string[]; // Subject IDs required
}

export interface RoutineGene {
  classId: string;
  subjectId: string;
  teacherId: string;
  slotId: string;
}

export interface RoutineChromosome {
  genes: RoutineGene[];
  fitness: number;
}

@Injectable()
export class GeneticAlgorithmService {
  private populationSize = 100;
  private mutationRate = 0.05;
  private generations = 50;

  async generateRoutine(
    slots: TimeSlot[],
    teachers: Teacher[],
    classes: ClassGroup[],
  ): Promise<RoutineGene[]> {
    let population = this.initializePopulation(slots, teachers, classes);

    for (let generation = 0; generation < this.generations; generation++) {
      population = this.evolvePopulation(population, slots, teachers, classes);

      // Check if we found a perfect solution
      const best = population.reduce((prev, current) => (prev.fitness > current.fitness ? prev : current));
      if (best.fitness === 1) {
        return best.genes;
      }
    }

    // Return the best solution found after max generations
    return population.reduce((prev, current) => (prev.fitness > current.fitness ? prev : current)).genes;
  }

  private initializePopulation(slots: TimeSlot[], teachers: Teacher[], classes: ClassGroup[]): RoutineChromosome[] {
    const population: RoutineChromosome[] = [];
    for (let i = 0; i < this.populationSize; i++) {
      const genes: RoutineGene[] = [];

      for (const cls of classes) {
        for (const subjectId of cls.subjects) {
          // Find eligible teachers
          const eligibleTeachers = teachers.filter(t => t.subjects.includes(subjectId));
          if (eligibleTeachers.length === 0) continue; // Skip if no teacher available (simplified)

          const randomTeacher = eligibleTeachers[Math.floor(Math.random() * eligibleTeachers.length)];
          const randomSlot = slots[Math.floor(Math.random() * slots.length)];

          genes.push({
            classId: cls.id,
            subjectId: subjectId,
            teacherId: randomTeacher.id,
            slotId: randomSlot.id,
          });
        }
      }

      population.push({ genes, fitness: this.calculateFitness(genes) });
    }
    return population;
  }

  private calculateFitness(genes: RoutineGene[]): number {
    let conflicts = 0;

    for (let i = 0; i < genes.length; i++) {
      for (let j = i + 1; j < genes.length; j++) {
        const g1 = genes[i];
        const g2 = genes[j];

        // Conflict 1: Same teacher at the same time
        if (g1.teacherId === g2.teacherId && g1.slotId === g2.slotId) {
          conflicts++;
        }

        // Conflict 2: Same class at the same time
        if (g1.classId === g2.classId && g1.slotId === g2.slotId) {
          conflicts++;
        }
      }
    }

    return 1 / (1 + conflicts); // 1.0 is perfect fitness (0 conflicts)
  }

  private evolvePopulation(
    population: RoutineChromosome[],
    slots: TimeSlot[],
    teachers: Teacher[],
    classes: ClassGroup[]
  ): RoutineChromosome[] {
    // Selection (Tournament)
    const nextGeneration: RoutineChromosome[] = [];

    while (nextGeneration.length < this.populationSize) {
        const parent1 = this.tournamentSelection(population);
        const parent2 = this.tournamentSelection(population);

        // Crossover
        const childGenes = this.crossover(parent1.genes, parent2.genes);

        // Mutation
        this.mutate(childGenes, slots, teachers, classes);

        nextGeneration.push({
            genes: childGenes,
            fitness: this.calculateFitness(childGenes)
        });
    }

    return nextGeneration;
  }

  private tournamentSelection(population: RoutineChromosome[]): RoutineChromosome {
    const tournamentSize = 5;
    let best: RoutineChromosome | null = null;

    for (let i = 0; i < tournamentSize; i++) {
        const candidate = population[Math.floor(Math.random() * population.length)];
        if (!best || candidate.fitness > best.fitness) {
            best = candidate;
        }
    }
    return best!;
  }

  private crossover(parent1: RoutineGene[], parent2: RoutineGene[]): RoutineGene[] {
    const splitPoint = Math.floor(Math.random() * parent1.length);
    return [...parent1.slice(0, splitPoint), ...parent2.slice(splitPoint)];
  }

  private mutate(genes: RoutineGene[], slots: TimeSlot[], teachers: Teacher[], classes: ClassGroup[]) {
    if (Math.random() < this.mutationRate) {
        const index = Math.floor(Math.random() * genes.length);
        const gene = genes[index];

        // Find subject and class details to pick valid teacher
        const cls = classes.find(c => c.id === gene.classId);
        if(!cls) return;

        const eligibleTeachers = teachers.filter(t => t.subjects.includes(gene.subjectId));
        if (eligibleTeachers.length > 0) {
             const randomTeacher = eligibleTeachers[Math.floor(Math.random() * eligibleTeachers.length)];
             const randomSlot = slots[Math.floor(Math.random() * slots.length)];

             // Mutate
             genes[index] = {
                 ...gene,
                 teacherId: randomTeacher.id,
                 slotId: randomSlot.id
             };
        }
    }
  }
}
