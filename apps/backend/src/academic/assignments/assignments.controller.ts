import { Controller, Post, Body, Param, UseGuards, UploadedFile, UseInterceptors } from '@nestjs/common';
import { AssignmentService } from './assignments.service';
import { CreateAssignmentDto, SubmitAssignmentDto } from './dto/assignment.dto';
import { ApiTags, ApiOperation, ApiConsumes } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('teacher')
@Controller('api/teacher/homework')
export class AssignmentController {
  constructor(private readonly assignmentService: AssignmentService) {}

  @Post('create')
  @ApiOperation({ summary: 'Create a new homework assignment' })
  async create(@Body() dto: CreateAssignmentDto) {
    return this.assignmentService.createAssignment(dto);
  }
}

@ApiTags('student')
@Controller('api/student/homework')
export class StudentAssignmentController {
    constructor(private readonly assignmentService: AssignmentService) {}

    @Post(':id/submit')
    async submit(@Param('id') id: string, @Body() dto: SubmitAssignmentDto) {
        return this.assignmentService.submitAssignment(id, dto);
    }
}

@ApiTags('upload')
@Controller('api/upload')
export class UploadController {
    @Post()
    @UseInterceptors(FileInterceptor('file'))
    @ApiConsumes('multipart/form-data')
    uploadFile(@UploadedFile() file: Express.Multer.File) {
        // Mock S3 Upload
        console.log('Uploading file:', file?.originalname);
        return {
            url: `https://fake-s3-bucket.com/uploads/${Date.now()}_${file?.originalname || 'file'}`
        };
    }
}
