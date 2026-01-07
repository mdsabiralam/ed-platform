import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';

@Injectable()
export class ProfanityCheckPipe implements PipeTransform {
  // Simple list for demo
  private badWords = ['badword', 'abuse', 'spam'];

  transform(value: any, metadata: ArgumentMetadata) {
    if (value && typeof value === 'object') {
       // Check relevant fields like 'content' or 'message'
       if (value.content && typeof value.content === 'string') {
         const hasProfanity = this.badWords.some(word => value.content.toLowerCase().includes(word));
         if (hasProfanity) {
           // Prompt 4: "Do NOT block... mark as isFlagged: true"
           // Since pipes transform input, we inject the flag into the DTO
           value.isFlagged = true;
         }
       }
    }
    return value;
  }
}
