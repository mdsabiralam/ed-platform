import { Injectable } from '@nestjs/common';
import { Counter } from 'prom-client';
import { InjectMetric } from '@willsoto/nestjs-prometheus';

@Injectable()
export class ObservabilityService {
  constructor(
    @InjectMetric('payment_success_total') public paymentSuccessCounter: Counter<string>,
    @InjectMetric('payment_failure_total') public paymentFailureCounter: Counter<string>,
  ) {}

  incrementPaymentSuccess() {
    this.paymentSuccessCounter.inc();
  }

  incrementPaymentFailure() {
    this.paymentFailureCounter.inc();
  }
}
