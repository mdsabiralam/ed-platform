import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors } from '@nestjs/common';
import { InstituteService } from './institute.service';
import { CreateInstituteDto } from './create-institute.dto';
import { UpdateInstituteDto } from './update-institute.dto';
import { HoneypotInterceptor } from '../common/interceptors/honeypot.interceptor';

@Controller('institutes')
export class InstituteController {
  constructor(private readonly instituteService: InstituteService) {}

  @Post()
  @UseInterceptors(HoneypotInterceptor) // 2.I.10 Honey Pot check added
  create(@Body() createInstituteDto: CreateInstituteDto) {
    return this.instituteService.create(createInstituteDto);
  }

  @Get()
  findAll() {
    return this.instituteService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.instituteService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateInstituteDto: UpdateInstituteDto) {
    return this.instituteService.update(id, updateInstituteDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.instituteService.remove(id);
  }
}