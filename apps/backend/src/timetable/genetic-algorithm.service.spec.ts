import { Test, TestingModule } from '@nestjs/testing';
import { GeneticAlgorithmService } from './genetic-algorithm.service';
import { TimetableInputData, DayOfWeek, ConstraintType } from './interfaces/timetable.interface';

describe('GeneticAlgorithmService', () => {
  let service: GeneticAlgorithmService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GeneticAlgorithmService],
    }).compile();

    service = module.get<GeneticAlgorithmService>(GeneticAlgorithmService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should generate a routine', () => {
    const mockData: TimetableInputData = {
      teachers: [
        { id: 't1', name: 'Teacher 1', subjectIds: ['s1'] },
        { id: 't2', name: 'Teacher 2', subjectIds: ['s2'] },
      ],
      subjects: [
        { id: 's1', name: 'Math', weeklySessions: 2 },
        { id: 's2', name: 'English', weeklySessions: 2 },
      ],
      rooms: [{ id: 'r1', name: 'Room 1', capacity: 30 }],
      sections: [{ id: 'sec1', name: 'Section A', subjectIds: ['s1', 's2'] }],
      timeSlots: [
        { id: 'ts1', startTime: '09:00', endTime: '10:00', label: 'Period 1' },
        { id: 'ts2', startTime: '10:00', endTime: '11:00', label: 'Period 2' },
      ],
      workDays: [DayOfWeek.MON, DayOfWeek.TUE],
    };

    const result = service.generate(mockData);
    expect(result).toBeDefined();
    expect(result.length).toBeGreaterThan(0);
    // 2 subjects * 2 sessions = 4 entries expected
    expect(result.length).toBe(4);

    // Check structure
    expect(result[0]).toHaveProperty('sectionId', 'sec1');
    expect(result[0]).toHaveProperty('teacherId');
    expect(result[0]).toHaveProperty('roomId');
  });
});
