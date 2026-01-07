import { Module, Global } from '@nestjs/common';
import { PrometheusModule, makeCounterProvider } from '@willsoto/nestjs-prometheus';
import { ObservabilityService } from './observability.service';

@Global()
@Module({
  imports: [
    PrometheusModule.register({
      path: '/metrics',
      defaultMetrics: {
        enabled: true,
      },
    }),
  ],
  providers: [
    ObservabilityService,
    makeCounterProvider({
      name: 'payment_success_total',
      help: 'Total number of successful payments',
    }),
    makeCounterProvider({
      name: 'payment_failure_total',
      help: 'Total number of failed payments',
    }),
  ],
  exports: [ObservabilityService],
})
export class ObservabilityModule {}
