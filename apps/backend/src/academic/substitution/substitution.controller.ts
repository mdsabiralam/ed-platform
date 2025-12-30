import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { SubstitutionService } from './substitution.service';
import { AssignSubstituteDto } from './dto/assign-substitute.dto';

@Controller('academic/substitution')
export class SubstitutionController {
  constructor(private readonly substitutionService: SubstitutionService) {}

  @Post('assign')
  assignSubstitute(@Body() dto: AssignSubstituteDto) {
    return this.substitutionService.assignSubstitute(dto);
  }
}
