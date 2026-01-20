import { Controller, Post, Get, Body, Query } from '@nestjs/common';
import { EventsService } from './events.service';

@Controller('api/event')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  // ইভেন্ট তৈরি করার API
  @Post('create')
  async createEvent(@Body() body: { tenantId: string; name: string; startTime: string; endTime: string; location?: string }) {
    // ডিফল্ট tenantId ব্যবহার করা হচ্ছে (পরবর্তীতে লগিন সিস্টেমের সাথে যুক্ত হবে)
    const tenantId = body.tenantId || 'default-tenant-id'; 
    
    return this.eventsService.createEvent({
      tenantId: tenantId,
      name: body.name,
      startTime: new Date(body.startTime),
      endTime: new Date(body.endTime),
      location: body.location,
    });
  }

  // সব ইভেন্ট দেখার API (Admin Dashboard এর জন্য নতুন যুক্ত করা হলো)
  @Get('list')
  async findAll(@Query('tenantId') tenantId: string) {
    // যদি ফ্রন্টএন্ড tenantId না পাঠায়, তবে একটা ডিফল্ট ভ্যালু ধরে নেব
    const id = tenantId || 'default-tenant-id';
    return this.eventsService.findAllEvents(id);
  }

  // ডিউটি অ্যাসাইন করার API
  @Post('duty/assign')
  async assignDuty(@Body() body: { eventId: string; staffProfileId: string; role: string; startTime: string; endTime: string }) {
    return this.eventsService.assignDuty({
      eventId: body.eventId,
      staffProfileId: body.staffProfileId,
      role: body.role,
      startTime: new Date(body.startTime),
      endTime: new Date(body.endTime),
    });
  }

  // মোবাইল অ্যাপের জন্য নিজের ডিউটি দেখার API
  @Get('my-duties')
  async getMyDuties(@Query('profileId') profileId: string) {
    return this.eventsService.getMyDuties(profileId);
  }
}